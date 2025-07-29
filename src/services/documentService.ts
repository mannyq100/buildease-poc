/**
 * Service for handling project document uploads and management
 * Supports PDF, Word, Excel and other document types
 */
import { uploadFile, deleteFile } from '@/utils/core/storageUtils';
import { supabase } from '@/lib/supabase';
import type { FileUploadResult, DeleteFileResult } from '@/types/fileUpload';

// Document type enum matching database schema
export type DocumentType = 
  | 'PERMIT' 
  | 'DRAWING' 
  | 'CONTRACT' 
  | 'INVOICE' 
  | 'RECEIPT' 
  | 'REPORT' 
  | 'SPECIFICATION' 
  | 'SCHEDULE' 
  | 'PHOTO' 
  | 'VIDEO' 
  | 'MANUAL' 
  | 'CERTIFICATE' 
  | 'OTHER';

// Allowed document MIME types matching storage bucket configuration
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Maximum file size: 50MB (matching storage bucket limit)
const MAX_FILE_SIZE_MB = 50;

/**
 * Get file extension from filename
 * @param filename The filename to extract extension from
 * @returns File extension in lowercase
 */
function getFileExtension(filename: string | undefined): string {
  if (!filename || typeof filename !== 'string') {
    return '';
  }
  return filename.toLowerCase().split('.').pop() || '';
}

/**
 * Check if file type is valid based on MIME type and/or file extension
 * @param file The file to validate
 * @returns Whether the file type is valid
 */
function isValidDocumentType(file: File): boolean {
  // Safety check for malformed file objects
  if (!file || typeof file !== 'object') {
    return false;
  }

  // First check MIME type if available and valid
  if (file.type && ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return true;
  }

  // Fallback to file extension validation
  const extension = getFileExtension(file.name);
  const validExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
  
  return validExtensions.includes(extension);
}

/**
 * Validate document file type and size
 * @param file The document file to validate
 * @returns Validation result
 */
export function validateDocumentFile(file: File): { isValid: boolean; error?: string } {
  // Safety check for malformed file objects
  if (!file || typeof file !== 'object') {
    return {
      isValid: false,
      error: 'Invalid file object provided'
    };
  }

  // Check if file has required properties
  if (typeof file.size !== 'number') {
    return {
      isValid: false,
      error: 'File object is missing size property'
    };
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    return {
      isValid: false,
      error: `File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum allowed size of ${MAX_FILE_SIZE_MB}MB`
    };
  }

  // Check file type using both MIME type and extension
  if (!isValidDocumentType(file)) {
    const extension = getFileExtension(file.name);
    const fileName = file.name || 'unknown';
    return {
      isValid: false,
      error: `File "${fileName}" with type "${file.type || 'unknown'}" and extension ".${extension}" is not supported. Allowed types: PDF, Word, Excel documents`
    };
  }

  return { isValid: true };
}

/**
 * Upload a project document to storage only
 * @param file The document file to upload
 * @param userId The user ID for storage path
 * @param projectId The project ID
 * @param documentType The type of document being uploaded
 * @param onProgress Optional progress callback
 * @returns Upload result with URL and path
 */
export async function uploadProjectDocument(
  file: File,
  userId: string,
  projectId: string,
  documentType: DocumentType = 'OTHER',
  onProgress?: (progress: number) => void
): Promise<FileUploadResult> {
  // Validate file before upload
  const validation = validateDocumentFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  try {
    console.log('Uploading document:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId,
      projectId,
      documentType
    });

    // Upload to storage only - database record will be created separately
    const uploadResult = await uploadFile(file, {
      bucket: 'documents',
      userId,
      projectId,
      allowedTypes: ALLOWED_DOCUMENT_TYPES,
      maxSizeMB: MAX_FILE_SIZE_MB,
      onProgress,
      cacheControl: '3600',
      upsert: false,
      metadata: {}
    });

    if (!uploadResult.success) {
      console.error('Upload failed with result:', uploadResult);
      throw new Error(uploadResult.error || 'Upload failed');
    }

    console.log('Upload successful:', uploadResult);
    return uploadResult;
  } catch (error) {
    console.error('Document upload failed:', error);
    // Provide more helpful error message for users
    if (error instanceof Error) {
      if (error.message.includes('DatabaseError') || error.message.includes('project_id')) {
        throw new Error('Database configuration issue. Please contact support or try again later.');
      } else if (error.message.includes('policy')) {
        throw new Error('Permission denied. Please check your account permissions.');
      } else if (error.message.includes('size')) {
        throw new Error('File size exceeds the maximum allowed limit.');
      }
    }
    throw error;
  }
}

/**
 * Create a document record in the database
 * @param options Document creation options
 * @returns Created document record
 */
export async function createDocumentRecord(options: {
  name: string;
  description?: string;
  documentType: DocumentType;
  projectId: string;
  phaseId?: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  metadata?: Record<string, any>;
}): Promise<{ success: boolean; document?: any; error?: string }> {
  try {
    const { data: document, error } = await supabase
      .from('be_document')
      .insert({
        name: options.name,
        description: options.description || null,
        document_type: options.documentType,
        project_id: options.projectId,
        phase_id: options.phaseId || null,
        file_path: options.filePath,
        file_size: options.fileSize,
        mime_type: options.mimeType,
        metadata: options.metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating document record:', error);
      return {
        success: false,
        error: `Failed to create document record: ${error.message}`
      };
    }

    return {
      success: true,
      document
    };
  } catch (error) {
    console.error('Error in createDocumentRecord:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create document record'
    };
  }
}

/**
 * Upload document and create database record in one operation
 * @param options Upload and document creation options
 * @returns Combined result
 */
export async function uploadAndCreateDocument(options: {
  file: File;
  userId: string;
  projectId: string;
  name?: string;
  description?: string;
  documentType?: DocumentType;
  phaseId?: string;
  onProgress?: (progress: number) => void;
}): Promise<{ success: boolean; document?: any; uploadResult?: FileUploadResult; error?: string }> {
  const {
    file,
    userId,
    projectId,
    name,
    description,
    documentType = 'OTHER',
    phaseId,
    onProgress
  } = options;

  try {
    // Step 1: Upload file to storage
    const uploadResult = await uploadProjectDocument(
      file,
      userId,
      projectId,
      documentType,
      onProgress
    );

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error || 'File upload failed'
      };
    }

    // Step 2: Create database record
    const documentName = name || file.name;
    const documentResult = await createDocumentRecord({
      name: documentName,
      description,
      documentType,
      projectId,
      phaseId,
      filePath: uploadResult.filePath!,
      fileSize: file.size,
      mimeType: file.type,
      metadata: {
        originalFileName: file.name,
        uploadedAt: new Date().toISOString()
      }
    });

    if (!documentResult.success) {
      // Upload succeeded but database creation failed
      console.error('File uploaded but database record creation failed');
      return {
        success: false,
        uploadResult,
        error: `File uploaded but database sync failed: ${documentResult.error}`
      };
    }

    return {
      success: true,
      document: documentResult.document,
      uploadResult
    };

  } catch (error) {
    console.error('Error in uploadAndCreateDocument:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload process failed'
    };
  }
}

/**
 * Delete a project document
 * @param filePath The file path to delete
 * @returns Delete result
 */
export async function deleteProjectDocument(filePath: string): Promise<DeleteFileResult> {
  return deleteFile('documents', filePath);
}

/**
 * Extract file path from public URL
 * @param url The public URL of the document
 * @returns The file path
 */
export function getDocumentPathFromUrl(url: string): string {
  try {
    // Extract the path from the URL
    // Example URL: https://xxxx.supabase.co/storage/v1/object/public/documents/user-id/project-id/filename.pdf
    const urlParts = url.split('/documents/');
    if (urlParts.length < 2) return '';
    
    return urlParts[1];
  } catch (error) {
    console.error('Error extracting document path from URL:', error);
    return '';
  }
}

/**
 * Get document type from file extension
 * @param filename The filename
 * @returns Suggested document type
 */
export function getDocumentTypeFromFilename(filename: string): DocumentType {
  const extension = filename.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'pdf':
      if (filename.toLowerCase().includes('permit')) return 'PERMIT';
      if (filename.toLowerCase().includes('contract')) return 'CONTRACT';
      if (filename.toLowerCase().includes('invoice')) return 'INVOICE';
      if (filename.toLowerCase().includes('receipt')) return 'RECEIPT';
      if (filename.toLowerCase().includes('report')) return 'REPORT';
      if (filename.toLowerCase().includes('spec')) return 'SPECIFICATION';
      if (filename.toLowerCase().includes('schedule')) return 'SCHEDULE';
      if (filename.toLowerCase().includes('manual')) return 'MANUAL';
      if (filename.toLowerCase().includes('cert')) return 'CERTIFICATE';
      return 'OTHER';
    
    case 'doc':
    case 'docx':
      if (filename.toLowerCase().includes('contract')) return 'CONTRACT';
      if (filename.toLowerCase().includes('spec')) return 'SPECIFICATION';
      return 'OTHER';
    
    case 'xls':
    case 'xlsx':
      if (filename.toLowerCase().includes('schedule')) return 'SCHEDULE';
      if (filename.toLowerCase().includes('budget')) return 'OTHER';
      return 'OTHER';
    
    default:
      return 'OTHER';
  }
}

/**
 * Format file size for display
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get document type display name
 * @param documentType The document type enum value
 * @returns Human-readable display name
 */
export function getDocumentTypeDisplayName(documentType: DocumentType): string {
  switch (documentType) {
    case 'PERMIT': return 'Permit';
    case 'DRAWING': return 'Drawing';
    case 'CONTRACT': return 'Contract';
    case 'INVOICE': return 'Invoice';
    case 'RECEIPT': return 'Receipt';
    case 'REPORT': return 'Report';
    case 'SPECIFICATION': return 'Specification';
    case 'SCHEDULE': return 'Schedule';
    case 'PHOTO': return 'Photo';
    case 'VIDEO': return 'Video';
    case 'MANUAL': return 'Manual';
    case 'CERTIFICATE': return 'Certificate';
    case 'OTHER': return 'Other';
    default: return 'Document';
  }
}