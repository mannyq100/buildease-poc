import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useProjectDocuments } from '@/hooks/queries/useDocuments';
import { useProjectProgressImages } from '@/hooks/useProjectStorageImages';
import { Filter, X, ImageIcon } from 'lucide-react';

import { UploadResult } from '@/types/upload';
import { Project } from '@/types/project';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'progress-image';
  category: string;
  size?: number;
  createdAt?: string;
  uploadedAt?: Date;
}

interface ProjectDocumentsSectionProps {
  project: Project;
  onUpdateProject?: (updates: Partial<Project>) => void;
  // Upload modal state management
  showInspirationUpload: boolean;
  showProgressUpload: boolean;
  showDocumentUpload: boolean;
  onSetImageUploadState?: (state: any) => void;
  // Modal state from parent
  actualShowImageUpload: boolean;
  actualShowDocumentUpload: boolean;
  previewImage: string | null;
  setPreviewImage: (image: string | null) => void;
}

export function ProjectDocumentsSection({
  project,
  onUpdateProject,
  showInspirationUpload,
  showProgressUpload,
  showDocumentUpload,
  onSetImageUploadState,
  actualShowImageUpload,
  actualShowDocumentUpload,
  previewImage,
  setPreviewImage
}: ProjectDocumentsSectionProps) {
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'document'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const { toast } = useToast();

  // Fetch documents and progress images
  const { data: documents = [] } = useProjectDocuments(project.id);
  const {
    images: progressImages,
    refetch: refetchProgressImages,
    isLoading: progressImagesLoading,
    error: progressImagesError
  } = useProjectProgressImages(project.id);

  // Shared profile image change handler - auto-saves to database
  const handleProfileImageChange = useCallback((url: string) => {
    setCurrentProfileImage(url);
    // Auto-save profile image change to database
    onUpdateProject?.({ profile_image: url });
  }, [onUpdateProject]);



  const handleDocumentUploadComplete = useCallback((results: UploadResult[]) => {
    toast({
      title: "Documents Uploaded",
      description: `${results.length} document(s) uploaded successfully.`,
    });
  }, [toast]);

  // Helper function to get category display name
  const getCategoryDisplayName = useCallback((category: string) => {
    const categoryMap: Record<string, string> = {
      profile: 'Profile',
      inspiration: 'Inspiration',
      progress: 'Progress',
      documents: 'Documents',
      contracts: 'Contracts',
      permits: 'Permits',
      plans: 'Plans'
    };
    return categoryMap[category] || category;
  }, []);

  // Combine all media items for unified display
  const allMediaItems = useMemo((): MediaItem[] => {
    const items: MediaItem[] = [];

    // Add profile image
    if (project.profile_image) {
      items.push({
        id: `profile-${project.profile_image}`,
        name: 'Profile Image',
        url: project.profile_image,
        type: 'image',
        category: 'profile',
        createdAt: project.created_at || new Date().toISOString()
      });
    }

    // Add inspiration images
    project.inspiration_images?.forEach((url, index) => {
      items.push({
        id: `inspiration-${index}`,
        name: `Inspiration ${index + 1}`,
        url,
        type: 'image',
        category: 'inspiration',
        createdAt: project.created_at || new Date().toISOString()
      });
    });

    // Add progress images from storage (StorageImage[])
    progressImages.forEach((storageImage) => {
      items.push({
        id: storageImage.id,
        url: storageImage.url,
        type: 'progress-image' as const,
        name: storageImage.name,
        uploadedAt: new Date(storageImage.createdAt),
        category: 'progress'
      });
    });

    // Add documents
    documents.forEach((doc) => {
      items.push({
        id: doc.id,
        name: doc.name,
        url: doc.file_path,
        type: 'document',
        category: doc.document_type || 'documents',
        size: doc.file_size || undefined,
        createdAt: doc.created_at
      });
    });

    return items;
  }, [project, documents, progressImages]);

  // Filter media items based on search and filters
  const filteredMediaItems = useMemo(() => {
    return allMediaItems.filter(item => {
      // Search filter
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Type filter
      if (filterType !== 'all') {
        if (filterType === 'images' && item.type !== 'image') return false;
        if (filterType === 'documents' && item.type !== 'document') return false;
      }

      // Category filter
      if (filterCategory !== 'all' && item.category !== filterCategory) {
        return false;
      }

      return true;
    });
  }, [allMediaItems, searchTerm, filterType, filterCategory]);

  // Get available categories from current media items
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    allMediaItems.forEach(item => {
      categories.add(item.category);
    });
    return Array.from(categories);
  }, [allMediaItems]);

  // Show upload options by default when there's no media
  useEffect(() => {
    const hasAnyMedia = allMediaItems.length > 0;
    if (!hasAnyMedia && !showUploadOptions) {
      setShowUploadOptions(true);
    }
  }, [allMediaItems.length, showUploadOptions]);

  return (
    <Card className="w-full p-4">
      {/* Header - always visible */}
      <MediaHeader
        filteredItemsCount={filteredMediaItems.length}
        hasUnsavedChanges={false}
        isSaving={false}
        onSaveChanges={() => {}}
      />

      {/* Content - always visible */}
      <div>
        <CardContent className="p-6 space-y-6">
            {/* Filters */}
            <MediaFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterType={filterType}
              onFilterTypeChange={setFilterType}
              filterCategory={filterCategory}
              onFilterCategoryChange={setFilterCategory}
              availableCategories={availableCategories}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              getCategoryDisplayName={getCategoryDisplayName}
              onShowUploadOptions={() => setShowUploadOptions(true)}
              onClearFilters={() => {
                setFilterType('all');
                setFilterCategory('all');
                setSearchTerm('');
              }}
            />

          {/* Upload Options */}
          <UploadOptions
            showUploadOptions={showUploadOptions}
            onShowInspirationUpload={() => {
              onSetImageUploadState('showImageUpload', true);
              setShowUploadOptions(false);
            }}
            onShowProgressUpload={() => {
              setShowProgressUpload(true);
              setShowUploadOptions(false);
            }}
            onShowDocumentUpload={() => {
              onSetImageUploadState('showDocumentUpload', true);
              setShowUploadOptions(false);
            }}
            onCloseUploadOptions={() => setShowUploadOptions(false)}
          />

          {/* Upload Sections */}
          <MediaUploadSection
            projectId={project.id}
            showInspirationUpload={actualShowImageUpload}
            showProgressUpload={showProgressUpload}
            showDocumentUpload={actualShowDocumentUpload}
            onInspirationUploadComplete={(results: UploadResult[]) => {
              const urls = results.map(r => r.url);
              // Auto-save inspiration images to project table in database
              onUpdateProject?.({ inspiration_images: [...(project.inspiration_images || []), ...urls] });
              toast({
                title: "Inspiration Images Uploaded",
                description: `${results.length} inspiration image(s) uploaded successfully.`,
              });
              setShowInspirationUpload(false);
            }}
            onProgressUploadComplete={(results: UploadResult[]) => {
              // Progress images now automatically sync to database via unified service
              // No manual refetch needed as the hook handles database sync
              toast({
                title: "Progress Images Uploaded",
                description: `${results.length} progress image(s) uploaded successfully.`,
              });
              setShowProgressUpload(false);
            }}
            onDocumentUploadComplete={handleDocumentUploadComplete}
            onCloseInspirationUpload={() => onSetImageUploadState('showImageUpload', false)}
            onCloseProgressUpload={() => setShowProgressUpload(false)}
            onCloseDocumentUpload={() => onSetImageUploadState('showDocumentUpload', false)}
          />

          {/* Media Grid/List */}
          {filteredMediaItems.length > 0 ? (
            <div className="bg-gradient-to-br from-slate-50/30 to-white p-4 rounded-xl border border-slate-100/50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-600" />
                  Media Items ({filteredMediaItems.length})
                </h4>
                {searchTerm || filterType !== 'all' || filterCategory !== 'all' ? (
                  <Badge variant="secondary" className="text-xs">
                    Filtered
                  </Badge>
                ) : null}
              </div>

              <MediaGrid
                items={filteredMediaItems}
                viewMode={viewMode}
                currentProfileImage={currentProfileImage}
                onImageClick={(url) => {
                  const imageIndex = filteredMediaItems.filter(mediaItem => mediaItem.type === 'image').findIndex(imageItem => imageItem.url === url);
                  onSetImageUploadState('previewImage', { url, caption: filteredMediaItems.find(item => item.url === url)?.name || '', index: imageIndex });
                }}
                onSelectProfileImage={handleProfileImageChange}
                getCategoryDisplayName={getCategoryDisplayName}
              />
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-slate-50/50 to-white rounded-xl border border-slate-100">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-buildease-blue-100 to-buildease-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ImageIcon className="h-10 w-10 text-buildease-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">No Media Found</h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm || filterType !== 'all' || filterCategory !== 'all' 
                    ? 'No media matches your current filters. Try adjusting your search criteria.'
                    : 'Use the upload options above to start adding images or documents to showcase your project.'
                  }
                </p>
                {(searchTerm || filterType !== 'all' || filterCategory !== 'all') && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFilterType('all');
                      setFilterCategory('all');
                      setSearchTerm('');
                    }}
                    className="mt-4 text-slate-500 hover:text-slate-700"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Image Preview Modal */}
          {previewImage && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
