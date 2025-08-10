/**
 * UnifiedProjectHeader Component
 * 
 * A clean, professional project header optimized for construction management.
 * Focuses on essential information with clear visual hierarchy and intuitive actions.
 */

import { useMemo, useCallback } from 'react';
import { StatusBadge } from '@/components/shared';
import { TouchOptimizedButton } from '@/components/ui/TouchOptimizedButton';
import { 
  DollarSign, Clock, Users, MapPin, Edit3, Upload,
  TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react';
import type { Project, ProjectStatus } from '@/types/project';
import type { ProjectPhase } from '@/types/projectDetails';
import type { TeamMember } from '@/types/project';
import { useProjectSummary } from '@/hooks/queries/useProjectSummary';
import { useProjectTasks } from '@/hooks/queries/useTask';

export interface UnifiedProjectHeaderProps {
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
const formatCurrency = (amount: number, currency: string) => {
  if (amount >= 1_000_000) return `${currency} ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${currency} ${(amount / 1_000).toFixed(0)}K`;
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency, 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  }).format(amount);
};

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

export function UnifiedProjectHeader({
  project,
  phases = [],
  activeTeamMembers = [],
  onOpenCreateBudget,
  onOpenCreatePhase,
  onAddTeamMember,
  onNavigateToDocuments,
  onScrollToSection,
  onUpdateProject,
}: UnifiedProjectHeaderProps) {
  const { data: summary } = useProjectSummary(project.id);
  const { data: tasks = [] } = useProjectTasks(project.id);

  // Process data once with useMemo
  const metrics = useMemo(() => {
    const progress = summary?.progress ?? project.progress ?? 0;
    const budget = summary?.budget ?? project.budget ?? 0;
    const spent = summary?.spent ?? 0;
    const currency = summary?.currency ?? project.currency ?? 'USD';
    const remaining = summary?.remaining ?? (budget - spent);
    const spentPercentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;

    // Calculate timeline
    const endDate = summary?.end_date || project.end_date;
    const daysRemaining = endDate ? 
      Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

    // Phase calculations
    const phaseCount = summary?.phases ?? phases.length;
    const completedPhases = phases.filter(p => 
      String(p.status || '').toUpperCase() === 'COMPLETED'
    ).length;

    // Task calculations
    const openTasks = (tasks as { status?: string | null }[]).filter(
      t => !t.status || t.status === 'PENDING' || t.status === 'IN_PROGRESS'
    ).length;

    return {
      progress,
      budget,
      spent,
      remaining,
      spentPercentage,
      currency,
      daysRemaining,
      phaseCount,
      completedPhases,
      openTasks,
      health: summary?.health ?? 'good',
      memberCount: summary?.members ?? activeTeamMembers.length,
      documentCount: summary?.documents ?? 0,
      transactionCount: summary?.transactions ?? 0,
      client: summary?.client,
      location: summary?.location || project.location,
      projectType: summary?.project_type ?? 'Construction'
    };
  }, [summary, project, phases, activeTeamMembers, tasks]);

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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white" style={{ background: 'linear-gradient(135deg, #2B6CB0 0%, #1E40AF 100%)' }}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">🏗️</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate">{project.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={project.status as ProjectStatus} />
                  {metrics.location && (
                    <div className="flex items-center text-xs text-white/80 bg-white/10 rounded px-2 py-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate max-w-20">{metrics.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Project Description */}
            {project.description && (
              <div className="mt-3 bg-white/10 rounded-lg px-3 py-2">
                <p className="text-sm text-white/90 leading-relaxed">{project.description}</p>
              </div>
            )}
          </div>
          
          {/* Progress Circle */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
                <circle 
                  cx="32" cy="32" r="28"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="4" 
                  fill="none"
                  strokeDasharray={`${(metrics.progress / 100) * 175.9} 175.9`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{metrics.progress}%</span>
              </div>
            </div>
            <TouchOptimizedButton
              touchSize="sm"
              onClick={handleUpdateProject}
              className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 py-1.5 rounded-lg text-xs font-medium"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </TouchOptimizedButton>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {/* Budget */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Budget</div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${getProgressColor(100 - metrics.spentPercentage)}`}>
                {metrics.spentPercentage}% used
              </span>
            </div>
            <div className="text-xs text-slate-600">
              {formatCurrency(metrics.remaining, metrics.currency)} left
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Timeline</div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" />
              <span className="text-sm font-bold text-slate-900">
                {formatTimeRemaining(metrics.daysRemaining)}
              </span>
            </div>
          </div>

          {/* Phases */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phases</div>
            <div className="text-sm font-bold text-slate-900">
              {metrics.completedPhases}/{metrics.phaseCount} complete
            </div>
          </div>

          {/* Health */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Health</div>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${healthConfig.bg} ${healthConfig.color}`}>
              <healthConfig.icon className="h-3 w-3" />
              <span className="capitalize">{metrics.health}</span>
            </div>
          </div>
        </div>

        {/* Secondary Info Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {metrics.client && metrics.client !== 'Unknown Client' && (
            <div className="shrink-0 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
              Client: {metrics.client}
            </div>
          )}
          <div className="shrink-0 text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
            {metrics.projectType}
          </div>
          <div className="shrink-0 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
            {metrics.memberCount} members
          </div>
          <div className="shrink-0 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
            {metrics.openTasks} open tasks
          </div>
          {metrics.documentCount > 0 && (
            <div className="shrink-0 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
              {metrics.documentCount} docs
            </div>
          )}
          {metrics.transactionCount > 0 && (
            <div className="shrink-0 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
              {metrics.transactionCount} expenses
            </div>
          )}
        </div>

        {/* Action Buttons - Using BuildEase Color Palette */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <TouchOptimizedButton
            touchSize="sm"
            onClick={onOpenCreateBudget}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
            style={{ backgroundColor: '#2B6CB0' }}
          >
            <DollarSign className="h-3 w-3" />
            Expense
          </TouchOptimizedButton>
          
          <TouchOptimizedButton
            touchSize="sm"
            onClick={onOpenCreatePhase}
            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
            style={{ backgroundColor: '#ED8936' }}
          >
            <Clock className="h-3 w-3" />
            Phase
          </TouchOptimizedButton>
          
          <TouchOptimizedButton
            touchSize="sm"
            onClick={onAddTeamMember}
            className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
          >
            <Users className="h-3 w-3" />
            Member
          </TouchOptimizedButton>
          
          <TouchOptimizedButton
            touchSize="sm"
            onClick={handleUploadDocument}
            className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
          >
            <Upload className="h-3 w-3" />
            Upload
          </TouchOptimizedButton>
        </div>
      </div>
    </div>
  );
}