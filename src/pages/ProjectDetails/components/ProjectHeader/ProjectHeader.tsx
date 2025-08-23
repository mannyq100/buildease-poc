/**
 * ProjectHeader Component
 * 
 * A clean, professional project header optimized for construction management.
 * Focuses on essential information with clear visual hierarchy and intuitive actions.
 */

import React, { useMemo, useCallback } from 'react';
import { formatCurrency } from '@/utils/core/format';
import { StatusBadge } from '@/components/shared';
import { TouchOptimizedButton } from '@/components/ui/TouchOptimizedButton';
import { 
  DollarSign, Clock, Users, MapPin, Edit3, Upload,
  TrendingUp, AlertCircle, CheckCircle, FileText, Package
} from 'lucide-react';
import type { Project, ProjectStatus, TeamMember } from '@/types/project';
import type { ProjectPhase } from '@/types/projectDetails';
import { useProjectData } from '@/hooks/queries/useProjectData';
import { ProCard } from '@/components/ui/ProCard';

export interface ProjectHeaderProps {
  project: Project;
  phases?: ProjectPhase[];
  activeTeamMembers?: TeamMember[];
  onOpenCreateBudget?: () => void;
  onOpenCreatePhase?: () => void;
  onAddTeamMember?: () => void;
  onNavigateToDocuments?: () => void;
  onScrollToSection?: (section: string) => void;
  onUpdateProject?: () => void;
}

// Utility functions

const formatTimeRemaining = (daysRemaining: number | null) => {
  if (daysRemaining === null) return 'No deadline';
  if (daysRemaining <= 0) return 'Overdue';
  if (daysRemaining === 1) return '1 day left';
  if (daysRemaining <= 7) return `${daysRemaining} days`;
  if (daysRemaining <= 30) return `${Math.ceil(daysRemaining / 7)} weeks`;
  return `${Math.ceil(daysRemaining / 30)} months`;
};

const getProgressColor = (progress: number) => {
  if (progress >= 90) return 'text-green-600';
  if (progress >= 70) return 'text-blue-600';
  if (progress >= 40) return 'text-orange-600';
  return 'text-red-600';
};

const getHealthConfig = (health: string) => {
  const configs = {
    excellent: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    good: { icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    fair: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    poor: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' }
  };
  return configs[health as keyof typeof configs] || configs.good;
};



function ProjectHeader({
  project,
  phases: _phases = [],
  activeTeamMembers: _activeTeamMembers = [],
  onOpenCreateBudget,
  onOpenCreatePhase,
  onAddTeamMember,
  onNavigateToDocuments,
  onScrollToSection,
  onUpdateProject,
}: ProjectHeaderProps) {
  const { data: consolidated, error } = useProjectData(project.id);

  // Process data once with useMemo - optimized to use view data directly
  const metrics = useMemo(() => {
    const c = consolidated;

    // Use consolidated data directly with safe fallbacks
    const progress = c?.progress ?? project.progress ?? 0;
    const budget = c?.budget ?? project.budget ?? 0;
    const spent = c?.spent ?? 0;
    const currency = c?.currency ?? project.currency ?? 'USD';
    const remaining = c?.remainingBudget ?? Math.max(0, budget - spent);
    const spentPercentage = c?.utilization !== undefined
      ? Math.round(c.utilization)
      : (budget > 0 ? Math.round((spent / budget) * 100) : 0);

    // Timeline from transformed project data or fallback
    const endDate = c?.end_date || project.end_date;
    const daysRemaining = endDate ?
      Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

    // Server-side aggregates (no client-side counting)
    const phaseCount = c?.phaseCount ?? 0;
    const openTasks = c?.openTasks ?? 0;

    return {
      progress,
      budget,
      spent,
      remaining,
      spentPercentage,
      currency,
      daysRemaining,
      phaseCount,
      openTasks,
      materialCount: c?.materialCount ?? 0,
      health: c?.health ?? project.health ?? 'good',
      memberCount: c?.memberCount ?? 0,
      documentCount: c?.documentCount ?? 0,
      transactionCount: c?.transactionCount ?? 0,
      client: c?.client ?? project.client,
      location: c?.location ?? project.location,
      projectType: c?.project_type ?? project.project_type ?? 'Construction'
    };
  }, [consolidated, project]);

  // Action handlers
  const handleUpdateProject = useCallback(() => {
    if (onUpdateProject) {
      onUpdateProject();
    } else {
      const slugOrId = project.slug ?? project.id;
      window.location.href = `/project/${slugOrId}/edit`;
    }
  }, [onUpdateProject, project.id, project.slug]);

  const handleUploadDocument = useCallback(() => {
    if (onNavigateToDocuments) return onNavigateToDocuments();
    onScrollToSection?.('documents');
  }, [onNavigateToDocuments, onScrollToSection]);

  const healthConfig = getHealthConfig(metrics.health);
  const handleAnchor = useCallback((section: string) => () => onScrollToSection?.(section), [onScrollToSection]);

  // Show loading or error state if needed
  if (error) {
    console.warn('ProjectHeader: Failed to load consolidated data, using fallback data:', error);
  }


  return (
    <ProCard accent="blue" className="overflow-hidden">
      {/* Header Section - Light BuildEase Blue Theme */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 sm:px-6 sm:py-4 text-white" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">🏗️</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold truncate">{project.name}</h1>
                  <StatusBadge status={project.status as ProjectStatus} />
                </div>
                {metrics.location && (
                  <div className="flex items-center text-xs text-white/80 px-2 py-1 mt-0.5">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate max-w-[120px]">{metrics.location}</span>
                  </div>
                )}
              </div>
            </div>
            
          </div>
          
          {/* Progress Circle and Update Button */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
                <circle 
                  cx="32" cy="32" r="28"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="3" 
                  fill="none"
                  strokeDasharray={`${(metrics.progress / 100) * 175.9} 175.9`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[13px] font-bold">{metrics.progress}%</span>
              </div>
            </div>
            {onUpdateProject && (
              <TouchOptimizedButton
                touchSize="sm"
                onClick={handleUpdateProject}
                className="bg-orange-500 hover:bg-orange-600 text-white border-0 px-2.5 py-1 rounded-lg text-[11px] font-medium shadow-sm"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Update Project
              </TouchOptimizedButton>
            )}
          </div>
        </div>
      </div>

      {/* Project Description - Outside Blue Background */}
      {project.description && (
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-50 border-b border-slate-200/60">
          <p className="text-sm text-slate-700 leading-relaxed">{project.description}</p>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
          {/* Budget */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleAnchor('budget')}
            onKeyDown={(e) => { if (e.key === 'Enter') onScrollToSection?.('budget'); }}
            className="cursor-pointer rounded-xl p-3 -m-1 hover:bg-slate-50 transition-colors border border-slate-200/70 bg-white shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Budget</div>
              <div className="h-6 w-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className={`text-sm font-bold ${getProgressColor(100 - metrics.spentPercentage)}`}>
                {metrics.spentPercentage}% used
              </span>
            </div>
            <div className="text-xs text-slate-600">
              {formatCurrency(metrics.remaining, metrics.currency)} left
            </div>
          </div>

          {/* Timeline */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleAnchor('timeline')}
            onKeyDown={(e) => { if (e.key === 'Enter') onScrollToSection?.('timeline'); }}
            className="cursor-pointer rounded-xl p-3 -m-1 hover:bg-slate-50 transition-colors border border-slate-200/70 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Timeline</div>
              <div className="h-6 w-6 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-sm font-bold text-slate-900">
                {formatTimeRemaining(metrics.daysRemaining)}
              </span>
            </div>
          </div>

          {/* Phases */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleAnchor('phases')}
            onKeyDown={(e) => { if (e.key === 'Enter') onScrollToSection?.('phases'); }}
            className="cursor-pointer rounded-xl p-3 -m-1 hover:bg-slate-50 transition-colors border border-slate-200/70 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phases</div>
              <div className="h-6 w-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">
              {metrics.phaseCount} phases
            </div>
          </div>

          {/* Health */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleAnchor('overview')}
            onKeyDown={(e) => { if (e.key === 'Enter') onScrollToSection?.('overview'); }}
            className="cursor-pointer rounded-xl p-3 -m-1 hover:bg-slate-50 transition-colors border border-slate-200/70 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Health</div>
              <div className="h-6 w-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
                <healthConfig.icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className={`mt-0.5 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${healthConfig.bg} ${healthConfig.color}`}>
              <healthConfig.icon className="h-3 w-3" />
              <span className="capitalize">{metrics.health}</span>
            </div>
          </div>
        </div>

        {/* Secondary Info Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 mb-3 snap-x snap-mandatory">
          {metrics.client && metrics.client !== 'Unknown Client' && (
            <div className="shrink-0 snap-start text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-flex items-center gap-1.5" title={`Client: ${metrics.client}`}>
              <Users className="h-3 w-3" />
              <span className="truncate max-w-[100px]">Client: {metrics.client}</span>
            </div>
          )}
          <div className="shrink-0 snap-start text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded inline-flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3" />
            <span>{metrics.projectType}</span>
          </div>
          <div className="shrink-0 snap-start text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded inline-flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            <span>{metrics.memberCount} members</span>
          </div>
          <div className="shrink-0 snap-start text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded inline-flex items-center gap-1.5">
            <FileText className="h-3 w-3" />
            <span>{metrics.openTasks} open tasks</span>
          </div>
          {metrics.documentCount > 0 && (
            <div className="shrink-0 snap-start text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded inline-flex items-center gap-1.5">
              <FileText className="h-3 w-3" />
              <span>{metrics.documentCount} docs</span>
            </div>
          )}
          {metrics.materialCount > 0 && (
            <div className="shrink-0 snap-start text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded inline-flex items-center gap-1.5">
              <Package className="h-3 w-3" />
              <span>{metrics.materialCount} materials</span>
            </div>
          )}
          {metrics.transactionCount > 0 && (
            <div className="shrink-0 snap-start text-xs bg-green-50 text-green-700 px-2 py-1 rounded inline-flex items-center gap-1.5">
              <DollarSign className="h-3 w-3" />
              <span>{metrics.transactionCount} expenses</span>
            </div>
          )}
        </div>

        {/* Action Buttons - Minimal Light Gray Theme for Construction */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <TouchOptimizedButton
            touchSize="sm"
            onClick={onOpenCreateBudget}
            className="bg-stone-100 hover:bg-stone-200 active:scale-95 transition-all duration-200 text-stone-700 hover:text-stone-800 px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-stone-200/60"
            title="Add a new expense to this project"
            aria-label="Add Expense"
          >
            <DollarSign className="h-3 w-3" />
            Add Expense
          </TouchOptimizedButton>
          
          <TouchOptimizedButton
            touchSize="sm"
            onClick={onOpenCreatePhase}
            className="bg-stone-100 hover:bg-stone-200 active:scale-95 transition-all duration-200 text-stone-700 hover:text-stone-800 px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-stone-200/60"
            title="Create a new project phase"
            aria-label="Add Phase"
          >
            <Clock className="h-3 w-3" />
            Add Phase
          </TouchOptimizedButton>
          
          <TouchOptimizedButton
            touchSize="sm"
            onClick={onAddTeamMember}
            className="bg-stone-100 hover:bg-stone-200 active:scale-95 transition-all duration-200 text-stone-700 hover:text-stone-800 px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-stone-200/60"
            title="Invite or add a team member"
            aria-label="Add Team Member"
          >
            <Users className="h-3 w-3" />
            Add Member
          </TouchOptimizedButton>
          
          <TouchOptimizedButton
            touchSize="sm"
            onClick={handleUploadDocument}
            className="bg-stone-100 hover:bg-stone-200 active:scale-95 transition-all duration-200 text-stone-700 hover:text-stone-800 px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-stone-200/60"
            title="Upload a document or file"
            aria-label="Upload Document"
          >
            <Upload className="h-3 w-3" />
            Upload Document
          </TouchOptimizedButton>
        </div>
      </div>
    </ProCard>
  );
}

// Export memoized component for performance optimization
export default React.memo(ProjectHeader);

// Named export for compatibility
export { ProjectHeader };