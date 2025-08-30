/**
 * Dashboard.tsx - Main dashboard page
 * Overview of construction project metrics, tasks, and deadlines
 */
import { useCallback, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { m } from 'framer-motion'
import { cn } from '@/utils/core/ui';

// Icons
import { 
  Plus,
  LayoutDashboard,
  RefreshCw,
  DollarSign, 
  ListTodo, 
  Calendar,
  Package,
  BarChart3,
  Activity,
  Briefcase
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'

import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Dashboard Components
import {
  DashboardMetricsGrid,
  ProjectsOverview,
  RecentActivity,
  UpcomingDeadlines,
  DataVisualization,
} from '@/components/dashboard'
import LoadingState from '@/components/dashboard/LoadingState'

// Shared Components
import { PageHeader } from '@/components/shared'

// Custom Hooks
import { useDashboardData } from '@/hooks/useDashboardData'

// Import types from dashboard types file
import { ActivityItem as DashboardActivityItem, QuickAction as DashboardQuickAction } from '@/types/dashboard'

// Local interface for activity items from API
interface ActivityItem {
  id: string
  type: string
  title?: string
  text?: string
  date?: string
  time?: string
  user?: string
  icon?: React.ReactNode
  link?: string
}

// Define chart data interface to match DataVisualization component's expected type
interface ChartData extends Record<string, unknown> {
  name: string
  [key: string]: unknown
}

/**
 * Dashboard component
 * Main dashboard for the construction management application
 */
export function Dashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  // State
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeChartTab, setActiveChartTab] = useState("progress")
  const [isMobile, setIsMobile] = useState(false)
  
  // Get dashboard data from custom hook
  const { 
    isLoading,
    projectProgressData,
    budgetData,
    materialUsageData,
    taskStatusData,
    quickStats,
    quickActions,
    activityItems,
    upcomingDeadlines,
    projectsData,
    lastUpdated,
    refreshData
  } = useDashboardData()
  
  // Check dark mode on component mount and whenever it might change
  useEffect(() => {
    function checkDarkMode() {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    
    // Check on mount
    checkDarkMode()
    
    // Set up a mutation observer to watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    // Clean up observer on unmount
    return () => observer.disconnect()
  }, [])

  /**
   * Handles refreshing dashboard data
   */
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return
    
    setIsRefreshing(true)
    
    try {
      await refreshData()
      
      // Show success toast
      toast({
        title: "Dashboard refreshed",
        description: "All data has been updated with the latest information",
        variant: "success",
        duration: 3000,
      })
    } catch (error) {
      // Show error toast
      toast({
        title: "Refresh failed",
        description: "There was a problem refreshing the dashboard data",
        variant: "destructive", // Using 'destructive' instead of 'error' to match ToastType
        duration: 5000,
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, refreshData, toast])

  // Map activity item icons to components
  const getIconForType = (type: string) => {
    switch (type) {
      case 'dollar':
        return <DollarSign className="h-5 w-5 text-blue-500" />
      case 'task':
        return <ListTodo className="h-5 w-5 text-green-500" />
      case 'calendar':
        return <Calendar className="h-5 w-5 text-amber-500" />
      case 'package':
        return <Package className="h-5 w-5 text-purple-500" />
      case 'briefcase':
        return <Briefcase className="h-5 w-5 text-blue-500" />
      case 'chart':
        return <BarChart3 className="h-5 w-5 text-amber-500" />
      case 'dashboard':
        return <LayoutDashboard className="h-5 w-5 text-purple-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }
  
  // Transform activity items to match the expected DashboardActivityItem format
  const enhancedActivityItems: DashboardActivityItem[] = activityItems && activityItems.length > 0 
    ? activityItems.map(item => ({
        text: item.title, // Use title from the API format
        time: item.date, // Use date from the API format
        icon: getIconForType(item.type), // Generate icon based on type
        link: `/activity/${item.id}` // Create link using ID
      }))
    : []

  // Transform raw dashboard data into the expected formats for components
  // Stats data for the metrics grid
  const formattedStats = useMemo(() => {
    return quickStats.map(stat => {
      // Properly handle trend object or create a default one if it's not valid
      let trendData = {
        value: 0,
        isPositive: true
      };
      
      // Safe type checking for trend property
      if (stat.trend) {
        if (typeof stat.trend === 'object' && 'value' in stat.trend) {
          // If trend is an object with value property
          const trendValue = Number(stat.trend.value || 0);
          trendData = {
            value: isNaN(trendValue) ? 0 : trendValue,
            isPositive: Boolean(stat.trend.isPositive)
          };
        } else if (typeof stat.trend === 'number') {
          // If trend is a number
          trendData = {
            value: Math.abs(stat.trend),
            isPositive: stat.trend > 0
          };
        }
      }
      
      return {
        title: String(stat.title || ''),  // Ensure title is a string with fallback
        value: typeof stat.value === 'number' ? stat.value : 0,
        color: (typeof stat.color === 'string' ? stat.color : 'blue') as 'blue' | 'green' | 'amber' | 'purple' | 'red',
        icon: typeof stat.icon === 'string' ? getIconForType(stat.icon) : stat.icon,
        trend: trendData
      };
    });
  }, [quickStats, getIconForType]);

  // Deadlines for the upcoming deadlines component
  const formattedDeadlines = useMemo(() => {
    return upcomingDeadlines.map(deadline => ({
      id: deadline.id,
      title: deadline.title,
      dueDate: deadline.dueDate,
      project: deadline.project,
      projectId: '1', // Default value since our interface might not have it
      priority: (deadline.priority || 'medium') as 'high' | 'medium' | 'low',
      status: 'pending' as 'pending' | 'in-progress' | 'completed'
    }));
  }, [upcomingDeadlines]);

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // If data is loading and not refreshing, show loading state
  if (isLoading && !isRefreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90 flex items-center justify-center p-4">
        <LoadingState className="max-w-md w-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* PageHeader with enhanced styling */}
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PageHeader
            className="mb-6 sm:mb-8"
            title="Project Dashboard"
            description="Track your construction projects with real-time insights and analytics"
            icon={<LayoutDashboard className="h-10 w-10 text-white" />}
            actions={
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                className="mr-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
                <Button 
                  variant="default" 
                className="bg-white hover:bg-gray-50 text-blue-700 border border-white/20 shadow-sm"
                  onClick={() => navigate('/projects/new')}
                >
                  <Plus className="mr-2 h-4 w-4" /> New Project
                </Button>
              </div>
            }
          />
        </m.div>
        
        {/* Last Updated Timestamp */}
        {lastUpdated && (
          <div className="mt-2 text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              Last updated: {lastUpdated.toLocaleTimeString()} {lastUpdated.toLocaleDateString()}
            </p>
          </div>
        )}
        
        {/* Welcome Banner with Quick Actions */}
        <m.div 
          className="mt-6 mb-6 p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary-dark/10 dark:to-primary-dark/5 transform transition-transform hover:-translate-y-1 duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative z-10">
            {/* Quick Actions Title */}
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            
            {/* Quick Actions Scrollable Row */}
            <div className="relative">
              {/* Scrollable Container */}
              <div className="overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 scrollbar-none sm:scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <div className="flex gap-2 sm:gap-3 min-w-max">
                  {(quickActions as DashboardQuickAction[]).map((action, index) => (
                    <m.div className="snap-start" key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1, duration: 0.3 }}>
                      <Button variant="outline" size="mobile" mobileFullWidth onClick={() => navigate(action.route)}>
                        {typeof action.icon === 'string' ? getIconForType(action.icon) : action.icon}
                        <span className="ml-2">{action.title}</span>
                      </Button>
                    </m.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </m.div>
        
        {/* Metrics Overview with enhanced styling */}
        <div className="mb-6 p-4 sm:p-6 lg:p-8 bg-white dark:bg-slate-800/80 rounded-xl shadow-lg transform transition-transform hover:-translate-y-1 duration-300">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DashboardMetricsGrid stats={formattedStats} />
          </m.div>
        </div>
        
        {/* Loading Overlay for Refresh */}
        {isRefreshing && (
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
            <LoadingState message="Refreshing dashboard data..." />
          </div>
        )}
        
        {/* Charts Section with enhanced styling */}
        <m.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 transform transition-transform hover:-translate-y-1 duration-300">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-blue-600 dark:text-blue-400" />
              Analytics Overview
            </h2>
            
            {/* Mobile Dropdown Selector for Tabs */}
            {isMobile && (
              <div className="mb-4">
                <Select 
                  value={activeChartTab} 
                  onValueChange={setActiveChartTab}
                >
                  <SelectTrigger className="w-full bg-gray-100/80 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700">
                    <SelectValue placeholder="Select chart" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress">Project Progress</SelectItem>
                    <SelectItem value="budget">Budget Overview</SelectItem>
                    <SelectItem value="tasks">Task Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Tabs defaultValue="progress" value={activeChartTab} onValueChange={setActiveChartTab} className="w-full">
              {/* Desktop Tabs - Hidden on Mobile */}
              {!isMobile && (
                <TabsList className="bg-gray-100/80 dark:bg-slate-800/50 p-1 rounded-lg mb-4 overflow-x-auto flex whitespace-nowrap">
                  <TabsTrigger 
                    value="progress" 
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-md transition-all duration-200 min-h-[44px]"
                  >
                    Project Progress
                  </TabsTrigger>
                  <TabsTrigger 
                    value="budget" 
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-md transition-all duration-200 min-h-[44px]"
                  >
                    Budget Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tasks" 
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-md transition-all duration-200 min-h-[44px]"
                  >
                    Task Status
                  </TabsTrigger>
                </TabsList>
              )}
            
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mt-3 sm:mt-6">
                <div className="lg:col-span-2">
                  <TabsContent value="progress" className="m-0">
                    <DataVisualization
                      data={projectProgressData as unknown as ChartData[]}
                      title="Project Progress"
                      description="Overview of all active project phases"
                      xAxisKey="name"
                      yAxisKeys={["completed"]}
                      defaultChartType="bar"
                      height={isMobile ? 250 : 300}
                      colorScheme="primary"
                    />
                  </TabsContent>
                  
                  <TabsContent value="budget" className="m-0">
                    <DataVisualization
                      data={budgetData as unknown as ChartData[]}
                      title="Budget Overview"
                      description="Monthly planned vs actual spending"
                      xAxisKey="name"
                      yAxisKeys={["Planned", "Actual"]}
                      defaultChartType="area"
                      height={isMobile ? 250 : 300}
                      colorScheme="success"
                    />
                  </TabsContent>
                  
                  <TabsContent value="tasks" className="m-0">
                    <DataVisualization
                      data={taskStatusData as unknown as ChartData[]}
                      title="Task Status"
                      description="Current status of all project tasks"
                      pieKey="name"
                      pieValueKey="value"
                      defaultChartType="pie"
                      height={isMobile ? 250 : 300}
                      colorScheme="accent"
                    />
                  </TabsContent>
                </div>
                
                <div className="lg:col-span-1">
                  <DataVisualization
                    data={materialUsageData as unknown as ChartData[]}
                    title="Material Usage"
                    description="Distribution of materials across projects"
                    pieKey="name"
                    pieValueKey="value"
                    defaultChartType="pie"
                    height={isMobile ? 200 : 300}
                    showToggle={false}
                    colorScheme="warning"
                  />
                </div>
              </div>
            </Tabs>
          </div>
        </m.div>
        
        {/* Dashboard Content Grid with enhanced styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <ProjectsOverview projects={projectsData} className="rounded-lg shadow-md transform transition-transform duration-300 hover:shadow-lg hover:-translate-y-1" />
          </m.div>
          <m.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
            <UpcomingDeadlines deadlines={formattedDeadlines} className="h-auto sm:h-full rounded-lg shadow-md transform transition-transform duration-300 hover:shadow-lg hover:-translate-y-1" />
          </m.div>
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }}>
            <RecentActivity activities={enhancedActivityItems} className="h-auto sm:h-full rounded-lg shadow-md transform transition-transform duration-300 hover:shadow-lg hover:-translate-y-1" />
          </m.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 