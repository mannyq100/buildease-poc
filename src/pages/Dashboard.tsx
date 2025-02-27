import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Home, 
  Plus, 
  Package, 
  TrendingUp, 
  Users, 
  FileText, 
  ChevronRight,
  LayoutDashboard,
  Clock,
  AlertTriangle,
  BarChart3,
  Building,
  Construction,
  Sparkles,
  Search,
  ArrowRight,
  Calendar,
  CheckCircle,
  Settings,
  Bell,
  LogOut,
  Menu,
  User,
  Briefcase,
  Hammer,
  Headphones,
  HardHat,
  Clipboard,
  DollarSign,
  PieChart,
  ListTodo,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { HorizontalNav, type NavItem } from '@/components/navigation/HorizontalNav';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import MainNavigation from '@/components/layout/MainNavigation';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check dark mode on component mount and whenever it might change
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Check on mount
    checkDarkMode();
    
    // Set up a mutation observer to watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Clean up observer on unmount
    return () => observer.disconnect();
  }, []);

  // Navigation items
  const navItems: NavItem[] = [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" /> 
    },
    { 
      label: 'Projects', 
      path: '/projects', 
      icon: <Briefcase className="w-5 h-5" />,
      badge: {
        text: '4',
        color: 'blue'
      }
    },
    { 
      label: 'Schedule', 
      path: '/schedule', 
      icon: <Calendar className="w-5 h-5" /> 
    },
    { 
      label: 'Materials', 
      path: '/materials', 
      icon: <Package className="w-5 h-5" /> 
    },
    { 
      label: 'Expenses', 
      path: '/expenses', 
      icon: <DollarSign className="w-5 h-5" /> 
    }
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-slate-900">
      <MainNavigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1E1E1E] dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back to your project hub</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search projects..."
                className="pl-9 w-full max-w-xs bg-white dark:bg-slate-800"
              />
            </div>
            <Button onClick={() => navigate('/create-project')} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Projects</p>
                  <p className="text-3xl font-bold mt-1 text-[#1E1E1E] dark:text-white">4</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-[#1E3A8A]" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Progress</span>
                  <span className="font-medium text-[#1E3A8A] dark:text-blue-400">68%</span>
                </div>
                <Progress value={68} className="h-1.5 bg-[#1E3A8A]/20">
                  <div className="h-full bg-[#1E3A8A]" />
                </Progress>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Tasks</p>
                  <p className="text-3xl font-bold mt-1 text-[#1E1E1E] dark:text-white">16</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-[#D97706]/10 flex items-center justify-center">
                  <ListTodo className="h-6 w-6 text-[#D97706]" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Badge className="bg-[#D97706]">5 due today</Badge>
                <Button variant="ghost" size="sm" className="text-[#D97706] h-8 px-2">
                  <span>View all</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Materials</p>
                  <p className="text-3xl font-bold mt-1 text-[#1E1E1E] dark:text-white">24</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-[#FFD700]" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="outline" className="border-orange-500 text-orange-500">3 low stock</Badge>
                <Button variant="ghost" size="sm" className="text-[#FFD700] h-8 px-2">
                  <span>Order now</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget Used</p>
                  <p className="text-3xl font-bold mt-1 text-[#1E1E1E] dark:text-white">$42,500</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Total budget</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">$120,000</span>
                </div>
                <Progress value={35} className="h-1.5 bg-green-100">
                  <div className="h-full bg-green-600" />
                </Progress>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1E1E1E] dark:text-white">Projects Progress</h2>
            <Button variant="outline" onClick={() => navigate('/projects')} className="text-[#1E3A8A] border-[#1E3A8A]">
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Project 1 */}
            <Card className="bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center gap-4 p-6">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold text-[#1E1E1E] dark:text-white">Residential Renovation</h3>
                      <Badge className="ml-2 bg-[#1E3A8A]">Active</Badge>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Completion deadline: August 15, 2024
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-full max-w-md">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500 dark:text-gray-400">Progress</span>
                          <span className="font-medium text-[#1E1E1E] dark:text-white">75%</span>
                        </div>
                        <Progress value={75} className="h-2">
                          <div className="h-full bg-[#1E3A8A]" />
                        </Progress>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((_, i) => (
                        <Avatar key={i} className="border-2 border-white dark:border-slate-800 h-8 w-8">
                          <AvatarFallback className="bg-[#1E3A8A] text-white">{["JD", "MB", "TS"][i]}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="ml-2" onClick={() => navigate('/project/1')}>
                      Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project 2 */}
            <Card className="bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center gap-4 p-6">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold text-[#1E1E1E] dark:text-white">Commercial Office Space</h3>
                      <Badge className="ml-2 bg-[#D97706]">Planning</Badge>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Completion deadline: December 10, 2024
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-full max-w-md">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500 dark:text-gray-400">Progress</span>
                          <span className="font-medium text-[#1E1E1E] dark:text-white">25%</span>
                        </div>
                        <Progress value={25} className="h-2">
                          <div className="h-full bg-[#D97706]" />
                        </Progress>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2].map((_, i) => (
                        <Avatar key={i} className="border-2 border-white dark:border-slate-800 h-8 w-8">
                          <AvatarFallback className="bg-[#D97706] text-white">{["AW", "RL"][i]}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="ml-2" onClick={() => navigate('/project/2')}>
                      Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity & Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#1E1E1E] dark:text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {[
                  { 
                    icon: <Package className="h-6 w-6 text-[#1E3A8A]" />, 
                    title: "Materials delivered", 
                    description: "Cement and reinforcement steel",
                    timestamp: "2 hours ago"
                  },
                  { 
                    icon: <Clipboard className="h-6 w-6 text-[#D97706]" />, 
                    title: "Task completed", 
                    description: "Foundation inspection passed",
                    timestamp: "Yesterday"
                  },
                  { 
                    icon: <Users className="h-6 w-6 text-green-500" />, 
                    title: "Team meeting", 
                    description: "Weekly progress review",
                    timestamp: "2 days ago"
                  }
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="rounded-full p-2 bg-gray-100 dark:bg-slate-700 flex-shrink-0">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-[#1E1E1E] dark:text-white">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {activity.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" className="text-[#1E3A8A] dark:text-blue-400 w-full justify-center">
                View All Activity
              </Button>
            </CardFooter>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#1E1E1E] dark:text-white">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {[
                  {
                    title: "Site inspection",
                    project: "Residential Renovation",
                    dueDate: "Today",
                    daysLeft: 0,
                    priority: "high"
                  },
                  {
                    title: "Material ordering",
                    project: "Commercial Office Space",
                    dueDate: "Tomorrow",
                    daysLeft: 1,
                    priority: "medium"
                  },
                  {
                    title: "Foundation planning",
                    project: "Commercial Office Space",
                    dueDate: "In 3 days",
                    daysLeft: 3,
                    priority: "low"
                  }
                ].map((task, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex items-start p-3 border rounded-lg",
                      task.priority === "high" 
                        ? "border-red-200 bg-red-50 dark:border-red-800/30 dark:bg-red-900/10" 
                        : task.priority === "medium"
                        ? "border-amber-200 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-900/10"
                        : "border-green-200 bg-green-50 dark:border-green-800/30 dark:bg-green-900/10"
                    )}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-[#1E1E1E] dark:text-white">{task.title}</h4>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="mr-2 text-xs">
                          {task.project}
                        </Badge>
                        <span className={cn(
                          "text-xs",
                          task.daysLeft === 0 
                            ? "text-red-600 dark:text-red-400" 
                            : task.daysLeft <= 2 
                            ? "text-amber-600 dark:text-amber-400" 
                            : "text-green-600 dark:text-green-400"
                        )}>
                          Due {task.dueDate}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[#1E3A8A]">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" className="text-[#1E3A8A] dark:text-blue-400 w-full justify-center">
                View All Tasks
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 