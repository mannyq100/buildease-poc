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
  variant?: "default" | "compact";
  className?: string;
}

/**
 * ProjectStatusHero - Hero section showing critical project metrics
 * Features large progress circle, key metrics, and health status indicator
 */
const ProjectStatusHero = React.forwardRef<
  HTMLDivElement,
  ProjectStatusHeroProps
>(({ className, project, progress, healthStatus, variant, ...props }, ref) => {

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
        className={cn('overflow-hidden border border-slate-200/40 dark:border-slate-700/40 shadow-xl hover:shadow-2xl transition-all duration-700 bg-gradient-to-br from-white via-buildease-blue-50/30 to-buildease-orange-50/20 dark:from-gray-900 dark:via-buildease-blue-950/30 dark:to-buildease-orange-950/20 backdrop-blur-md rounded-2xl relative group', className)}
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

        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              {/* Project name and description */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
                {project.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed max-w-2xl">
                {project.description}
              </p>
            </div>
            
            {/* Project image */}
            {project.imageUrl && (
              <div className="flex-shrink-0">
                <div className="relative group">
                  <img 
                    src={project.imageUrl} 
                    className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl object-cover shadow-lg group-hover:shadow-xl transition-all duration-300 ring-2 ring-white/50 dark:ring-slate-700/50"
                    alt={project.name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-transparent to-white/20 group-hover:to-white/30 transition-all duration-300" />
                </div>
              </div>
            )}
          </div>
          
          {/* Enhanced Progress section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                Overall Progress
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  {progress}%
                </span>
                <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-200/50 dark:border-emerald-700/50">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {progress >= 75 ? 'Excellent' : progress >= 50 ? 'Good' : progress >= 25 ? 'Fair' : 'Starting'}
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 shadow-inner">
                <div 
                  className="h-3 bg-gradient-to-r from-buildease-blue-500 via-buildease-blue-400 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-sm relative overflow-hidden"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
              {/* Progress milestones */}
              <div className="flex justify-between mt-2 px-1">
                {[25, 50, 75, 100].map((milestone) => (
                  <div key={milestone} className="flex flex-col items-center">
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      progress >= milestone 
                        ? "bg-emerald-500 shadow-lg" 
                        : "bg-slate-300 dark:bg-slate-600"
                    )} />
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{milestone}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Enhanced Key metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center group cursor-pointer">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-buildease-blue-50 to-buildease-blue-100 dark:from-buildease-blue-900/20 dark:to-buildease-blue-800/30 hover:from-buildease-blue-100 hover:to-buildease-blue-200 dark:hover:from-buildease-blue-800/30 dark:hover:to-buildease-blue-700/40 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl border border-buildease-blue-200/50 dark:border-buildease-blue-700/50 group-hover:border-buildease-blue-300 dark:group-hover:border-buildease-blue-600">
                <DollarSign className="h-7 w-7 text-buildease-blue-600 dark:text-buildease-blue-400 transition-all duration-300 group-hover:scale-110 group-hover:text-buildease-blue-700 dark:group-hover:text-buildease-blue-300" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-200 group-hover:text-buildease-blue-700 dark:group-hover:text-buildease-blue-300">
                ${Math.round(project.budget / 1000)}K
              </div>
              <div className="text-sm text-buildease-blue-600 dark:text-buildease-blue-400 font-semibold">Total Budget</div>
            </div>
            
            <div className="text-center group cursor-pointer">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-buildease-orange-50 to-buildease-orange-100 dark:from-buildease-orange-900/20 dark:to-buildease-orange-800/30 hover:from-buildease-orange-100 hover:to-buildease-orange-200 dark:hover:from-buildease-orange-800/30 dark:hover:to-buildease-orange-700/40 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl border border-buildease-orange-200/50 dark:border-buildease-orange-700/50 group-hover:border-buildease-orange-300 dark:group-hover:border-buildease-orange-600">
                <Clock className="h-7 w-7 text-buildease-orange-600 dark:text-buildease-orange-400 transition-all duration-300 group-hover:scale-110 group-hover:text-buildease-orange-700 dark:group-hover:text-buildease-orange-300" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-200 group-hover:text-buildease-orange-700 dark:group-hover:text-buildease-orange-300">
                {daysLeft !== null ? daysLeft : '---'}
              </div>
              <div className="text-sm text-buildease-orange-600 dark:text-buildease-orange-400 font-semibold">
                {daysLeft !== null && daysLeft > 0 ? 'Days Remaining' : 'Timeline'}
              </div>
            </div>
            
            <div className="text-center group cursor-pointer">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/30 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-800/30 dark:hover:to-emerald-700/40 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl border border-emerald-200/50 dark:border-emerald-700/50 group-hover:border-emerald-300 dark:group-hover:border-emerald-600">
                <Users className="h-7 w-7 text-emerald-600 dark:text-emerald-400 transition-all duration-300 group-hover:scale-110 group-hover:text-emerald-700 dark:group-hover:text-emerald-300" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                {project.teamMembers?.length || 0}
              </div>
              <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                {(project.teamMembers?.length || 0) === 1 ? 'Team Member' : 'Team Members'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
});

ProjectStatusHero.displayName = "ProjectStatusHero";

export { ProjectStatusHero };
