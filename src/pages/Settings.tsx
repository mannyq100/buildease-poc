/**
 * Settings component
 * Handles application settings and user preferences
 */
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-4">
        <Tabs 
          defaultValue={activeTab} 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-full"
        >
          {/* Enhanced Tab Navigation */}
          <div className="mb-8">
            <TabsList className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-1.5 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 gap-1 h-auto">
              {tabConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                return (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value}
                    className={`
                      relative px-3 py-2.5 rounded-lg transition-all duration-300 font-medium h-auto min-h-[44px]
                      flex items-center justify-center text-center
                      ${isActive 
                        ? 'bg-gradient-to-r from-buildease-blue-500 to-buildease-blue-600 text-white shadow-md shadow-buildease-blue-500/25' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-buildease-blue-600 dark:hover:text-buildease-blue-400 hover:bg-buildease-blue-50 dark:hover:bg-buildease-blue-900/20'
                      }
                    `}
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 w-full">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium leading-tight text-center">{tab.label}</span>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Enhanced Tab Content */}
          <TabsContent value="account" className="space-y-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2">
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
              </div>
              <div className="lg:col-span-1">
                <AccountOverview profile={profile} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-0">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
              <NotificationSettings profile={profile} onSave={handleSaveSettings} />
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-0">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
              <AppearanceSettings profile={profile} onSave={handleSaveSettings} />
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-0">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
              <SecuritySettings />
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
}