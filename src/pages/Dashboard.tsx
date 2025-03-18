/**
 * Dashboard.tsx - Main dashboard page
 * Overview of construction project metrics, tasks, and deadlines
 */
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LazyMotion, domAnimation, m } from 'framer-motion'

// Icons
import { 
  Plus,
  LayoutDashboard,
  RefreshCw,
  DollarSign, 
  ListTodo, 
  Calendar,
  Package,
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast-context'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// Dashboard Components
import {
  DashboardMetricsGrid,
  ProjectsOverview,
  RecentActivity,
  UpcomingDeadlines,
  TeamPerformance,
  DataVisualization,
} from '@/components/dashboard'
import LoadingState from '@/components/dashboard/LoadingState'

// Shared Components
import { PageHeader } from '@/components/shared'

// Custom Hooks
import { useDashboardData } from '@/hooks/useDashboardData'

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
    teamData,
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
        variant: "error",
        duration: 5000,
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, refreshData, toast])

  // Map activity item icons to components
  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case 'dollar':
        return <DollarSign className="h-4 w-4 text-green-500" />
      case 'task':
        return <ListTodo className="h-4 w-4 text-amber-500" />
      case 'calendar':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'package':
        return <Package className="h-4 w-4 text-purple-500" />
      default:
        return <ListTodo className="h-4 w-4 text-gray-500" />
    }
  }
  
  // Enhanced activity items with React components instead of strings
  const enhancedActivityItems = activityItems.map(item => ({
    ...item,
    icon: getActivityIcon(item.icon as string)
  }))

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* PageHeader */}
        <PageHeader
          title="Project Dashboard"
          description="Track your construction projects with real-time insights and analytics"
          icon={<LayoutDashboard className="h-8 w-8" />}
          actions={
            <>
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
                onClick={() => navigate('/create-project')}
              >
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Button>
            </>
          }
        />
        
        {/* Last Updated Timestamp */}
        {lastUpdated && (
          <div className="mt-2 text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()} {lastUpdated.toLocaleDateString()}
            </p>
          </div>
        )}
        
        {/* Welcome Banner with Quick Actions */}
        <m.div 
          className="mt-8 mb-8 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative z-10">
            {/* Quick Actions Row */}
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(action.route)}
                  className="bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-400 border border-gray-200 dark:border-slate-700"
                >
                  {action.icon}
                  <span className="ml-2">{action.title}</span>
                </Button>
              ))}
            </div>
          </div>
        </m.div>
        
        {/* Metrics Overview */}
        <DashboardMetricsGrid
          stats={quickStats}
          className="mb-8"
        />
        
        {/* Loading Overlay for Refresh */}
        {isRefreshing && (
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
            <LoadingState message="Refreshing dashboard data..." />
          </div>
        )}
        
        {/* Charts Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Tabs defaultValue="progress" value={activeChartTab} onValueChange={setActiveChartTab} className="w-full">
              <TabsList className="bg-gray-100/80 dark:bg-slate-800/50">
                <TabsTrigger 
                  value="progress" 
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"
                >
                  Project Progress
                </TabsTrigger>
                <TabsTrigger 
                  value="budget" 
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"
                >
                  Budget Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks" 
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"
                >
                  Task Status
                </TabsTrigger>
              </TabsList>
            
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2">
                  <TabsContent value="progress" className="m-0">
                    <DataVisualization
                      data={projectProgressData}
                      title="Project Progress"
                      description="Overview of all active project phases"
                      xAxisKey="name"
                      yAxisKeys={["completed"]}
                      defaultChartType="bar"
                      height={300}
                      colorScheme="primary"
                    />
                  </TabsContent>
                  
                  <TabsContent value="budget" className="m-0">
                    <DataVisualization
                      data={budgetData}
                      title="Budget Overview"
                      description="Monthly planned vs actual spending"
                      xAxisKey="name"
                      yAxisKeys={["Planned", "Actual"]}
                      defaultChartType="area"
                      height={300}
                      colorScheme="success"
                    />
                  </TabsContent>
                  
                  <TabsContent value="tasks" className="m-0">
                    <DataVisualization
                      data={taskStatusData}
                      title="Task Status"
                      description="Current status of all project tasks"
                      pieKey="name"
                      pieValueKey="value"
                      defaultChartType="pie"
                      height={300}
                      colorScheme="accent"
                    />
                  </TabsContent>
                </div>
                
                <div className="lg:col-span-1">
                  <DataVisualization
                    data={materialUsageData}
                    title="Material Usage"
                    description="Distribution of materials across projects"
                    pieKey="name"
                    pieValueKey="value"
                    defaultChartType="pie"
                    height={300}
                    showToggle={false}
                    colorScheme="warning"
                  />
                </div>
              </div>
            </Tabs>
          </div>
        </div>
        
        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Projects Overview */}
            <ProjectsOverview projects={projectsData} />
            
            {/* Team Performance */}
            <TeamPerformance teamMembers={teamData} />
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            {/* Upcoming Deadlines */}
            <UpcomingDeadlines deadlines={upcomingDeadlines} />
            
            {/* Recent Activity */}
            <RecentActivity activities={enhancedActivityItems} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 