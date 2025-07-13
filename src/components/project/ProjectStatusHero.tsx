import * as React from "react";
import { cn } from "@/utils/core/ui";
import type { Project } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, Users, MapPin, Clock, Target } from "lucide-react";

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
    healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    critical: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
  };

  const progressColor = 'primary'; // Simplified to single color

  // Calculate days left
  const daysLeft = React.useMemo(() => {
    if (!project.endDate) return null;
    const end = new Date(project.endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [project.endDate]);

  if (variant === 'compact') {
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
  }

  // Expanded variant
  return (
    <Card 
      ref={ref} 
      className={cn('overflow-hidden border shadow-lg hover:shadow-xl transition-all duration-300', className)}
      {...props}
    >
      {/* Decorative top bar */}
      <div className="h-1 bg-gradient-to-r from-slate-800 to-slate-600" />
      
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1 min-w-0">
            {/* Header with status */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <StatusBadge 
                status={project.status} 
                variant="outline"
                size="md"
              />
              <Badge className={cn('text-sm font-medium px-3 py-1', healthColors[healthStatus])}>
                {healthStatus}
              </Badge>
              {project.location && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-1" />
                  {project.location}
                </div>
              )}
            </div>
            
            {/* Project name and description */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
              {project.name}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6 max-w-2xl">
              {project.description}
            </p>
          </div>
          
          {/* Project image */}
          {project.imageUrl && (
            <div className="ml-8 flex-shrink-0">
              <div className="relative">
                <img 
                  src={project.imageUrl} 
                  className="w-32 h-32 rounded-2xl object-cover shadow-xl"
                  alt={project.name}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-transparent to-white/10" />
              </div>
            </div>
          )}
        </div>

        {/* Main metrics section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
          {/* Large progress circle */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center shadow-inner">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {progress}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Complete
                  </div>
                </div>
              </div>
              <div className="absolute inset-0">
                <ProgressBar 
                  value={progress} 
                  variant="circular" 
                  color={progressColor}
                  className="w-32 h-32"
                />
              </div>
            </div>
          </div>
          
          {/* Key metrics grid */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Budget */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-700 dark:bg-slate-300 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white dark:text-slate-900" />
                </div>
                <div className="ml-3">
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Budget
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                ${project.budget.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                ${project.spent?.toLocaleString() || '0'} spent
              </div>
            </div>
            
            {/* Timeline */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-700 dark:bg-slate-300 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-white dark:text-slate-900" />
                </div>
                <div className="ml-3">
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Timeline
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {daysLeft !== null ? `${daysLeft} days` : 'TBD'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {project.endDate ? `Due ${new Date(project.endDate).toLocaleDateString()}` : 'No deadline set'}
              </div>
            </div>
            
            {/* Team */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    Team
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {project.teamMembers?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Active members
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional project details */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-1" />
              Project Type: {project.type}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Client: {project.client}
            </div>
            {project.tags && project.tags.length > 0 && (
              <div className="flex items-center gap-2">
                {project.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProjectStatusHero.displayName = "ProjectStatusHero";

export { ProjectStatusHero };
