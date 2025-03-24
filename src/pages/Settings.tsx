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
import { Settings as SettingsIcon, User, Bell, Shield, Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Settings = () => {
  const { theme, setTheme, isDarkMode } = useTheme();

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
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Theme Preference</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose your preferred theme mode
                  </p>
                  <RadioGroup 
                    value={theme} 
                    onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
                    className="flex flex-col space-y-3"
                  >
                    <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted/50 dark:border-gray-700">
                      <RadioGroupItem value="light" id="theme-light" />
                      <Label htmlFor="theme-light" className="flex flex-1 items-center gap-2 font-normal">
                        <Sun size={18} className="text-yellow-500" />
                        <div className="flex flex-col">
                          <span>Light</span>
                          <span className="text-xs text-muted-foreground">Use light theme</span>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted/50 dark:border-gray-700">
                      <RadioGroupItem value="dark" id="theme-dark" />
                      <Label htmlFor="theme-dark" className="flex flex-1 items-center gap-2 font-normal">
                        <Moon size={18} className="text-blue-500" />
                        <div className="flex flex-col">
                          <span>Dark</span>
                          <span className="text-xs text-muted-foreground">Use dark theme</span>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted/50 dark:border-gray-700">
                      <RadioGroupItem value="system" id="theme-system" />
                      <Label htmlFor="theme-system" className="flex flex-1 items-center gap-2 font-normal">
                        <Laptop size={18} className="text-gray-500 dark:text-gray-400" />
                        <div className="flex flex-col">
                          <span>System</span>
                          <span className="text-xs text-muted-foreground">Follow system preference</span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-3 pt-4">
                  <Label>UI Density</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Adjust the spacing and density of UI elements
                  </p>
                  <RadioGroup defaultValue="comfortable" className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted/50 dark:border-gray-700">
                      <RadioGroupItem value="comfortable" id="density-comfortable" />
                      <Label htmlFor="density-comfortable" className="flex flex-1 items-center font-normal">
                        <div className="flex flex-col">
                          <span>Comfortable</span>
                          <span className="text-xs text-muted-foreground">Standard spacing between elements</span>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted/50 dark:border-gray-700">
                      <RadioGroupItem value="compact" id="density-compact" />
                      <Label htmlFor="density-compact" className="flex flex-1 items-center font-normal">
                        <div className="flex flex-col">
                          <span>Compact</span>
                          <span className="text-xs text-muted-foreground">Reduced spacing for more content</span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
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