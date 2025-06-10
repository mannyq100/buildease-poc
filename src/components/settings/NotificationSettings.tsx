/**
 * NotificationSettings component
 * Handles notification preferences and channel settings
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail } from 'lucide-react';
import type { SettingsTabProps } from '@/types/settings';

interface NotificationSettingsProps extends SettingsTabProps {
  profile: {
    settings?: {
      notifications?: {
        email?: boolean;
        push?: boolean;
      };
    };
  } | null;
}

export function NotificationSettings({ profile, className }: NotificationSettingsProps) {
  const notificationChannels = [
    {
      id: 'email',
      icon: Mail,
      title: 'Email Notifications',
      description: 'Receive email notifications for important updates',
      checked: profile?.settings?.notifications?.email || false,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'push',
      icon: Bell,
      title: 'Push Notifications',
      description: 'Receive push notifications in your browser',
      checked: profile?.settings?.notifications?.push || false,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  const notificationTypes = [
    {
      id: 'projectUpdates',
      title: 'Project Updates',
      description: 'Changes to your projects',
      defaultChecked: true
    },
    {
      id: 'taskAssignments',
      title: 'Task Assignments',
      description: 'When you\'re assigned a new task',
      defaultChecked: true
    },
    {
      id: 'phaseCompletions',
      title: 'Phase Completions',
      description: 'When a project phase is completed',
      defaultChecked: true
    },
    {
      id: 'teamMessages',
      title: 'Team Messages',
      description: 'Messages from team members',
      defaultChecked: true
    }
  ];

  return (
    <Card className={`border-0 shadow-md dark:shadow-slate-900/30 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Notification Settings</CardTitle>
        <CardDescription>
          Manage how you receive notifications and alerts
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Header Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Notification Channels
            </h3>
            <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 w-fit">
              Active
            </Badge>
          </div>
          <p className="text-sm text-blue-600/90 dark:text-blue-400/90">
            Choose how you want to receive notifications from BuildEase
          </p>
        </div>
        
        {/* Notification Channels */}
        <div className="grid gap-4">
          {notificationChannels.map((channel) => {
            const IconComponent = channel.icon;
            return (
              <div 
                key={channel.id}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${channel.bgColor}`}>
                      <IconComponent className={`h-4 w-4 ${channel.iconColor}`} />
                    </div>
                    <Label className="text-sm sm:text-base font-medium cursor-pointer">
                      {channel.title}
                    </Label>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 pl-10">
                    {channel.description}
                  </p>
                </div>
                <Switch checked={channel.checked} className="ml-4" />
              </div>
            );
          })}
        </div>
        
        <Separator />
        
        {/* Notification Types */}
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-medium">Notification Types</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select which types of notifications you'd like to receive
            </p>
          </div>
          
          <div className="grid gap-3">
            {notificationTypes.map((type) => (
              <div 
                key={type.id}
                className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm sm:text-base">{type.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {type.description}
                  </p>
                </div>
                <Switch defaultChecked={type.defaultChecked} className="ml-4" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Save Button */}
        <div className="pt-4">
          <Button 
            variant="default" 
            className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 w-full sm:w-auto"
          >
            Save Notification Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}