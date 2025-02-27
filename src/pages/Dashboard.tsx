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
import { PageHeader } from '@/components/shared';

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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
      <MainNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <PageHeader
          title="Dashboard"
          subtitle="Welcome back to your project hub"
          icon={<LayoutDashboard className="h-6 w-6" />}
          actions={[
            {
              label: "New Project",
              icon: <Plus />,
              variant: "construction",
              onClick: () => navigate('/create-project')
            }
          ]}
        />

        {/* Search Bar */}
        <div className="mt-8 mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search projects, tasks, or materials..."
              className="pl-10 py-6 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl shadow-sm"
            />
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="transition-all duration-300"
          >
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 shadow-sm hover:shadow-md transition-all duration-300 border border-blue-200 dark:border-blue-800/30 overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Projects</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">4</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110">
                    <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">68%</span>
                  </div>
                  <Progress value={68} className="h-2 bg-blue-100 dark:bg-blue-900/30">
                    <div className="h-full bg-blue-600 dark:bg-blue-500" />
                  </Progress>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="transition-all duration-300"
          >
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 shadow-sm hover:shadow-md transition-all duration-300 border border-amber-200 dark:border-amber-800/30 overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Tasks</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">16</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110">
                    <ListTodo className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Badge className="bg-amber-600 hover:bg-amber-700 transition-colors">5 due today</Badge>
                  <Button variant="ghost" size="sm" className="text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 h-8 px-2 transition-colors">
                    <span>View all</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="transition-all duration-300"
          >
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 shadow-sm hover:shadow-md transition-all duration-300 border border-purple-200 dark:border-purple-800/30 overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Materials</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">24</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-800/50 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110">
                    <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="outline" className="border-red-500 text-red-500 dark:border-red-400 dark:text-red-400">3 low stock</Badge>
                  <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 h-8 px-2 transition-colors">
                    <span>Order now</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="transition-all duration-300"
          >
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 shadow-sm hover:shadow-md transition-all duration-300 border border-emerald-200 dark:border-emerald-800/30 overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Budget Used</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">$42,500</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110">
                    <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Total budget</span>
                    <span className="font-medium text-gray-900 dark:text-white">$120,000</span>
                  </div>
                  <Progress value={35} className="h-2 bg-emerald-100 dark:bg-emerald-900/30">
                    <div className="h-full bg-emerald-600 dark:bg-emerald-500" />
                  </Progress>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Projects Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white group flex items-center gap-2">
              <div className="h-8 w-1 bg-blue-600 dark:bg-blue-500 rounded"></div>
              Projects Progress
            </h2>
            <Button variant="outline" onClick={() => navigate('/projects')} className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Project 1 */}
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Card className="bg-white dark:bg-slate-800 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-slate-700 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 p-6">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Residential Renovation</h3>
                        <Badge className="ml-2 bg-blue-600 hover:bg-blue-700 transition-colors">Active</Badge>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Completion deadline: August 15, 2024
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="w-full max-w-md">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500 dark:text-gray-400">Progress</span>
                            <span className="font-medium text-gray-900 dark:text-white">75%</span>
                          </div>
                          <Progress value={75} className="h-2 bg-blue-100 dark:bg-blue-900/30">
                            <div className="h-full bg-blue-600 dark:bg-blue-500" />
                          </Progress>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center flex-wrap gap-3">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((_, i) => (
                          <Avatar key={i} className="border-2 border-white dark:border-slate-800 h-8 w-8 ring-2 ring-blue-500/10">
                            <AvatarFallback className="bg-blue-600 text-white">{["JD", "MB", "TS"][i]}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="ml-2 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => navigate('/project/1')}>
                        Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Project 2 */}
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Card className="bg-white dark:bg-slate-800 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-slate-700 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 p-6">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Commercial Office Space</h3>
                        <Badge className="ml-2 bg-amber-600 hover:bg-amber-700 transition-colors">Planning</Badge>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Completion deadline: December 10, 2024
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="w-full max-w-md">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500 dark:text-gray-400">Progress</span>
                            <span className="font-medium text-gray-900 dark:text-white">25%</span>
                          </div>
                          <Progress value={25} className="h-2 bg-amber-100 dark:bg-amber-900/30">
                            <div className="h-full bg-amber-600 dark:bg-amber-500" />
                          </Progress>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center flex-wrap gap-3">
                      <div className="flex -space-x-2">
                        {[1, 2].map((_, i) => (
                          <Avatar key={i} className="border-2 border-white dark:border-slate-800 h-8 w-8 ring-2 ring-amber-500/10">
                            <AvatarFallback className="bg-amber-600 text-white">{["AW", "RL"][i]}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="ml-2 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/20" onClick={() => navigate('/project/2')}>
                        Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Recent Activity & Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-slate-700 overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border-b border-gray-200 dark:border-slate-700">
                <CardTitle className="text-xl text-gray-900 dark:text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  {[
                    { 
                      icon: <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />, 
                      title: "Materials delivered", 
                      description: "Cement and reinforcement steel",
                      timestamp: "2 hours ago"
                    },
                    { 
                      icon: <Clipboard className="h-6 w-6 text-amber-600 dark:text-amber-400" />, 
                      title: "Task completed", 
                      description: "Foundation inspection passed",
                      timestamp: "Yesterday"
                    },
                    { 
                      icon: <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />, 
                      title: "Team meeting", 
                      description: "Weekly progress review",
                      timestamp: "2 days ago"
                    }
                  ].map((activity, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/20 transition-colors cursor-pointer"
                    >
                      <div className="rounded-full p-3 bg-gray-100 dark:bg-slate-700 flex-shrink-0 shadow-sm">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap py-1 px-2 bg-gray-100 dark:bg-slate-700 rounded-full">
                        {activity.timestamp}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0 border-t border-gray-100 dark:border-slate-700">
                <Button variant="ghost" className="text-blue-600 dark:text-blue-400 w-full justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Upcoming Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-slate-700 overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border-b border-gray-200 dark:border-slate-700">
                <CardTitle className="text-xl text-gray-900 dark:text-white">Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
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
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className={cn(
                        "flex items-start p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer",
                        task.priority === "high" 
                          ? "border-red-200 bg-red-50 dark:border-red-800/30 dark:bg-red-900/10" 
                          : task.priority === "medium"
                          ? "border-amber-200 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-900/10"
                          : "border-green-200 bg-green-50 dark:border-green-800/30 dark:bg-green-900/10"
                      )}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                        <div className="flex items-center mt-2 flex-wrap gap-2">
                          <Badge variant="outline" className="mr-2 text-xs">
                            {task.project}
                          </Badge>
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            task.daysLeft === 0 
                              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" 
                              : task.daysLeft <= 2 
                              ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
                              : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          )}>
                            Due {task.dueDate}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-600 dark:hover:text-green-400">
                        <CheckCircle className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0 border-t border-gray-100 dark:border-slate-700">
                <Button variant="ghost" className="text-blue-600 dark:text-blue-400 w-full justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  View All Tasks
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 