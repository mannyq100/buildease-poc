/**
 * Component for displaying a team member in card format
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Phone,
  Award,
  Clock,
  CheckCircle2,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { formatNumber } from '@/lib/chartUtils'
import { ViewMode, AvailabilityStatus } from '@/types/common'

export interface TeamMember {
  id: string | number
  name: string
  position: string
  email: string
  phone?: string
  avatar?: string
  department: string
  completedTasks: number
  totalTasks: number
  performance: number
  availability: AvailabilityStatus
  status: 'active' | 'inactive'
  tags?: string[]
  isTopPerformer?: boolean
  joinDate: string
}

export interface TeamMemberCardProps {
  member: TeamMember
  viewMode?: ViewMode
  onViewProfile?: (member: TeamMember) => void
  onStartChat?: (member: TeamMember) => void
  className?: string
}

/**
 * TeamMemberCard component
 * Displays team member information in grid or list view
 */
export function TeamMemberCard({
  member,
  viewMode = 'grid',
  onViewProfile,
  onStartChat,
  className
}: TeamMemberCardProps) {
  const navigate = useNavigate()
  
  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
  }
  
  // Get color based on performance
  const getPerformanceColor = (performance: number) => {
    if (performance >= 80) return 'text-green-600 dark:text-green-400'
    if (performance >= 60) return 'text-blue-600 dark:text-blue-400'
    if (performance >= 40) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }
  
  // Get progress color based on performance
  const getProgressColor = (performance: number) => {
    if (performance >= 80) return 'bg-green-500 dark:bg-green-500'
    if (performance >= 60) return 'bg-blue-500 dark:bg-blue-500'
    if (performance >= 40) return 'bg-amber-500 dark:bg-amber-500'
    return 'bg-red-500 dark:bg-red-500'
  }
  
  // Get color based on availability
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/30'
      case 'busy':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30'
      case 'on-leave':
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800/30'
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800/30'
    }
  }
  
  // Handle profile click
  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(member)
    } else {
      navigate(`/team/member/${member.id}`)
    }
  }
  
  // Handle chat click
  const handleStartChat = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onStartChat) {
      onStartChat(member)
    }
  }
  
  // Render grid view
  if (viewMode === 'grid') {
    return (
      <div 
        className={cn(
          "bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer",
          className
        )}
        onClick={handleViewProfile}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <Avatar className="h-14 w-14 border-2 border-white dark:border-slate-700 shadow-sm">
              {member.avatar ? (
                <AvatarImage src={member.avatar} alt={member.name} />
              ) : (
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-lg">
                  {getInitials(member.name)}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex items-center gap-1">
              {member.phone && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.location.href = `tel:${member.phone}`
                  }}
                  aria-label={`Call ${member.name}`}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                onClick={handleStartChat}
                aria-label={`Message ${member.name}`}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {member.name}
              </h3>
              
              {member.isTopPerformer && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30 flex items-center gap-1">
                  <Award className="h-3 w-3 text-amber-500" /> Top Performer
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{member.position}</p>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Task completion</span>
                <span className={cn(
                  "text-xs font-medium",
                  getPerformanceColor(member.performance)
                )}>
                  {member.performance}%
                </span>
              </div>
              <Progress 
                value={member.performance} 
                className="h-2 bg-gray-100 dark:bg-gray-700"
                indicatorClassName={getProgressColor(member.performance)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {member.completedTasks}/{member.totalTasks} tasks
                </span>
              </div>
              
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  getAvailabilityColor(member.availability)
                )}
              >
                {member.availability}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="px-5 py-3 bg-gray-50 dark:bg-slate-700/20 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Department: {member.department}
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            onClick={handleViewProfile}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">View Profile</span>
          </Button>
        </div>
      </div>
    )
  }
  
  // Render list view
  return (
    <div 
      className={cn(
        "bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 overflow-hidden flex cursor-pointer",
        className
      )}
      onClick={handleViewProfile}
    >
      <div className="p-4 flex-shrink-0 flex items-center">
        <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-700 shadow-sm">
          {member.avatar ? (
            <AvatarImage src={member.avatar} alt={member.name} />
          ) : (
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {getInitials(member.name)}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      
      <div className="flex-1 min-w-0 p-4 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
            {member.name}
          </h3>
          
          {member.isTopPerformer && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30 flex items-center gap-1 h-5">
              <Award className="h-3 w-3 text-amber-500" /> Top
            </Badge>
          )}
          
          <Badge
            variant="outline"
            className={cn(
              "text-xs h-5",
              getAvailabilityColor(member.availability)
            )}
          >
            {member.availability}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500 dark:text-gray-400">
          <span>{member.position}</span>
          <span>•</span>
          <span>{member.department}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {member.completedTasks}/{member.totalTasks} tasks
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Joined {member.joinDate}
          </span>
        </div>
      </div>
      
      <div className="w-[120px] p-4 flex-shrink-0 flex flex-col items-end justify-center gap-2 border-l border-gray-100 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-semibold",
            getPerformanceColor(member.performance)
          )}>
            {member.performance}%
          </span>
        </div>
        
        <Progress 
          value={member.performance} 
          className="h-2 w-full bg-gray-100 dark:bg-gray-700"
          indicatorClassName={getProgressColor(member.performance)}
        />
      </div>
      
      <div className="flex-shrink-0 flex flex-col p-2 border-l border-gray-100 dark:border-slate-700/50">
        {member.phone && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={(e) => {
              e.stopPropagation()
              window.location.href = `tel:${member.phone}`
            }}
            aria-label={`Call ${member.name}`}
          >
            <Phone className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-1"
          onClick={handleStartChat}
          aria-label={`Message ${member.name}`}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center pr-4 pl-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          onClick={handleViewProfile}
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">View Profile</span>
        </Button>
      </div>
    </div>
  )
}

export default TeamMemberCard 