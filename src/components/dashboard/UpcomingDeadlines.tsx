import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Calendar, Clock, ChevronRight } from 'lucide-react'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DeadlineItem {
  id: string | number
  title: string
  dueDate: string
  project: string
  projectId: string | number
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in-progress' | 'completed'
}

interface UpcomingDeadlinesProps {
  deadlines: DeadlineItem[]
  className?: string
}

/**
 * UpcomingDeadlines component
 * Displays a list of upcoming deadlines and tasks for the dashboard
 */
export function UpcomingDeadlines({ deadlines, className = '' }: UpcomingDeadlinesProps) {
  const navigate = useNavigate()
  
  // Sort deadlines by due date (closest first)
  const sortedDeadlines = [...deadlines].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
  
  // Take only the next 5 deadlines
  const upcomingDeadlines = sortedDeadlines.slice(0, 5)
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800/30'
      case 'medium':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30'
      case 'low':
        return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/30'
      default:
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30'
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/30'
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30'
      case 'pending':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30'
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800/30'
    }
  }
  
  return (
    <div className={className}>
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/10 border-b border-amber-100 dark:border-amber-900/20 p-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-amber-900 dark:text-amber-100 flex items-center text-base">
              <Clock className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
              Upcoming Deadlines
            </CardTitle>
            <Badge 
              variant="outline" 
              className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30"
            >
              {deadlines.length} Tasks
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <LazyMotion features={domAnimation}>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((item, i) => (
                  <m.div 
                    key={item.id}
                    className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-200 cursor-pointer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate(`/project/${item.projectId}/task/${item.id}`)}
                  >
                    <div className={cn(
                      "flex-shrink-0 mt-1 bg-gray-100 dark:bg-slate-800 rounded-full p-2",
                      item.priority === 'high' ? 'text-red-500 dark:text-red-400' :
                      item.priority === 'medium' ? 'text-amber-500 dark:text-amber-400' :
                      'text-green-500 dark:text-green-400'
                    )}>
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            getPriorityColor(item.priority)
                          )}
                        >
                          {item.priority} priority
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            getStatusColor(item.status)
                          )}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {item.dueDate}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Project: {item.project}
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      size="icon"
                      variant="ghost"
                      className="ml-auto h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/project/${item.projectId}/task/${item.id}`)
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </m.div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No upcoming deadlines</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <Button 
                variant="ghost" 
                className="w-full text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                onClick={() => navigate('/schedule')}
              >
                View All Tasks
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </LazyMotion>
        </CardContent>
      </Card>
    </div>
  )
} 