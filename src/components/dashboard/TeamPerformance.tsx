import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Users, Award, ChevronRight } from 'lucide-react'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface TeamMemberPerformance {
  id: string | number
  name: string
  position: string
  avatar?: string
  completedTasks: number
  totalTasks: number
  performance: number // 0-100
  isTopPerformer?: boolean
}

interface TeamPerformanceProps {
  teamMembers: TeamMemberPerformance[]
  className?: string
}

/**
 * TeamPerformance component
 * Displays team member performance metrics in a dashboard view
 */
export function TeamPerformance({ teamMembers, className = '' }: TeamPerformanceProps) {
  const navigate = useNavigate()
  
  // Sort team members by performance (highest first)
  const sortedTeamMembers = [...teamMembers]
    .sort((a, b) => b.performance - a.performance)
    .slice(0, 5) // Show only top 5 performers
  
  // Get initials from a name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
  }
  
  // Get color based on performance score
  const getPerformanceColor = (performance: number) => {
    if (performance >= 80) return 'text-green-600 dark:text-green-400'
    if (performance >= 60) return 'text-blue-600 dark:text-blue-400'
    if (performance >= 40) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }
  
  // Get progress color based on performance score
  const getProgressColor = (performance: number) => {
    if (performance >= 80) return 'bg-green-500 dark:bg-green-500'
    if (performance >= 60) return 'bg-blue-500 dark:bg-blue-500'
    if (performance >= 40) return 'bg-amber-500 dark:bg-amber-500'
    return 'bg-red-500 dark:bg-red-500'
  }
  
  return (
    <div className={className}>
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/10 border-b border-purple-100 dark:border-purple-900/20 p-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-900 dark:text-purple-100 flex items-center text-base">
              <Users className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              Top Performers
            </CardTitle>
            <Badge 
              variant="outline" 
              className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800/30"
            >
              {teamMembers.length} Members
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <LazyMotion features={domAnimation}>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {sortedTeamMembers.length > 0 ? (
                sortedTeamMembers.map((member, i) => (
                  <m.div 
                    key={member.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-200 cursor-pointer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate(`/team/member/${member.id}`)}
                  >
                    <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-700 shadow-sm">
                      {member.avatar ? (
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // If image fails to load, show fallback
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.querySelector('[data-fallback]')?.removeAttribute('style');
                          }}
                        />
                      ) : (
                        <AvatarFallback 
                          data-fallback 
                          className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                        >
                          {getInitials(member.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {member.name}
                        </h3>
                        {member.isTopPerformer && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30 flex items-center gap-1 text-xs">
                            <Award className="h-3 w-3 text-amber-500" /> Top Performer
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {member.position} • {member.completedTasks}/{member.totalTasks} tasks
                      </p>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <Progress 
                          value={member.performance} 
                          className="h-2 w-full bg-gray-100 dark:bg-gray-700"
                          indicatorClassName={getProgressColor(member.performance)}
                        />
                        <span className={cn(
                          "text-xs font-medium whitespace-nowrap",
                          getPerformanceColor(member.performance)
                        )}>
                          {member.performance}%
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      size="icon"
                      variant="ghost"
                      className="ml-auto h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/team/member/${member.id}`)
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </m.div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No team members data available</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <Button 
                variant="ghost" 
                className="w-full text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                onClick={() => navigate('/team')}
              >
                View All Team Members
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </LazyMotion>
        </CardContent>
      </Card>
    </div>
  )
} 