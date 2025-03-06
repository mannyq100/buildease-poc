import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Users,
  DollarSign,
  Package,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  FileText,
  ChevronRight,
  Plus,
  Sparkles,
  Building,
  ArrowUpRight,
  Bell,
  BarChart3,
  ShieldAlert,
  Clipboard,
  TrendingUp,
  Calendar as CalendarIcon,
  Settings,
  MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PhaseDetails = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
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

  return (
    <div className={cn(
      "min-h-screen transition-colors",
      isDarkMode ? "bg-slate-900" : "bg-gray-50"
    )}>
      {/* Header with Gradient Background */}
      <div className={cn(
        "relative py-6 px-4 shadow-md z-10",
        isDarkMode ? "bg-slate-800" : "bg-white"
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 opacity-50 z-0"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <LazyMotion features={domAnimation}>
            <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-2 text-sm"
          >
            <Button 
              variant="ghost" 
              size="sm" 
              className="px-2 py-1 h-auto text-blue-600 dark:text-blue-400 hover:text-blue-700"
              onClick={() => navigate("/project/1")}
            >
              <Building className="w-4 h-4 mr-1" />
              Villa Construction
            </Button>
            <ArrowRight className={cn("w-3 h-3", isDarkMode ? "text-slate-400" : "text-gray-400")} />
            <Badge variant="outline" className="rounded-full font-normal">Foundation Phase</Badge>
            </m.div>
          
            <m.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex justify-between items-start mt-4"
          >
            <div>
              <h1 className={cn(
                "text-2xl font-bold flex items-center",
                isDarkMode ? "text-white" : "text-slate-800"
              )}>
                Foundation Phase
                <Badge className="ml-3 bg-blue-500 hover:bg-blue-600 text-white">In Progress</Badge>
              </h1>
              <p className={cn(
                "text-sm mt-1.5 flex items-center",
                isDarkMode ? "text-slate-300" : "text-gray-600"
              )}>
                <CalendarIcon className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                Feb 2 - Mar 15, 2024
                <span className="mx-2">•</span>
                <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                6 weeks duration
              </p>
            </div>
            
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <Bell className="w-4 h-4 mr-1" />
                      Alerts
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Phase alerts and notifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" className="h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Reports
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View phase reports and analytics</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            </m.div>
          
            <m.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5"
          >
            <div className="flex justify-between text-sm mb-1.5">
              <span className={isDarkMode ? "text-slate-300" : "text-slate-600"}>Phase Progress</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">65% Complete</span>
            </div>
            <div className="bg-gray-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <m.div
                initial={{ width: 0 }}
                animate={{ width: "65%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              />
            </div>
            </m.div>
          </LazyMotion>
        </div>
      </div>

      {/* Main Content */}
      <LazyMotion features={domAnimation}>
        <m.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-5xl mx-auto p-4 pt-6"
      >
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-1 rounded-lg border border-gray-200 dark:border-slate-700">
            <TabsTrigger value="overview" className="text-sm px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="tasks" className="text-sm px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">Tasks</TabsTrigger>
            <TabsTrigger value="materials" className="text-sm px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">Materials</TabsTrigger>
            <TabsTrigger value="documents" className="text-sm px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-4">
              {/* Phase Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard 
                  icon={<Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                  label="Duration"
                  value="6 Weeks"
                  subtext="2 weeks remaining"
                  trend="normal"
                />
                <MetricCard 
                  icon={<Users className="w-5 h-5 text-green-600 dark:text-green-400" />}
                  label="Team Size"
                  value="8 Members"
                  subtext="All assigned"
                  trend="positive"
                />
                <MetricCard 
                  icon={<DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                  label="Budget"
                  value="$45,000"
                  subtext="$32,450 spent"
                  trend="warning"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tasks Summary */}
                <Card className={cn(
                  "border transition-all duration-300 shadow-sm hover:shadow-md",
                  isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                )}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clipboard className="w-5 h-5 text-blue-500" />
                      Tasks Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        <m.div 
                        whileHover={{ scale: 1.05, y: -5 }}
                        className={cn(
                          "p-3 rounded-lg border border-green-200",
                          isDarkMode ? "bg-green-900/20" : "bg-green-50"
                        )}
                      >
                        <div className={cn("text-xl font-bold", isDarkMode ? "text-green-400" : "text-green-600")}>12</div>
                        <div className={cn("text-sm", isDarkMode ? "text-green-300" : "text-green-700")}>Completed</div>
                        </m.div>
                        <m.div 
                        whileHover={{ scale: 1.05, y: -5 }}
                        className={cn(
                          "p-3 rounded-lg border border-blue-200",
                          isDarkMode ? "bg-blue-900/20" : "bg-blue-50"
                        )}
                      >
                        <div className={cn("text-xl font-bold", isDarkMode ? "text-blue-400" : "text-blue-600")}>5</div>
                        <div className={cn("text-sm", isDarkMode ? "text-blue-300" : "text-blue-700")}>In Progress</div>
                        </m.div>
                        <m.div 
                        whileHover={{ scale: 1.05, y: -5 }}
                        className={cn(
                          "p-3 rounded-lg border border-yellow-200",
                          isDarkMode ? "bg-yellow-900/20" : "bg-yellow-50"
                        )}
                      >
                        <div className={cn("text-xl font-bold", isDarkMode ? "text-yellow-400" : "text-yellow-600")}>3</div>
                        <div className={cn("text-sm", isDarkMode ? "text-yellow-300" : "text-yellow-700")}>Pending</div>
                        </m.div>
                        <m.div 
                        whileHover={{ scale: 1.05, y: -5 }}
                        className={cn(
                          "p-3 rounded-lg border border-red-200",
                          isDarkMode ? "bg-red-900/20" : "bg-red-50"
                        )}
                      >
                        <div className={cn("text-xl font-bold", isDarkMode ? "text-red-400" : "text-red-600")}>1</div>
                        <div className={cn("text-sm", isDarkMode ? "text-red-300" : "text-red-700")}>Delayed</div>
                        </m.div>
                    </div>
                  </CardContent>
                </Card>

                {/* Critical Path */}
                <Card className={cn(
                  "border transition-all duration-300 shadow-sm hover:shadow-md",
                  isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                )}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-amber-500" />
                      Critical Path Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CriticalItem 
                      title="Complete soil testing"
                      deadline="Feb 15"
                      status="completed"
                    />
                    <CriticalItem 
                      title="Foundation reinforcement"
                      deadline="Feb 28"
                      status="in-progress"
                    />
                    <CriticalItem 
                      title="Concrete pouring"
                      deadline="Mar 5"
                      status="pending"
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phase Dependencies */}
                <Card className={cn(
                  "border transition-all duration-300 shadow-sm hover:shadow-md",
                  isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                )}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="w-5 h-5 text-indigo-500" />
                      Dependencies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <DependencyItem 
                      title="Site Preparation"
                      status="completed"
                      type="Previous Phase"
                    />
                    <DependencyItem 
                      title="Material Delivery"
                      status="in-progress"
                      type="External"
                    />
                    <DependencyItem 
                      title="Quality Inspection"
                      status="pending"
                      type="Milestone"
                    />
                  </CardContent>
                </Card>

                {/* AI Insights */}
                <Card className={cn(
                  "border transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden",
                  isDarkMode ? "bg-slate-800/80 border-blue-900/50" : "bg-blue-50/80 border-blue-200"
                )}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-3xl -z-10"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className={cn(
                      "text-lg flex items-center gap-2",
                      isDarkMode ? "text-blue-400" : "text-blue-800"
                    )}>
                      <Sparkles className={cn(
                        "w-5 h-5",
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      )} />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <InsightItem 
                      title="Schedule Risk"
                      description="Consider adding resources to foundation reinforcement to maintain timeline"
                    />
                    <InsightItem 
                      title="Budget Tracking"
                      description="Material costs are 15% below estimates - potential for reallocation"
                    />
                    <InsightItem 
                      title="Quality Control"
                      description="Schedule concrete strength testing before proceeding to next phase"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <Card className={cn(
              "border transition-all duration-300 shadow-sm hover:shadow-md",
              isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
            )}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Clipboard className="w-5 h-5 text-blue-500" />
                    Phase Tasks
                  </CardTitle>
                    <LazyMotion features={domAnimation}>
                      <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={()=>navigate("/generate-tasks")}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                      </m.div>
                    </LazyMotion>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <TaskItem 
                  title="Site clearing and excavation"
                  status="completed"
                  progress={100}
                  assignees={4}
                  deadline="Feb 10, 2024"
                />
                <TaskItem 
                  title="Foundation reinforcement installation"
                  status="in-progress"
                  progress={65}
                  assignees={6}
                  deadline="Feb 28, 2024"
                />
                <TaskItem 
                  title="Concrete pouring and curing"
                  status="pending"
                  progress={0}
                  assignees={8}
                  deadline="Mar 5, 2024"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials">
            <Card className={cn(
              "border transition-all duration-300 shadow-sm hover:shadow-md",
              isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
            )}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    Materials
                  </CardTitle>
                    <LazyMotion features={domAnimation}>
                      <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Material
                    </Button>
                      </m.div>
                    </LazyMotion>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <MaterialItem 
                  name="Cement"
                  quantity="200 bags"
                  used="150 bags"
                  status="sufficient"
                />
                <MaterialItem 
                  name="Steel Reinforcement"
                  quantity="5000 kg"
                  used="3500 kg"
                  status="low"
                />
                <MaterialItem 
                  name="Concrete Mix"
                  quantity="100 m³"
                  used="0 m³"
                  status="pending"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </m.div>
      </LazyMotion>
    </div>
  );
};

// Enhanced metric card component with animations
const MetricCard = ({ icon, label, value, subtext, trend = 'normal' }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const trendColors = {
    positive: isDarkMode ? "text-green-400" : "text-green-600",
    negative: isDarkMode ? "text-red-400" : "text-red-600",
    warning: isDarkMode ? "text-amber-400" : "text-amber-600",
    normal: isDarkMode ? "text-blue-400" : "text-blue-600"
  };
  
  const trendIcons = {
    positive: <TrendingUp className="w-3.5 h-3.5" />,
    negative: <TrendingUp className="w-3.5 h-3.5 transform rotate-180" />,
    warning: <AlertCircle className="w-3.5 h-3.5" />,
    normal: null
  };
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className={cn(
        "relative overflow-hidden border transition-all duration-300 shadow-sm hover:shadow-md",
        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-30"></div>
        </div>
        <CardContent className="p-4 relative z-10">
          <div className="flex items-center space-x-2">
            {icon}
            <span className={cn(
              "font-medium",
              isDarkMode ? "text-white" : "text-slate-800"
            )}>{label}</span>
          </div>
          <div className="mt-2">
            <div className={cn(
              "text-2xl font-bold",
              isDarkMode ? "text-white" : "text-slate-800"
            )}>{value}</div>
            <div className={cn(
              "text-sm flex items-center mt-1",
              isDarkMode ? "text-slate-400" : "text-gray-600"
            )}>
              {subtext}
              {trendIcons[trend] && (
                <span className={`ml-1.5 flex items-center ${trendColors[trend]}`}>
                  {trendIcons[trend]}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      </m.div>
    </LazyMotion>
  );
};

const CriticalItem = ({ title, deadline, status }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const statusClasses = {
    completed: {
      badge: isDarkMode ? "bg-green-900/30 text-green-400 border-green-700/50" : "bg-green-100 text-green-600 border-green-200",
      icon: isDarkMode ? "text-green-400" : "text-green-600"
    },
    'in-progress': {
      badge: isDarkMode ? "bg-blue-900/30 text-blue-400 border-blue-700/50" : "bg-blue-100 text-blue-600 border-blue-200",
      icon: isDarkMode ? "text-blue-400" : "text-blue-600"
    },
    pending: {
      badge: isDarkMode ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-gray-100 text-gray-600 border-gray-200",
      icon: isDarkMode ? "text-slate-400" : "text-gray-400"
    }
  };
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
      whileHover={{ scale: 1.02, x: 3 }}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-colors",
        isDarkMode ? "bg-slate-800/50 border-slate-700 hover:bg-slate-800" : "bg-white border-gray-200 hover:bg-gray-50"
      )}
    >
      <div className="flex items-center space-x-3">
        <CheckCircle2 className={statusClasses[status].icon} />
        <div>
          <h4 className={cn(
            "font-medium",
            isDarkMode ? "text-white" : "text-slate-800"
          )}>{title}</h4>
          <p className={cn(
            "text-sm",
            isDarkMode ? "text-slate-400" : "text-gray-600"
          )}>Due: {deadline}</p>
        </div>
      </div>
      <Badge className={statusClasses[status].badge}>
        {status}
      </Badge>
      </m.div>
    </LazyMotion>
  );
};

const DependencyItem = ({ title, status, type }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const statusClasses = {
    completed: isDarkMode ? "bg-green-900/30 text-green-400 border-green-700/50" : "bg-green-100 text-green-600 border-green-200",
    'in-progress': isDarkMode ? "bg-blue-900/30 text-blue-400 border-blue-700/50" : "bg-blue-100 text-blue-600 border-blue-200",
    pending: isDarkMode ? "bg-yellow-900/30 text-yellow-400 border-yellow-700/50" : "bg-yellow-100 text-yellow-600 border-yellow-200"
  };
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
      whileHover={{ scale: 1.02, x: 3 }}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-colors",
        isDarkMode ? "bg-slate-800/50 border-slate-700 hover:bg-slate-800" : "bg-white border-gray-200 hover:bg-gray-50"
      )}
    >
      <div className="flex items-center space-x-3">
        <div className={cn(
          "p-2 rounded-lg",
          isDarkMode ? "bg-slate-700" : "bg-gray-100"
        )}>
          <Package className={cn(
            "w-4 h-4",
            isDarkMode ? "text-blue-400" : "text-blue-500"
          )} />
        </div>
        <div>
          <h4 className={cn(
            "font-medium",
            isDarkMode ? "text-white" : "text-slate-800"
          )}>{title}</h4>
          <p className={cn(
            "text-sm",
            isDarkMode ? "text-slate-400" : "text-gray-600"
          )}>{type}</p>
        </div>
      </div>
      <Badge className={statusClasses[status]}>
        {status}
      </Badge>
      </m.div>
    </LazyMotion>
  );
};

const InsightItem = ({ title, description }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
      whileHover={{ x: 3 }}
      className="flex items-start space-x-3"
    >
      <Sparkles className={cn(
        "w-5 h-5 mt-0.5",
        isDarkMode ? "text-blue-400" : "text-blue-600"
      )} />
      <div>
        <h4 className={cn(
          "font-medium",
          isDarkMode ? "text-blue-300" : "text-blue-900"
        )}>{title}</h4>
        <p className={cn(
          "text-sm mt-1",
          isDarkMode ? "text-blue-200/80" : "text-blue-800"
        )}>{description}</p>
      </div>
      </m.div>
    </LazyMotion>
  );
};

const TaskItem = ({ title, status, progress, assignees, deadline }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const statusClasses = {
    completed: isDarkMode ? "bg-green-900/30 text-green-400 border-green-700/50" : "bg-green-100 text-green-600 border-green-200",
    'in-progress': isDarkMode ? "bg-blue-900/30 text-blue-400 border-blue-700/50" : "bg-blue-100 text-blue-600 border-blue-200",
    pending: isDarkMode ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-gray-100 text-gray-600 border-gray-200"
  };
  
  const progressColor = () => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 20) return "bg-amber-500";
    return "bg-red-500";
  };
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
      whileHover={{ scale: 1.01, y: -2 }}
      className={cn(
        "p-4 rounded-lg border transition-all shadow-sm hover:shadow-md",
        isDarkMode ? "bg-slate-800/80 border-slate-700" : "bg-white border-gray-200"
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className={cn(
            "font-medium",
            isDarkMode ? "text-white" : "text-slate-800"
          )}>{title}</h4>
          <div className={cn(
            "flex items-center space-x-4 mt-1.5 text-sm",
            isDarkMode ? "text-slate-400" : "text-gray-600"
          )}>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{assignees} members</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{deadline}</span>
            </div>
          </div>
        </div>
        <Badge className={statusClasses[status]}>
          {status}
        </Badge>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-sm mb-1.5">
          <span className={isDarkMode ? "text-slate-400" : "text-gray-600"}>Progress</span>
          <span className={
            progress === 100 
              ? (isDarkMode ? "text-green-400" : "text-green-600") 
              : (isDarkMode ? "text-blue-400" : "text-blue-600")
          }>{progress}%</span>
        </div>
        <div className={cn(
          "bg-gray-100 rounded-full h-2 overflow-hidden",
          isDarkMode ? "bg-slate-700" : "bg-gray-100"
        )}>
            <m.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
            className={`h-full rounded-full ${progressColor()}`}
          />
        </div>
      </div>
      </m.div>
    </LazyMotion>
  );
};

const MaterialItem = ({ name, quantity, used, status }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const statusClasses = {
    sufficient: isDarkMode ? "bg-green-900/30 text-green-400 border-green-700/50" : "bg-green-100 text-green-600 border-green-200",
    low: isDarkMode ? "bg-yellow-900/30 text-yellow-400 border-yellow-700/50" : "bg-yellow-100 text-yellow-600 border-yellow-200",
    pending: isDarkMode ? "bg-blue-900/30 text-blue-400 border-blue-700/50" : "bg-blue-100 text-blue-600 border-blue-200"
  };
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
      whileHover={{ scale: 1.01, y: -2 }}
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border transition-all shadow-sm hover:shadow-md",
        isDarkMode ? "bg-slate-800/80 border-slate-700" : "bg-white border-gray-200"
      )}
    >
      <div>
        <h4 className={cn(
          "font-medium",
          isDarkMode ? "text-white" : "text-slate-800"
        )}>{name}</h4>
        <div className={cn(
          "flex items-center space-x-4 mt-1.5 text-sm",
          isDarkMode ? "text-slate-400" : "text-gray-600"
        )}>
          <span>Total: {quantity}</span>
          <span>Used: {used}</span>
        </div>
      </div>
      <Badge className={statusClasses[status]}>
        {status}
      </Badge>
      </m.div>
    </LazyMotion>
  );
};

// TaskCard component
const TaskCard = ({ title, description, dueDate, status, progress, assignedTo }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
        <Card className={cn(
          "relative overflow-hidden border transition-all duration-300 shadow-sm hover:shadow-md",
          status === 'completed' ? (isDarkMode ? "border-l-4 border-l-green-500" : "border-l-4 border-l-green-500") :
          status === 'in-progress' ? (isDarkMode ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-blue-500") :
          status === 'delayed' ? (isDarkMode ? "border-l-4 border-l-red-500" : "border-l-4 border-l-red-500") :
          (isDarkMode ? "border-l-4 border-l-gray-500" : "border-l-4 border-l-gray-500")
        )}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className={cn("font-medium", isDarkMode ? "text-white" : "text-gray-900")}>{title}</h3>
              <Badge className={cn(
                status === 'completed' ? (isDarkMode ? "bg-green-600" : "bg-green-100 text-green-800") :
                status === 'in-progress' ? (isDarkMode ? "bg-blue-600" : "bg-blue-100 text-blue-800") :
                status === 'delayed' ? (isDarkMode ? "bg-red-600" : "bg-red-100 text-red-800") :
                (isDarkMode ? "bg-gray-600" : "bg-gray-100 text-gray-800")
              )}>
                {status}
              </Badge>
            </div>
            <p className={cn("text-sm mb-3", isDarkMode ? "text-gray-300" : "text-gray-600")}>{description}</p>
            <div className="flex justify-between items-center text-xs mb-2">
              <div className={cn(isDarkMode ? "text-gray-400" : "text-gray-500")}>
                <Calendar className="w-3 h-3 inline mr-1" />
                Due {dueDate}
              </div>
              <div>{progress}% Complete</div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-4">
              <div 
                className={cn(
                  "h-full rounded-full",
                  status === 'completed' ? "bg-green-500" :
                  status === 'in-progress' ? "bg-blue-500" :
                  status === 'delayed' ? "bg-red-500" :
                  "bg-gray-500"
                )} 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex -space-x-2">
                {assignedTo.slice(0, 3).map((person, i) => (
                  <Avatar key={i} className="border-2 border-white dark:border-slate-800 h-6 w-6">
                    <AvatarFallback className="bg-blue-500 text-xs text-white">{person}</AvatarFallback>
                  </Avatar>
                ))}
                {assignedTo.length > 3 && (
                  <Avatar className="border-2 border-white dark:border-slate-800 h-6 w-6">
                    <AvatarFallback className="bg-gray-500 text-xs text-white">+{assignedTo.length - 3}</AvatarFallback>
                  </Avatar>
                )}
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  );
};

// MaterialCard component
const MaterialCard = ({ name, supplier, quantity, status }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        whileHover={{ scale: 1.02, x: 3 }}
        className={cn(
          "flex items-center justify-between p-3 rounded-lg",
          status === 'delivered' ? (isDarkMode ? "bg-green-900/20" : "bg-green-50") :
          status === 'ordered' ? (isDarkMode ? "bg-blue-900/20" : "bg-blue-50") :
          status === 'delayed' ? (isDarkMode ? "bg-red-900/20" : "bg-red-50") :
          (isDarkMode ? "bg-slate-800" : "bg-gray-50")
        )}
      >
        <div>
          <h3 className={cn("font-medium", isDarkMode ? "text-white" : "text-gray-900")}>{name}</h3>
          <p className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-600")}>
            {supplier} · {quantity}
          </p>
        </div>
        <Badge className={cn(
          status === 'delivered' ? (isDarkMode ? "bg-green-800 text-green-100" : "bg-green-100 text-green-800") :
          status === 'ordered' ? (isDarkMode ? "bg-blue-800 text-blue-100" : "bg-blue-100 text-blue-800") :
          status === 'delayed' ? (isDarkMode ? "bg-red-800 text-red-100" : "bg-red-100 text-red-800") :
          (isDarkMode ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-800")
        )}>
          {status}
        </Badge>
      </m.div>
    </LazyMotion>
  );
};

// TeamMemberCard component
const TeamMemberCard = ({ name, role, status }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        whileHover={{ scale: 1.02, x: 3 }}
        className={cn(
          "flex items-center justify-between p-3 rounded-lg",
          isDarkMode ? "bg-slate-800" : "bg-gray-50"
        )}
      >
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-500 text-white">{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className={cn("font-medium", isDarkMode ? "text-white" : "text-gray-900")}>{name}</h3>
            <p className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-600")}>{role}</p>
          </div>
        </div>
        <Badge className={cn(
          status === 'active' ? (isDarkMode ? "bg-green-800 text-green-100" : "bg-green-100 text-green-800") :
          status === 'on-leave' ? (isDarkMode ? "bg-amber-800 text-amber-100" : "bg-amber-100 text-amber-800") :
          (isDarkMode ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-800")
        )}>
          {status}
        </Badge>
      </m.div>
    </LazyMotion>
  );
};

// CommentItem component
const CommentItem = ({ author, timestamp, description }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        whileHover={{ x: 3 }}
        className="flex items-start space-x-3"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-blue-500 text-white">{author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-baseline space-x-2">
            <h4 className={cn("font-medium", isDarkMode ? "text-white" : "text-gray-900")}>{author}</h4>
            <span className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>{timestamp}</span>
          </div>
          <p className={cn("text-sm mt-1", isDarkMode ? "text-gray-300" : "text-gray-600")}>{description}</p>
        </div>
      </m.div>
    </LazyMotion>
  );
};

// ProgressItem component
const ProgressItem = ({ date, title, description, progress }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        whileHover={{ scale: 1.01, y: -2 }}
        className={cn(
          "p-3 rounded-lg",
          isDarkMode ? "bg-slate-800" : "bg-gray-50"
        )}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className={cn("font-medium", isDarkMode ? "text-white" : "text-gray-900")}>{title}</h3>
            <p className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-600")}>{date}</p>
          </div>
        </div>
        <p className={cn("text-sm mb-2", isDarkMode ? "text-gray-300" : "text-gray-600")}>{description}</p>
        <div className={cn(
          "w-full h-1.5 rounded-full overflow-hidden",
          isDarkMode ? "bg-slate-700" : "bg-gray-100"
        )}>
          <m.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className={progressColor()}
          />
        </div>
      </m.div>
    </LazyMotion>
  );
};

// DocumentItem component
const DocumentItem = ({ name, type, date, size, status }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        whileHover={{ scale: 1.01, y: -2 }}
        className={cn(
          "flex items-center justify-between p-3 rounded-lg",
          isDarkMode ? "bg-slate-800" : "bg-gray-50"
        )}
      >
        <div className="flex items-center space-x-3">
          <div className={cn(
            "p-2 rounded",
            type === 'pdf' ? (isDarkMode ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-600") :
            type === 'doc' ? (isDarkMode ? "bg-blue-900/20 text-blue-400" : "bg-blue-50 text-blue-600") :
            type === 'xls' ? (isDarkMode ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-600") :
            (isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600")
          )}>
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className={cn("font-medium", isDarkMode ? "text-white" : "text-gray-900")}>{name}</h3>
            <p className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-600")}>
              {date} · {size}
            </p>
          </div>
        </div>
        <Badge className={cn(
          status === 'approved' ? (isDarkMode ? "bg-green-800 text-green-100" : "bg-green-100 text-green-800") :
          status === 'pending' ? (isDarkMode ? "bg-amber-800 text-amber-100" : "bg-amber-100 text-amber-800") :
          (isDarkMode ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-800")
        )}>
          {status}
        </Badge>
      </m.div>
    </LazyMotion>
  );
};

export default PhaseDetails;