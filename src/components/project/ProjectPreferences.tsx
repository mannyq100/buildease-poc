import React, { useState } from 'react';
import { cn } from '@/utils/core/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, 
  Bell, 
  Clock, 
  Globe,
  Shield,
  Smartphone,
  Mail,
  Users,
  Eye,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Mock project preferences data
const mockPreferences = {
  general: {
    priority: 'high',
    visibility: 'team',
    timezone: 'America/New_York',
    currency: 'USD',
    tags: ['commercial', 'office', 'downtown', 'LEED-certified']
  },
  notifications: {
    email: {
      taskUpdates: true,
      budgetAlerts: true,
      deadlineReminders: true,
      weeklyReports: true
    },
    sms: {
      urgentAlerts: true,
      emergencyOnly: true
    },
    inApp: {
      allUpdates: true,
      mentions: true,
      deadlines: true
    }
  },
  permissions: {
    teamAccess: 'read-write',
    budgetVisibility: 'managers-only',
    documentSharing: 'team-members'
  },
  integrations: {
    calendar: true,
    weatherApi: true,
    reporting: true
  }
};

interface ProjectPreferencesProps {
  projectId: string;
  onOpenFullSettings: () => void;
  className?: string;
}

export function ProjectPreferences({ projectId, onOpenFullSettings, className }: ProjectPreferencesProps) {
  const [preferences, setPreferences] = useState(mockPreferences);
  const [isSaving, setIsSaving] = useState(false);

  const updatePreference = (path: string[], value: any) => {
    setPreferences(prev => {
      const newPrefs = { ...prev };
      let current = newPrefs;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]] = { ...current[path[i]] };
      }
      current[path[path.length - 1]] = value;
      
      return newPrefs;
    });
  };

  const handleSaveQuickSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Quick settings saved for project:', projectId);
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'team': return <Users className="h-4 w-4" />;
      case 'private': return <Shield className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Quick Settings Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-buildease-blue-600" />
            Project Preferences
          </CardTitle>
          <CardDescription>
            Quick access to commonly used project settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* General Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General Settings
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Priority</Label>
                <Select
                  value={preferences.general.priority}
                  onValueChange={(value) => updatePreference(['general', 'priority'], value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Project Visibility</Label>
                <Select
                  value={preferences.general.visibility}
                  onValueChange={(value) => updatePreference(['general', 'visibility'], value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="team">Team Members</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={preferences.general.timezone}
                  onValueChange={(value) => updatePreference(['general', 'timezone'], value)}
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

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={preferences.general.currency}
                  onValueChange={(value) => updatePreference(['general', 'currency'], value)}
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

            {/* Project Tags */}
            <div className="space-y-2">
              <Label>Project Tags</Label>
              <div className="flex flex-wrap gap-2">
                {preferences.general.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Priority:</span>
                </div>
                <Badge className={getPriorityColor(preferences.general.priority)}>
                  {preferences.general.priority.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getVisibilityIcon(preferences.general.visibility)}
                  <span className="text-sm font-medium">Visibility:</span>
                </div>
                <Badge variant="outline">
                  {preferences.general.visibility}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Timezone:</span>
                </div>
                <Badge variant="outline">
                  {preferences.general.timezone.split('/')[1]?.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notification Preferences
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Notifications */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </div>
                <div className="space-y-2">
                  {Object.entries(preferences.notifications.email).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-sm">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => updatePreference(['notifications', 'email', key], checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* SMS Notifications */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Smartphone className="h-4 w-4" />
                  SMS Notifications
                </div>
                <div className="space-y-2">
                  {Object.entries(preferences.notifications.sms).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-sm">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => updatePreference(['notifications', 'sms', key], checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Integrations Status */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Active Integrations
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(preferences.integrations).map(([integration, enabled]) => (
                <div key={integration} className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className={cn(
                    'h-2 w-2 rounded-full',
                    enabled ? 'bg-green-500' : 'bg-red-500'
                  )} />
                  <span className="text-sm font-medium capitalize">
                    {integration.replace(/([A-Z])/g, ' $1')}
                  </span>
                  {enabled ? (
                    <CheckCircle className="h-3 w-3 text-green-500 ml-auto" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-red-500 ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button 
              onClick={handleSaveQuickSettings}
              disabled={isSaving}
              className="bg-buildease-blue-600 hover:bg-buildease-blue-700 flex-1"
            >
              {isSaving ? 'Saving...' : 'Save Quick Settings'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onOpenFullSettings}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              Advanced Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}