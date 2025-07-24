/**
 * ProjectDocumentsSection - Comprehensive document and image management
 * Extracted from ProjectDetailsContent.tsx for better organization
 * Handles image uploads, document management, and file organization
 * Mobile-first responsive design with drag-and-drop functionality
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Upload, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Calendar, 
  ImageIcon, 
  Edit3, 
  X, 
  Plus 
} from 'lucide-react';

// Types for project data and images
interface ProjectImage {
  url: string;
  caption?: string;
}

interface Project {
  id: string;
  profile_image?: string;
  inspirationalImages?: ProjectImage[];
  progressImages?: ProjectImage[];
}

interface ImageUploadStates {
  showImageUpload: boolean;
  imagesCollapsed: boolean;
  previewImage: { url: string; caption?: string } | null;
  selectedImageType: 'profile' | 'inspiration' | 'progress' | null;
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
}

// ImagePreview interface moved to props as part of imageUploadStates

export function ProjectDocumentsSection({ 
  project, 
  expandedSections, 
  onToggleSection,
  imageUploadStates,
  onSetImageUploadState
}: ProjectDocumentsSectionProps) {
  // Destructure image upload states from centralized state
  const { showImageUpload, imagesCollapsed, previewImage } = imageUploadStates;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic
    console.log('Files selected:', e.target.files);
    // TODO: Implement actual file upload to Supabase storage
  };

  const handleRemoveImage = (imageUrl: string, imageType: 'profile' | 'inspiration' | 'progress') => {
    // Handle image removal logic
    console.log(`Remove ${imageType} image:`, imageUrl);
    // TODO: Implement actual image removal from Supabase storage
  };

  return (
    <div className="space-y-6">
      {/* Project Images Section - Enhanced & Collapsible */}
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
                <CardTitle className="text-xl font-bold text-slate-900">Project Images</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  {!imagesCollapsed ? 'Click to collapse' : 'Profile, inspiration & progress photos'}
                </p>
              </div>
              <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${imagesCollapsed ? 'rotate-0' : 'rotate-180'}`} />
            </button>
            
            {!imagesCollapsed && (
              <Button
                onClick={() => onSetImageUploadState('showImageUpload', !showImageUpload)}
                variant="outline"
                size="sm"
                className="text-buildease-blue-600 border-buildease-blue-200 hover:bg-buildease-blue-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Images
              </Button>
            )}
          </div>
        </CardHeader>
        
        {!imagesCollapsed && (
          <CardContent className="space-y-8">
            {/* Profile Picture Section */}
            <div className="bg-gradient-to-br from-buildease-blue-50/30 to-white p-4 rounded-xl border border-buildease-blue-100/50">
              <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-buildease-blue-600" />
                Profile Picture
                <span className="text-xs text-slate-500 font-normal">Main project photo</span>
              </h4>
              <div className="relative group">
                {project.profile_image ? (
                  <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-lg cursor-pointer"
                       onClick={() => onSetImageUploadState('previewImage', { url: project.profile_image!, caption: 'Project Profile' })}>
                    <img 
                      src={project.profile_image} 
                      alt="Project profile" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 text-slate-700 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetImageUploadState('showImageUpload', true);
                        }}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 text-slate-700 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetImageUploadState('previewImage', { url: project.profile_image!, caption: 'Project Profile' });
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onSetImageUploadState('showImageUpload', true)}
                    className="w-40 h-40 rounded-xl border-2 border-dashed border-slate-300 hover:border-buildease-blue-400 bg-slate-50 hover:bg-buildease-blue-50/50 transition-colors flex flex-col items-center justify-center group"
                  >
                    <ImageIcon className="h-10 w-10 text-slate-400 group-hover:text-buildease-blue-500 mb-2" />
                    <span className="text-sm text-slate-500 group-hover:text-buildease-blue-600 font-medium">Add Profile Photo</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Inspirational Images Section */}
            <div className="bg-gradient-to-br from-buildease-orange-50/30 to-white p-4 rounded-xl border border-buildease-orange-100/50">
              <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-buildease-orange-600" />
                Inspirational Images
                <span className="text-xs text-slate-500 font-normal">Design references & ideas</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {/* Display inspiration images */}
                {project.inspirationalImages?.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden shadow-md cursor-pointer"
                         onClick={() => onSetImageUploadState('previewImage', { url: image.url, caption: image.caption || `Inspiration ${index + 1}` })}>
                      <img 
                        src={image.url} 
                        alt={image.caption || `Inspiration ${index + 1}`} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 text-slate-700 hover:bg-white p-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetImageUploadState('previewImage', { url: image.url, caption: image.caption || `Inspiration ${index + 1}` });
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="bg-red-500/90 hover:bg-red-600 p-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(image.url, 'inspiration');
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )) || []}
                
                {/* Show empty state if no images */}
                {(!project.inspirationalImages || project.inspirationalImages.length === 0) && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No inspiration images uploaded yet</p>
                  </div>
                )}
                
                {/* Add More Inspiration Images */}
                <button
                  onClick={() => onSetImageUploadState('showImageUpload', true)}
                  className="aspect-square rounded-lg border-2 border-dashed border-buildease-orange-300 hover:border-buildease-orange-400 bg-buildease-orange-50/50 hover:bg-buildease-orange-100/50 transition-colors flex flex-col items-center justify-center group"
                >
                  <Plus className="h-5 w-5 text-buildease-orange-400 group-hover:text-buildease-orange-500 mb-1" />
                  <span className="text-xs text-buildease-orange-600 group-hover:text-buildease-orange-700 font-medium">Add</span>
                </button>
              </div>
            </div>
            
            {/* Progress Images Section */}
            <div className="bg-gradient-to-br from-green-50/30 to-white p-4 rounded-xl border border-green-100/50">
              <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                Progress Images
                <span className="text-xs text-slate-500 font-normal">Construction progress photos</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {project.progressImages?.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden shadow-md cursor-pointer"
                         onClick={() => onSetImageUploadState('previewImage', { url: image.url, caption: image.caption || `Progress ${index + 1}` })}>
                      <img 
                        src={image.url} 
                        alt={image.caption || `Progress ${index + 1}`} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 text-slate-700 hover:bg-white p-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetImageUploadState('previewImage', { url: image.url, caption: image.caption || `Progress ${index + 1}` });
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="bg-red-500/90 hover:bg-red-600 p-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(image.url, 'progress');
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )) || []}
                
                {/* Add More Progress Images */}
                <button
                  onClick={() => onSetImageUploadState('showImageUpload', true)}
                  className="aspect-square rounded-lg border-2 border-dashed border-green-300 hover:border-green-400 bg-green-50/50 hover:bg-green-100/50 transition-colors flex flex-col items-center justify-center group"
                >
                  <Plus className="h-5 w-5 text-green-400 group-hover:text-green-500 mb-1" />
                  <span className="text-xs text-green-600 group-hover:text-green-700 font-medium">Add</span>
                </button>
              </div>
            </div>
            
            {/* Enhanced Image Upload Section */}
            {showImageUpload && (
              <div className="p-6 bg-gradient-to-br from-slate-50 to-buildease-blue-50/30 rounded-xl border border-slate-200 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-buildease-blue-600" />
                    Upload Images
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSetImageUploadState('showImageUpload', false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {/* Image Type Selection */}
                  <div className="grid grid-cols-3 gap-3">
                    <button className="p-3 rounded-lg border-2 border-buildease-blue-200 bg-buildease-blue-50 text-buildease-blue-700 hover:bg-buildease-blue-100 transition-colors">
                      <ImageIcon className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">Profile</div>
                    </button>
                    <button className="p-3 rounded-lg border-2 border-buildease-orange-200 bg-buildease-orange-50 text-buildease-orange-700 hover:bg-buildease-orange-100 transition-colors">
                      <ImageIcon className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">Inspiration</div>
                    </button>
                    <button className="p-3 rounded-lg border-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                      <Calendar className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">Progress</div>
                    </button>
                  </div>
                  
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-buildease-blue-400 hover:bg-buildease-blue-50/30 transition-colors">
                    <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 mb-2 font-medium">Drop images here or click to browse</p>
                    <p className="text-xs text-slate-500">Supports JPG, PNG, WebP up to 10MB</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                      onChange={handleImageUpload}
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-block mt-4 px-6 py-3 bg-buildease-blue-600 text-white rounded-lg hover:bg-buildease-blue-700 cursor-pointer transition-colors font-medium"
                    >
                      Choose Files
                    </label>
                  </div>
                  
                  {/* Upload Actions */}
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSetImageUploadState('showImageUpload', false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-buildease-blue-600 hover:bg-buildease-blue-700"
                      onClick={() => {
                        // Handle upload
                        onSetImageUploadState('showImageUpload', false);
                      }}
                    >
                      Upload Images
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Documents Section with Expand Option */}
      <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-purple-50/20 backdrop-blur-md rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Documents & Updates
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onToggleSection('documents')}
              className="text-slate-500 hover:text-slate-700"
            >
              {expandedSections.documents ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900">Foundation inspection completed</div>
                <div className="text-xs text-slate-600">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900">Materials delivered on schedule</div>
                <div className="text-xs text-slate-600">5 hours ago</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900">Weather delay - rescheduled roofing</div>
                <div className="text-xs text-slate-600">1 day ago</div>
              </div>
            </div>
            
            {expandedSections.documents && (
              <div className="mt-4 pt-4 border-t border-slate-200/50">
                <div className="text-sm font-medium text-slate-700 mb-3">Recent Documents</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-white/50 rounded-lg hover:bg-white/80 transition-colors cursor-pointer">
                    <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">Building Plans v2.1.pdf</div>
                      <div className="text-xs text-slate-600">Updated 3 days ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-white/50 rounded-lg hover:bg-white/80 transition-colors cursor-pointer">
                    <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">Electrical Permit.pdf</div>
                      <div className="text-xs text-slate-600">Approved 1 week ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-white/50 rounded-lg hover:bg-white/80 transition-colors cursor-pointer">
                    <FileText className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">Material Specifications.xlsx</div>
                      <div className="text-xs text-slate-600">Updated 2 weeks ago</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
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