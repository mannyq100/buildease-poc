import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseModal } from '@/components/ui/BaseModal';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bell, 
  Shield, 
  Trash2,
  AlertTriangle,
  Mail,
  Smartphone,
  Calendar,
  Globe,
  Database,
  Save,
  RefreshCw
} from 'lucide-react';

// Mock project settings data
const mockProjectSettings = {
  general: {
    name: 'Modern Downtown Office Complex',
    description: 'A 12-story mixed-use building featuring office spaces, retail units, and underground parking.',
    status: 'active',
    priority: 'high',
    visibility: 'team',
    timezone: 'America/New_York',
    currency: 'USD',
    language: 'en',
    tags: ['commercial', 'office', 'downtown', 'LEED-certified']
  },
  notifications: {
    email: {
      taskUpdates: true,
      budgetAlerts: true,
      teamChanges: true,
      documentUploads: false,
      deadlineReminders: true,
      weeklyReports: true
    },
    sms: {
      urgentAlerts: true,
      dailyDigest: false,
      emergencyOnly: true
    },
    inApp: {
      allUpdates: true,
      mentions: true,
      deadlines: true,
      comments: true
    },
    frequency: {
      digestFrequency: 'daily',
      reminderTiming: '24h'
    }
  },
  permissions: {
    teamManagement: ['Project Manager', 'Site Supervisor'],
    budgetAccess: ['Project Manager'],
    documentManagement: ['Project Manager', 'Architect'],
    taskAssignment: ['Project Manager', 'Site Supervisor'],
    reportGeneration: ['Project Manager'],
    settings: ['Project Manager']
  },
  integrations: {
    calendar: {
      enabled: true,
      provider: 'google',
      syncDeadlines: true,
      syncMeetings: true
    },
    accounting: {
      enabled: false,
      provider: null,
      autoSync: false
    },
    weatherApi: {
      enabled: true,
      alerts: true,
      location: 'New York, NY'
    },
    reporting: {
      enabled: true,
      autoGenerate: true,
      frequency: 'weekly'
    }
  },
  advanced: {
    dataRetention: '7years',
    backupFrequency: 'daily',
    archiveAfter: '1year',
    deleteAfter: 'never'
  }
};

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSettingsUpdate?: () => void;
}

export function ProjectSettingsModal({ 
  isOpen, 
  onClose, 
  projectId, 
  onSettingsUpdate 
}: ProjectSettingsModalProps) {
  const [settings, setSettings] = useState(mockProjectSettings);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Simulate loading settings
      setLoading(true);
      setTimeout(() => {
        setSettings(mockProjectSettings);
        setLoading(false);
        setHasChanges(false);
      }, 500);
    }
  }, [isOpen, projectId]);

  const handleSave = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      onSettingsUpdate?.();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (path: string[], value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      let current = newSettings;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]] = { ...current[path[i]] };
      }
      current[path[path.length - 1]] = value;
      
      setHasChanges(true);
      return newSettings;
    });
  };

  const addTag = (tag: string) => {
    if (tag && !settings.general.tags.includes(tag)) {
      updateSetting(['general', 'tags'], [...settings.general.tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateSetting(['general', 'tags'], settings.general.tags.filter(tag => tag !== tagToRemove));
  };

  const handleArchiveProject = async () => {
    if (confirm('Are you sure you want to archive this project? It will be moved to archived projects and can be restored later.')) {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        onClose();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteProject = async () => {
    const confirmText = 'DELETE';
    const userInput = prompt(
      `This action cannot be undone. This will permanently delete the project and all associated data.\n\nType "${confirmText}" to confirm:`
    );
    
    if (userInput === confirmText) {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        onClose();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Settings"
      description="Configure project preferences, notifications, and integrations."
      size="4xl"
    >
      <div className="space-y-4">
          <Tabs defaultValue="general" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto mt-6">
              {/* General Settings */}
              <TabsContent value="general" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Project Information</CardTitle>
                    <CardDescription>
                      Basic project details and configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input
                          id="project-name"
                          value={settings.general.name}
                          onChange={(e) => updateSetting(['general', 'name'], e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="project-status">Status</Label>
                        <Select
                          value={settings.general.status}
                          onValueChange={(value) => updateSetting(['general', 'status'], value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="project-description">Description</Label>
                      <Textarea
                        id="project-description"
                        value={settings.general.description}
                        onChange={(e) => updateSetting(['general', 'description'], e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={settings.general.priority}
                          onValueChange={(value) => updateSetting(['general', 'priority'], value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={settings.general.timezone}
                          onValueChange={(value) => updateSetting(['general', 'timezone'], value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                            <SelectItem value="America/Chicago">Central Time</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={settings.general.currency}
                          onValueChange={(value) => updateSetting(['general', 'currency'], value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
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

                    <div>
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {settings.general.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="cursor-pointer hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                            onClick={() => removeTag(tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                        <Badge
                          variant="outline"
                          className="cursor-pointer border-dashed"
                          onClick={() => {
                            const tag = prompt('Enter new tag:');
                            if (tag) addTag(tag.toLowerCase());
                          }}
                        >
                          + Add Tag
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(settings.notifications.email).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Label>
                        </div>
                        <Switch
                          checked={value as boolean}
                          onCheckedChange={(checked) => updateSetting(['notifications', 'email', key], checked)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      SMS Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(settings.notifications.sms).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                        <Switch
                          checked={value as boolean}
                          onCheckedChange={(checked) => updateSetting(['notifications', 'sms', key], checked)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      In-App Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(settings.notifications.inApp).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                        <Switch
                          checked={value as boolean}
                          onCheckedChange={(checked) => updateSetting(['notifications', 'inApp', key], checked)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Permissions */}
              <TabsContent value="permissions" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Role-based Permissions
                    </CardTitle>
                    <CardDescription>
                      Define which roles can access different features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(settings.permissions).map(([permission, roles]) => (
                      <div key={permission} className="space-y-2">
                        <Label className="text-sm font-medium">
                          {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {(roles as string[]).map((role) => (
                            <Badge key={role} variant="outline">
                              {role}
                            </Badge>
                          ))}
                          <Badge 
                            variant="outline" 
                            className="cursor-pointer border-dashed"
                            onClick={() => {
                              const role = prompt('Enter role name:');
                              if (role && !(roles as string[]).includes(role)) {
                                updateSetting(['permissions', permission], [...(roles as string[]), role]);
                              }
                            }}
                          >
                            + Add Role
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Integrations */}
              <TabsContent value="integrations" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Calendar Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable Calendar Sync</Label>
                      <Switch
                        checked={settings.integrations.calendar.enabled}
                        onCheckedChange={(checked) => updateSetting(['integrations', 'calendar', 'enabled'], checked)}
                      />
                    </div>
                    {settings.integrations.calendar.enabled && (
                      <>
                        <div>
                          <Label>Provider</Label>
                          <Select
                            value={settings.integrations.calendar.provider}
                            onValueChange={(value) => updateSetting(['integrations', 'calendar', 'provider'], value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="google">Google Calendar</SelectItem>
                              <SelectItem value="outlook">Outlook</SelectItem>
                              <SelectItem value="apple">Apple Calendar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Sync Deadlines</Label>
                          <Switch
                            checked={settings.integrations.calendar.syncDeadlines}
                            onCheckedChange={(checked) => updateSetting(['integrations', 'calendar', 'syncDeadlines'], checked)}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Weather API
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable Weather Alerts</Label>
                      <Switch
                        checked={settings.integrations.weatherApi.enabled}
                        onCheckedChange={(checked) => updateSetting(['integrations', 'weatherApi', 'enabled'], checked)}
                      />
                    </div>
                    {settings.integrations.weatherApi.enabled && (
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={settings.integrations.weatherApi.location}
                          onChange={(e) => updateSetting(['integrations', 'weatherApi', 'location'], e.target.value)}
                          placeholder="Enter city, state or coordinates"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Settings */}
              <TabsContent value="advanced" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Data Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Data Retention Period</Label>
                      <Select
                        value={settings.advanced.dataRetention}
                        onValueChange={(value) => updateSetting(['advanced', 'dataRetention'], value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1year">1 Year</SelectItem>
                          <SelectItem value="3years">3 Years</SelectItem>
                          <SelectItem value="5years">5 Years</SelectItem>
                          <SelectItem value="7years">7 Years</SelectItem>
                          <SelectItem value="indefinite">Indefinite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Backup Frequency</Label>
                      <Select
                        value={settings.advanced.backupFrequency}
                        onValueChange={(value) => updateSetting(['advanced', 'backupFrequency'], value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription>
                      Irreversible actions that affect your project data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
                      <div>
                        <h4 className="font-medium text-red-600">Archive Project</h4>
                        <p className="text-sm text-slate-500">
                          Move this project to archived status. Can be restored later.
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleArchiveProject}
                        disabled={loading}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Archive
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
                      <div>
                        <h4 className="font-medium text-red-600">Delete Project</h4>
                        <p className="text-sm text-slate-500">
                          Permanently delete this project and all associated data. This cannot be undone.
                        </p>
                      </div>
                      <Button 
                        variant="destructive"
                        onClick={handleDeleteProject}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
          
          {/* Footer with Save/Cancel */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {hasChanges && (
                <>
                  <div className="h-2 w-2 bg-buildease-orange-500 rounded-full" />
                  Unsaved changes
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || loading}
                className="bg-buildease-blue-600 hover:bg-buildease-blue-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
    </BaseModal>
  );
}