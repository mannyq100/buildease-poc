/**
 * Settings component
 * Handles application settings and user preferences
 */
import React, { useState, useEffect, startTransition } from 'react';
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
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      companyName: profile?.companyName || '',
      pictureUrl: profile?.avatarUrl || user?.user_metadata?.avatar_url || ''
    });
  };

  const handleTabChange = (value: string) => {
    startTransition(() => {
      setActiveTab(value as SettingsTab);
    });
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
      component: <NotificationSettings profile={profile} />
    },
    {
      value: 'appearance',
      label: 'Appearance',
      icon: Moon,
      component: <AppearanceSettings />
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
              const IconComponent = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-md text-xs sm:text-sm px-2 sm:px-4 py-2"
                >
                  <IconComponent size={16} className="hidden sm:block" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabConfig.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}