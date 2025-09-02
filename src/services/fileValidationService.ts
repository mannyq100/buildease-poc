/**
 * File Validation Service
 * Provides comprehensive file validation for uploads with security checks
 */

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedFile?: File;
}

export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  maxFiles?: number;
  requireImageDimensions?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
}

export class FileValidationService {
  // Default configuration for BuildEase project images
  private static readonly DEFAULT_OPTIONS: Required<FileValidationOptions> = {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif'
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    maxFiles: 10,
    requireImageDimensions: true,
    maxWidth: 4096,
    maxHeight: 4096,
    minWidth: 100,
    minHeight: 100,
  };

  /**
   * Validate a single file
   */
  static async validateFile(
    file: File, 
    options: Partial<FileValidationOptions> = {}
  ): Promise<FileValidationResult> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic file existence check
    if (!file) {
      return {
        isValid: false,
        errors: ['No file provided'],
        warnings: [],
      };
    }

    // File size validation
    if (file.size > config.maxSizeBytes) {
      errors.push(
        `File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(config.maxSizeBytes)})`
      );
    }

    // File type validation (MIME type)
    if (!config.allowedTypes.includes(file.type)) {
      errors.push(
        `File type "${file.type}" is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`
      );
    }

    // File extension validation (additional security layer)
    const fileExtension = this.getFileExtension(file.name).toLowerCase();
    if (!config.allowedExtensions.includes(fileExtension)) {
      errors.push(
        `File extension "${fileExtension}" is not allowed. Allowed extensions: ${config.allowedExtensions.join(', ')}`
      );
    }

    // Filename validation (security check)
    const filenameValidation = this.validateFilename(file.name);
    if (!filenameValidation.isValid) {
      errors.push(...filenameValidation.errors);
    }

    // Image-specific validation
    if (file.type.startsWith('image/')) {
      try {
        const imageValidation = await this.validateImageFile(file, config);
        if (!imageValidation.isValid) {
          errors.push(...imageValidation.errors);
        }
        warnings.push(...imageValidation.warnings);
      } catch (error) {
        errors.push('Failed to validate image properties');
      }
    }

    // File content validation (basic magic number check)
    try {
      const contentValidation = await this.validateFileContent(file);
      if (!contentValidation.isValid) {
        errors.push(...contentValidation.errors);
      }
    } catch (error) {
      warnings.push('Could not validate file content');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedFile: errors.length === 0 ? file : undefined,
    };
  }

  /**
   * Validate multiple files
   */
  static async validateFiles(
    files: File[], 
    options: Partial<FileValidationOptions> = {}
  ): Promise<{
    isValid: boolean;
    results: FileValidationResult[];
    globalErrors: string[];
  }> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    const globalErrors: string[] = [];

    // Check file count limit
    if (files.length > config.maxFiles) {
      globalErrors.push(
        `Too many files selected (${files.length}). Maximum allowed: ${config.maxFiles}`
      );
    }

    // Validate each file individually
    const results = await Promise.all(
      files.map(file => this.validateFile(file, options))
    );

    // Check total size of all files
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSize = config.maxSizeBytes * config.maxFiles;
    if (totalSize > maxTotalSize) {
      globalErrors.push(
        `Total file size (${this.formatFileSize(totalSize)}) exceeds maximum allowed (${this.formatFileSize(maxTotalSize)})`
      );
    }

    const allFilesValid = results.every(result => result.isValid) && globalErrors.length === 0;

    return {
      isValid: allFilesValid,
      results,
      globalErrors,
    };
  }

  /**
   * Validate image file dimensions and properties
   */
  private static async validateImageFile(
    file: File, 
    config: Required<FileValidationOptions>
  ): Promise<FileValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        // Dimension validation
        if (config.requireImageDimensions) {
          if (img.width > config.maxWidth || img.height > config.maxHeight) {
            errors.push(
              `Image dimensions (${img.width}x${img.height}) exceed maximum allowed (${config.maxWidth}x${config.maxHeight})`
            );
          }
          
          if (img.width < config.minWidth || img.height < config.minHeight) {
            errors.push(
              `Image dimensions (${img.width}x${img.height}) are below minimum required (${config.minWidth}x${config.minHeight})`
            );
          }
        }

        // Aspect ratio warnings for construction images
        const aspectRatio = img.width / img.height;
        if (aspectRatio < 0.5 || aspectRatio > 3) {
          warnings.push('Unusual aspect ratio detected. Consider using more standard image proportions for better display.');
        }

        // Resolution warnings
        const megapixels = (img.width * img.height) / 1000000;
        if (megapixels > 20) {
          warnings.push('Very high resolution image. Consider resizing for faster upload and better performance.');
        }

        URL.revokeObjectURL(img.src);
        resolve({
          isValid: errors.length === 0,
          errors,
          warnings,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve({
          isValid: false,
          errors: ['Invalid or corrupted image file'],
          warnings: [],
        });
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Validate file content using magic numbers (file signatures)
   */
  private static async validateFileContent(file: File): Promise<FileValidationResult> {
    const errors: string[] = [];

    // Read first few bytes to check file signature
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Common image file signatures
    const signatures = {
      jpeg: [0xFF, 0xD8, 0xFF],
      png: [0x89, 0x50, 0x4E, 0x47],
      gif: [0x47, 0x49, 0x46],
      webp: [0x52, 0x49, 0x46, 0x46], // RIFF header for WebP
    };

    // Check if file signature matches declared MIME type
    let signatureMatch = false;
    
    if (file.type === 'image/jpeg' && this.checkSignature(bytes, signatures.jpeg)) {
      signatureMatch = true;
    } else if (file.type === 'image/png' && this.checkSignature(bytes, signatures.png)) {
      signatureMatch = true;
    } else if (file.type === 'image/gif' && this.checkSignature(bytes, signatures.gif)) {
      signatureMatch = true;
    } else if (file.type === 'image/webp' && this.checkSignature(bytes, signatures.webp)) {
      signatureMatch = true;
    }

    if (!signatureMatch && file.type.startsWith('image/')) {
      errors.push('File content does not match declared file type (possible security risk)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * Validate filename for security issues
   */
  private static validateFilename(filename: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for dangerous characters
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(filename)) {
      errors.push('Filename contains invalid characters');
    }

    // Check filename length
    if (filename.length > 255) {
      errors.push('Filename is too long (maximum 255 characters)');
    }

    // Check for reserved names (Windows)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
    if (reservedNames.test(filename)) {
      errors.push('Filename uses a reserved system name');
    }

    // Check for hidden files or suspicious patterns
    if (filename.startsWith('.') && filename !== '.htaccess') {
      errors.push('Hidden files are not allowed');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if bytes match a signature pattern
   */
  private static checkSignature(bytes: Uint8Array, signature: number[]): boolean {
    if (bytes.length < signature.length) return false;
    
    return signature.every((byte, index) => bytes[index] === byte);
  }

  /**
   * Format file size for human readability
   */
  private static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Get file extension from filename
   */
  private static getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.slice(lastDotIndex) : '';
  }

  /**
   * Get validation options for different contexts
   */
  static getValidationOptions(context: 'profile' | 'inspiration' | 'progress' | 'progress_video'): Partial<FileValidationOptions> {
    switch (context) {
      case 'profile':
        return {
          maxSizeBytes: 5 * 1024 * 1024, // 5MB for profile images
          maxFiles: 1,
          requireImageDimensions: true,
          minWidth: 200,
          minHeight: 200,
          maxWidth: 2048,
          maxHeight: 2048,
        };
      
      case 'inspiration':
        return {
          maxSizeBytes: 10 * 1024 * 1024, // 10MB for inspiration images
          maxFiles: 10,
          requireImageDimensions: true,
          minWidth: 300,
          minHeight: 300,
        };
      
      case 'progress':
        return {
          maxSizeBytes: 15 * 1024 * 1024, // 15MB for progress photos
          maxFiles: 20,
          requireImageDimensions: false, // More flexible for progress photos
        };
      
      case 'progress_video':
        return {
          maxSizeBytes: 50 * 1024 * 1024, // 50MB for progress videos
          maxFiles: 5,
          requireImageDimensions: false,
          allowedTypes: [
            'video/mp4',
            'video/quicktime',
            'video/x-msvideo',
            'video/webm'
          ],
          allowedExtensions: ['.mp4', '.mov', '.avi', '.webm'],
        };
      
      default:
        return {};
    }
  }
}
