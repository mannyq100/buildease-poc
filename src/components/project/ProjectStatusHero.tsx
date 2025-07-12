import * as React from "react";
import { cn } from "@/utils/core/ui";
import type { Project } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, Users, MapPin } from "lucide-react";

export interface ProjectStatusHeroProps {
  project: Project;
  progress: number;
  healthStatus: "healthy" | "warning" | "critical";
  variant?: "compact" | "expanded";
  className?: string;
}

/**
 * ProjectStatusHero - Hero section showing critical project metrics
 * Features large progress circle, key metrics, and health status indicator
 */
const ProjectStatusHero = React.forwardRef<
  HTMLDivElement,
  ProjectStatusHeroProps
>(({ className, project, progress, healthStatus, variant = "expanded", ...props }, ref) => {
  const healthColors = {
    healthy: 'bg-status-completed/10 text-status-completed border border-status-completed/20',
    warning: 'bg-status-in-progress/10 text-status-in-progress border border-status-in-progress/20',
    critical: 'bg-destructive/10 text-destructive border border-destructive/20'
  };

  const progressColor = progress >= 75 ? 'success' : progress >= 50 ? 'primary' : 'warning';

  if (variant === 'compact') {
    return (
      <Card 
        ref={ref} 
        className={cn('border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg', className)}
        {...props}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge 
                  status={project.status} 
                  variant="outline"
                  size="sm"
                />
                <Badge className={cn('text-xs', healthColors[healthStatus])}>
                  {healthStatus}
                </Badge>
              </div>
              <h1 className="text-lg sm:text-xl font-bold mb-1 bg-gradient-to-r from-buildease-blue-900 via-buildease-blue-800 to-buildease-blue-900 dark:from-buildease-blue-100 dark:via-white dark:to-buildease-blue-100 bg-clip-text text-transparent">{project.name}</h1>
              <p className="text-buildease-blue-600 dark:text-buildease-blue-300 text-xs sm:text-sm mb-3 line-clamp-2">{project.description}</p>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="text-center group">
                  <div className="relative">
                    <div className="text-sm sm:text-base font-bold bg-gradient-to-r from-buildease-blue-600 to-buildease-blue-700 dark:from-buildease-blue-400 dark:to-buildease-blue-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{progress}%</div>
                  </div>
                  <div className="text-xs text-buildease-blue-600 dark:text-buildease-blue-300 font-medium">Complete</div>
                </div>
                <div className="text-center group">
                  <div className="relative">
                    <div className="text-sm sm:text-base font-bold bg-gradient-to-r from-buildease-orange-600 to-buildease-orange-700 dark:from-buildease-orange-400 dark:to-buildease-orange-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">${project.budget?.allocated ? Math.round(project.budget.allocated / 1000) + 'K' : 'N/A'}</div>
                  </div>
                  <div className="text-xs text-buildease-orange-600 dark:text-buildease-orange-300 font-medium">Budget</div>
                </div>
                <div className="text-center group">
                  <div className="relative">
                    <div className="text-sm sm:text-base font-bold bg-gradient-to-r from-buildease-earth-600 to-buildease-earth-700 dark:from-buildease-earth-400 dark:to-buildease-earth-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                      {project.timeline?.planned_start && project.timeline?.planned_end ? 
                        Math.ceil((new Date(project.timeline.planned_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : '---'
                      }
                    </div>
                  </div>
                  <div className="text-xs text-buildease-earth-600 dark:text-buildease-earth-300 font-medium">Days Left</div>
                </div>
              </div>
            </div>
            
            {project.profile_image && (
              <div className="ml-3 sm:ml-4">
                <img 
                  src={project.profile_image} 
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover shadow-lg"
                  alt={project.name}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Expanded variant
  return (
    <Card 
      ref={ref} 
      className={cn('border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg', className)}
      {...props}
    >
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <StatusBadge 
                status={project.status} 
                variant="outline"
              />
              <Badge className={cn('text-xs', healthColors[healthStatus])}>
                {healthStatus}
              </Badge>
              {project.details?.location?.district && (
                <div className="flex items-center text-buildease-blue-600 dark:text-buildease-blue-400 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {project.details.location.district}{project.details.location.region && `, ${project.details.location.region}`}
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold text-buildease-blue-900 dark:text-buildease-blue-100 mb-2">{project.name}</h1>
            <p className="text-buildease-blue-700 dark:text-buildease-blue-300 text-lg mb-6">{project.description}</p>
          </div>
          
          {project.profile_image && (
            <div className="ml-6">
              <img 
                src={project.profile_image} 
                className="w-24 h-24 rounded-xl object-cover shadow-lg"
                alt={project.name}
              />
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="flex items-center gap-8 mb-6">
          <div className="flex-shrink-0">
            <div className="relative">
              <ProgressBar 
                value={progress} 
                variant="circular" 
                color={progressColor}
                showLabel
                className="w-24 h-24"
              />
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 mr-1 text-buildease-blue-600 dark:text-buildease-blue-400" />
              </div>
              <div className="text-2xl font-bold">${project.budget?.allocated?.toLocaleString() ?? 'N/A'}</div>
              <div className="text-sm text-buildease-blue-700 dark:text-buildease-blue-300">Budget</div>
              <div className="text-xs text-buildease-blue-600 dark:text-buildease-blue-400 mt-1">
                ${project.budget?.spent?.toLocaleString() ?? '0'} spent
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CalendarDays className="h-5 w-5 mr-1 text-buildease-orange-600 dark:text-buildease-orange-400" />
              </div>
              <div className="text-2xl font-bold">
                {project.timeline?.planned_start && project.timeline?.planned_end ? 
                  Math.ceil((new Date(project.timeline.planned_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : '---'
                }
              </div>
              <div className="text-sm text-buildease-orange-700 dark:text-buildease-orange-300">Days Left</div>
              <div className="text-xs text-buildease-orange-600 dark:text-buildease-orange-400 mt-1">
                {project.timeline?.planned_end ? new Date(project.timeline.planned_end).toLocaleDateString() : 'TBD'}
              </div>
            </div>
            
            <div className="text-center md:block hidden">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 mr-1 text-buildease-earth-600 dark:text-buildease-earth-400" />
              </div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-buildease-earth-700 dark:text-buildease-earth-300">Team Members</div>
              <div className="text-xs text-buildease-earth-600 dark:text-buildease-earth-400 mt-1">
                3 contractors
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProjectStatusHero.displayName = "ProjectStatusHero";

export { ProjectStatusHero };
