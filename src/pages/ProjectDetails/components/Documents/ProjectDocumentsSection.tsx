import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useProjectDocuments } from '@/hooks/queries/useDocuments';
import { useProjectProgressImages } from '@/hooks/useProjectStorageImages';
import { Plus, X, ImageIcon, FileText, Search, Filter, Download, MoreVertical, User, Star } from 'lucide-react';

import { UploadResult } from '@/types/upload';
import { Project } from '@/types/project';
import { SimplifiedUpload } from '@/components/upload/SimplifiedUpload';
import { getDocumentTypeDisplayName } from '@/services/documentService';

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
  showInspirationUpload?: boolean;
  showProgressUpload?: boolean;
  showDocumentUpload?: boolean;
  onSetImageUploadState?: (state: Record<string, unknown>) => void;
  // Modal state from parent (optional)
  actualShowImageUpload?: boolean;
  actualShowDocumentUpload?: boolean;
  previewImage?: string | null;
  setPreviewImage?: (image: string | null) => void;
  // Legacy prop support
  uploadModalState?: {
    showImageUpload?: boolean;
    showDocumentUpload?: boolean;
    previewImage?: { url: string; caption: string; index: number } | null;
  };
}

export function ProjectDocumentsSection({
  project,
  onUpdateProject,
  showInspirationUpload = false,
  showProgressUpload = false,
  showDocumentUpload = false,
  onSetImageUploadState,
  _actualShowImageUpload = false,
  _actualShowDocumentUpload = false,
  previewImage: externalPreviewImage,
  setPreviewImage: externalSetPreviewImage,
  uploadModalState
}: ProjectDocumentsSectionProps) {
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'document'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Local upload modal state
  const [localShowInspirationUpload, setLocalShowInspirationUpload] = useState(false);
  const [localShowProgressUpload, setLocalShowProgressUpload] = useState(false);
  const [localShowDocumentUpload, setLocalShowDocumentUpload] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  
  // Internal preview state when not provided by parent
  const [internalPreviewImage, setInternalPreviewImage] = useState<string | null>(null);
  
  // Use external preview state if provided, otherwise use internal
  const previewImage = externalPreviewImage ?? internalPreviewImage;
  const setPreviewImage = externalSetPreviewImage ?? setInternalPreviewImage;
  
  // Use external modal state if provided, otherwise use local state
  const activeShowInspirationUpload = showInspirationUpload || localShowInspirationUpload;
  const activeShowProgressUpload = showProgressUpload || localShowProgressUpload;
  const activeShowDocumentUpload = showDocumentUpload || localShowDocumentUpload;

  const { toast } = useToast();

  // Utility function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Download function for documents
  const handleDownloadDocument = useCallback(async (item: MediaItem) => {
    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = item.name;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download Started",
        description: `Downloading ${item.name}...`
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the document. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Handle media item click
  const handleMediaItemClick = useCallback((item: MediaItem, e: React.MouseEvent) => {
    if (item.type === 'document') {
      e.preventDefault();
      handleDownloadDocument(item);
    } else {
      setPreviewImage(item.url);
    }
  }, [handleDownloadDocument, setPreviewImage]);

  // Handle setting an image as profile image
  const handleSetProfileImage = useCallback((imageUrl: string) => {
    onUpdateProject?.({ profile_image: imageUrl });
    toast({
      title: "Profile Image Updated",
      description: "The project profile image has been updated successfully."
    });
  }, [onUpdateProject, toast]);

  // Fetch documents and progress images
  const { data: documents = [] } = useProjectDocuments(project.id);
  const {
    images: progressImages,
    isLoading: _progressImagesLoading,
    error: _progressImagesError,
    refetch: refetchProgressImages
  } = useProjectProgressImages(project.id);

  // Auto-save handlers for image uploads
  const handleInspirationUploadComplete = useCallback((results: UploadResult[]) => {
    const urls = results.map(r => r.url);
    // Auto-save inspiration images to project table in database
    onUpdateProject?.({ inspiration_images: [...(project.inspiration_images || []), ...urls] });
    toast({ 
      title: "Inspiration Images Uploaded", 
      description: `${results.length} inspiration image(s) uploaded successfully.` 
    });
  }, [onUpdateProject, project.inspiration_images, toast]);

  const handleProgressUploadComplete = useCallback((results: UploadResult[]) => {
    const urls = results.map(r => r.url);
    // Update progress images in project table database
    onUpdateProject?.({ progress_images: [...(project.progress_images || []), ...urls] });
    // Also refresh the storage query to display new images immediately
    refetchProgressImages();
    toast({ 
      title: "Progress Images Uploaded", 
      description: `${results.length} progress image(s) uploaded successfully.` 
    });
  }, [onUpdateProject, project.progress_images, refetchProgressImages, toast]);

  const handleDocumentUploadComplete = useCallback((results: UploadResult[]) => {
    toast({
      title: "Documents Uploaded",
      description: `${results.length} document(s) uploaded successfully.`
    });
  }, [toast]);

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

    // Add progress images from database
    (project.progress_images || []).forEach((url, index) => {
      items.push({
        id: `progress-db-${index}`,
        name: `Progress ${index + 1}`,
        url,
        type: 'image',
        category: 'progress',
        createdAt: project.created_at || new Date().toISOString()
      });
    });

    // Add additional progress images from storage (if any not in database)
    progressImages.forEach((storageImage) => {
      // Check if this image is already included from database
      const alreadyIncluded = (project.progress_images || []).some(dbUrl => dbUrl === storageImage.url);
      if (!alreadyIncluded) {
        items.push({
          id: storageImage.id,
          url: storageImage.url,
          type: 'progress-image',
          name: storageImage.name,
          uploadedAt: new Date(storageImage.createdAt),
          category: 'progress'
        });
      }
    });

    // Add documents
    documents.forEach((doc) => {
      items.push({
        id: doc.id,
        name: doc.name,
        url: doc.file_path,
        type: 'document',
        category: doc.document_type ? getDocumentTypeDisplayName(doc.document_type as any) : 'Other',
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
        if (filterType === 'image' && !['image', 'progress-image'].includes(item.type)) {
          return false;
        }
        if (filterType === 'document' && item.type !== 'document') {
          return false;
        }
      }

      // Category filter (case-insensitive)
      if (filterCategory !== 'all' && item.category.toLowerCase() !== filterCategory.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [allMediaItems, searchTerm, filterType, filterCategory]);

  // Show upload options by default when there's no media
  useEffect(() => {
    const hasAnyMedia = allMediaItems.length > 0;
    if (!hasAnyMedia && !showUploadOptions) {
      setShowUploadOptions(true);
    }
  }, [allMediaItems.length, showUploadOptions]);

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Project Media</h3>
            <p className="text-sm text-muted-foreground">
              {filteredMediaItems.length} item{filteredMediaItems.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {allMediaItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUploadOptions(!showUploadOptions)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Media
            </Button>
          )}
        </div>

        {/* Search and Filter */}
        {allMediaItems.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={(value: 'all' | 'image' | 'document') => setFilterType(value)}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {/* Image Categories */}
                  <SelectItem value="Inspiration">Inspiration</SelectItem>
                  <SelectItem value="Progress">Progress</SelectItem>
                  <SelectItem value="Before">Before</SelectItem>
                  <SelectItem value="After">After</SelectItem>
                  {/* Document Categories */}
                  <SelectItem value="Permit">Permit</SelectItem>
                  <SelectItem value="Drawing">Drawing</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Invoice">Invoice</SelectItem>
                  <SelectItem value="Receipt">Receipt</SelectItem>
                  <SelectItem value="Report">Report</SelectItem>
                  <SelectItem value="Specification">Specification</SelectItem>
                  <SelectItem value="Schedule">Schedule</SelectItem>
                  <SelectItem value="Photo">Photo</SelectItem>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Certificate">Certificate</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Upload Options */}
        {(showUploadOptions || allMediaItems.length === 0) && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium">Add Media</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => {
                  setLocalShowInspirationUpload(true);
                  onSetImageUploadState?.({ showInspirationUpload: true });
                }}
              >
                <ImageIcon className="h-6 w-6" />
                <span className="text-sm">Inspiration Images</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => {
                  setLocalShowProgressUpload(true);
                  onSetImageUploadState?.({ showProgressUpload: true });
                }}
              >
                <ImageIcon className="h-6 w-6" />
                <span className="text-sm">Progress Images</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => {
                  setLocalShowDocumentUpload(true);
                  onSetImageUploadState?.({ showDocumentUpload: true });
                }}
              >
                <FileText className="h-6 w-6" />
                <span className="text-sm">Upload Documents</span>
              </Button>
            </div>
          </div>
        )}

        {/* Media Grid */}
        {filteredMediaItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMediaItems.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={(e) => handleMediaItemClick(item, e)}
                title={item.type === 'document' ? `Click to download ${item.name}` : `Click to preview ${item.name}`}
              >
                {item.type === 'document' ? (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="relative">
                      <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                      <Download className="h-3 w-3 absolute -bottom-1 -right-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xs text-center font-medium truncate w-full">
                      {item.name}
                    </span>
                    {item.size && (
                      <span className="text-xs text-muted-foreground mt-1">
                        {formatFileSize(item.size)}
                      </span>
                    )}
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                
                <Badge
                  variant="secondary"
                  className="absolute top-2 left-2 text-xs"
                >
                  {item.category}
                </Badge>

                {/* Profile Image Indicator */}
                {project.profile_image === item.url && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="text-xs bg-blue-600">
                      <Star className="h-3 w-3 mr-1" />
                      Profile
                    </Badge>
                  </div>
                )}

                {/* Image Actions */}
                {item.type !== 'document' && (
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetProfileImage(item.url);
                          }}
                          className="cursor-pointer"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Set as Profile Image
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                
                {/* Document Download Badge */}
                {item.type === 'document' && (
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge variant="outline" className="text-xs bg-white/90">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">No media yet</h4>
            <p className="text-muted-foreground mb-4">
              Start by uploading some images or documents for your project.
            </p>
          </div>
        )}

        {/* Upload Modals */}
        {activeShowInspirationUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Upload Inspiration Images</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setLocalShowInspirationUpload(false);
                    onSetImageUploadState?.({ showInspirationUpload: false });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SimplifiedUpload
                type="inspiration"
                projectId={project.id}
                onUploadComplete={handleInspirationUploadComplete}
              />
            </div>
          </div>
        )}

        {activeShowProgressUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Upload Progress Images</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setLocalShowProgressUpload(false);
                    onSetImageUploadState?.({ showProgressUpload: false });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SimplifiedUpload
                type="progress"
                projectId={project.id}
                onUploadComplete={handleProgressUploadComplete}
              />
            </div>
          </div>
        )}

        {activeShowDocumentUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Upload Documents</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setLocalShowDocumentUpload(false);
                    onSetImageUploadState?.({ showDocumentUpload: false });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SimplifiedUpload
                type="documents"
                projectId={project.id}
                onUploadComplete={handleDocumentUploadComplete}
                enableMetadata={true}
              />
            </div>
          </div>
        )}

        {/* Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] p-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-white hover:bg-white/20"
                onClick={() => setPreviewImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
