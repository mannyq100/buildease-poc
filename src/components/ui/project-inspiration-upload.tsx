import { Button } from '@/components/ui/button';
import { X, Upload, Check, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/utils/core/ui';
import { Badge } from '@/components/ui/badge';
import { useProjectInspirationImages, UseProjectInspirationImagesReturn } from '@/hooks/useProjectInspirationImages';

interface ProjectInspirationUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  className?: string;
  profileImage?: string | null;
  onSelectProfileImage?: (url: string) => void;
  hookInstance?: UseProjectInspirationImagesReturn;
}

export function ProjectInspirationUpload({
  value = [],
  onChange,
  maxImages = 5,
  className,
  profileImage = null,
  onSelectProfileImage,
  hookInstance
}: ProjectInspirationUploadProps) {
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
  } = hookInstance || useProjectInspirationImages({
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
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                className="text-xs h-8 px-2"
              >
                {profileImage === url ? 'Selected' : 'Set as Profile'}
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
                : "border-amber-300 dark:border-amber-700"
            )}
          >
            <img 
              src={localFile.previewUrl} 
              alt={`New inspiration image`} 
              className="w-full h-full object-cover"
            />
            
            {/* Local badge */}
            <Badge 
              className="absolute top-2 right-2 bg-amber-500 text-white"
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
                className="text-xs h-8 px-2"
              >
                {profileImage === null && localFile.id === activeProfileImage ? 'Selected' : 'Set as Profile'}
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
              <div className="border-2 border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center p-4 h-full aspect-square bg-slate-50 dark:bg-slate-800">
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-[#2B6CB0] border-t-transparent animate-spin mb-4"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-opensans">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center p-4 h-full aspect-square cursor-pointer hover:border-[#2B6CB0] transition-colors bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                    <Upload className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium font-inter">Select Image</span>
                  <span className="text-xs mt-1 font-opensans">JPG, PNG, WebP (max 5MB)</span>
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
