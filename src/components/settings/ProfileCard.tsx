/**
 * ProfileCard component for account settings
 * Handles profile information editing and avatar upload
 */
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Camera, Mail, User } from 'lucide-react';
import { MediaService } from '@/services/MediaService';
import { useMemoryManagement } from '@/utils/memoryManager';
import { useToast } from '@/hooks/use-toast';
import type { SettingsFormData, ProfileUploadState } from '@/types/settings';
import type { UserProfile } from '@/types/user';

interface ProfileCardProps {
  formData: SettingsFormData;
  uploadState: ProfileUploadState;
  profile: UserProfile | null;
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
  const { createPreviewUrl, revokePreviewUrl } = useMemoryManagement();

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

    let previewUrl: string | null = null;
    try {
      // Show progress and preview immediately
      onUploadStateChange({ showProgress: true, uploadProgress: 10 });

      // Create a preview URL for immediate feedback
      previewUrl = createPreviewUrl(file);
      onFormDataChange({ pictureUrl: previewUrl });
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        onUploadStateChange({ 
          uploadProgress: Math.min((uploadState.uploadProgress || 0) + 15, 90) 
        });
      }, 300);

      // Use the unified MediaService for profile upload
      const results = await MediaService.upload([file], {
        projectId: undefined, // No project for user profile images
        type: 'profile',
        userId: user.id,
        name: `Profile picture for ${user.id}`,
        description: 'User profile image'
      });

      // Clear the progress interval
      clearInterval(progressInterval);
      onUploadStateChange({ uploadProgress: 100 });

      if (results.length > 0) {
        const uploadedMedia = results[0];
        // Update the form with the new URL
        onFormDataChange({ pictureUrl: uploadedMedia.file_path });
        toast({
          title: "Image uploaded",
          description: "Profile picture uploaded successfully!",
        });
      } else {
        throw new Error('No upload results returned');
      }

      // Clean up preview URL and hide progress
      if (previewUrl) {
        revokePreviewUrl(previewUrl);
      }
      setTimeout(() => onUploadStateChange({ showProgress: false }), 500);

    } catch (error) {
      console.error('Error in upload process:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      onUploadStateChange({ showProgress: false });
      
      // Clean up preview URL on error
      if (previewUrl) {
        revokePreviewUrl(previewUrl);
      }
      
      // Revert to previous image
      onFormDataChange({
        pictureUrl: profile?.avatarUrl || user?.user_metadata?.avatar_url || ''
      });
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg overflow-hidden">
      {/* Enhanced Header */}
      <CardHeader className="bg-gradient-to-br from-buildease-blue-50 via-blue-50 to-orange-50 dark:from-buildease-blue-900/20 dark:via-blue-900/20 dark:to-orange-900/20 border-b border-buildease-blue-200/50 dark:border-buildease-blue-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-buildease-blue-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Profile Information
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage your personal information and preferences
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {/* Profile Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-700 shadow-lg ring-2 ring-buildease-blue-100 dark:ring-buildease-blue-900/50">
              <AvatarImage
                src={formData.pictureUrl || user?.user_metadata?.avatar_url}
                alt={`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()}
              />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-buildease-blue-100 to-orange-100 text-buildease-blue-700 dark:from-buildease-blue-900/50 dark:to-orange-900/50 dark:text-buildease-blue-300">
                {profile?.firstName?.[0] || profile?.lastName?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={triggerFileInput}
              className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-r from-buildease-blue-500 to-buildease-blue-600 p-2.5 text-white shadow-lg hover:from-buildease-blue-600 hover:to-buildease-blue-700 focus:outline-none focus:ring-2 focus:ring-buildease-blue-500 focus:ring-offset-2 transition-all duration-300 hover:scale-110"
              aria-label="Upload profile picture"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePictureUpload}
            />
          </div>

          <div className="text-center sm:text-left space-y-3 flex-1">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'User Name'}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-600 dark:text-slate-400 mt-1">
                <Mail className="h-4 w-4" />
                <span>{profile?.email || user?.email}</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <Badge className="bg-buildease-blue-100 text-buildease-blue-700 border-buildease-blue-200 dark:bg-buildease-blue-900/30 dark:text-buildease-blue-300 dark:border-buildease-blue-700">
                Member
              </Badge>
              <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                Active
              </Badge>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadState.showProgress && (
          <div className="bg-gradient-to-r from-buildease-blue-50 to-orange-50 dark:from-buildease-blue-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-buildease-blue-200/50 dark:border-buildease-blue-700/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-buildease-blue-700 dark:text-buildease-blue-300">Uploading image...</span>
              <span className="text-sm font-bold text-buildease-blue-600 dark:text-buildease-blue-400">
                {uploadState.uploadProgress}%
              </span>
            </div>
            <Progress 
              value={uploadState.uploadProgress} 
              className="h-2 bg-buildease-blue-100 dark:bg-buildease-blue-900/30" 
            />
          </div>
        )}

        {/* Enhanced Form Section */}
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="h-11 border-slate-300 dark:border-slate-600 focus:border-buildease-blue-500 focus:ring-buildease-blue-500/20 transition-colors"
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="h-11 border-slate-300 dark:border-slate-600 focus:border-buildease-blue-500 focus:ring-buildease-blue-500/20 transition-colors"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="h-11 border-slate-300 dark:border-slate-600 focus:border-buildease-blue-500 focus:ring-buildease-blue-500/20 transition-colors"
              placeholder="Enter your email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="h-11 border-slate-300 dark:border-slate-600 focus:border-buildease-blue-500 focus:ring-buildease-blue-500/20 transition-colors"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Company
            </Label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="h-11 border-slate-300 dark:border-slate-600 focus:border-buildease-blue-500 focus:ring-buildease-blue-500/20 transition-colors"
              placeholder="Enter your company name"
            />
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="submit"
              disabled={isLoadingProfile || uploadState.isUpdating}
              className="flex-1 h-11 bg-gradient-to-r from-buildease-blue-500 to-buildease-blue-600 hover:from-buildease-blue-600 hover:to-buildease-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {uploadState.isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="flex-1 h-11 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Reset Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}