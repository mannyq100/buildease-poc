import { Button } from '@/components/ui/button';
import { X, Upload, Check, Image as ImageIcon, Calendar } from 'lucide-react';
import { cn } from '@/utils/core/ui';
import { Badge } from '@/components/ui/badge';
import { useProjectImages, UseProjectImagesReturn } from '@/hooks/useProjectImages';

type ImageType = 'inspiration' | 'progress' | 'profile';

interface ImageTypeConfig {
  title: string;
  description: string;
  color: string;
  addButtonText: string;
  localBadgeColor: string;
  borderColor: string;
  hoverColor: string;
}

const getImageTypeConfig = (imageType: ImageType): ImageTypeConfig => {
  switch(imageType) {
    case 'inspiration':
      return {
        title: 'Inspirational Images',
        description: 'Design references & ideas',
        color: 'orange',
        addButtonText: 'Add Image',
        localBadgeColor: 'bg-orange-500',
        borderColor: 'border-orange-300 dark:border-orange-700',
        hoverColor: 'hover:border-orange-400 hover:bg-orange-100/50'
      };
    case 'progress':
      return {
        title: 'Progress Images',
        description: 'Construction progress photos',
        color: 'green',
        addButtonText: 'Add Photo',
        localBadgeColor: 'bg-green-500',
        borderColor: 'border-green-300 dark:border-green-700',
        hoverColor: 'hover:border-green-400 hover:bg-green-100/50'
      };
    case 'profile':
      return {
        title: 'Profile Picture',
        description: 'Main project photo',
        color: 'blue',
        addButtonText: 'Add Photo',
        localBadgeColor: 'bg-blue-500',
        borderColor: 'border-blue-300 dark:border-blue-700',
        hoverColor: 'hover:border-blue-400 hover:bg-blue-100/50'
      };
  }
};

interface ProjectImageUploadProps {
  imageType: ImageType;
  projectId?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  className?: string;
  profileImage?: string | null;
  onSelectProfileImage?: (url: string) => void;
  hookInstance?: UseProjectImagesReturn;
}

export function ProjectImageUpload({
  imageType,
  projectId,
  value = [],
  onChange,
  maxImages = 5,
  className,
  profileImage = null,
  onSelectProfileImage,
  hookInstance
}: ProjectImageUploadProps) {
  // Get configuration for this image type
  const config = getImageTypeConfig(imageType);
  // Use the provided hook instance or create a new one
  const {
    images,
    localFiles,
    profileImage: activeProfileImage,
    isUploading,
    uploadProgress,
    uploadError,
    handleFileSelection,
    handleRemoveLocal,
    handleRemove,
    handleSelectProfileImage,
    handleSelectLocalProfileImage,
    hasLocalFiles
  } = hookInstance || useProjectImages({
    imageType,
    projectId,
    initialImages: value,
    initialProfileImage: profileImage,
    maxImages,
    onChange,
    onProfileImageChange: onSelectProfileImage
  });
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
      // Reset the input after selection
      e.target.value = '';
    }
  };
  
  // Calculate total images (remote + local)
  const totalImages = value.length + localFiles.length;
  
  return (
    <div className={cn("space-y-4", className)}>
      {uploadError && (
        <p className="text-sm text-red-600 font-opensans">{uploadError}</p>
      )}
      
      {hasLocalFiles && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-300 font-opensans flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span>Images will be uploaded when you submit the form</span>
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {/* Remote images (already uploaded) */}
        {value.map((url, index) => (
          <div 
            key={`remote-${index}`} 
            className={cn(
              "relative group aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300",
              profileImage === url 
                ? "border-[#2B6CB0] ring-2 ring-[#2B6CB0]/30" 
                : "border-slate-200 dark:border-slate-700"
            )}
          >
            <img 
              src={url} 
              alt={`Inspiration ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            
            {/* Profile image badge */}
            {profileImage === url && (
              <Badge 
                className="absolute top-2 left-2 bg-[#2B6CB0] text-white"
                variant="secondary"
              >
                <Check className="h-3 w-3 mr-1" />
                Profile
              </Badge>
            )}
            
            {/* Hover overlay with actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={profileImage === url ? "default" : "outline"}
                onClick={() => handleSelectProfileImage(url)}
                className="text-xs h-7 px-2 whitespace-nowrap"
              >
                {profileImage === url ? 'Profile' : 'Set Profile'}
              </Button>
              
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={() => handleRemove(url)}
                className="rounded-full h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {/* Local files (not yet uploaded) */}
        {localFiles.map((localFile) => (
          <div 
            key={localFile.id} 
            className={cn(
              "relative group aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300",
              "border-dashed", // Dashed border indicates not yet uploaded
              profileImage === null && localFile.id === activeProfileImage 
                ? "border-[#2B6CB0] ring-2 ring-[#2B6CB0]/30" 
                : config.borderColor
            )}
          >
            <img 
              src={localFile.previewUrl} 
              alt={`New inspiration image`} 
              className="w-full h-full object-cover"
            />
            
            {/* Local badge */}
            <Badge 
              className={cn("absolute top-2 right-2 text-white", config.localBadgeColor)}
              variant="secondary"
            >
              Local
            </Badge>
            
            {/* Profile image badge */}
            {profileImage === null && localFile.id === activeProfileImage && (
              <Badge 
                className="absolute top-2 left-2 bg-[#2B6CB0] text-white"
                variant="secondary"
              >
                <Check className="h-3 w-3 mr-1" />
                Profile
              </Badge>
            )}
            
            {/* Hover overlay with actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={profileImage === null && localFile.id === activeProfileImage ? "default" : "outline"}
                onClick={() => handleSelectLocalProfileImage(localFile.id)}
                className="text-xs h-7 px-2 whitespace-nowrap"
              >
                {profileImage === null && localFile.id === activeProfileImage ? 'Profile' : 'Set Profile'}
              </Button>
              
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={() => handleRemoveLocal(localFile.id)}
                className="rounded-full h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {/* Upload placeholder */}
        {totalImages < maxImages && (
          <div className="relative">
            {isUploading ? (
              <div className="border-2 border-blue-300 dark:border-blue-700 rounded-lg flex flex-col items-center justify-center p-3 h-full aspect-square bg-blue-50/50 dark:bg-blue-900/20">
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-3"></div>
                  <div className="text-center px-1">
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 leading-tight">
                      Uploading...
                    </p>
                    <p className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                      {uploadProgress}%
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <label className={cn(
                "border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-2 h-full aspect-square cursor-pointer transition-all duration-300 bg-white/60 dark:bg-slate-800/50 hover:bg-white/80 hover:shadow-lg group",
                config.borderColor,
                config.hoverColor
              )}>
                <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 h-full">
                  <div className={cn(
                    "w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                    imageType === 'inspiration' ? "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600" :
                    imageType === 'progress' ? "bg-gradient-to-br from-green-100 to-green-200 text-green-600" :
                    "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600"
                  )}>
                    {imageType === 'progress' ? <Calendar className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

