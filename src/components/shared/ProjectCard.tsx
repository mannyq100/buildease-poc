// React import removed as it's not needed in React 17+
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { SmartProjectImageDisplay } from '@/components/ui/SmartProjectImageDisplay';
import { cn } from '@/utils/core/ui';

export interface TeamMember {
  id: string | number;
  name: string;
  avatar?: string;
  role?: string;
}

export interface ProjectCardProps {
  /** Project details */
  title: string;
  description?: string;
  client: string;
  owner?: string; // Project owner name
  status: 'active' | 'completed' | 'pending' | 'delayed';
  progress?: number;
  imageUrl?: string;
  budget?: {
    total: number;
    spent: number;
    currency?: string;
  };
  startDate?: string;
  endDate?: string;
  team?: TeamMember[];
  documents?: number;
  phases?: number;
  
  /** Additional styling and behavior */
  className?: string;
  onClick?: () => void;
  animate?: boolean; // Currently unused but kept for future animation features
}

/**
 * ProjectCard component for displaying project information.
 * Follows Buildese UI design principles:
 * - Card-based UI with subtle shadows for depth
 * - Clear visual feedback for interactions
 * - Consistent spacing system
 * - Modern, aesthetic look with warm blue accents
 * - Progressive disclosure for complex tasks
 */
export function ProjectCard({
  title,
  client,
  owner,
  status,
  progress = 0,
  imageUrl,
  startDate,
  endDate,
  team = [],
  className,
  onClick,
  animate = true
}: ProjectCardProps) {
  const statusConfig = {
    active: {
      bg: 'bg-gradient-to-r from-buildease-blue-500 to-buildease-blue-600',
      text: 'text-white',
      indicator: 'bg-white',
      shadow: 'shadow-buildease-blue-500/25'
    },
    completed: {
      bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      text: 'text-white',
      indicator: 'bg-white',
      shadow: 'shadow-emerald-500/25'
    },
    pending: {
      bg: 'bg-gradient-to-r from-buildease-orange-500 to-buildease-orange-600',
      text: 'text-white',
      indicator: 'bg-white',
      shadow: 'shadow-buildease-orange-500/25'
    },
    delayed: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      text: 'text-white',
      indicator: 'bg-white',
      shadow: 'shadow-red-500/25'
    }
  };

  return (
    <Card 
      className={cn(
        'group overflow-hidden transition-all duration-300 h-full flex flex-col cursor-pointer',
        'bg-gradient-to-br from-white to-buildease-blue-50/30',
        'hover:shadow-2xl hover:shadow-buildease-blue-500/20 hover:border-buildease-blue-300/50',
        'hover:-translate-y-1 hover:scale-[1.02] transform-gpu',
        'border border-buildease-blue-200/40 dark:border-slate-700/60',
        'shadow-xl shadow-buildease-blue-900/10',
        'dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-700/30',
        className
      )}
      onClick={onClick}
    >
      {/* Enhanced Project Image */}
      <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
        <SmartProjectImageDisplay
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
          aspectRatio="auto"
        />
        
        {/* Enhanced Status Badge Overlay */}
        <Badge 
          className={cn(
            'absolute top-4 right-4 px-3 py-1.5 text-xs font-semibold',
            'shadow-lg backdrop-blur-sm border-0',
            'transition-all duration-300 group-hover:scale-105',
            statusConfig[status].bg,
            statusConfig[status].text,
            statusConfig[status].shadow
          )}
        >
          <div className={cn('w-2 h-2 rounded-full mr-2 animate-pulse', statusConfig[status].indicator)} />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        
        {/* Gradient Overlay for Better Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-5 flex flex-col flex-grow bg-gradient-to-b from-white/50 to-white/80 dark:from-slate-800/50 dark:to-slate-800/80">
        {/* Enhanced Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 mb-2 group-hover:text-buildease-blue-700 dark:group-hover:text-buildease-blue-400 transition-colors duration-300">{title}</h3>
        
        {/* Enhanced Client and Owner */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-buildease-blue-700 dark:text-slate-400">
            <Building2 className="h-4 w-4 mr-2 flex-shrink-0 text-buildease-orange-600 dark:text-buildease-orange-400" />
            <span className="line-clamp-1 font-medium">{client}</span>
          </div>
          {owner && (
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
              <Users className="h-3 w-3 mr-2 flex-shrink-0 text-green-600 dark:text-green-400" />
              <span className="line-clamp-1 font-medium">Owner: {owner}</span>
            </div>
          )}
        </div>
        
        {/* Enhanced Progress Section */}
        <div className="mt-auto space-y-3">
          {/* Timeline */}
          {startDate && endDate && (
            <div className="flex items-center text-xs text-buildease-blue-700 dark:text-slate-400 bg-buildease-blue-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
              <Calendar className="h-3 w-3 mr-2 flex-shrink-0 text-buildease-orange-500" />
              <span className="truncate font-medium">{startDate} - {endDate}</span>
            </div>
          )}
          
          {/* Enhanced Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Progress</span>
              <span className="font-bold text-slate-900 dark:text-white">{progress}%</span>
            </div>
            <div className="relative">
              <Progress 
                value={progress} 
                className="h-2 bg-buildease-blue-100 dark:bg-slate-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-buildease-blue-500/20 to-buildease-orange-500/20 rounded-full" />
            </div>
          </div>
          
          {/* Enhanced Team Count */}
          {team.length > 0 && (
            <div className="flex items-center justify-between text-xs pt-2 border-t border-buildease-blue-200/50 dark:border-slate-600/50">
              <div className="flex items-center text-buildease-blue-600 dark:text-slate-400">
                <Users className="h-3 w-3 mr-1.5 text-buildease-orange-600 dark:text-buildease-orange-400" />
                <span className="font-medium">{team.length} member{team.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex -space-x-1">
                {team.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-buildease-blue-400 to-buildease-blue-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-white"
                    title={member.name}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {team.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-buildease-orange-400 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-white">
                    +{team.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
