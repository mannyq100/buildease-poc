/**
 * ProjectDocumentsSection - Comprehensive document and image management
 * Extracted from ProjectDetailsContent.tsx for better organization
 * Handles image uploads, document management, and file organization
 * Mobile-first responsive design with drag-and-drop functionality
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProjectImageUpload } from '@/components/ui/project-image-upload';
import { useProjectImages } from '@/hooks/useProjectImages';
import { useToast } from '@/components/ui/use-toast';
import { DocumentUpload, DocumentList } from '@/components/documents';
import { useProjectDocuments } from '@/hooks/queries/useDocuments';
import { formatFileSize, getDocumentTypeDisplayName, type DocumentType } from '@/services/documentService';
import type { Document } from '@/hooks/queries/useDocuments';
import { 
  FileText, 
  ChevronDown, 
  Calendar, 
  ImageIcon, 
  X,
  Save,
  Check,
  Upload,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  User,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Info
} from 'lucide-react';

// Types for project data and images
interface ProjectImage {
  url: string;
  caption?: string;
}

interface MediaItem {
  id: string;
  type: 'image' | 'document';
  url: string;
  name: string;
  category: 'profile' | 'inspiration' | 'progress' | DocumentType;
  size?: number;
  mimeType?: string;
  createdAt: string;
  description?: string;
}

interface Project {
  id: string;
  profile_image?: string;
  inspiration_images?: string[];
  progress_images?: string[];
  inspirationalImages?: ProjectImage[];
  progressImages?: ProjectImage[];
}

interface ImageUploadStates {
  imagesCollapsed: boolean;
  previewImage: { url: string; caption?: string; index?: number } | null;
  documentsCollapsed?: boolean;
  showDocumentUpload?: boolean;
  showImageUpload?: boolean;
}

interface ProjectDocumentsSectionProps {
  project: Project;
  expandedSections: {
    documents: boolean;
  };
  onToggleSection: (section: 'documents') => void;
  imageUploadStates: ImageUploadStates;
  onSetImageUploadState: <K extends keyof ImageUploadStates>(
    stateKey: K, 
    value: ImageUploadStates[K]
  ) => void;
  onUpdateProject?: (updates: Partial<Project>) => void;
}

// ImagePreview interface moved to props as part of imageUploadStates

export function ProjectDocumentsSection({ 
  project, 
  expandedSections, 
  onToggleSection,
  imageUploadStates,
  onSetImageUploadState,
  onUpdateProject
}: ProjectDocumentsSectionProps) {
  // Destructure image upload states from centralized state
  const { 
    imagesCollapsed, 
    previewImage, 
    documentsCollapsed = true, 
    showDocumentUpload = false,
    showImageUpload = false
  } = imageUploadStates;
  
  // Local state for save functionality and media management
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentProfileImage, setCurrentProfileImage] = useState<string | null>(project.profile_image || null);
  
  // Local state for unified media interface
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'images' | 'documents'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  
  const { toast } = useToast();

  // Fetch documents
  const { data: documents = [] } = useProjectDocuments(project.id);

  // Shared profile image change handler
  const handleProfileImageChange = useCallback((url: string) => {
    setCurrentProfileImage(url);
    setHasUnsavedChanges(true);
    onUpdateProject?.({ profile_image: url });
  }, [onUpdateProject]);

  // Create hook instances for each image type
  const inspirationHook = useProjectImages({
    imageType: 'inspiration',
    projectId: project.id,
    initialImages: project.inspiration_images || [],
    initialProfileImage: currentProfileImage,
    maxImages: 10,
    onChange: (urls) => {
      setHasUnsavedChanges(true);
      onUpdateProject?.({ inspiration_images: urls });
    },
    onProfileImageChange: handleProfileImageChange
  });

  const progressHook = useProjectImages({
    imageType: 'progress',
    projectId: project.id,
    initialImages: project.progress_images || [],
    maxImages: 20,
    onChange: (urls) => {
      setHasUnsavedChanges(true);
      onUpdateProject?.({ progress_images: urls });
    }
    // Note: No onProfileImageChange callback - progress images should not auto-set as profile
  });

  const profileHook = useProjectImages({
    imageType: 'profile',
    projectId: project.id,
    initialImages: currentProfileImage ? [currentProfileImage] : [],
    initialProfileImage: currentProfileImage,
    maxImages: 1,
    onChange: (urls) => {
      // Only track that there are unsaved changes
      // Do NOT auto-set as profile image - let user explicitly select
      setHasUnsavedChanges(true);
      // Note: Removed auto-assignment logic - profile images must be explicitly selected
    },
    onProfileImageChange: handleProfileImageChange
  });

  // Detect unsaved changes (local files or changes)
  useEffect(() => {
    const hasLocalFiles = inspirationHook.hasLocalFiles || progressHook.hasLocalFiles || profileHook.hasLocalFiles;
    const hasProfileChange = currentProfileImage !== project.profile_image;
    
    if (hasLocalFiles || hasProfileChange) {
      setHasUnsavedChanges(true);
    }
  }, [
    inspirationHook.hasLocalFiles, 
    progressHook.hasLocalFiles, 
    profileHook.hasLocalFiles,
    currentProfileImage,
    project.profile_image
  ]);

  // Create unified media items list
  const allMediaItems = useMemo((): MediaItem[] => {
    const items: MediaItem[] = [];
    
    // Add profile image
    if (currentProfileImage) {
      items.push({
        id: `profile-${currentProfileImage}`,
        type: 'image',
        url: currentProfileImage,
        name: 'Profile Image',
        category: 'profile',
        createdAt: new Date().toISOString()
      });
    }
    
    // Add inspiration images
    project.inspiration_images?.forEach((url, index) => {
      items.push({
        id: `inspiration-${index}`,
        type: 'image',
        url,
        name: `Inspiration Image ${index + 1}`,
        category: 'inspiration',
        createdAt: new Date().toISOString()
      });
    });
    
    // Add progress images
    project.progress_images?.forEach((url, index) => {
      items.push({
        id: `progress-${index}`,
        type: 'image',
        url,
        name: `Progress Image ${index + 1}`,
        category: 'progress',
        createdAt: new Date().toISOString()
      });
    });
    
    // Add documents
    documents.forEach((doc: Document) => {
      items.push({
        id: doc.id,
        type: 'document',
        url: doc.file_path,
        name: doc.name,
        category: doc.document_type,
        size: doc.file_size || 0,
        mimeType: doc.mime_type || undefined,
        createdAt: doc.created_at,
        description: doc.description || undefined
      });
    });
    
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentProfileImage, project.inspiration_images, project.progress_images, documents]);

  // Filter media items based on search and filters
  const filteredMediaItems = useMemo(() => {
    return allMediaItems.filter((item) => {
      // Filter by search term
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by type
      if (filterType !== 'all' && filterType !== item.type + 's') {
        return false;
      }
      
      // Filter by category
      if (filterCategory !== 'all' && filterCategory !== item.category) {
        return false;
      }
      
      return true;
    });
  }, [allMediaItems, searchTerm, filterType, filterCategory]);

  // Get unique categories for filter dropdown
  const availableCategories = useMemo(() => {
    const categories = new Set(allMediaItems.map(item => item.category));
    return Array.from(categories).sort();
  }, [allMediaItems]);

  // Helper functions
  const getCategoryDisplayName = (category: string) => {
    if (category === 'profile' || category === 'inspiration' || category === 'progress') {
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
    return getDocumentTypeDisplayName(category as DocumentType);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleUploadComplete = useCallback(() => {
    setShowUploadOptions(false);
    onSetImageUploadState('showDocumentUpload', false);
    onSetImageUploadState('showImageUpload', false);
  }, [onSetImageUploadState]);

  // Save all changes to Supabase
  const handleSaveChanges = useCallback(async () => {
    if (!hasUnsavedChanges) return;
    
    setIsSaving(true);
    let uploadErrors = 0;

    try {
      // Upload all pending images for each type
      const promises = [
        inspirationHook.hasLocalFiles ? inspirationHook.uploadAllFiles() : Promise.resolve(inspirationHook.images),
        progressHook.hasLocalFiles ? progressHook.uploadAllFiles() : Promise.resolve(progressHook.images),
        profileHook.hasLocalFiles ? profileHook.uploadAllFiles() : Promise.resolve(profileHook.images)
      ];

      const [inspirationUrls, progressUrls, profileUrls] = await Promise.allSettled(promises);

      // Handle results and update project
      const updates: Partial<Project> = {};
      
      if (inspirationUrls.status === 'fulfilled') {
        updates.inspiration_images = inspirationUrls.value;
      } else {
        uploadErrors++;
        console.error('Failed to upload inspiration images:', inspirationUrls.reason);
      }

      if (progressUrls.status === 'fulfilled') {
        updates.progress_images = progressUrls.value;
      } else {
        uploadErrors++;
        console.error('Failed to upload progress images:', progressUrls.reason);
      }

      // Only update profile image if it was explicitly changed by the user
      if (currentProfileImage !== project.profile_image) {
        updates.profile_image = currentProfileImage;
      }
      
      // Handle profile image uploads (but don't auto-set as profile unless explicitly selected)
      if (profileUrls.status === 'rejected') {
        uploadErrors++;
        console.error('Failed to upload profile image:', profileUrls.reason);
      }

      // Update project with final URLs
      if (Object.keys(updates).length > 0) {
        try {
          await onUpdateProject?.(updates);
        } catch (error) {
          console.error('Database update failed:', error);
          uploadErrors++;
        }
      }
      
      // Show success/warning messages
      if (uploadErrors === 0) {
        setHasUnsavedChanges(false);
        toast({
          title: "Changes saved",
          description: "All images have been successfully uploaded and saved.",
        });
      } else {
        toast({
          title: "Partially saved",
          description: `Some images could not be uploaded. ${uploadErrors} upload(s) failed.`,
          variant: "warning"
        });
      }

    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Save failed",
        description: "There was a problem saving your changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, inspirationHook, progressHook, profileHook, onUpdateProject, toast]);

  // Legacy handlers for backward compatibility with direct calls
  const handleInspirationImagesChange = useCallback((urls: string[]) => {
    setHasUnsavedChanges(true);
    onUpdateProject?.({ inspiration_images: urls });
  }, [onUpdateProject]);

  const handleProgressImagesChange = useCallback((urls: string[]) => {
    setHasUnsavedChanges(true);
    onUpdateProject?.({ progress_images: urls });
  }, [onUpdateProject]);

  return (
    <div className="space-y-6">
      {/* Unified Project Media Section - Images & Documents Combined */}
      <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-buildease-blue-50/20 backdrop-blur-md rounded-2xl overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onSetImageUploadState('imagesCollapsed', !imagesCollapsed)}
              className="flex items-center gap-3 text-left group hover:bg-slate-50/50 -m-2 p-2 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-buildease-blue-500 to-buildease-blue-600 rounded-xl group-hover:scale-105 transition-transform">
                <ImageIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Project Media</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  {!imagesCollapsed ? 'Click to collapse' : `${filteredMediaItems.length} items • Images & documents`}
                </p>
              </div>
              <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${imagesCollapsed ? 'rotate-0' : 'rotate-180'}`} />
            </button>
            
            {/* Save Controls */}
            {!imagesCollapsed && (
              <div className="flex items-center gap-2">
                {/* Save Changes Button */}
                {hasUnsavedChanges && (
                  <Button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                )}
                
                {/* Saved Indicator */}
                {!hasUnsavedChanges && !isSaving && (
                  <div className="flex items-center text-green-600 text-sm">
                    <Check className="h-4 w-4 mr-1" />
                    All changes saved
                  </div>
                )}
              </div>
            )}
            
          </div>
        </CardHeader>
        
        {!imagesCollapsed && (
          <CardContent className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-50/50 p-4 rounded-xl">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search media..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Enhanced Filters */}
                <div className="flex flex-wrap gap-3">
                  <Select value={filterType} onValueChange={(value: 'all' | 'images' | 'documents') => setFilterType(value)}>
                    <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-slate-200/50 hover:border-buildease-blue-300 hover:bg-white transition-all duration-200 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-md border-slate-200/50 shadow-xl">
                      <SelectItem value="all" className="hover:bg-slate-50/80">
                        All Media Types
                      </SelectItem>
                      <SelectItem value="images" className="hover:bg-buildease-blue-50/80">
                        Images Only
                      </SelectItem>
                      <SelectItem value="documents" className="hover:bg-purple-50/80">
                        Documents Only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-slate-200/50 hover:border-buildease-blue-300 hover:bg-white transition-all duration-200 shadow-sm">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-md border-slate-200/50 shadow-xl">
                      <SelectItem value="all" className="hover:bg-slate-50/80">
                        All Categories
                      </SelectItem>
                      
                      {/* Image Categories */}
                      {availableCategories.filter(cat => ['profile', 'inspiration', 'progress'].includes(cat)).length > 0 && (
                        <>
                          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50/50">
                            📸 Image Categories
                          </div>
                          {availableCategories.filter(cat => ['profile', 'inspiration', 'progress'].includes(cat)).map(category => (
                            <SelectItem key={category} value={category} className="hover:bg-buildease-blue-50/80">
                              {getCategoryDisplayName(category)}
                            </SelectItem>
                          ))}
                        </>
                      )}
                      
                      {/* Document Categories */}
                      {availableCategories.filter(cat => !['profile', 'inspiration', 'progress'].includes(cat)).length > 0 && (
                        <>
                          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50/50 border-t border-slate-100">
                            📄 Document Categories
                          </div>
                          {availableCategories.filter(cat => !['profile', 'inspiration', 'progress'].includes(cat)).map(category => (
                            <SelectItem key={category} value={category} className="hover:bg-purple-50/80">
                              {getCategoryDisplayName(category)}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  
                </div>
                
                {/* Active Filter Chips */}
                {(filterType !== 'all' || filterCategory !== 'all' || searchTerm) && (
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200/50">
                    <span className="text-xs font-medium text-slate-500">Active filters:</span>
                    {filterType !== 'all' && (
                      <Badge className="bg-buildease-blue-100 text-buildease-blue-700 border-0 rounded-full px-3 py-1">
                        {filterType === 'images' ? '📸 Images' : '📄 Documents'}
                        <button
                          onClick={() => setFilterType('all')}
                          className="ml-2 hover:text-buildease-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {filterCategory !== 'all' && (
                      <Badge className="bg-purple-100 text-purple-700 border-0 rounded-full px-3 py-1">
                        {getCategoryDisplayName(filterCategory)}
                        <button
                          onClick={() => setFilterCategory('all')}
                          className="ml-2 hover:text-purple-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {searchTerm && (
                      <Badge className="bg-green-100 text-green-700 border-0 rounded-full px-3 py-1">
                        "🔍 {searchTerm}"
                        <button
                          onClick={() => setSearchTerm('')}
                          className="ml-2 hover:text-green-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterType('all');
                        setFilterCategory('all');
                        setSearchTerm('');
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 h-auto"
                    >
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
              
                {/* View Mode and Upload Controls */}
                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-slate-200/50 shadow-sm">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
                        viewMode === 'grid'
                          ? 'bg-buildease-blue-500 text-white shadow-md'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                      title="Grid View"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
                        viewMode === 'list'
                          ? 'bg-buildease-blue-500 text-white shadow-md'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                      title="List View"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Enhanced Add Media Button */}
                  <Button
                    onClick={() => setShowUploadOptions(!showUploadOptions)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      showUploadOptions
                        ? 'bg-slate-500 hover:bg-slate-600 text-white'
                        : 'bg-gradient-to-r from-buildease-blue-500 to-buildease-blue-600 hover:from-buildease-blue-600 hover:to-buildease-blue-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {showUploadOptions ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Close
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Media
                      </>
                    )}
                  </Button>
                </div>
            </div>

            {/* Upload Options */}
            {showUploadOptions && (
              <div className="bg-gradient-to-br from-buildease-blue-50/30 to-white p-4 rounded-xl border border-buildease-blue-100/50 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onSetImageUploadState('showImageUpload', true);
                      setShowUploadOptions(false);
                    }}
                    className="flex-1 text-buildease-blue-600 border-buildease-blue-200 hover:bg-buildease-blue-50"
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
                    className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                </div>
              </div>
            )}

            {/* Enhanced Image Upload Section */}
            {showImageUpload && (
              <div 
                className="bg-gradient-to-br from-slate-50/50 via-white/80 to-buildease-blue-50/30 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-2xl overflow-hidden"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    onSetImageUploadState('showImageUpload', false);
                  }
                }}
                tabIndex={0}
              >
                {/* Header with Close Button */}
                <div className="bg-gradient-to-r from-buildease-blue-500/10 via-buildease-blue-500/5 to-transparent p-6 border-b border-slate-200/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-buildease-blue-500 to-buildease-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <ImageIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">Upload Project Images</h3>
                        <p className="text-slate-600 mt-1">Add photos to showcase your construction project</p>
                      </div>
                    </div>
                    
                    {/* Prominent Close Button */}
                    <button
                      onClick={() => onSetImageUploadState('showImageUpload', false)}
                      className="flex items-center justify-center w-12 h-12 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200/50 transition-all duration-200 hover:scale-105 shadow-lg backdrop-blur-sm"
                      title="Close image upload (Esc)"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Upload Categories */}
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Picture Section */}
                    <div className="bg-gradient-to-br from-buildease-blue-50/80 via-white/90 to-buildease-blue-50/50 p-6 rounded-2xl border border-buildease-blue-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-gradient-to-br from-buildease-blue-500 to-buildease-blue-600 rounded-xl flex items-center justify-center shadow-md">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-800">Profile Picture</h4>
                            <p className="text-sm text-slate-600">Main project photo</p>
                          </div>
                        </div>
                        <Badge className="bg-buildease-blue-100 text-buildease-blue-700 border-0 text-xs font-semibold">
                          1 image max
                        </Badge>
                      </div>
                      <ProjectImageUpload
                        imageType="profile"
                        projectId={project.id}
                        value={currentProfileImage ? [currentProfileImage] : []}
                        onChange={(urls) => handleProfileImageChange(urls[0] || '')}
                        maxImages={1}
                        profileImage={currentProfileImage}
                        onSelectProfileImage={handleProfileImageChange}
                        hookInstance={profileHook}
                      />
                    </div>
                    
                    {/* Inspirational Images Section */}
                    <div className="bg-gradient-to-br from-buildease-orange-50/80 via-white/90 to-buildease-orange-50/50 p-6 rounded-2xl border border-buildease-orange-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-gradient-to-br from-buildease-orange-500 to-buildease-orange-600 rounded-xl flex items-center justify-center shadow-md">
                            <ImageIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-800">Inspiration Gallery</h4>
                            <p className="text-sm text-slate-600">Design references & ideas</p>
                          </div>
                        </div>
                        <Badge className="bg-buildease-orange-100 text-buildease-orange-700 border-0 text-xs font-semibold">
                          {project.inspiration_images?.length || 0}/10
                        </Badge>
                      </div>
                      <ProjectImageUpload
                        imageType="inspiration"
                        projectId={project.id}
                        value={project.inspiration_images || []}
                        onChange={handleInspirationImagesChange}
                        maxImages={10}
                        profileImage={currentProfileImage}
                        onSelectProfileImage={handleProfileImageChange}
                        hookInstance={inspirationHook}
                      />
                    </div>
                    
                    {/* Progress Images Section */}
                    <div className="bg-gradient-to-br from-green-50/80 via-white/90 to-green-50/50 p-6 rounded-2xl border border-green-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-800">Progress Photos</h4>
                            <p className="text-sm text-slate-600">Construction timeline</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs font-semibold">
                          {project.progress_images?.length || 0}/20
                        </Badge>
                      </div>
                      <ProjectImageUpload
                        imageType="progress"
                        projectId={project.id}
                        value={project.progress_images || []}
                        onChange={handleProgressImagesChange}
                        maxImages={20}
                        hookInstance={progressHook}
                      />
                    </div>
                  </div>
                  
                  {/* Help Section */}
                  <div className="bg-gradient-to-r from-slate-50/50 to-blue-50/30 p-6 rounded-xl border border-slate-200/50">
                    <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Info className="h-4 w-4 text-buildease-blue-600" />
                      Upload Guidelines
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-buildease-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="font-medium text-slate-700">Profile:</span> Choose your best project overview shot
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-buildease-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="font-medium text-slate-700">Inspiration:</span> Reference designs and style ideas
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="font-medium text-slate-700">Progress:</span> Before, during, and after construction photos
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Action Bar */}
                <div className="bg-gradient-to-r from-slate-50/80 via-white/90 to-slate-50/80 backdrop-blur-sm border-t border-slate-200/50 p-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    {/* Upload Progress Info */}
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-buildease-blue-500"></div>
                        <span>Profile: {currentProfileImage ? '1' : '0'}/1</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-buildease-orange-500"></div>
                        <span>Inspiration: {project.inspiration_images?.length || 0}/10</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Progress: {project.progress_images?.length || 0}/20</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {hasUnsavedChanges && (
                        <Button
                          onClick={handleSaveChanges}
                          disabled={isSaving}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl"
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        onClick={() => onSetImageUploadState('showImageUpload', false)}
                        className="px-6 py-2 font-semibold border-slate-300 hover:bg-slate-50 text-slate-700 shadow-md hover:shadow-lg"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Done Uploading
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Upload Section */}
            {showDocumentUpload && (
              <div 
                className="bg-gradient-to-br from-purple-50/30 to-white p-6 rounded-xl border border-purple-100/50 relative"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    onSetImageUploadState('showDocumentUpload', false);
                  }
                }}
                tabIndex={0}
              >
                {/* Header with close button */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">Upload Documents</h4>
                      <p className="text-sm text-slate-600">PDF, Word, Excel files up to 50MB each</p>
                    </div>
                  </div>
                  
                  {/* Prominent close button */}
                  <button
                    onClick={() => onSetImageUploadState('showDocumentUpload', false)}
                    className="flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl transition-all duration-200 hover:scale-105"
                    title="Close upload (Esc)"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <DocumentUpload
                  projectId={project.id}
                  onUploadComplete={handleUploadComplete}
                  onCancel={() => onSetImageUploadState('showDocumentUpload', false)}
                />
              </div>
            )}

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

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredMediaItems.map((item) => (
                      <div key={item.id} className="group relative bg-white rounded-xl border border-gray-200 hover:border-buildease-blue-300 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg">
                        {item.type === 'image' ? (
                          <div 
                            className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer relative overflow-hidden"
                            onClick={() => {
                              const imageIndex = filteredMediaItems.filter(mediaItem => mediaItem.type === 'image').findIndex(imageItem => imageItem.id === item.id);
                              onSetImageUploadState('previewImage', { url: item.url, caption: item.name, index: imageIndex });
                            }}
                          >
                            <img 
                              src={item.url} 
                              alt={item.name}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            {/* Image overlay with category badge */}
                            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Badge 
                                variant={item.category === 'profile' ? 'default' : item.category === 'inspiration' ? 'secondary' : 'outline'} 
                                className="text-xs backdrop-blur-sm bg-white/90 border-white/50 shadow-lg"
                              >
                                {getCategoryDisplayName(item.category)}
                              </Badge>
                            </div>
                            {/* Zoom icon overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                                <ImageIcon className="h-5 w-5 text-buildease-blue-600" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-[4/3] bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center cursor-pointer hover:bg-gradient-to-br hover:from-purple-100 hover:to-blue-100 transition-colors duration-300">
                            <div className="text-center">
                              <FileText className="h-12 w-12 text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                              <p className="text-xs text-purple-600 font-medium">Document</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Enhanced info panel */}
                        <div className="p-3 bg-gradient-to-t from-white to-gray-50">
                          <p className="text-sm font-semibold text-gray-900 truncate mb-1">{item.name}</p>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={item.category === 'profile' ? 'default' : item.category === 'inspiration' ? 'secondary' : 'outline'} 
                              className="text-xs"
                            >
                              {getCategoryDisplayName(item.category)}
                            </Badge>
                            <div className="flex flex-col text-right">
                              {item.size && (
                                <span className="text-xs text-gray-500">{formatFileSize(item.size)}</span>
                              )}
                              <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredMediaItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          {item.type === 'image' ? (
                            <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{item.name}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Badge variant="secondary" className="text-xs">
                                {getCategoryDisplayName(item.category)}
                              </Badge>
                              <span>{formatDate(item.createdAt)}</span>
                              {item.size && <span>{formatFileSize(item.size)}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-slate-50/50 to-white rounded-xl border border-slate-100">
                {searchTerm || filterType !== 'all' || filterCategory !== 'all' ? (
                  // Filtered empty state
                  <div className="max-w-md mx-auto">
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <Search className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No results found</h3>
                    <p className="text-slate-600 mb-6">
                      No media matches your current filters. Try adjusting your search terms or category filters.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFilterType('all');
                          setFilterCategory('all');
                          setSearchTerm('');
                        }}
                        className="text-buildease-blue-600 border-buildease-blue-200 hover:bg-buildease-blue-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Default empty state
                  <div className="max-w-md mx-auto">
                    <div className="bg-gradient-to-br from-buildease-blue-100 to-buildease-blue-200 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-buildease-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Start your media gallery</h3>
                    <p className="text-slate-600 mb-6">
                      Upload project images and documents to create a comprehensive visual record of your construction progress.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() => {
                          onSetImageUploadState('showImageUpload', true);
                          setShowUploadOptions(false);
                        }}
                        className="bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white"
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
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Upload Documents
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Image Preview Modal */}
            {previewImage && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={() => onSetImageUploadState('previewImage', null)}
              >
                <div 
                  className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    onClick={() => onSetImageUploadState('previewImage', null)}
                    className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  
                  {/* Image */}
                  <div className="relative">
                    <img 
                      src={previewImage.url} 
                      alt={previewImage.caption || 'Preview'}
                      className="w-full h-auto max-h-[70vh] object-contain"
                    />
                  </div>
                  
                  {/* Image info */}
                  {previewImage.caption && (
                    <div className="p-6 bg-gradient-to-t from-slate-50 to-white border-t border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{previewImage.caption}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(new Date().toISOString())}
                        </span>
                        <span className="flex items-center gap-1">
                          <ImageIcon className="h-4 w-4" />
                          High Resolution
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Document Management (when documents are filtered) */}
            {(filterType === 'documents' || filterType === 'all') && documents.length > 0 && (
              <DocumentList
                projectId={project.id}
                onEditDocument={(document) => {
                  console.log('Edit document:', document);
                }}
                className="bg-gradient-to-br from-slate-50/30 to-white rounded-xl border border-slate-100/50"
              />
            )}
          </CardContent>
        )}
      </Card>


      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => onSetImageUploadState('previewImage', null)}>
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img 
              src={previewImage.url} 
              alt={previewImage.caption || 'Preview'} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            {previewImage.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 rounded-b-lg">
                <p className="text-center font-medium">{previewImage.caption}</p>
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white"
              onClick={() => onSetImageUploadState('previewImage', null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}