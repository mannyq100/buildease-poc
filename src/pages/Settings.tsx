/**
 * Settings component
 * Handles application settings and user preferences
 */
import React, { useState, useRef, useEffect, startTransition } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {Briefcase, Clock} from 'lucide-react';
import { CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Laptop, 
  Camera, 
  Mail, 
  Phone, 
  Calendar, 
  Award} from 'lucide-react';
import { Key } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Lock, KeyRound, Smartphone, MessageSquare, Monitor, LogOut } from 'lucide-react';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { profile, auth0User, updateSettings, isUpdating, isLoading } = useUserProfile();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pictureUrl: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        pictureUrl: profile.settings.pictureUrl || auth0User?.picture || ''
      });
    }
  }, [profile, auth0User]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    } as Intl.DateTimeFormatOptions);
  };

  // Calculate membership duration
  const getMembershipDuration = () => {
    if (!profile?.createdAt) return 'N/A';
    
    const createdDate = new Date(profile.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
    
    const diffYears = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    
    return `${diffYears} year${diffYears !== 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''}`;
  };

  // Calculate renewal date (mock function)
  const getRenewalDate = () => {
    if (!profile?.createdAt) return 'N/A';
    
    const createdDate = new Date(profile.createdAt);
    const renewalDate = new Date(createdDate);
    renewalDate.setFullYear(renewalDate.getFullYear() + 1); // Assuming yearly renewal
    
    return renewalDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    } as Intl.DateTimeFormatOptions);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Show progress indicator
    setShowProgress(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowProgress(false), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Create a blob URL for preview
    const imageUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      pictureUrl: imageUrl
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    updateSettings({
      name: formData.name,
      phone: formData.phone,
      settings: {
        ...profile.settings,  // Preserve existing settings
        pictureUrl: formData.pictureUrl  // Update only the picture URL
      }
    });
  };

  // Handle tab change with React 19's startTransition for smoother UI updates
  const handleTabChange = (value: string) => {
    startTransition(() => {
      setActiveTab(value);
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
        icon={<SettingsIcon className="h-6 w-6" />}
      />

      <div className="container mx-auto max-w-5xl">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-6 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
            <TabsTrigger value="account" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-md">
              <User size={16} />
              <span>Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-md">
              <Bell size={16} />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-md">
              <Moon size={16} />
              <span>Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-md">
              <Shield size={16} />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Profile Card */}
              <Card className="lg:col-span-2 overflow-hidden border-0 shadow-md dark:shadow-slate-900/30">
                <div className="h-40 bg-gradient-to-r from-blue-100 to-sky-200 dark:from-blue-900/30 dark:to-sky-900/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 dark:bg-black/10"></div>
                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>
                <CardContent className="relative px-8 py-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 mb-8 gap-6">
                    <div className="relative group">
                      <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-900 shadow-lg">
                        <AvatarImage
                          src={formData.pictureUrl || auth0User?.picture}
                          alt={profile?.name}
                        />
                        <AvatarFallback className="text-3xl bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                          {profile?.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 flex space-x-1">
                        <button
                          type="button"
                          onClick={triggerFileInput}
                          className="rounded-full bg-blue-500 p-2.5 text-white shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                        >
                          <Camera className="h-5 w-5" />
                        </button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureUpload}
                      />
                    </div>
                    <div className="text-center sm:text-left space-y-2">
                      <h2 className="text-3xl font-semibold">{profile?.name}</h2>
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Mail className="h-4 w-4" />
                        <span>{profile?.email}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-sm px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                          {profile?.role.charAt(0).toUpperCase() + profile?.role.slice(1)}
                        </Badge>
                        <Badge variant="outline" className="text-sm px-3 py-1 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                          {profile?.status || 'Active'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {showProgress && (
                    <div className="w-full max-w-md space-y-2 mb-8">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Uploading image...</span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {uploadProgress}%
                        </span>
                      </div>
                      <Progress 
                        value={uploadProgress} 
                        className="h-3 bg-blue-100 dark:bg-blue-900/30" 
                        indicatorClassName="bg-blue-500 dark:bg-blue-600"
                      />
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 py-6 border-t border-slate-200 dark:border-slate-800">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <User size={16} />
                          <span>Full Name</span>
                        </Label>
                        <input
                          id="name"
                          type="text"
                          className="w-full rounded-md border border-blue-200 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/50 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-600 dark:focus:ring-blue-600 text-base"
                          placeholder="Your Name"
                          value={formData.name}
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
                          className="w-full rounded-md border border-blue-200 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/50 text-base"
                          placeholder="your.email@example.com"
                          defaultValue={profile?.email || ''}
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
                          placeholder="Your phone number"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Calendar size={16} />
                          <span>Member Since</span>
                        </Label>
                        <div className="flex flex-col p-3 bg-blue-50 dark:bg-blue-900/50 rounded-md border border-blue-200 dark:border-blue-800">
                          <p className="font-medium text-base">{profile && formatDate(profile.createdAt)}</p>
                          <p className="text-sm text-blue-600/70 dark:text-blue-400/70 mt-1">{getMembershipDuration()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-4 flex flex-wrap gap-3">
                      <Button 
                        type="submit" 
                        variant="default" 
                        disabled={isUpdating}
                        className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors px-6 py-5 text-base h-auto"
                      >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setFormData({
                            name: profile?.name || '',
                            phone: profile?.phone || '',
                            pictureUrl: profile?.settings.pictureUrl || auth0User?.picture || ''
                          });
                        }}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/50 px-6 py-5 text-base h-auto"
                      >
                        Reset Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Account Stats Card */}
              <Card className="border-0 shadow-md dark:shadow-slate-900/30 h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-blue-500" />
                    <span>Account Overview</span>
                  </CardTitle>
                  <CardDescription className="text-base">Summary of your account activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-900/30">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-base font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          <span>Subscription</span>
                        </h3>
                        <Badge variant="outline" className="text-sm bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          <span>Active</span>
                        </Badge>
                      </div>
                      <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{profile?.tier}</p>
                      <div className="flex items-center gap-1.5 text-sm text-blue-600/70 dark:text-blue-400/70 mt-2">
                        <Clock className="h-4 w-4" />
                        <span>Renews on {getRenewalDate()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4" />
                          <span>Projects</span>
                        </h3>
                        <p className="text-2xl font-semibold">{profile ? Object.keys(profile.projectPermissions || {}).length : 0}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                          <Key className="h-4 w-4" />
                          <span>Permissions</span>
                        </h3>
                        <p className="text-2xl font-semibold">{profile?.permissions.length || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-base font-medium mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <span>Account Permissions</span>
                    </h3>
                    <div className="space-y-0 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                      {profile?.permissions.slice(0, 5).map((permission, index) => (
                        <div key={index} className="flex items-center justify-between text-sm py-3 px-4 border-b last:border-b-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <span className="text-slate-600 dark:text-slate-300 capitalize">{permission.split(':')[0]}</span>
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                            {permission.split(':')[1]}
                          </Badge>
                        </div>
                      ))}
                      {profile?.permissions && profile.permissions.length > 5 && (
                        <Button variant="ghost" size="sm" className="w-full text-sm py-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20">
                          View all {profile.permissions.length} permissions
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="border-0 shadow-md dark:shadow-slate-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Notification Settings</CardTitle>
                <CardDescription>
                  Manage how you receive notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Notification Channels</h3>
                      <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-600/90 dark:text-blue-400/90">Choose how you want to receive notifications from BuildEase</p>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20">
                            <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <Label className="text-base font-medium">Email Notifications</Label>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 pl-10">
                          Receive email notifications for important updates
                        </p>
                      </div>
                      <Switch checked={profile?.settings?.notifications?.email} />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20">
                            <Bell className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <Label className="text-base font-medium">Push Notifications</Label>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 pl-10">
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <Switch checked={profile?.settings?.notifications?.push} />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="text-base font-medium">Notification Types</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select which types of notifications you'd like to receive
                  </p>
                  
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="font-medium">Project Updates</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Changes to your projects</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="font-medium">Task Assignments</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">When you're assigned a new task</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="font-medium">Phase Completions</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">When a project phase is completed</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="font-medium">Team Messages</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Messages from team members</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="default" 
                    className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    Save Notification Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="border-0 shadow-md dark:shadow-slate-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Appearance Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Theme Preference</h3>
                    <p className="text-sm text-blue-600/90 dark:text-blue-400/90">Choose how BuildEase looks to you</p>
                  </div>
                  
                  <div className="space-y-3">
                    <RadioGroup 
                      defaultValue={theme} 
                      onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')} 
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div className="flex flex-col space-y-2 rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors dark:border-gray-700 cursor-pointer relative">
                        <RadioGroupItem value="light" id="theme-light" className="absolute right-4 top-4" />
                        <div className="h-24 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                          <Sun size={32} className="text-amber-500" />
                        </div>
                        <Label htmlFor="theme-light" className="flex flex-col gap-1 font-medium cursor-pointer">
                          <span>Light</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Bright mode with light backgrounds</span>
                        </Label>
                      </div>
                      
                      <div className="flex flex-col space-y-2 rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors dark:border-gray-700 cursor-pointer relative">
                        <RadioGroupItem value="dark" id="theme-dark" className="absolute right-4 top-4" />
                        <div className="h-24 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center shadow-sm">
                          <Moon size={32} className="text-blue-400" />
                        </div>
                        <Label htmlFor="theme-dark" className="flex flex-col gap-1 font-medium cursor-pointer">
                          <span>Dark</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Dark mode with reduced brightness</span>
                        </Label>
                      </div>
                      
                      <div className="flex flex-col space-y-2 rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors dark:border-gray-700 cursor-pointer relative">
                        <RadioGroupItem value="system" id="theme-system" className="absolute right-4 top-4" />
                        <div className="h-24 rounded-md bg-gradient-to-r from-white to-slate-900 border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden">
                          <div className="flex items-center gap-2">
                            <Sun size={24} className="text-amber-500" />
                            <Laptop size={28} className="text-slate-500" />
                            <Moon size={24} className="text-blue-400" />
                          </div>
                        </div>
                        <Label htmlFor="theme-system" className="flex flex-col gap-1 font-medium cursor-pointer">
                          <span>System</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Follow your device's theme setting</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-medium mb-2">UI Density</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Adjust the spacing and density of UI elements
                      </p>
                    </div>
                    
                    <RadioGroup defaultValue="comfortable" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-2 rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors dark:border-gray-700 cursor-pointer relative">
                        <RadioGroupItem value="comfortable" id="density-comfortable" className="absolute right-4 top-4" />
                        <div className="h-20 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                          <div className="flex flex-col items-center gap-4 w-4/5">
                            <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700"></div>
                            <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700"></div>
                          </div>
                        </div>
                        <Label htmlFor="density-comfortable" className="flex flex-col gap-1 font-medium cursor-pointer">
                          <span>Comfortable</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Standard spacing between elements</span>
                        </Label>
                      </div>
                      
                      <div className="flex flex-col space-y-2 rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors dark:border-gray-700 cursor-pointer relative">
                        <RadioGroupItem value="compact" id="density-compact" className="absolute right-4 top-4" />
                        <div className="h-20 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                          <div className="flex flex-col items-center gap-2 w-4/5">
                            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700"></div>
                            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700"></div>
                            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700"></div>
                          </div>
                        </div>
                        <Label htmlFor="density-compact" className="flex flex-col gap-1 font-medium cursor-pointer">
                          <span>Compact</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Reduced spacing for more content</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      variant="default" 
                      className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      Save Appearance Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="border-0 shadow-md dark:shadow-slate-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and authentication options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Account Security Status</h3>
                      <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                        Secure
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-600/90 dark:text-blue-400/90">Your account has strong security measures in place</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-medium mb-2">Password</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Manage your account password
                      </p>
                    </div>
                    
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <Lock size={18} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Password</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Last changed: 30 days ago</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1">
                          <KeyRound size={14} />
                          <span>Change Password</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-medium mb-2">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <Smartphone size={18} className="text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Authenticator App</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Use an authenticator app to generate codes</p>
                          </div>
                        </div>
                        <Switch defaultChecked={false} />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <MessageSquare size={18} className="text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">SMS Authentication</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Receive codes via text message</p>
                          </div>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-medium mb-2">Login Sessions</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Manage your active login sessions
                      </p>
                    </div>
                    
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                            <Monitor size={18} className="text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Current Session</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">MacOS · Chrome · San Francisco, CA</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                          Active Now
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                            <Smartphone size={18} className="text-slate-600 dark:text-slate-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Mobile Session</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">iOS · Safari · San Francisco, CA</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-slate-600 dark:text-slate-300">
                          3 days ago
                        </Badge>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="gap-1 mt-2">
                      <LogOut size={14} />
                      <span>Sign Out All Other Sessions</span>
                    </Button>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      variant="default" 
                      className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      Save Security Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;