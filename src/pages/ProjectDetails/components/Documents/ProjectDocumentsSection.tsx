import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useProjectDocuments } from '@/hooks/queries/useDocuments';

import { UploadResult } from '@/types/upload';
import { Project } from '@/types/project';
import { 
  X,
  ImageIcon,
  FileText,
  Filter
} from 'lucide-react';

// Import subcomponents
import { MediaHeader } from './MediaHeader';
import { MediaFilters } from './MediaFilters';
import { MediaGrid } from './MediaGrid';
import { MediaUploadSection, UploadOptions } from './MediaUploadSection';

// Local interfaces specific to this component
interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document';
  category: string;
  size?: number;
  createdAt: string;
}

interface ProjectDocumentsSectionProps {
  project: Project;
  onUpdateProject?: (updates: Partial<Project>) => void;
  onSetImageUploadState: (key: string, value: unknown) => void;
}

export function ProjectDocumentsSection({
  project,
  onUpdateProject,
  onSetImageUploadState
}: ProjectDocumentsSectionProps) {
  // Local state for upload modals
  const [showInspirationUpload, setShowInspirationUpload] = useState(false);
  const [showProgressUpload, setShowProgressUpload] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Local state for save functionality and media management
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentProfileImage, setCurrentProfileImage] = useState<string | null>(project.profile_image || null);
  
  // Local state for unified media interface
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'images' | 'documents'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Collapse state for Project Media accordion
  const [imagesCollapsed, setImagesCollapsed] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  
  // Toggle handler for accordion collapse
  const handleToggleCollapse = useCallback(() => {
    setImagesCollapsed(prev => !prev);
  }, []);
  
  const { toast } = useToast();

  // Fetch documents
  const { data: documents = [] } = useProjectDocuments(project.id);

  // Shared profile image change handler
  const handleProfileImageChange = useCallback((url: string) => {
    setCurrentProfileImage(url);
    setHasUnsavedChanges(true);
    onUpdateProject?.({ profile_image: url });
  }, [onUpdateProject]);



  const handleDocumentUploadComplete = useCallback((results: UploadResult[]) => {
    toast({
      title: "Documents Uploaded",
      description: `${results.length} document(s) uploaded successfully.`,
    });
  }, [toast]);

  // Save changes handler
  const handleSaveChanges = useCallback(async () => {
    setIsSaving(true);
    try {
      // Save logic would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
      setHasUnsavedChanges(false);
      toast({
        title: "Changes Saved",
        description: "Your project media has been updated successfully.",
      });
    } catch {
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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

    // Add progress images
    project.progress_images?.forEach((url, index) => {
      items.push({
        id: `progress-${index}`,
        name: `Progress ${index + 1}`,
        url,
        type: 'image',
        category: 'progress',
        createdAt: project.created_at || new Date().toISOString()
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
  }, [project, documents]);

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

  return (
    <Card className="w-full p-4">
      {/* Header - always visible */}
      <MediaHeader
        imagesCollapsed={imagesCollapsed}
        onToggleCollapse={handleToggleCollapse}
        filteredItemsCount={filteredMediaItems.length}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSaveChanges={handleSaveChanges}
      />

      {/* Content - only when expanded */}
      {!imagesCollapsed && (
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
              setShowInspirationUpload(true);
              setShowUploadOptions(false);
            }}
            onShowProgressUpload={() => {
              setShowProgressUpload(true);
              setShowUploadOptions(false);
            }}
            onShowDocumentUpload={() => {
              setShowDocumentUpload(true);
              setShowUploadOptions(false);
            }}
            onCloseUploadOptions={() => setShowUploadOptions(false)}
          />

          {/* Upload Sections */}
          <MediaUploadSection
            projectId={project.id}
            showInspirationUpload={showInspirationUpload}
            showProgressUpload={showProgressUpload}
            showDocumentUpload={showDocumentUpload}
            onInspirationUploadComplete={(results: UploadResult[]) => {
              const urls = results.map(r => r.url);
              setHasUnsavedChanges(true);
              onUpdateProject?.({ inspiration_images: [...(project.inspiration_images || []), ...urls] });
              toast({
                title: "Inspiration Images Uploaded",
                description: `${results.length} inspiration image(s) uploaded successfully.`,
              });
              setShowInspirationUpload(false);
            }}
            onProgressUploadComplete={(results: UploadResult[]) => {
              const urls = results.map(r => r.url);
              setHasUnsavedChanges(true);
              onUpdateProject?.({ progress_images: [...(project.progress_images || []), ...urls] });
              toast({
                title: "Progress Images Uploaded",
                description: `${results.length} progress image(s) uploaded successfully.`,
              });
              setShowProgressUpload(false);
            }}
            onDocumentUploadComplete={handleDocumentUploadComplete}
            onCloseInspirationUpload={() => setShowInspirationUpload(false)}
            onCloseProgressUpload={() => setShowProgressUpload(false)}
            onCloseDocumentUpload={() => setShowDocumentUpload(false)}
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
                    : 'Start by uploading some images or documents to showcase your project.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => {
                      onSetImageUploadState('showImageUpload', true);
                      setShowUploadOptions(false);
                    }}
                    className="bg-gradient-to-r from-buildease-blue-600 to-buildease-blue-700 hover:from-buildease-blue-700 hover:to-buildease-blue-800 text-white font-semibold"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Upload Images
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onSetImageUploadState('showDocumentUpload', true);
                      setShowUploadOptions(false);
                    }}
                    className="border-buildease-blue-200 text-buildease-blue-700 hover:bg-buildease-blue-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                </div>
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
      )}
    </Card>
  );
}
