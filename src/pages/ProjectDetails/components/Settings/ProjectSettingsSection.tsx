/**
 * ProjectSettingsSection - Comprehensive project configuration and preferences
 * Mobile-first responsive design for construction project settings management
 * Handles project configuration, notifications, permissions, and advanced settings
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Bell, 
  Users, 
  Shield, 
  Palette, 
  Calendar, 
  MapPin, 
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Smartphone,
  Mail,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

// Types for project settings
interface ProjectSettings {
  general: {
    name: string;
    description: string;
    type: string;
    status: string;
    location: string;
    timezone: string;
  };
  notifications: {
    emailUpdates: boolean;
    smsAlerts: boolean;
    pushNotifications: boolean;
    weeklyReports: boolean;
    budgetAlerts: boolean;
    phaseCompletions: boolean;
  };
  permissions: {
    allowTeamEdits: boolean;
    requireApprovals: boolean;
    publicVisibility: boolean;
    guestAccess: boolean;
  };
  preferences: {
    theme: string;
    language: string;
    dateFormat: string;
    currency: string;
    workingHours: {
      start: string;
      end: string;
    };
  };
}

interface Project {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  location?: string;
}

interface ProjectSettingsSectionProps {
  project: Project;
  onSaveSettings?: (settings: ProjectSettings) => Promise<void>;
}

export function ProjectSettingsSection({ 
  project, 
  onSaveSettings 
}: ProjectSettingsSectionProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'permissions' | 'preferences'>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize settings with project data
  const [settings, setSettings] = useState<ProjectSettings>({
    general: {
      name: project.name || '',
      description: project.description || '',
      type: project.type || 'residential',
      status: project.status || 'planning',
      location: project.location || '',
      timezone: 'America/New_York'
    },
    notifications: {
      emailUpdates: true,
      smsAlerts: false,
      pushNotifications: true,
      weeklyReports: true,
      budgetAlerts: true,
      phaseCompletions: true
    },
    permissions: {
      allowTeamEdits: true,
      requireApprovals: false,
      publicVisibility: false,
      guestAccess: false
    },
    preferences: {
      theme: 'system',
      language: 'en',
      dateFormat: 'MM/dd/yyyy',
      currency: 'USD',
      workingHours: {
        start: '08:00',
        end: '17:00'
      }
    }
  });

  const updateSettings = (section: keyof ProjectSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const updateNestedSettings = (section: keyof ProjectSettings, parent: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parent]: {
          ...(prev[section] as any)[parent],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    if (!onSaveSettings) {
      toast.error('Save functionality not implemented');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveSettings(settings);
      setHasChanges(false);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    // Reset to original project values
    setSettings({
      general: {
        name: project.name || '',
        description: project.description || '',
        type: project.type || 'residential',
        status: project.status || 'planning',
        location: project.location || '',
        timezone: 'America/New_York'
      },
      notifications: {
        emailUpdates: true,
        smsAlerts: false,
        pushNotifications: true,
        weeklyReports: true,
        budgetAlerts: true,
        phaseCompletions: true
      },
      permissions: {
        allowTeamEdits: true,
        requireApprovals: false,
        publicVisibility: false,
        guestAccess: false
      },
      preferences: {
        theme: 'system',
        language: 'en',
        dateFormat: 'MM/dd/yyyy',
        currency: 'USD',
        workingHours: {
          start: '08:00',
          end: '17:00'
        }
      }
    });
    setHasChanges(false);
    toast.info('Settings reset to defaults');
  };

  const tabConfig = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette }
  ];

  return (
    <div className="space-y-6">
      {/* Settings Navigation */}
      <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-slate-100/20 backdrop-blur-md rounded-2xl">
        <CardContent className="p-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {tabConfig.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-buildease-blue-100 text-buildease-blue-700 shadow-md'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Settings Content */}
      <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-slate-100/20 backdrop-blur-md rounded-2xl">
        <CardContent className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={settings.general.name}
                    onChange={(e) => updateSettings('general', 'name', e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-type">Project Type</Label>
                  <Select
                    value={settings.general.type}
                    onValueChange={(value) => updateSettings('general', 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="renovation">Renovation</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={settings.general.description}
                  onChange={(e) => updateSettings('general', 'description', e.target.value)}
                  placeholder="Describe your project..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="project-location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="project-location"
                      value={settings.general.location}
                      onChange={(e) => updateSettings('general', 'location', e.target.value)}
                      placeholder="Enter project location"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-status">Status</Label>
                  <Select
                    value={settings.general.status}
                    onValueChange={(value) => updateSettings('general', 'status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-buildease-blue-600" />
                  Notification Preferences
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">Email Updates</p>
                        <p className="text-sm text-slate-600">Receive project updates via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.emailUpdates}
                      onCheckedChange={(checked) => updateSettings('notifications', 'emailUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">SMS Alerts</p>
                        <p className="text-sm text-slate-600">Critical updates via SMS</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.smsAlerts}
                      onCheckedChange={(checked) => updateSettings('notifications', 'smsAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">Push Notifications</p>
                        <p className="text-sm text-slate-600">Real-time app notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) => updateSettings('notifications', 'pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">Weekly Reports</p>
                        <p className="text-sm text-slate-600">Summary reports every week</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.weeklyReports}
                      onCheckedChange={(checked) => updateSettings('notifications', 'weeklyReports', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Permissions Settings */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-buildease-blue-600" />
                  Access & Permissions
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">Allow Team Edits</p>
                        <p className="text-sm text-slate-600">Team members can edit project details</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.permissions.allowTeamEdits}
                      onCheckedChange={(checked) => updateSettings('permissions', 'allowTeamEdits', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">Require Approvals</p>
                        <p className="text-sm text-slate-600">Major changes need approval</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.permissions.requireApprovals}
                      onCheckedChange={(checked) => updateSettings('permissions', 'requireApprovals', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">Public Visibility</p>
                        <p className="text-sm text-slate-600">Project visible to public</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.permissions.publicVisibility}
                      onCheckedChange={(checked) => updateSettings('permissions', 'publicVisibility', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Settings */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Palette className="h-5 w-5 text-buildease-blue-600" />
                  Display Preferences
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={settings.preferences.theme}
                      onValueChange={(value) => updateSettings('preferences', 'theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={settings.preferences.language}
                      onValueChange={(value) => updateSettings('preferences', 'language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select
                      value={settings.preferences.dateFormat}
                      onValueChange={(value) => updateSettings('preferences', 'dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                        <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                        <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={settings.preferences.currency}
                      onValueChange={(value) => updateSettings('preferences', 'currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Working Hours
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={settings.preferences.workingHours.start}
                        onChange={(e) => updateNestedSettings('preferences', 'workingHours', 'start', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={settings.preferences.workingHours.end}
                        onChange={(e) => updateNestedSettings('preferences', 'workingHours', 'end', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {hasChanges && (
        <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-slate-100/20 backdrop-blur-md rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">You have unsaved changes</span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={resetSettings}
                  disabled={isSaving}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="bg-buildease-blue-600 hover:bg-buildease-blue-700"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}