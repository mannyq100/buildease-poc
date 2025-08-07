/**
 * MediaGallery Component
 * Integrated media gallery with search, filtering, and bulk operations
 * Main interface for project media management
 */

import { useState, useMemo } from 'react';
import { useAdvancedMediaSearch, useMediaStats } from '@/hooks/queries/useAdvancedMedia';
import { MediaMetadataEditor } from './MediaMetadataEditor';
import { AdvancedMediaSearch } from './AdvancedMediaSearch';
import { BulkOperationsToolbar } from './BulkOperationsToolbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { 
  Grid, 
  List, 
  Edit3,
  FileText,
  Image as ImageIcon,
  Video,
  Calendar,
  HardDrive
} from 'lucide-react';
import { formatBytes } from '@/utils/fileUtils';
import { formatDistanceToNow } from 'date-fns';
import type { MediaSearchFilters, MediaSearchResult, Document } from '@/types/database';

interface MediaGalleryProps {
  projectId: string;
  className?: string;
  initialFilters?: Partial<MediaSearchFilters>;
  onDocumentSelect?: (document: MediaSearchResult) => void;
}

type ViewMode = 'grid' | 'list';

export function MediaGallery({
  projectId,
  className = '',
  initialFilters = {},
  onDocumentSelect
}: MediaGalleryProps) {
  const [filters, setFilters] = useState<MediaSearchFilters>({
    searchTerm: '',
    tags: [],
    documentTypes: [],
    ...initialFilters
  });
  const [selectedDocuments, setSelectedDocuments] = useState<MediaSearchResult[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [editingDocument, setEditingDocument] = useState<MediaSearchResult | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Data fetching
  const { data: searchResults = [], isLoading, error, refetch } = useAdvancedMediaSearch({
    projectId,
    filters,
    limit: 200,
    enabled: true
  });

  const { data: mediaStats } = useMediaStats({ projectId });

  // Selection management
  const isDocumentSelected = (documentId: string) => {
    return selectedDocuments.some(doc => doc.id === documentId);
  };

  const toggleDocumentSelection = (document: MediaSearchResult) => {
    setSelectedDocuments(prev => {
      const isSelected = prev.some(doc => doc.id === document.id);
      if (isSelected) {
        return prev.filter(doc => doc.id !== document.id);
      } else {
        return [...prev, document];
      }
    });
  };

  const selectAllDocuments = () => {
    setSelectedDocuments(searchResults);
  };

  const clearSelection = () => {
    setSelectedDocuments([]);
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.length === searchResults.length) {
      clearSelection();
    } else {
      selectAllDocuments();
    }
  };

  // Document actions
  const handleEditDocument = (document: MediaSearchResult) => {
    setEditingDocument(document);
    setShowEditor(true);
  };

  const handleDocumentUpdated = (updatedDocument: Document) => {
    // Refresh search results to show updated data
    refetch();
    setEditingDocument(null);
    setShowEditor(false);
  };

  const handleOperationComplete = () => {
    // Refresh data after bulk operations
    refetch();
  };

  // Get document icon based on type
  const getDocumentIcon = (document: MediaSearchResult) => {
    if (document.mime_type?.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    if (document.mime_type?.startsWith('video/')) {
      return <Video className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  // Memoized filtered results for performance
  const displayResults = useMemo(() => {
    return searchResults.slice(0, 200); // Limit for performance
  }, [searchResults]);

  const allSelected = displayResults.length > 0 && selectedDocuments.length === displayResults.length;
  const someSelected = selectedDocuments.length > 0 && selectedDocuments.length < displayResults.length;

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Failed to load media gallery</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Interface */}
      <AdvancedMediaSearch
        projectId={projectId}
        onResultsChange={() => {/* Results handled by useAdvancedMediaSearch */}}
        onFilterChange={setFilters}
      />

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Select All Checkbox */}
          {displayResults.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onCheckedChange={toggleSelectAll}
                className="touch-manipulation"
              />
              <span className="text-sm text-muted-foreground">
                {selectedDocuments.length > 0 
                  ? `${selectedDocuments.length} selected`
                  : 'Select all'
                }
              </span>
            </div>
          )}

          {/* Media Stats */}
          {mediaStats && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {mediaStats.total_documents} files
              </div>
              <div className="flex items-center gap-1">
                <HardDrive className="h-4 w-4" />
                {formatBytes(mediaStats.total_size_bytes)}
              </div>
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="touch-manipulation"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="touch-manipulation"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Operations Toolbar */}
      <BulkOperationsToolbar
        selectedDocuments={selectedDocuments}
        projectId={projectId}
        onClearSelection={clearSelection}
        onOperationComplete={handleOperationComplete}
      />

      {/* Results Display */}
      <div className="min-h-[200px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading media...</span>
          </div>
        ) : displayResults.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No media found</h3>
              <p className="text-muted-foreground">
                {Object.keys(filters).some(key => filters[key as keyof MediaSearchFilters])
                  ? 'Try adjusting your search filters'
                  : 'Upload some files to get started'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[600px]">
            {viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {displayResults.map((document) => (
                  <Card 
                    key={document.id} 
                    className={`
                      group cursor-pointer transition-all hover:shadow-md
                      ${isDocumentSelected(document.id) ? 'ring-2 ring-primary' : ''}
                    `}
                    onClick={() => onDocumentSelect?.(document)}
                  >
                    <CardContent className="p-3">
                      {/* Selection Checkbox */}
                      <div className="flex items-start justify-between mb-2">
                        <Checkbox
                          checked={isDocumentSelected(document.id)}
                          onCheckedChange={() => toggleDocumentSelection(document)}
                          onClick={(e) => e.stopPropagation()}
                          className="touch-manipulation"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDocument(document);
                          }}
                          className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 touch-manipulation"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Document Preview/Icon */}
                      <div className="aspect-square bg-muted rounded-md flex items-center justify-center mb-2">
                        {document.thumbnail_url ? (
                          <img
                            src={document.thumbnail_url}
                            alt={document.name}
                            className="w-full h-full object-cover rounded-md"
                            loading="lazy"
                          />
                        ) : (
                          <div className="text-muted-foreground">
                            {getDocumentIcon(document)}
                          </div>
                        )}
                      </div>

                      {/* Document Info */}
                      <div className="space-y-1">
                        <p className="text-sm font-medium truncate" title={document.name}>
                          {document.name}
                        </p>
                        {document.caption && (
                          <p className="text-xs text-muted-foreground line-clamp-2" title={document.caption}>
                            {document.caption}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {document.document_type}
                          </Badge>
                          {document.file_size_bytes && (
                            <span>{formatBytes(document.file_size_bytes)}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-2">
                {displayResults.map((document) => (
                  <Card 
                    key={document.id}
                    className={`
                      group cursor-pointer transition-all hover:shadow-sm
                      ${isDocumentSelected(document.id) ? 'ring-2 ring-primary' : ''}
                    `}
                    onClick={() => onDocumentSelect?.(document)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Selection Checkbox */}
                        <Checkbox
                          checked={isDocumentSelected(document.id)}
                          onCheckedChange={() => toggleDocumentSelection(document)}
                          onClick={(e) => e.stopPropagation()}
                          className="touch-manipulation"
                        />

                        {/* Document Icon */}
                        <div className="flex-shrink-0">
                          {document.thumbnail_url ? (
                            <img
                              src={document.thumbnail_url}
                              alt={document.name}
                              className="w-12 h-12 object-cover rounded-md"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                              {getDocumentIcon(document)}
                            </div>
                          )}
                        </div>

                        {/* Document Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{document.name}</p>
                              {document.caption && (
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                  {document.caption}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <Badge variant="outline" className="text-xs">
                                {document.document_type}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditDocument(document);
                                }}
                                className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 touch-manipulation"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
                            </div>
                            {document.file_size_bytes && (
                              <div className="flex items-center gap-1">
                                <HardDrive className="h-3 w-3" />
                                {formatBytes(document.file_size_bytes)}
                              </div>
                            )}
                            {document.tags && document.tags.length > 0 && (
                              <div className="flex gap-1">
                                {document.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {document.tags.length > 3 && (
                                  <span className="text-xs">+{document.tags.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </div>

      {/* Metadata Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {editingDocument && (
            <MediaMetadataEditor
              document={editingDocument as Document}
              projectId={projectId}
              onClose={() => setShowEditor(false)}
              onSave={handleDocumentUpdated}
              className="border-0 shadow-none"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}