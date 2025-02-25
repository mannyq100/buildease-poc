import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardSection } from '@/components/layout/DashboardSection';
import { PageHeader } from '@/components/shared/PageHeader';
import { HorizontalNav } from '@/components/navigation/HorizontalNav';
import { Footer } from '@/components/layout/Footer';
import { ActionMenu, defaultActions, ActionIcons } from '@/components/ui/action-menu';
import { BreadcrumbWithItems } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Home, 
  Settings, 
  Users, 
  Layers, 
  LayoutDashboard, 
  PanelRight, 
  Moon, 
  Sun,
  PlusCircle,
  MoreHorizontal,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

const UIComponentsDemo = () => {
  // Check initial dark mode state
  const [darkMode, setDarkMode] = useState(false);
  
  // Set initial dark mode state on component mount
  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Breadcrumb items for the page header
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'UI Demo', href: '/ui-components' }
  ];
  
  // Navigation items for horizontal nav
  const navItems = [
    { label: 'Overview', path: '#overview' },
    { label: 'Page Headers', path: '#headers' },
    { label: 'Navigation', path: '#navigation' },
    { label: 'Sections', path: '#sections' },
    { label: 'Footers', path: '#footers' },
    { label: 'Action Menus', path: '#action-menus' },
  ];
  
  // Action menu with custom actions
  const customActions = [
    {
      label: 'View Profile',
      icon: ActionIcons.view,
      onClick: () => console.log('View Profile clicked'),
    },
    {
      label: 'Edit Settings',
      icon: ActionIcons.edit,
      onClick: () => console.log('Edit Settings clicked'),
      submenu: [
        {
          label: 'Account Settings',
          icon: <Settings className="h-4 w-4" />,
          onClick: () => console.log('Account Settings clicked'),
        },
        {
          label: 'Notification Settings',
          icon: <Bell className="h-4 w-4" />,
          onClick: () => console.log('Notification Settings clicked'),
        },
      ],
    },
    {
      label: 'Separator',
      divider: true
    },
    {
      label: 'Logout',
      icon: ActionIcons.cancel,
      variant: 'destructive' as const,
      onClick: () => console.log('Logout clicked'),
    },
  ];

  return (
    <div className={cn(darkMode ? 'dark' : '')}>
      <DashboardLayout>
        <PageHeader
          title="UI Components Demo"
          subtitle="Showcase of our modern UI components with dark mode support"
          breadcrumbs={breadcrumbItems}
          action={
            <Button variant="outline" size="sm" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
          }
          backgroundVariant="gradient"
          animated
        />
        
        <div className="mb-8">
          <HorizontalNav items={navItems} showIcons={false} size="md" variant="tabs" />
        </div>
        
        {/* Overview Section */}
        <DashboardSection
          title="Overview"
          icon={<LayoutDashboard className="h-5 w-5" />}
          subtitle="A showcase of all our enhanced UI components"
          className="mb-8"
          variant="gradient"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            This page demonstrates all the UI components we've built or enhanced with dark mode support,
            better styling, and animations. You can toggle between light and dark mode using the button in the header.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Modern Design</CardTitle>
                <CardDescription>Clean and consistent UI elements</CardDescription>
              </CardHeader>
              <CardContent>
                Our components follow modern design principles with attention to spacing,
                typography, and visual hierarchy.
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Dark Mode</CardTitle>
                <CardDescription>Full dark mode support</CardDescription>
              </CardHeader>
              <CardContent>
                All components have been designed to look great in both light and dark modes
                with appropriate contrast and color adjustments.
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Responsive</CardTitle>
                <CardDescription>Mobile-friendly components</CardDescription>
              </CardHeader>
              <CardContent>
                Components adapt to different screen sizes ensuring a great experience
                on both desktop and mobile devices.
              </CardContent>
            </Card>
          </div>
        </DashboardSection>
        
        {/* Page Headers Section */}
        <DashboardSection
          title="Page Headers"
          icon={<Layers className="h-5 w-5" />}
          subtitle="Enhanced page headers with various styles"
          className="mb-8"
          collapsible
        >
          <Tabs defaultValue="default">
            <TabsList className="mb-4">
              <TabsTrigger value="default">Default</TabsTrigger>
              <TabsTrigger value="gradient">Gradient</TabsTrigger>
              <TabsTrigger value="minimal">Minimal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="default">
              <div className="border rounded-lg overflow-hidden">
                <PageHeader
                  title="Default Header"
                  subtitle="With breadcrumbs and action button"
                  breadcrumbs={breadcrumbItems}
                  action={
                    <Button size="sm">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Item
                    </Button>
                  }
                  backgroundVariant="default"
                  className="mb-0"
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                The default page header provides a clean, simple layout with title, subtitle, 
                breadcrumbs, and action button.
              </div>
            </TabsContent>
            
            <TabsContent value="gradient">
              <div className="border rounded-lg overflow-hidden">
                <PageHeader
                  title="Gradient Header"
                  subtitle="With a beautiful gradient background"
                  breadcrumbs={breadcrumbItems}
                  action={
                    <Button variant="secondary" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  }
                  backgroundVariant="gradient"
                  animated
                  className="mb-0"
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                The gradient page header adds visual interest with a subtle gradient background
                and animations for a more dynamic appearance.
              </div>
            </TabsContent>
            
            <TabsContent value="minimal">
              <div className="border rounded-lg overflow-hidden">
                <PageHeader
                  title="Minimal Header"
                  subtitle="A simpler, more compact header design"
                  backgroundVariant="minimal"
                  size="sm"
                  alignment="left"
                  className="mb-0"
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                The minimal page header uses less vertical space while still providing
                essential information. Great for dense UI applications.
              </div>
            </TabsContent>
          </Tabs>
        </DashboardSection>
        
        {/* Navigation Section */}
        <DashboardSection
          title="Navigation"
          icon={<PanelRight className="h-5 w-5" />}
          subtitle="Navigation components with various styles"
          className="mb-8"
          collapsible
        >
          <h3 className="text-lg font-medium mb-4">Horizontal Nav</h3>
          
          <div className="space-y-8">
            <div>
              <h4 className="text-sm font-medium mb-2">Default Variant</h4>
              <div className="p-4 border rounded-lg">
                <HorizontalNav 
                  items={navItems} 
                  showIcons={false} 
                  variant="default" 
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Pills Variant</h4>
              <div className="p-4 border rounded-lg">
                <HorizontalNav 
                  items={navItems.map(item => ({ 
                    ...item, 
                    icon: item.label === 'Overview' ? <Home className="h-4 w-4" /> :
                           item.label === 'Page Headers' ? <Layers className="h-4 w-4" /> :
                           item.label === 'Navigation' ? <PanelRight className="h-4 w-4" /> :
                           item.label === 'Sections' ? <LayoutDashboard className="h-4 w-4" /> :
                           item.label === 'Footers' ? <Settings className="h-4 w-4" /> :
                           <Users className="h-4 w-4" />
                  }))} 
                  showIcons={true} 
                  variant="pills" 
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Underlined Variant</h4>
              <div className="p-4 border rounded-lg">
                <HorizontalNav 
                  items={navItems} 
                  showIcons={false} 
                  variant="underlined" 
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Tabs Variant</h4>
              <div className="p-4 border rounded-lg">
                <HorizontalNav 
                  items={navItems} 
                  showIcons={false} 
                  variant="tabs" 
                />
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-medium mt-8 mb-4">Breadcrumbs</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Default</h4>
              <div className="p-4 border rounded-lg">
                <BreadcrumbWithItems items={breadcrumbItems} />
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">With Home Icon</h4>
              <div className="p-4 border rounded-lg">
                <BreadcrumbWithItems 
                  items={[
                    { label: 'Home', href: '/', icon: <Home className="h-4 w-4" /> },
                    ...breadcrumbItems.slice(1)
                  ]} 
                />
              </div>
            </div>
          </div>
        </DashboardSection>
        
        {/* Sections */}
        <DashboardSection
          title="Sections"
          icon={<Layers className="h-5 w-5" />}
          subtitle="Dashboard sections with various styles"
          className="mb-8"
          collapsible
        >
          <div className="space-y-8">
            <div>
              <h4 className="text-sm font-medium mb-2">Default Section</h4>
              <DashboardSection
                title="Default Section"
                subtitle="The standard dashboard section"
                className="border rounded-lg"
                variant="default"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This is the default dashboard section style with a clean, simple appearance.
                </p>
              </DashboardSection>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Highlight Section</h4>
              <DashboardSection
                title="Highlight Section"
                subtitle="For emphasizing important content"
                className="border rounded-lg"
                variant="highlight"
                icon={<Settings className="h-5 w-5" />}
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  The highlight variant draws more attention to the section with a subtle 
                  background color and accent border.
                </p>
              </DashboardSection>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Outlined Section</h4>
              <DashboardSection
                title="Outlined Section"
                subtitle="With a subtle border"
                className="border rounded-lg"
                variant="outlined"
                collapsible
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  The outlined variant adds a border around the entire section for clear 
                  visual separation. This example is also collapsible.
                </p>
              </DashboardSection>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Gradient Section</h4>
              <DashboardSection
                title="Gradient Section"
                subtitle="With a beautiful gradient background"
                className="border rounded-lg"
                variant="gradient"
                icon={<Layers className="h-5 w-5" />}
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  The gradient variant adds visual interest with a subtle gradient background.
                </p>
              </DashboardSection>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Glass Section</h4>
              <DashboardSection
                title="Glass Section"
                subtitle="With a modern glass morphism effect"
                className="border rounded-lg"
                variant="glass"
                animate
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  The glass variant uses a frosted glass effect for a modern, translucent appearance.
                </p>
              </DashboardSection>
            </div>
          </div>
        </DashboardSection>
        
        {/* Action Menus */}
        <DashboardSection
          title="Action Menus"
          icon={<MoreHorizontal className="h-5 w-5" />}
          subtitle="Dropdown menus for actions and options"
          className="mb-8"
          collapsible
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-medium mb-4">Default Action Menu (Dots)</h4>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Item Options</CardTitle>
                    <ActionMenu
                      actions={defaultActions}
                      menuTrigger="dots"
                    />
                  </div>
                  <CardDescription>Default menu with three dots trigger</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    The default action menu uses a three-dots icon as the trigger and displays
                    a dropdown with various action options.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-4">Button Action Menu</h4>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>User Actions</CardTitle>
                    <ActionMenu
                      actions={customActions}
                      menuTrigger="button"
                      buttonText="User Options"
                      buttonIcon={<Users className="h-4 w-4" />}
                      buttonVariant="outline"
                      buttonSize="sm"
                      label="User Options"
                    />
                  </div>
                  <CardDescription>Menu with button trigger</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This action menu uses a button as the trigger with custom text and an icon.
                    It also includes a label at the top of the dropdown menu.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </DashboardSection>
        
        {/* Footers */}
        <DashboardSection
          title="Footers"
          icon={<Settings className="h-5 w-5" />}
          subtitle="Footer components with various styles"
          className="mb-8"
          collapsible
        >
          <Tabs defaultValue="default">
            <TabsList className="mb-4">
              <TabsTrigger value="default">Default</TabsTrigger>
              <TabsTrigger value="minimal">Minimal</TabsTrigger>
              <TabsTrigger value="centered">Centered</TabsTrigger>
            </TabsList>
            
            <TabsContent value="default">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900 p-4">
                  <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
                    Page content would appear here
                  </p>
                </div>
                <Footer 
                  variant="default" 
                  className="rounded-b-lg" 
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                The default footer provides company information, navigation links, social media links,
                and legal information in a comprehensive layout.
              </div>
            </TabsContent>
            
            <TabsContent value="minimal">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900 p-4">
                  <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
                    Page content would appear here
                  </p>
                </div>
                <Footer 
                  variant="minimal" 
                  className="rounded-b-lg" 
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                The minimal footer takes up less vertical space while still providing
                essential copyright information and social links.
              </div>
            </TabsContent>
            
            <TabsContent value="centered">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900 p-4">
                  <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
                    Page content would appear here
                  </p>
                </div>
                <Footer 
                  variant="centered" 
                  className="rounded-b-lg" 
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                The centered footer has a symmetrical layout with the company information and links
                centered on the page.
              </div>
            </TabsContent>
          </Tabs>
        </DashboardSection>
      </DashboardLayout>
    </div>
  );
};

export default UIComponentsDemo; 