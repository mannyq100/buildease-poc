/**
 * ProfileCard component for account settings
 * Handles profile information editing and avatar upload
 */
import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Briefcase, Camera } from 'lucide-react';
import { createPreviewUrl, revokePreviewUrl } from '@/utils/core/fileUpload';
import { uploadProfilePicture } from '@/utils/core/storageUtils';
import { useToast } from '@/hooks/use-toast';
import type { SettingsFormData, ProfileUploadState } from '@/types/settings';

interface ProfileCardProps {
  formData: SettingsFormData;
  uploadState: ProfileUploadState;
  profile: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatarUrl?: string;
  } | null;
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      avatar_url?: string;
    };
  } | null;
  isLoadingProfile: boolean;
  onFormDataChange: (data: Partial<SettingsFormData>) => void;
  onUploadStateChange: (state: Partial<ProfileUploadState>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export function ProfileCard({
  formData,
  uploadState,
  profile,
  user,
  isLoadingProfile,
  onFormDataChange,
  onUploadStateChange,
  onSubmit,
  onReset
}: ProfileCardProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    onFormDataChange({ [id]: value });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      // Show progress and preview immediately
      onUploadStateChange({ showProgress: true, uploadProgress: 10 });

      // Create a preview URL for immediate feedback
      const previewUrl = createPreviewUrl(file);
      onFormDataChange({ pictureUrl: previewUrl });
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        onUploadStateChange({ 
          uploadProgress: Math.min((uploadState.uploadProgress || 0) + 15, 90) 
        });
      }, 300);

      // Use the new uploadProfilePicture function
      const result = await uploadProfilePicture(file, user.id);

      // Clear the progress interval
      clearInterval(progressInterval);
      onUploadStateChange({ uploadProgress: 100 });

      if (result.success && result.url) {
        // Update the form with the new URL
        onFormDataChange({ pictureUrl: result.url });
        toast({
          title: "Image uploaded",
          description: "Profile picture uploaded successfully!",
        });
      } else {
        // Handle upload failure
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload image. Please try again.",
          variant: "destructive",
        });
        
        // Revert to previous image
        onFormDataChange({
          pictureUrl: profile?.avatarUrl || user?.user_metadata?.avatar_url || ''
        });
      }

      // Clean up and hide progress
      revokePreviewUrl(previewUrl);
      setTimeout(() => onUploadStateChange({ showProgress: false }), 500);

    } catch (error) {
      console.error('Error in upload process:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      onUploadStateChange({ showProgress: false });
      
      onFormDataChange({
        pictureUrl: profile?.avatarUrl || user?.user_metadata?.avatar_url || ''
      });
    }
  };

  return (
    <Card className="lg:col-span-2 overflow-hidden border-0 shadow-md dark:shadow-slate-900/30">
      {/* Hero Section */}
      <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-100 to-sky-200 dark:from-blue-900/30 dark:to-sky-900/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/20 dark:bg-black/10"></div>
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/10 to-transparent"></div>
      </div>

      <CardContent className="relative px-4 sm:px-8 py-6">
        {/* Profile Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20 mb-6 sm:mb-8 gap-4 sm:gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white dark:border-slate-900 shadow-lg">
              <AvatarImage
                src={formData.pictureUrl || user?.user_metadata?.avatar_url}
                alt={`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()}
              />
              <AvatarFallback className="text-xl sm:text-3xl bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                {profile?.firstName?.[0] || profile?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={triggerFileInput}
              className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 rounded-full bg-blue-500 p-2 sm:p-2.5 text-white shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
              aria-label="Upload profile picture"
            >
              <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePictureUpload}
            />
          </div>

          <div className="text-center sm:text-left space-y-2 flex-1 min-w-0">
            <h2 className="text-xl sm:text-3xl font-semibold truncate">
              {`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'User Name'}
            </h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{profile?.email || user?.email}</span>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
              <Badge variant="outline" className="text-sm px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                Member
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                Active
              </Badge>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadState.showProgress && (
          <div className="w-full max-w-md space-y-2 mb-6 sm:mb-8">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Uploading image...</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {uploadState.uploadProgress}%
              </span>
            </div>
            <Progress 
              value={uploadState.uploadProgress} 
              className="h-3 bg-blue-100 dark:bg-blue-900/30" 
              indicatorClassName="bg-blue-500 dark:bg-blue-600"
            />
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-8 sm:gap-y-6 py-6 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-3">
              <Label htmlFor="firstName" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <User size={16} />
                <span>First Name</span>
              </Label>
              <input
                id="firstName"
                type="text"
                className="w-full rounded-md border border-blue-200 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/50 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-600 dark:focus:ring-blue-600 text-base"
                placeholder="Your First Name"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="lastName" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <User size={16} />
                <span>Last Name</span>
              </Label>
              <input
                id="lastName"
                type="text"
                className="w-full rounded-md border border-blue-200 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/50 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-600 dark:focus:ring-blue-600 text-base"
                placeholder="Your Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Mail size={16} />
                <span>Email Address</span>
              </Label>
              <input
                id="email"
                type="email"
                className="w-full rounded-md border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/30 focus:border-slate-500 focus:ring-slate-500 text-base text-slate-500 dark:text-slate-400"
                placeholder="your.email@example.com"
                value={formData.email} 
                readOnly
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Phone size={16} />
                <span>Phone Number</span>
              </Label>
              <input
                id="phone"
                type="tel"
                className="w-full rounded-md border border-blue-200 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/50 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-600 dark:focus:ring-blue-600 text-base"
                placeholder="(123) 456-7890"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-3 sm:col-span-2">
              <Label htmlFor="companyName" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Briefcase size={16} />
                <span>Company Name</span>
              </Label>
              <input
                id="companyName"
                type="text"
                className="w-full rounded-md border border-blue-200 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/50 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-600 dark:focus:ring-blue-600 text-base"
                placeholder="Your Company Name"
                value={formData.companyName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-4 flex flex-col sm:flex-row gap-3">
            <Button 
              type="submit" 
              variant="default" 
              disabled={isLoadingProfile || uploadState.isUpdating}
              className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors px-6 py-3 sm:py-5 text-base h-auto w-full sm:w-auto"
            >
              {uploadState.isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onReset}
              className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/50 px-6 py-3 sm:py-5 text-base h-auto w-full sm:w-auto"
            >
              Reset Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}