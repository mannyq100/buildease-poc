/**
 * Enhanced Phase Selector
 * Context-aware phase selection based on project characteristics
 */

import React, { useState, useMemo } from 'react';
import { 
  ProjectContext, 
  PhaseGroup, 
  EnhancedTask,
  getRecommendedPhaseGroups,
  getRecommendedPhases,
  enhanceTasksForProject,
  getProjectScale,
  getProjectTimelineEstimate,
  PHASE_GROUPS
} from '@/utils/enhancedPhaseUtils';
import { CONSTRUCTION_PHASES_WITH_TASKS } from '@/data/constants/constructionPhasesWithTasks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Building2, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Star, 
  AlertCircle,
  CheckCircle2,
  Zap,
  Shield,
  Palette,
  Hammer,
  ClipboardList,
  Wrench
} from 'lucide-react';

interface EnhancedPhaseSelectorProps {
  projectContext: ProjectContext;
  selectedPhases: string[];
  onPhasesChange: (phases: string[]) => void;
  onPhaseSelect?: (phaseId: string, phaseName: string) => void;
  onTasksPreview?: (tasks: EnhancedTask[]) => void;
  showTaskPreview?: boolean;
  className?: string;
}

const STAGE_ICONS = {
  'clipboard-list': ClipboardList,
  'hammer': Hammer,
  'building': Building2,
  'shield': Shield,
  'zap': Zap,
  'palette': Palette,
  'check-circle': CheckCircle2,
  'wrench': Wrench
};

const STAGE_COLORS = {
  'blue': 'from-blue-500 to-blue-600',
  'orange': 'from-orange-500 to-orange-600',
  'emerald': 'from-emerald-500 to-emerald-600',
  'purple': 'from-purple-500 to-purple-600',
  'yellow': 'from-yellow-500 to-yellow-600',
  'pink': 'from-pink-500 to-pink-600',
  'green': 'from-green-500 to-green-600',
  'red': 'from-red-500 to-red-600'
};

export function EnhancedPhaseSelector({
  projectContext,
  selectedPhases,
  onPhasesChange,
  onPhaseSelect,
  onTasksPreview,
  showTaskPreview = true,
  className = ''
}: EnhancedPhaseSelectorProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['PLANNING_STAGE']);
  const [selectedPhaseForPreview, setSelectedPhaseForPreview] = useState<string | null>(null);

  // Get project-specific recommendations
  const projectScale = useMemo(() => getProjectScale(projectContext), [projectContext]);
  const recommendedPhases = useMemo(() => getRecommendedPhases(projectContext), [projectContext]);
  const phaseGroups = useMemo(() => getRecommendedPhaseGroups(projectContext), [projectContext]);
  const timelineEstimate = useMemo(() => 
    getProjectTimelineEstimate(recommendedPhases, projectContext), 
    [recommendedPhases, projectContext]
  );

  // Enhanced tasks for preview
  const previewTasks = useMemo(() => {
    if (!selectedPhaseForPreview) return [];
    return enhanceTasksForProject(selectedPhaseForPreview, projectContext);
  }, [selectedPhaseForPreview, projectContext]);

  // Handle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Handle phase selection
  const handlePhaseSelect = (phaseId: string) => {
    const phase = CONSTRUCTION_PHASES_WITH_TASKS[phaseId];
    if (!phase) return;

    const isSelected = selectedPhases.includes(phaseId);
    const newSelectedPhases = isSelected
      ? selectedPhases.filter(id => id !== phaseId)
      : [...selectedPhases, phaseId];

    onPhasesChange(newSelectedPhases);

    if (onPhaseSelect && !isSelected) {
      onPhaseSelect(phaseId, phase.alternativeNames?.[0] || phaseId);
    }

    // Update task preview
    if (!isSelected) {
      setSelectedPhaseForPreview(phaseId);
      if (onTasksPreview) {
        const enhancedTasks = enhanceTasksForProject(phaseId, projectContext);
        onTasksPreview(enhancedTasks);
      }
    }
  };

  // Quick select recommended phases
  const selectRecommendedPhases = () => {
    onPhasesChange(recommendedPhases);
    if (onTasksPreview && recommendedPhases.length > 0) {
      const firstPhase = recommendedPhases[0];
      setSelectedPhaseForPreview(firstPhase);
      const enhancedTasks = enhanceTasksForProject(firstPhase, projectContext);
      onTasksPreview(enhancedTasks);
    }
  };

  // Clear all selections
  const clearAllPhases = () => {
    onPhasesChange([]);
    setSelectedPhaseForPreview(null);
    if (onTasksPreview) {
      onTasksPreview([]);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Project Context Summary */}
      <Card className="p-4 bg-gradient-to-r from-buildease-blue-50 to-slate-50 border-buildease-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Project Context</h3>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="capitalize">{projectContext.projectType.replace('-', ' ')}</span>
              <span>•</span>
              <span>{projectContext.buildingSize} {projectContext.buildingSizeUnit}</span>
              <span>•</span>
              <span>{projectContext.storeys} floor{projectContext.storeys > 1 ? 's' : ''}</span>
              <span>•</span>
              <Badge variant="outline" className="text-xs">
                {projectScale} Scale
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600">Estimated Timeline</div>
            <div className="font-semibold text-buildease-orange-600">
              {timelineEstimate.totalMonths} months
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button
          onClick={selectRecommendedPhases}
          className="flex-1 bg-gradient-to-r from-buildease-blue-500 to-buildease-blue-600 hover:from-buildease-blue-600 hover:to-buildease-blue-700"
        >
          <Star className="h-4 w-4 mr-2" />
          Use Recommended ({recommendedPhases.length})
        </Button>
        <Button
          onClick={clearAllPhases}
          variant="outline"
          className="border-slate-300 hover:border-slate-400"
        >
          Clear All
        </Button>
      </div>

      {/* Phase Groups */}
      <div className="space-y-4">
        {phaseGroups.map((group) => {
          const IconComponent = STAGE_ICONS[group.icon as keyof typeof STAGE_ICONS] || Building2;
          const isExpanded = expandedGroups.includes(group.id);
          const groupPhases = group.phases.filter(phaseId => 
            CONSTRUCTION_PHASES_WITH_TASKS[phaseId]
          );
          const selectedInGroup = groupPhases.filter(phaseId => 
            selectedPhases.includes(phaseId)
          ).length;

          return (
            <Card key={group.id} className={`overflow-hidden transition-all duration-200 ${
              group.isRecommended 
                ? 'border-buildease-blue-200 shadow-md' 
                : 'border-slate-200'
            }`}>
              <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(group.id)}>
                <CollapsibleTrigger asChild>
                  <div className="p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${
                          STAGE_COLORS[group.color as keyof typeof STAGE_COLORS]
                        } text-white`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900">{group.name}</h4>
                            {group.isRecommended && (
                              <Badge variant="secondary" className="text-xs bg-buildease-blue-100 text-buildease-blue-700">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{group.description}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {group.estimatedDuration}
                            </span>
                            <span>{groupPhases.length} phases</span>
                            {selectedInGroup > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {selectedInGroup} selected
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-slate-200 p-4 bg-slate-50/50">
                    <div className="grid gap-3">
                      {groupPhases.map((phaseId) => {
                        const phase = CONSTRUCTION_PHASES_WITH_TASKS[phaseId];
                        const isSelected = selectedPhases.includes(phaseId);
                        const isRecommended = recommendedPhases.includes(phaseId);

                        return (
                          <div
                            key={phaseId}
                            onClick={() => handlePhaseSelect(phaseId)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? 'border-buildease-orange-500 bg-buildease-orange-50 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-medium text-slate-900">
                                    {phase.alternativeNames?.[0] || phaseId}
                                  </h5>
                                  {isRecommended && (
                                    <Star className="h-3 w-3 text-buildease-blue-500 fill-current" />
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 mt-1">
                                  {phase.description}
                                </p>
                                <div className="text-xs text-slate-500 mt-1">
                                  {phase.tasks.length} tasks
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isSelected && (
                                  <CheckCircle2 className="h-5 w-5 text-buildease-orange-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Task Preview */}
      {showTaskPreview && selectedPhaseForPreview && previewTasks.length > 0 && (
        <Card className="p-4 border-buildease-blue-200 bg-buildease-blue-50/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-buildease-blue-600" />
            <h4 className="font-semibold text-slate-900">
              Tasks Preview: {CONSTRUCTION_PHASES_WITH_TASKS[selectedPhaseForPreview]?.alternativeNames?.[0]}
            </h4>
          </div>
          <div className="grid gap-2 max-h-40 overflow-y-auto">
            {previewTasks.slice(0, 8).map((task) => (
              <div key={task.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'critical' ? 'bg-red-500' :
                    task.priority === 'important' ? 'bg-orange-500' : 'bg-slate-400'
                  }`} />
                  <span className={task.isRecommended ? 'text-slate-900' : 'text-slate-600'}>
                    {task.name}
                  </span>
                  {task.inspectionRequired && (
                    <Shield className="h-3 w-3 text-buildease-blue-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{task.estimatedDays}d</span>
                  <Badge variant="outline" className="text-xs">
                    {task.complexity}
                  </Badge>
                </div>
              </div>
            ))}
            {previewTasks.length > 8 && (
              <div className="text-xs text-slate-500 text-center pt-2">
                +{previewTasks.length - 8} more tasks...
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Selection Summary */}
      {selectedPhases.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-buildease-orange-50 to-orange-50 border-buildease-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Selection Summary</h4>
              <p className="text-sm text-slate-600">
                {selectedPhases.length} phases selected
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Estimated Duration</div>
              <div className="font-semibold text-buildease-orange-600">
                {getProjectTimelineEstimate(selectedPhases, projectContext).totalMonths} months
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
