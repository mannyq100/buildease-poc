import React from 'react';
import { cn } from '@/utils/core/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Shield, 
  Bell,
  Globe
} from 'lucide-react';

interface SettingsAndConfigurationProps {
  projectId: string;
  onOpenFullSettings: () => void;
  className?: string;
}

export function SettingsAndConfiguration({ 
  projectId, 
  onOpenFullSettings,
  className 
}: SettingsAndConfigurationProps) {
  const configurationHealth = 85; // Simplified static value

  return (
    <div className={cn('space-y-6', className)}>
      {/* Simplified Settings Overview */}
      <div className="space-y-6">
        {/* Quick Settings Access */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-buildease-blue-600" />
              Project Settings
            </CardTitle>
            <CardDescription>
              Manage your project configuration and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Configuration Health */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-slate-900 dark:text-white">Configuration Status</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-900 dark:text-white">{configurationHealth}%</div>
                <div className="text-xs text-slate-500">Complete</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={onOpenFullSettings}
                className="flex flex-col items-center p-4 h-auto space-y-2"
              >
                <Bell className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Notifications</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={onOpenFullSettings}
                className="flex flex-col items-center p-4 h-auto space-y-2"
              >
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm">Permissions</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={onOpenFullSettings}
                className="flex flex-col items-center p-4 h-auto space-y-2"
              >
                <Globe className="h-5 w-5 text-purple-500" />
                <span className="text-sm">Integrations</span>
              </Button>
            </div>

            {/* Main Settings Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button 
                onClick={onOpenFullSettings}
                className="w-full bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white"
                size="lg"
              >
                <Settings className="h-4 w-4 mr-2" />
                Open All Settings
              </Button>
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}