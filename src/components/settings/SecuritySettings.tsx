/**
 * SecuritySettings component
 * Handles password, 2FA, and session management
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Lock, 
  KeyRound, 
  Smartphone, 
  MessageSquare, 
  Monitor, 
  LogOut 
} from 'lucide-react';
import type { SettingsTabProps } from '@/types/settings';

export function SecuritySettings({ className }: SettingsTabProps) {
  const passwordInfo = {
    lastChanged: '30 days ago',
    status: 'secure'
  };

  const twoFactorOptions = [
    {
      id: 'authenticator',
      icon: Smartphone,
      title: 'Authenticator App',
      description: 'Use an authenticator app to generate codes',
      enabled: false,
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      id: 'sms',
      icon: MessageSquare,
      title: 'SMS Authentication',
      description: 'Receive codes via text message',
      enabled: true,
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400'
    }
  ];

  const sessions = [
    {
      id: 'current',
      icon: Monitor,
      title: 'Current Session',
      description: 'MacOS · Chrome · San Francisco, CA',
      status: 'Active Now',
      isCurrent: true,
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      badgeColor: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
    },
    {
      id: 'mobile',
      icon: Smartphone,
      title: 'Mobile Session',
      description: 'iOS · Safari · San Francisco, CA',
      status: '3 days ago',
      isCurrent: false,
      bgColor: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-600 dark:text-slate-400',
      badgeColor: 'text-slate-600 dark:text-slate-300'
    }
  ];

  return (
    <Card className={`border-0 shadow-md dark:shadow-slate-900/30 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Security Settings</CardTitle>
        <CardDescription>
          Manage your account security and authentication options
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Security Status */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Account Security Status
              </h3>
              <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 w-fit">
                Secure
              </Badge>
            </div>
            <p className="text-sm text-blue-600/90 dark:text-blue-400/90">
              Your account has strong security measures in place
            </p>
          </div>

          {/* Password Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium mb-2">Password</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Manage your account password
              </p>
            </div>
            
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 dark:bg-slate-800/50 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Lock size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Password</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Last changed: {passwordInfo.lastChanged}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto">
                  <KeyRound size={14} />
                  <span>Change Password</span>
                </Button>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Two-Factor Authentication */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium mb-2">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Add an extra layer of security to your account
              </p>
            </div>
            
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              {twoFactorOptions.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <div 
                    key={option.id}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 dark:bg-slate-800/50 gap-3 ${
                      index > 0 ? 'border-t border-slate-200 dark:border-slate-700' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${option.bgColor}`}>
                        <IconComponent size={18} className={option.iconColor} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{option.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <Switch defaultChecked={option.enabled} className="ml-auto" />
                  </div>
                );
              })}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Login Sessions */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium mb-2">Login Sessions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Manage your active login sessions
              </p>
            </div>
            
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              {sessions.map((session, index) => {
                const IconComponent = session.icon;
                return (
                  <div 
                    key={session.id}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 dark:bg-slate-800/50 gap-3 ${
                      index > 0 ? 'border-t border-slate-200 dark:border-slate-700' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-full ${session.bgColor}`}>
                        <IconComponent size={18} className={session.iconColor} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium">{session.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {session.description}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${session.badgeColor} whitespace-nowrap ml-auto`}
                    >
                      {session.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
            
            <Button variant="outline" size="sm" className="gap-1 mt-2 w-full sm:w-auto">
              <LogOut size={14} />
              <span>Sign Out All Other Sessions</span>
            </Button>
          </div>
          
          {/* Save Button */}
          <div className="pt-4">
            <Button 
              variant="default" 
              className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 w-full sm:w-auto"
            >
              Save Security Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}