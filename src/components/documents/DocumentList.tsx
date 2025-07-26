/**
 * Document List Component
 * Displays project documents with download, edit, and delete functionality
 */
import React, { useState } from 'react';
import { FileText, Download, Edit, Trash2, Eye, Calendar, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useProjectDocuments, useDeleteDocument, type Document } from '@/hooks/queries/useDocuments';
import { formatFileSize, getDocumentTypeDisplayName, type DocumentType } from '@/services/documentService';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DocumentListProps {
  projectId: string;
  phaseId?: string;
  onEditDocument?: (document: Document) => void;
  className?: string;
}


export function DocumentList({ 
  projectId, 
  phaseId, 
  onEditDocument,
  className = '' 
}: DocumentListProps) {
  const [documentsWithUrls, setDocumentsWithUrls] = useState<Record<string, string>>({});
  const [loadingUrls, setLoadingUrls] = useState<Record<string, boolean>>({});

  const { data: documents = [], isLoading, error } = useProjectDocuments(projectId);
  const deleteDocument = useDeleteDocument();

  // Filter documents by phase if phaseId is provided
  const filteredDocuments = phaseId 
    ? documents.filter(doc => doc.phase_id === phaseId)
    : documents;

  // Group documents by type
  const groupedDocuments = filteredDocuments.reduce((groups, doc) => {
    const type = doc.document_type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(doc);
    return groups;
  }, {} as Record<string, Document[]>);

  const getDocumentDownloadUrl = async (document: Document) => {
    if (documentsWithUrls[document.id]) {
      // URL already cached
      window.open(documentsWithUrls[document.id], '_blank');
      return;
    }

    setLoadingUrls(prev => ({ ...prev, [document.id]: true }));

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600); // 1 hour expiry

      if (error) {
        throw error;
      }

      if (data?.signedUrl) {
        setDocumentsWithUrls(prev => ({ ...prev, [document.id]: data.signedUrl }));
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error getting download URL:', error);
      toast.error('Failed to generate download link');
    } finally {
      setLoadingUrls(prev => ({ ...prev, [document.id]: false }));
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocument.mutateAsync(documentId);
      // Remove from URL cache
      setDocumentsWithUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[documentId];
        return newUrls;
      });
    } catch {
      // Error is handled by the mutation hook
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return FileText;
    
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('word')) return FileText;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return FileText;
    
    return FileText;
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-red-600">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Failed to load documents</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
      </Card>
    );
  }

  if (filteredDocuments.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium mb-1">No documents yet</p>
          <p className="text-sm">Upload documents to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(groupedDocuments).map(([documentType, docs]) => (
        <Card key={documentType} className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Folder className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">
              {getDocumentTypeDisplayName(documentType as DocumentType)} ({docs.length})
            </h3>
          </div>

          <div className="space-y-3">
            {docs.map((document) => {
              const IconComponent = getFileIcon(document.mime_type);
              const isLoadingUrl = loadingUrls[document.id];

              return (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <IconComponent className="h-8 w-8 text-blue-500 flex-shrink-0" />
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {document.name}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {getDocumentTypeDisplayName(document.document_type)}
                        </Badge>
                      </div>
                      
                      {document.description && (
                        <p className="text-sm text-gray-600 truncate mb-1">
                          {document.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(document.created_at)}</span>
                        </div>
                        
                        {document.file_size && (
                          <span>{formatFileSize(document.file_size)}</span>
                        )}
                        
                        {document.phase_id && (
                          <div className="flex items-center space-x-1">
                            <Folder className="h-3 w-3" />
                            <span>Phase Document</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => getDocumentDownloadUrl(document)}
                      disabled={isLoadingUrl}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {isLoadingUrl ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => getDocumentDownloadUrl(document)}
                      disabled={isLoadingUrl}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    {onEditDocument && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditDocument(document)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Document</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{document.name}"? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteDocument(document.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}