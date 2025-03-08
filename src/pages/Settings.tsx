/**
 * Settings component
 * Handles application settings and user preferences
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared';
import { Settings as SettingsIcon, User, Bell, Shield, Moon, Sun } from 'lucide-react';

const Settings = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(
    document.documentElement.classList.contains('dark')
  );

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
        icon={<SettingsIcon className="h-6 w-6" />}
      />

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="account" className="gap-2">
            <User size={16} />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell size={16} />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Moon size={16} />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield size={16} />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account details and profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <input
                    id="name"
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                    placeholder="Your Name"
                    defaultValue="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <input
                    id="email"
                    type="email"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                    placeholder="your.email@example.com"
                    defaultValue="john.doe@buildease.com"
                  />
                </div>
              </div>
              <Button variant="default">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive updates about your projects via email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Project Updates</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Notifications about changes to your projects
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Task Reminders</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Reminders about upcoming and overdue tasks
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the app looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                    Dark Mode
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Toggle between light and dark theme
                  </p>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Active Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings; 