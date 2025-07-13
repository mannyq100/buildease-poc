import * as React from "react";
import { cn } from "@/utils/core/ui";
import type { Project } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DollarSign, Users, MapPin, Clock } from "lucide-react";

export interface ProjectStatusHeroProps {
  project: Project;
  progress: number;
  healthStatus?: "healthy" | "warning" | "critical";
  className?: string;
}

/**
 * ProjectStatusHero - Hero section showing critical project metrics
 * Features large progress circle, key metrics, and health status indicator
 */
const ProjectStatusHero = React.forwardRef<
  HTMLDivElement,
  ProjectStatusHeroProps
>(({ className, project, progress, ...props }, ref) => {

  // Calculate days left
  const daysLeft = React.useMemo(() => {
    if (!project.endDate) return null;
    const end = new Date(project.endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [project.endDate]);

  return (
      <Card 
        ref={ref} 
        className={cn('overflow-hidden border border-slate-200/60 dark:border-slate-800/60 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white via-buildease-blue-50/20 to-buildease-orange-50/10 dark:from-gray-900 dark:via-buildease-blue-950/20 dark:to-buildease-orange-950/10 backdrop-blur-sm rounded-xl relative', className)}
        {...props}
      >
        
        {/* Status and location badges - positioned at top right */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
          <StatusBadge 
            status={project.status} 
            variant="default"
            size="sm"
            className="shadow-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
          />
          {project.location && (
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-slate-200/50 dark:border-slate-700/50">
              <MapPin className="h-3 w-3 mr-1.5 text-buildease-orange-500" />
              <span className="font-medium">{project.location}</span>
            </div>
          )}
        </div>

        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 pr-20">
              {/* Project name and description */}
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                {project.name}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                {project.description}
              </p>
            </div>
            
            {/* Project image */}
            {project.imageUrl && (
              <div className="ml-4 flex-shrink-0">
                <div className="relative">
                  <img 
                    src={project.imageUrl} 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shadow-md"
                    alt={project.name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-transparent to-white/10" />
                </div>
              </div>
            )}
          </div>
          
          {/* Progress section */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Overall Progress
              </span>
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-buildease-blue-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Key metrics grid */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center group">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl bg-buildease-blue-50 dark:bg-buildease-blue-900/20 hover:bg-buildease-blue-100 dark:hover:bg-buildease-blue-800/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg border border-buildease-blue-200/30 dark:border-buildease-blue-700/30">
                <DollarSign className="h-5 w-5 text-buildease-blue-600 dark:text-buildease-blue-400 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white mb-1 transition-colors duration-200">
                ${Math.round(project.budget / 1000)}K
              </div>
              <div className="text-xs text-buildease-blue-600 dark:text-buildease-blue-400 font-semibold">Budget</div>
            </div>
            
            <div className="text-center group">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl bg-buildease-orange-50 dark:bg-buildease-orange-900/20 hover:bg-buildease-orange-100 dark:hover:bg-buildease-orange-800/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg border border-buildease-orange-200/30 dark:border-buildease-orange-700/30">
                <Clock className="h-5 w-5 text-buildease-orange-600 dark:text-buildease-orange-400 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white mb-1 transition-colors duration-200">
                {daysLeft !== null ? daysLeft : '---'}
              </div>
              <div className="text-xs text-buildease-orange-600 dark:text-buildease-orange-400 font-semibold">Days Left</div>
            </div>
            
            <div className="text-center group">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-800/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg border border-emerald-200/30 dark:border-emerald-700/30">
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white mb-1 transition-colors duration-200">
                {project.teamMembers?.length || 0}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Team</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
});

ProjectStatusHero.displayName = "ProjectStatusHero";

export { ProjectStatusHero };
