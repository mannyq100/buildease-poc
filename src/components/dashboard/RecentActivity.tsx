import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Calendar, ChevronRight } from 'lucide-react'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ActivityItem {
  text: string
  time: string
  icon: React.ReactNode
  link?: string
}

interface RecentActivityProps {
  activities: ActivityItem[]
  className?: string
}

/**
 * RecentActivity component
 * Displays a list of recent activities in the dashboard
 */
export function RecentActivity({ activities, className = '' }: RecentActivityProps) {
  const navigate = useNavigate()
  
  return (
    <div className={className}>
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border-b border-blue-100 dark:border-blue-900/20 p-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center text-base">
              <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Recent Activity
            </CardTitle>
            <Badge 
              variant="outline" 
              className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30"
            >
              Last 24 hours
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <LazyMotion features={domAnimation}>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {activities.length > 0 ? (
                activities.map((item, i) => (
                  <m.div 
                    key={i}
                    className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => item.link && navigate(item.link)}
                    style={{ cursor: item.link ? 'pointer' : 'default' }}
                  >
                    <div className="flex-shrink-0 mt-1 bg-gray-100 dark:bg-slate-800 rounded-full p-2">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.text}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.time}</p>
                    </div>
                    
                    {item.link && (
                      <Button 
                        size="icon"
                        variant="ghost"
                        className="ml-auto h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(item.link)
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </m.div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                </div>
              )}
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
          </LazyMotion>
        </CardContent>
      </Card>
    </div>
  )
} 