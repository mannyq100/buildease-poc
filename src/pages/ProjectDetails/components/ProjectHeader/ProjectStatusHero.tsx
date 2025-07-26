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

import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared';
import { TouchOptimizedButton } from '@/components/ui/TouchOptimizedButton';
import { DollarSign, Clock, Users, MapPin, Eye, Edit3 } from 'lucide-react';
import type { Project, TeamMember } from '@/types/project';

interface ProjectStatusHeroProps {
  project: Project;
  activeTeamMembers: TeamMember[];
  toggleSection: (section: string) => void;
  onUpdateProject?: () => void;
}

export function ProjectStatusHero({ 
  project, 
  activeTeamMembers, 
  toggleSection,
  onUpdateProject
}: ProjectStatusHeroProps) {
  // Calculate days remaining for timeline
  const daysRemaining = project.end_date 
    ? Math.max(0, Math.ceil((new Date(project.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  // Format budget display (convert to K format) using the transformed project data
  const budgetDisplayValue = Math.round((project.budget || 0) / 1000);
  
  // Format currency display using user's specified currency
  const formatBudgetWithCurrency = (amount: number) => {
    const currency = project.currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount * 1000); // Convert back from K format
  };

  const handleUpdateProject = () => {
    if (onUpdateProject) {
      onUpdateProject();
    } else {
      // Default behavior - navigate to edit page
      window.location.href = `/project/${project.id}/edit`;
    }
  };

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
          
            {/* Key Metrics with Detail Access */}
            <div className="grid grid-cols-3 gap-4">
              {/* Budget Metric */}
              <button 
                onClick={() => toggleSection('budget')}
                className="text-center p-3 bg-buildease-blue-50/50 rounded-xl hover:bg-buildease-blue-100/50 transition-colors group"
              >
                <DollarSign className="h-5 w-5 text-buildease-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-lg font-bold text-slate-900">
                  {formatBudgetWithCurrency(budgetDisplayValue).replace(/\d+/, `${budgetDisplayValue}K`)}
                </div>
                <div className="text-xs text-slate-600 flex items-center justify-center gap-1">
                  Budget <Eye className="h-3 w-3" />
                </div>
              </button>
              
              {/* Timeline Metric */}
              <button 
                onClick={() => toggleSection('phases')}
                className="text-center p-3 bg-buildease-orange-50/50 rounded-xl hover:bg-buildease-orange-100/50 transition-colors group"
              >
                <Clock className="h-5 w-5 text-buildease-orange-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-lg font-bold text-slate-900">
                  {daysRemaining !== null ? daysRemaining : '---'}
                </div>
                <div className="text-xs text-slate-600 flex items-center justify-center gap-1">
                  Timeline <Eye className="h-3 w-3" />
                </div>
              </button>
              
              {/* Team Metric */}
              <button 
                onClick={() => toggleSection('team')}
                className="text-center p-3 bg-emerald-50/50 rounded-xl hover:bg-emerald-100/50 transition-colors group"
              >
                <Users className="h-5 w-5 text-emerald-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-lg font-bold text-slate-900">
                  {activeTeamMembers.length}
                </div>
                <div className="text-xs text-slate-600 flex items-center justify-center gap-1">
                  Team <Eye className="h-3 w-3" />
                </div>
              </button>
            </div>
          </div>
          
          {/* Enhanced Progress Circle */}
          <div className="flex-shrink-0 text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="#e5e7eb" 
                  strokeWidth="6" 
                  fill="none" 
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="url(#progressGradient)" 
                  strokeWidth="6" 
                  fill="none"
                  strokeDasharray={`${(project.progress || 0) * 2.51} 251`}
                  className="transition-all duration-700 drop-shadow-sm"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2B6CB0" />
                    <stop offset="100%" stopColor="#ED8936" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold bg-gradient-to-r from-buildease-blue-600 to-buildease-orange-600 bg-clip-text text-transparent">
                  {project.progress || 0}%
                </span>
              </div>
            </div>
            <div className="text-sm text-slate-600 font-semibold">Project Complete</div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}