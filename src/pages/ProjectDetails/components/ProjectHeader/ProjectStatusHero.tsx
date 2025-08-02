/**
 * ProjectStatusHero Component
 * 
 * Displays the main project header with name, status, progress circle, and key metrics.
 * Extracted from ProjectDetailsContent.tsx to maintain the 400-line limit.
 * 
 * Features:
 * - Mobile-first responsive design with proper breakpoints
 * - BuildEase color scheme (blue #2B6CB0, orange #ED8936)
 * - Progress circle with animated completion percentage
 * - Clickable metric cards for section navigation
 * - Strong TypeScript typing
 */

import React, { useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared';
import { TouchOptimizedButton } from '@/components/ui/TouchOptimizedButton';
import { DollarSign, Clock, Users, MapPin, Edit3 } from 'lucide-react';
import type { Project, TeamMember } from '@/types/project';

interface ProjectStatusHeroProps {
  project: Project;
  activeTeamMembers: TeamMember[];
  toggleSection: (section: string) => void;
  onUpdateProject?: () => void;
}

// Cache number formatters to avoid recreation on every render
const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(currency: string): Intl.NumberFormat {
  if (!currencyFormatters.has(currency)) {
    currencyFormatters.set(currency, new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }));
  }
  return currencyFormatters.get(currency)!;
}

export const ProjectStatusHero = React.memo<ProjectStatusHeroProps>(function ProjectStatusHero({ 
  project, 
  activeTeamMembers, 
  toggleSection,
  onUpdateProject
}) {
  // Memoized date calculations for performance
  const daysRemaining = useMemo(() => {
    if (!project.endDate) return null;
    const end = new Date(project.endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [project.endDate]);

  // Memoized progress calculations
  const progressData = useMemo(() => {
    const progress = project.progress || 0;
    const circumference = 2 * Math.PI * 38; // radius = 38
    const strokeDasharray = `${(progress / 100) * circumference} ${circumference}`;
    
    const status = progress === 100 
      ? { label: 'Complete', class: 'bg-green-100 text-green-700' }
      : progress > 50 
        ? { label: 'In Progress', class: 'bg-blue-100 text-blue-700' }
        : { label: 'Getting Started', class: 'bg-orange-100 text-orange-700' };
    
    return { progress, strokeDasharray, status };
  }, [project.progress]);

  // Memoize timeline display text
  const timelineDisplay = useMemo(() => {
    if (daysRemaining === null) return '---';
    if (daysRemaining === 0) return 'Due Today';
    if (daysRemaining === 1) return '1 Day';
    if (daysRemaining <= 7) return `${daysRemaining} Days`;
    if (daysRemaining <= 30) return `${Math.ceil(daysRemaining / 7)} Weeks`;
    return `${Math.ceil(daysRemaining / 30)} Months`;
  }, [daysRemaining]);

  // Memoize timeline label
  const timelineLabel = useMemo(() => {
    if (daysRemaining === null) return 'Timeline';
    if (daysRemaining === 0) return 'Due Today';
    return 'Remaining';
  }, [daysRemaining]);

  // Memoize budget display with cached formatter
  const budgetDisplay = useMemo(() => {
    const budget = project.budget || 0;
    if (budget === 0) return 'Not Set';
    
    const currency = project.currency || 'USD';
    
    // For amounts >= 1M, show in millions
    if (budget >= 1000000) {
      const millions = budget / 1000000;
      return `${currency} ${millions.toFixed(millions % 1 === 0 ? 0 : 1)}M`;
    }
    
    // For amounts >= 1K, show in thousands
    if (budget >= 1000) {
      const thousands = budget / 1000;
      return `${currency} ${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}K`;
    }
    
    // For smaller amounts, use cached formatter
    return getCurrencyFormatter(currency).format(budget);
  }, [project.budget, project.currency]);

  // Memoize team member count and label
  const teamInfo = useMemo(() => ({
    count: activeTeamMembers.length,
    label: activeTeamMembers.length === 1 ? 'Team Member' : 'Team Members'
  }), [activeTeamMembers.length]);

  // Use useCallback to prevent unnecessary re-renders
  const handleUpdateProject = useCallback(() => {
    if (onUpdateProject) {
      onUpdateProject();
    } else {
      // Default behavior - navigate to edit page
      window.location.href = `/project/${project.id}/edit`;
    }
  }, [onUpdateProject, project.id]);

  // Memoize toggle section handlers to prevent re-renders
  const handleToggleBudget = useCallback(() => toggleSection('budget'), [toggleSection]);
  const handleTogglePhases = useCallback(() => toggleSection('phases'), [toggleSection]);
  const handleToggleTeam = useCallback(() => toggleSection('team'), [toggleSection]);

  return (
    <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-buildease-blue-50/30 to-buildease-orange-50/20 backdrop-blur-md rounded-2xl overflow-hidden
                     hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-orange-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Simplified Header Section - Only Project Name and Update Button */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">🏗️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
            </div>
          </div>
          
          <TouchOptimizedButton
            touchSize="md"
            onClick={handleUpdateProject}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 
                      hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 
                      hover:scale-105 font-semibold"
          >
            <Edit3 className="mr-2 h-5 w-5" />
            <span className="hidden sm:inline">Update Project</span>
            <span className="sm:hidden">Update</span>
          </TouchOptimizedButton>
        </div>
      </div>
      
      <CardContent className="p-6 bg-gradient-to-br from-white via-blue-50/20 to-orange-50/10">
        {/* Project Details Section - Moved from Header */}
        <div className="mb-6 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <StatusBadge status={project.status} size="sm" />
            {project.location && (
              <div className="flex items-center text-slate-600 text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                {project.location}
              </div>
            )}
          </div>
          
          {/* Project Description */}
          {project.description && (
            <p className="text-slate-700 text-sm leading-relaxed">{project.description}</p>
          )}
        </div>
        
        <div className="flex items-start gap-6">
          <div className="flex-1">
          
            {/* Enhanced Key Metrics with Detail Access */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {/* Budget Metric - Enhanced */}
              <button 
                onClick={handleToggleBudget}
                className="relative overflow-hidden text-center p-4 bg-gradient-to-br from-buildease-blue-50/80 via-buildease-blue-50/60 to-buildease-blue-100/40 
                          rounded-2xl hover:from-buildease-blue-100/90 hover:via-buildease-blue-100/70 hover:to-buildease-blue-200/50 
                          transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-blue-500/20 
                          border border-buildease-blue-100/50 hover:border-buildease-blue-200/70 hover:-translate-y-0.5"
              >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="w-10 h-10 mx-auto mb-2 bg-buildease-blue-500/10 rounded-xl flex items-center justify-center 
                                group-hover:bg-buildease-blue-500/20 transition-colors duration-300 group-hover:scale-110">
                    <DollarSign className="h-5 w-5 text-buildease-blue-600 group-hover:text-buildease-blue-700 transition-colors duration-300" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 mb-1 group-hover:text-slate-800 transition-colors">
                    {budgetDisplay}
                  </div>
                  <div className="text-xs text-slate-600 font-medium group-hover:text-slate-700 transition-colors">
                    Total Budget
                  </div>
                </div>
              </button>
              
              {/* Timeline Metric - Enhanced */}
              <button 
                onClick={handleTogglePhases}
                className="relative overflow-hidden text-center p-4 bg-gradient-to-br from-buildease-orange-50/80 via-buildease-orange-50/60 to-buildease-orange-100/40 
                          rounded-2xl hover:from-buildease-orange-100/90 hover:via-buildease-orange-100/70 hover:to-buildease-orange-200/50 
                          transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-orange-500/20 
                          border border-buildease-orange-100/50 hover:border-buildease-orange-200/70 hover:-translate-y-0.5"
              >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="w-10 h-10 mx-auto mb-2 bg-buildease-orange-500/10 rounded-xl flex items-center justify-center 
                                group-hover:bg-buildease-orange-500/20 transition-colors duration-300 group-hover:scale-110">
                    <Clock className="h-5 w-5 text-buildease-orange-600 group-hover:text-buildease-orange-700 transition-colors duration-300" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 mb-1 group-hover:text-slate-800 transition-colors">
                    {timelineDisplay}
                  </div>
                  <div className="text-xs text-slate-600 font-medium group-hover:text-slate-700 transition-colors">
                    {timelineLabel}
                  </div>
                </div>
              </button>
              
              {/* Team Metric - Enhanced */}
              <button 
                onClick={handleToggleTeam}
                className="relative overflow-hidden text-center p-4 bg-gradient-to-br from-emerald-50/80 via-emerald-50/60 to-emerald-100/40 
                          rounded-2xl hover:from-emerald-100/90 hover:via-emerald-100/70 hover:to-emerald-200/50 
                          transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-emerald-500/20 
                          border border-emerald-100/50 hover:border-emerald-200/70 hover:-translate-y-0.5"
              >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="w-10 h-10 mx-auto mb-2 bg-emerald-500/10 rounded-xl flex items-center justify-center 
                                group-hover:bg-emerald-500/20 transition-colors duration-300 group-hover:scale-110">
                    <Users className="h-5 w-5 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 mb-1 group-hover:text-slate-800 transition-colors">
                    {teamInfo.count}
                  </div>
                  <div className="text-xs text-slate-600 font-medium group-hover:text-slate-700 transition-colors">
                    {teamInfo.label}
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          {/* Enhanced Progress Circle with Improved Design */}
          <div className="flex-shrink-0 text-center">
            <div className="relative w-28 h-28 mx-auto mb-4">
              {/* Background circle with subtle glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full shadow-inner"></div>
              
              {/* Progress SVG */}
              <svg className="w-28 h-28 transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                {/* Background track */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  stroke="#f1f5f9" 
                  strokeWidth="4" 
                  fill="none" 
                  className="drop-shadow-sm"
                />
                {/* Progress circle with enhanced gradient */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  stroke="url(#enhancedProgressGradient)" 
                  strokeWidth="4" 
                  fill="none"
                  strokeDasharray={progressData.strokeDasharray}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out drop-shadow-md"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(43, 108, 176, 0.2))'
                  }}
                />
                <defs>
                  <linearGradient id="enhancedProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="30%" stopColor="#2B6CB0" />
                    <stop offset="70%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#ED8936" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center content with enhanced styling */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold bg-gradient-to-br from-buildease-blue-600 via-buildease-blue-700 to-buildease-orange-600 bg-clip-text text-transparent drop-shadow-sm">
                  {progressData.progress}%
                </span>
                {/* Progress status indicator */}
                <div className="w-2 h-2 rounded-full mt-1 bg-gradient-to-r from-buildease-blue-500 to-buildease-orange-500 opacity-60"></div>
              </div>
              
              {/* Subtle pulse animation for active projects */}
              {progressData.progress > 0 && progressData.progress < 100 && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-buildease-blue-500/10 to-buildease-orange-500/10 animate-pulse"></div>
              )}
            </div>
            
            {/* Enhanced label with status-based styling */}
            <div className="space-y-1">
              <div className="text-sm text-slate-700 font-semibold">Project Progress</div>
              <div className={`text-xs px-2 py-1 rounded-full inline-block font-medium ${progressData.status.class}`}>
                {progressData.status.label}
              </div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
});