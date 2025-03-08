/**
 * Dashboard.tsx - Main dashboard page
 * Overview of construction project metrics, tasks, and quick actions
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LazyMotion, domAnimation, m } from 'framer-motion'

// Icons
import { 
  Plus,
  LayoutDashboard,
  RefreshCw,
  Briefcase, 
  DollarSign, 
  ListTodo, 
  Users,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Package,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast-context'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// Custom Components
import { PageHeader } from '@/components/shared'
import { StatCard } from '@/components/shared/StatCard'
import DataVisualization from '@/components/dashboard/DataVisualization'

// Utilities
import { darkModeDetector } from '@/lib/utils'

// Data Services
import {
  getProjectProgressData,
  getBudgetData,
  getMaterialUsageData,
  getTaskStatusData,
  getQuickStats,
  getQuickActions
} from '@/data/dashboardService'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0, 
    opacity: 1
  }
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
  
  // Load data from service
  const projectProgressData = getProjectProgressData()
  const budgetData = getBudgetData()
  const materialUsageData = getMaterialUsageData()
  const taskStatusData = getTaskStatusData()
  const quickStats = getQuickStats()
  const quickActions = getQuickActions()
  
  // Set up dark mode detection
  useEffect(() => {
    const unsubscribe = darkModeDetector.subscribe(setIsDarkMode)
    return unsubscribe
  }, [])

  /**
   * Handles refreshing dashboard data
   */
  function handleRefresh() {
    setIsRefreshing(true)
    
    // Simulate data fetching
    setTimeout(() => {
      setIsRefreshing(false)
      
      // Show success toast
      toast({
        title: "Dashboard refreshed",
        description: "All data has been updated with the latest information",
        variant: "success",
        duration: 3000,
      })
    }, 1500)
  }

  // Recent activity data
  const activityItems = [
    { text: "Budget for Main St. project updated", time: "1h ago", icon: <DollarSign className="h-4 w-4 text-green-500" /> },
    { text: "3 new tasks assigned to team", time: "3h ago", icon: <ListTodo className="h-4 w-4 text-amber-500" /> },
    { text: "Meeting scheduled with contractors", time: "5h ago", icon: <Calendar className="h-4 w-4 text-blue-500" /> },
    { text: "New material order placed", time: "Yesterday", icon: <Package className="h-4 w-4 text-purple-500" /> }
  ];

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
                Refresh Data
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
        
        {/* Welcome Banner */}
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
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Key Performance Metrics
          </h2>
          <m.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <m.div variants={itemVariants} className="h-full">
              <StatCard
                title="Active Projects"
                value="4"
                icon={<Briefcase className="h-6 w-6" />}
                color="blue"
                subtitle="in progress"
              />
            </m.div>
            <m.div variants={itemVariants} className="h-full">
              <StatCard
                title="Budget"
                value="$120K"
                icon={<DollarSign className="h-6 w-6" />}
                color="green"
                subtitle="$80K spent (67%)"
              />
            </m.div>
            <m.div variants={itemVariants} className="h-full">
              <StatCard
                title="Open Tasks"
                value="28"
                icon={<ListTodo className="h-6 w-6" />}
                color="amber"
                subtitle="8 due today"
              />
            </m.div>
            <m.div variants={itemVariants} className="h-full">
              <StatCard
                title="Team Members"
                value="12"
                icon={<Users className="h-6 w-6" />}
                color="purple"
                subtitle="8 active today"
              />
            </m.div>
          </m.div>
        </div>
        
        {/* Charts Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Tabs defaultValue="progress" value={activeChartTab} onValueChange={setActiveChartTab} className="w-full">
              <TabsList className="bg-gray-100/80 dark:bg-slate-800/50">
                <TabsTrigger value="progress" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Progress
                </TabsTrigger>
                <TabsTrigger value="budget" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                  <LineChart className="h-4 w-4 mr-2" />
                  Budget
                </TabsTrigger>
                <TabsTrigger value="tasks" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                  <PieChart className="h-4 w-4 mr-2" />
                  Tasks
                </TabsTrigger>
              </TabsList>
            
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2">
                  <TabsContent value="progress" className="m-0">
                    <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border-b border-blue-100 dark:border-blue-900/20 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center">
                              <BarChart3 className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                              Project Progress
                            </CardTitle>
                            <CardDescription className="text-blue-700/70 dark:text-blue-300/70 mt-1">
                              Overview of all active project phases
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30">
                            <Calendar className="h-3 w-3 mr-1" />
                            Updated Today
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-8">
                        <DataVisualization
                          data={projectProgressData}
                          title="Progress by Phase"
                          xAxisKey="name"
                          yAxisKeys={["completed"]}
                          defaultChartType="bar"
                          height={300}
                        />
                        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic border-t border-gray-100 dark:border-gray-800 pt-3">
                          * Chart shows percentage completion of each phase. Foundation work is complete, while later phases are in various stages of progress.
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="budget" className="m-0">
                    <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/10 border-b border-green-100 dark:border-green-900/20 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-green-900 dark:text-green-100 flex items-center">
                              <LineChart className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                              Budget Overview
                            </CardTitle>
                            <CardDescription className="text-green-700/70 dark:text-green-300/70 mt-1">
                              Monthly planned vs actual spending
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/30">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Within Budget
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-8">
                        <DataVisualization
                          data={budgetData}
                          title="Monthly Budget Analysis"
                          xAxisKey="name"
                          yAxisKeys={["Planned", "Actual"]}
                          defaultChartType="line"
                          height={300}
                        />
                        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic border-t border-gray-100 dark:border-gray-800 pt-3">
                          * Chart compares planned vs actual expenditure. April and May show variances that may require adjustments to remain on budget.
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="tasks" className="m-0">
                    <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                      <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/10 border-b border-amber-100 dark:border-amber-900/20 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-amber-900 dark:text-amber-100 flex items-center">
                              <PieChart className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                              Task Status
                            </CardTitle>
                            <CardDescription className="text-amber-700/70 dark:text-amber-300/70 mt-1">
                              Current status of all project tasks
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30">
                            <ListTodo className="h-3 w-3 mr-1" />
                            28 Active Tasks
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-8">
                        <DataVisualization
                          data={taskStatusData}
                          title="Tasks by Status"
                          pieKey="name"
                          pieValueKey="value"
                          defaultChartType="pie"
                          height={300}
                        />
                        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic border-t border-gray-100 dark:border-gray-800 pt-3">
                          * Pie chart shows the distribution of tasks by status. 42% of tasks are completed, with 6% currently delayed.
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
                
                <div className="lg:col-span-1">
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-full flex flex-col">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/10 border-b border-purple-100 dark:border-purple-900/20 p-5 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-purple-900 dark:text-purple-100 flex items-center text-base">
                          <Package className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                          Material Usage
                        </CardTitle>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800/30">
                          <Package className="h-3 w-3 mr-1" />
                          5 Types
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-8 flex-grow flex flex-col">
                      <div className="flex-grow">
                        <DataVisualization
                          data={materialUsageData}
                          title="Material Distribution"
                          pieKey="name"
                          pieValueKey="value"
                          defaultChartType="pie"
                          height={280}
                          showToggle={false}
                        />
                      </div>
                      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic border-t border-gray-100 dark:border-gray-800 pt-3">
                        * Concrete and steel account for over 50% of all materials used in active projects.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Tabs>
          </div>
        </div>
        
        {/* Recent Activity in its own row */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border-b border-blue-100 dark:border-blue-900/20 p-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center text-base">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Recent Activity
                </CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30">
                  Last 24 hours
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {activityItems.map((item, i) => (
                  <m.div 
                    key={i}
                    className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex-shrink-0 mt-1 bg-gray-100 dark:bg-slate-800 rounded-full p-2">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.text}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.time}</p>
                    </div>
                    
                    <Button 
                      size="icon"
                      variant="ghost"
                      className="ml-auto h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </m.div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <Button 
                  variant="ghost" 
                  className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => navigate('/activity')}
                >
                  View All Activity
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Only use default export to avoid duplicate exports
export default Dashboard 