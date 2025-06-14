/**
 * Settings component
 * Handles application settings and user preferences
 */
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Moon 
} from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  ProfileCard,
  AccountOverview,
  NotificationSettings,
  AppearanceSettings,
  SecuritySettings
} from '@/components/settings';
import type { SettingsFormData, ProfileUploadState, SettingsTab } from '@/types/settings';
import type { UserSettings } from '@/types/user';

export default function Settings() {
  const { profile, updateProfile, user, isLoadingProfile } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [formData, setFormData] = useState<SettingsFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    pictureUrl: ''
  });
  
  const [uploadState, setUploadState] = useState<ProfileUploadState>({
    uploadProgress: 0,
    showProgress: false,
    isUpdating: false
  });

  useEffect(() => {
    if (profile && user) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: user.email || '',
        phone: profile.phone || '',
        companyName: profile.companyName || '',
        pictureUrl: profile.avatarUrl || user?.user_metadata?.avatar_url || ''
      });
    }
  }, [profile, user]);

  const handleFormDataChange = (data: Partial<SettingsFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleUploadStateChange = (state: Partial<ProfileUploadState>) => {
    setUploadState(prev => ({ ...prev, ...state }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    try {
      setUploadState(prev => ({ ...prev, isUpdating: true }));
      
      const settingsToUpdate = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        companyName: formData.companyName,
        avatarUrl: formData.pictureUrl
      };
      
      const { error } = await updateProfile(settingsToUpdate);
      
      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Update failed",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully!",
        });
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadState(prev => ({ ...prev, isUpdating: false }));
    }
  };

  const handleReset = () => {
    if (profile && user) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: user.email || '',
        phone: profile.phone || '',
        companyName: profile.companyName || '',
        pictureUrl: profile.avatarUrl || user?.user_metadata?.avatar_url || ''
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as SettingsTab);
  };

  const handleSaveSettings = async (newSettings: Partial<UserSettings>) => {
    if (!profile) return;

    const updatedSettings = {
      ...profile.settings,
      ...newSettings,
    };

    try {
      await updateProfile({ settings: updatedSettings });
      toast({
        title: 'Settings Saved',
        description: 'Your preferences have been updated successfully.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error Saving Settings',
        description: 'Could not save your preferences. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  const tabConfig = [
    { 
      value: 'account', 
      label: 'Account', 
      icon: User,
      component: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ProfileCard
            formData={formData}
            uploadState={uploadState}
            profile={profile}
            user={user}
            isLoadingProfile={isLoadingProfile}
            onFormDataChange={handleFormDataChange}
            onUploadStateChange={handleUploadStateChange}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />
          <AccountOverview profile={profile} />
        </div>
      )
    },
    {
      value: 'notifications',
      label: 'Notifications',
      icon: Bell,
      component: <NotificationSettings profile={profile} onSave={handleSaveSettings} />
    },
    {
      value: 'appearance',
      label: 'Appearance',
      icon: Moon,
      component: <AppearanceSettings profile={profile} onSave={handleSaveSettings} />
    },
    {
      value: 'security',
      label: 'Security',
      icon: Shield,
      component: <SecuritySettings />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
        icon={<SettingsIcon className="h-6 w-6" />}
      />

      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <Tabs 
          defaultValue={activeTab} 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-full"
        >
          <TabsList className="mb-6 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 gap-0">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value}>
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="account">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ProfileCard
                formData={formData}
                uploadState={uploadState}
                profile={profile}
                user={user}
                isLoadingProfile={isLoadingProfile}
                onFormDataChange={handleFormDataChange}
                onUploadStateChange={handleUploadStateChange}
                onSubmit={handleSubmit}
                onReset={handleReset}
              />
              <AccountOverview profile={profile} className="lg:col-span-1" />
            </div>
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationSettings profile={profile} onSave={handleSaveSettings} />
          </TabsContent>
          <TabsContent value="appearance">
            <AppearanceSettings profile={profile} onSave={handleSaveSettings} />
          </TabsContent>
          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}