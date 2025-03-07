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

// Data
import {
  PROJECT_PROGRESS_DATA,
  BUDGET_DATA,
  MATERIAL_USAGE_DATA,
  TASK_STATUS_DATA,
  QUICK_STATS,
  QUICK_ACTIONS
} from '@/data/mock/dashboardData'

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
          title="Dashboard"
          description="Overview of your construction projects and tasks"
          icon={<LayoutDashboard className="h-8 w-8" />}
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mr-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300"
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                Refresh
              </Button>
              <Button 
                variant="default" 
                className="bg-white hover:bg-gray-100 text-blue-700 border border-white/20"
                onClick={() => navigate('/create-project')}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Project
              </Button>
            </>
          }
        />
        
        {/* Welcome Banner */}
        <m.div 
          className="mt-8 mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-xl shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-white">Welcome back, John!</h2>
            <p className="mt-1 text-white/80">Here's what's happening with your projects today.</p>
          </div>
          
          {/* Abstract background pattern */}
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.8))]"></div>
          
          {/* Quick Actions Row */}
          <div className="flex flex-wrap gap-2 mt-4">
            {QUICK_ACTIONS.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => navigate(action.route)}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                {action.icon}
                <span className="ml-2">{action.title}</span>
              </Button>
            ))}
          </div>
        </m.div>
        
        {/* Metrics Overview */}
        <m.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
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
              subtitle="$80K spent"
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
        
        {/* Charts Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Project Analytics</h2>
            <Tabs defaultValue="progress" value={activeChartTab} onValueChange={setActiveChartTab}>
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
                    <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Project Progress</CardTitle>
                            <CardDescription>Overview of all active project phases</CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30">
                            <Calendar className="h-3 w-3 mr-1" />
                            Updated Today
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-8">
                        <DataVisualization
                          data={PROJECT_PROGRESS_DATA}
                          title="Progress by Phase"
                          xAxisKey="name"
                          yAxisKeys={["completed"]}
                          defaultChartType="bar"
                          height={300}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="budget" className="m-0">
                    <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Budget Overview</CardTitle>
                            <CardDescription>Monthly planned vs actual spending</CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/30">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Budget
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-8">
                        <DataVisualization
                          data={BUDGET_DATA}
                          title="Budget Overview"
                          xAxisKey="name"
                          yAxisKeys={["Planned", "Actual"]}
                          defaultChartType="line"
                          height={300}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="tasks" className="m-0">
                    <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Task Status</CardTitle>
                            <CardDescription>Distribution of tasks by status</CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30">
                            <ListTodo className="h-3 w-3 mr-1" />
                            Tasks
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-8">
                        <DataVisualization
                          data={TASK_STATUS_DATA}
                          title="Task Status"
                          pieKey="name"
                          pieValueKey="value"
                          defaultChartType="pie"
                          height={300}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
                
                <div className="lg:col-span-1">
                  <div className="grid gap-6">
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700 pb-3">
                        <CardTitle className="text-base">Material Usage</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <DataVisualization
                          data={MATERIAL_USAGE_DATA}
                          title="Material Usage"
                          pieKey="name"
                          pieValueKey="value"
                          defaultChartType="pie"
                          height={200}
                          showToggle={false}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700 pb-3">
                        <CardTitle className="text-base">Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-gray-200 dark:divide-slate-700">
                          {activityItems.map((item, i) => (
                            <div key={i} className="flex items-start p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-150">
                              <div className="mr-4 mt-0.5 flex-shrink-0">{item.icon}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.text}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.time}</p>
                              </div>
                              <div className="ml-2">
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 border-t border-gray-200 dark:border-slate-700 flex justify-center">
                        <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 w-full">
                          View All Activity
                          <ArrowUpRight className="ml-2 h-3 w-3" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

// Only use default export to avoid duplicate exports
export default Dashboard 