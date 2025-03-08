/**
 * GeneratedPlan component
 * Displays an AI-generated construction project plan with various views and interactive elements
 */
import { PageHeader } from '@/components/shared';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/components/ui/use-toast';
import { createDefaultPhase } from '@/data/mock/generatedPlan/defaultPhase';
import { TIMELINE_INSIGHTS } from '@/data/mock/generatedPlan/insights';
import { SAMPLE_PROJECT_PLAN } from '@/data/mock/generatedPlan/samplePhases';
import { InsightItemProps, Phase } from '@/types/projectInputs';
import { AnimatePresence, m } from 'framer-motion';
import {
  AlertCircle,
  Building,
  Calendar,
  Check,
  CheckCircle,
  ChevronRight,
  Clock,
  Download,
  Edit,
  FileEdit,
  FileText,
  Loader2,
  Package,
  Pencil,
  Plus,
  Printer,
  RotateCw,
  Save,
  Share2,
  Sparkles,
  Sun,
  Trash2,
  Users,
  X,
  XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Types
interface ProjectData {
  name?: string;
  description?: string;
  type?: string;
  location?: string;
  region?: string;
  budget?: string;
  currency?: string;
  timeframe?: string;
  images?: string[];
  [key: string]: unknown;
}

interface TabData {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// Add new type for plan status
type PlanStatus = 'draft' | 'final' | 'none';

// Component for insights displayed on the page
function InsightItem({ 
  title, 
  description, 
  icon, 
  type = 'default', 
  animationDelay = 0 
}: InsightItemProps) {
  const styles = {
    default: {
      container: 'bg-blue-50/80 border border-blue-100/50 hover:border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50 dark:hover:border-blue-700',
      icon: 'text-blue-500 dark:text-blue-400',
      heading: 'text-blue-900 dark:text-blue-300',
      text: 'text-blue-800 dark:text-blue-400',
    },
    warning: {
      container: 'bg-amber-50/80 border border-amber-100/50 hover:border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50 dark:hover:border-amber-700',
      icon: 'text-amber-500 dark:text-amber-400',
      heading: 'text-amber-900 dark:text-amber-300',
      text: 'text-amber-800 dark:text-amber-400',
    },
    success: {
      container: 'bg-green-50/80 border border-green-100/50 hover:border-green-200 dark:bg-green-900/20 dark:border-green-800/50 dark:hover:border-green-700',
      icon: 'text-green-500 dark:text-green-400',
      heading: 'text-green-900 dark:text-green-300',
      text: 'text-green-800 dark:text-green-400',
    }
  };

  const style = styles[type];

  return (
    <m.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay }}
      className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 hover:translate-x-1 ${style.container}`}
    >
      <div className={`rounded-full p-2 bg-white dark:bg-slate-800 shadow-sm ${style.icon}`}>
        {icon || <Sparkles className={`w-5 h-5 ${style.icon}`} />}
      </div>
      <div>
        <h4 className={`font-medium ${style.heading}`}>{title}</h4>
        <p className={`text-sm mt-1 leading-relaxed ${style.text}`}>{description}</p>
      </div>
    </m.div>
  );
}

// Component for rendering the project title with edit functionality
function ProjectTitle({
  title,
  description,
  isEditingTitle,
  setIsEditingTitle,
  titleValue,
  setTitleValue,
  cancelTitleEdit,
  saveTitleEdit,
  isDarkMode
}: {
  title: string;
  description?: string;
  isEditingTitle: boolean;
  setIsEditingTitle: (value: boolean) => void;
  titleValue: string;
  setTitleValue: (value: string) => void;
  cancelTitleEdit: () => void;
  saveTitleEdit: () => void;
  isDarkMode: boolean;
}) {
  return (
    <div className="flex items-center space-x-2 mb-8">
      <Building className={`h-8 w-8 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
      <div className="flex-1">
        {isEditingTitle ? (
          <div className="flex items-center">
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none w-full dark:text-white"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={cancelTitleEdit} className="ml-2">
              <XCircle className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={saveTitleEdit} className="ml-1">
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center">
            <h1 className="text-2xl font-bold dark:text-white">{title}</h1>
            <Button size="sm" variant="ghost" onClick={() => setIsEditingTitle(true)} className="ml-2 opacity-50 hover:opacity-100">
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
        {description && (
          <p className="text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

// Component for rendering markdown content
function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;
  
  return (
    <div className="prose prose-blue dark:prose-invert max-w-none">
      {content.split('\n').map((line, index) => {
        try {
          // Handle markdown headings
          if (line.startsWith('# ')) {
            return <h1 key={index} className="text-2xl font-bold mt-6 mb-4">{line.substring(2)}</h1>;
          } else if (line.startsWith('## ')) {
            return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{line.substring(3)}</h2>;
          } else if (line.startsWith('### ')) {
            return <h3 key={index} className="text-lg font-bold mt-5 mb-2">{line.substring(4)}</h3>;
          } else if (line.startsWith('- ')) {
            return <li key={index} className="ml-6 my-1">{line.substring(2)}</li>;
          } else if (line.startsWith('**') && line.endsWith('**')) {
            const content = line.replace(/\*\*/g, '');
            return <p key={index} className="font-bold my-2">{content}</p>;
          } else if (line.startsWith('|')) {
            // This is a table row
            const cells = line.split('|').filter(cell => cell.trim() !== '');
            if (cells.length === 0) return null;
            
            if (index > 0 && content.split('\n')[index-1] && content.split('\n')[index-1].startsWith('|---')) {
              // This is a header row
              return (
                <div key={index} className="flex border-b">
                  {cells.map((cell, cellIndex) => (
                    <div key={cellIndex} className="px-4 py-2 font-medium flex-1">{cell.trim()}</div>
                  ))}
                </div>
              );
            } else if (line.includes('---')) {
              // This is a separator row, skip it
              return null;
            } else {
              return (
                <div key={index} className="flex border-b border-gray-200 dark:border-gray-800">
                  {cells.map((cell, cellIndex) => (
                    <div key={cellIndex} className="px-4 py-2 flex-1">{cell.trim()}</div>
                  ))}
                </div>
              );
            }
          } else if (line.trim() === '') {
            return <div key={index} className="h-4"></div>;
          } else {
            return <p key={index} className="my-2">{line}</p>;
          }
        } catch (error) {
          console.error('Error rendering markdown line:', error);
          return <p key={index} className="text-red-500">{line}</p>;
        }
      })}
    </div>
  );
}

// Component for editing markdown content
function MarkdownEditor({
  value,
  onChange,
  isDarkMode
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isDarkMode: boolean;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <FileEdit className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Markdown Editor</span>
      </div>
      <textarea
        value={value}
        onChange={onChange}
        className={`w-full h-[600px] p-4 font-mono text-sm resize-none focus:outline-none focus:ring-0 ${
          isDarkMode 
            ? "bg-gray-900 text-gray-100" 
            : "bg-white text-gray-800"
        }`}
        placeholder="Edit your project plan here using Markdown formatting..."
      />
    </div>
  );
}

// Component for action buttons
function ActionButtons({
  isGenerating,
  handleRegenerate,
  navigateToProjectInput,
  setShowCollaborateModal,
  onAddPhase,
  onSave
}: {
  isGenerating: boolean;
  handleRegenerate: (data: ProjectData | null) => void;
  navigateToProjectInput: () => void;
  setShowCollaborateModal: (value: boolean) => void;
  onAddPhase?: () => void;
  onSave?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
  
      
      <Button
        variant="default"
        size="sm"
        onClick={() => handleRegenerate(null)}
        disabled={isGenerating}
        className="gap-1.5 "
      >
        {isGenerating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RotateCw className="h-3.5 w-3.5" />
        )}
        <span>{isGenerating ? 'Generating...' : 'Regenerate'}</span>
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            <span>Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShowCollaborateModal(true)}>
            <Users className="h-4 w-4 mr-2" />
            <span>Collaborate</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={navigateToProjectInput}>
            <Edit className="h-4 w-4 mr-2" />
            <span>Edit Source Data</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Download className="h-4 w-4 mr-2" />
            <span>Download PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Printer className="h-4 w-4 mr-2" />
            <span>Print</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Component for distribute modal
function DistributeModal({
  show,
  onClose,
  onDistribute,
  saving
}: {
  show: boolean;
  onClose: () => void;
  onDistribute: () => void;
  saving: boolean;
}) {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <m.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Distribute Plan</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            This will distribute your plan details to the following areas of your project:
          </p>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md flex items-start">
            <Calendar className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Project Phases</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Creates timeline and milestone entries
              </p>
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md flex items-start">
            <Package className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Materials</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Extracts required materials and quantities
              </p>
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md flex items-start">
            <Users className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Team & Tasks</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Creates roles and responsibilities
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onDistribute} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Distributing...
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Distribute
              </>
            )}
          </Button>
        </div>
      </m.div>
    </div>
  );
}

// Component for phase management
function ProjectPhaseManager({
  phases,
  setPhases,
  isDarkMode
}: {
  phases: Phase[];
  setPhases: (phases: Phase[]) => void;
  isDarkMode: boolean;
}) {
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState<string | null>(null);
  const [showAddMaterial, setShowAddMaterial] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [newMaterial, setNewMaterial] = useState({ name: '', quantity: '', unit: 'pcs' });
  
  // Initialize with collapsed sections - a simpler implementation to avoid linter errors
  const [expandedSections, setExpandedSections] = useState<Record<string, { tasks: boolean, materials: boolean }>>({});
  
  // Initialize expanded state for new phases - start with all sections collapsed
  useEffect(() => {
    // Only run if there are phases
    if (phases.length > 0) {
      // Check which phases don't have expanded state set yet
      const newPhaseIds = phases
        .filter(phase => !expandedSections[phase.id])
        .map(phase => phase.id);
      
      // If there are any new phases, set their initial state to collapsed
      if (newPhaseIds.length > 0) {
        const updatedExpandedSections = { ...expandedSections };
        
        // Set all sections to collapsed by default
        newPhaseIds.forEach(phaseId => {
          updatedExpandedSections[phaseId] = {
            tasks: false,
            materials: false
          };
        });
        
        // Update the state with the new collapsed sections
        setExpandedSections(updatedExpandedSections);
      }
    }
  }, [phases]);
  
  // Toggle section expanded state
  const toggleSection = (phaseId: string, section: 'tasks' | 'materials') => {
    setExpandedSections(prev => ({
      ...prev,
      [phaseId]: {
        ...prev[phaseId],
        [section]: !prev[phaseId]?.[section]
      }
    }));
  };
  
  // Delete a phase
  const handleDeletePhase = (phaseId: string) => {
    if (window.confirm('Are you sure you want to delete this phase? This action cannot be undone.')) {
      setPhases(phases.filter(phase => phase.id !== phaseId));
      
      // Also clean up expanded sections state
      const newExpandedSections = { ...expandedSections };
      delete newExpandedSections[phaseId];
      setExpandedSections(newExpandedSections);
    }
  };
  
  // Add a new task to a phase
  const handleAddTask = (phaseId: string) => {
    if (!newTask.title.trim()) return;
    
    const updatedPhases = phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: [
            ...phase.tasks,
            {
              id: `task-${Date.now()}`,
              title: newTask.title,
              description: newTask.description,
              completed: false
            }
          ]
        };
      }
      return phase;
    });
    
    setPhases(updatedPhases);
    setNewTask({ title: '', description: '' });
    setShowAddTask(null);
    
    // Ensure tasks section is expanded after adding
    setExpandedSections(prev => ({
      ...prev,
      [phaseId]: {
        ...prev[phaseId],
        tasks: true
      }
    }));
  };
  
  // Add a new material to a phase
  const handleAddMaterial = (phaseId: string) => {
    if (!newMaterial.name.trim() || !newMaterial.quantity.trim()) return;
    
    const updatedPhases = phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          materials: [
            ...phase.materials,
            {
              id: `material-${Date.now()}`,
              name: newMaterial.name,
              quantity: newMaterial.quantity,
              unit: newMaterial.unit
            }
          ]
        };
      }
      return phase;
    });
    
    setPhases(updatedPhases);
    setNewMaterial({ name: '', quantity: '', unit: 'pcs' });
    setShowAddMaterial(null);
    
    // Ensure materials section is expanded after adding
    setExpandedSections(prev => ({
      ...prev,
      [phaseId]: {
        ...prev[phaseId],
        materials: true
      }
    }));
  };
  
  // Delete a task
  const handleDeleteTask = (phaseId: string, taskId: string) => {
    const updatedPhases = phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.filter(task => task.id !== taskId)
        };
      }
      return phase;
    });
    
    setPhases(updatedPhases);
  };
  
  // Delete a material
  const handleDeleteMaterial = (phaseId: string, materialId: string) => {
    const updatedPhases = phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          materials: phase.materials.filter(material => material.id !== materialId)
        };
      }
      return phase;
    });
    
    setPhases(updatedPhases);
  };
  
  // Toggle task completion
  const toggleTaskCompletion = (phaseId: string, taskId: string) => {
    const updatedPhases = phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        };
      }
      return phase;
    });
    
    setPhases(updatedPhases);
  };
  
  // Calculate progress for a phase
  const calculatePhaseProgress = (phase: Phase): number => {
    if (phase.tasks.length === 0) return 0;
    const completedTasks = phase.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / phase.tasks.length) * 100);
  };
  
  return (
    <div className="space-y-8">
      {phases.map(phase => {
        const phaseProgress = calculatePhaseProgress(phase);
        const hasExpandedSections = expandedSections[phase.id];
        const isTasksExpanded = hasExpandedSections?.tasks;
        const isMaterialsExpanded = hasExpandedSections?.materials;
        
        return (
          <Card 
            key={phase.id} 
            className={`
              border border-gray-200 dark:border-gray-800 
              overflow-hidden transition-all duration-300 ease-in-out
              hover:shadow-md
              ${editingPhaseId === phase.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
            `}
          >
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-b border-gray-200 dark:border-gray-800 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center text-blue-700 dark:text-blue-400 mb-1">
                    {phase.title}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap gap-2 items-center">
                    <span className="inline-flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-400" />
                      <span>Duration: {phase.duration}</span>
                    </span>
                    {phase.startDate && (
                      <span className="inline-flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-400" />
                        <span>{phase.startDate} - {phase.endDate}</span>
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setEditingPhaseId(editingPhaseId === phase.id ? null : phase.id)}
                    className={`
                      h-8 w-8 
                      ${editingPhaseId === phase.id 
                        ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' 
                        : ''}
                    `}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDeletePhase(phase.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-green-500 dark:bg-green-600 transition-all duration-500 ease-out"
                  style={{ width: `${phaseProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>{phaseProgress}% complete</span>
                <span>{phase.tasks.filter(t => t.completed).length}/{phase.tasks.length} tasks</span>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Phase Description Edit */}
              {editingPhaseId === phase.id && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Edit Phase Details</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`phase-title-${phase.id}`} className="mb-1 block text-xs">Phase Title</Label>
                      <Input 
                        id={`phase-title-${phase.id}`}
                        value={phase.title}
                        onChange={(e) => {
                          const updatedPhases = phases.map(p => 
                            p.id === phase.id ? { ...p, title: e.target.value } : p
                          );
                          setPhases(updatedPhases);
                        }}
                        placeholder="Phase title..."
                      />
                    </div>
                    <div>
                      <Label htmlFor={`phase-duration-${phase.id}`} className="mb-1 block text-xs">Duration</Label>
                      <Input 
                        id={`phase-duration-${phase.id}`}
                        value={phase.duration}
                        onChange={(e) => {
                          const updatedPhases = phases.map(p => 
                            p.id === phase.id ? { ...p, duration: e.target.value } : p
                          );
                          setPhases(updatedPhases);
                        }}
                        placeholder="e.g., 2-3 weeks"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`phase-description-${phase.id}`} className="mb-1 block text-xs">Description</Label>
                      <Textarea 
                        id={`phase-description-${phase.id}`}
                        value={phase.description || ''} 
                        onChange={(e) => {
                          const updatedPhases = phases.map(p => 
                            p.id === phase.id ? { ...p, description: e.target.value } : p
                          );
                          setPhases(updatedPhases);
                        }}
                        placeholder="Phase description..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Phase Description Display */}
              {phase.description && editingPhaseId !== phase.id && (
                <div className="p-4 border-b border-gray-100 dark:border-gray-800/70 bg-gradient-to-r from-blue-50/30 to-transparent dark:from-blue-900/5 dark:to-transparent">
                  <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">{phase.description}</p>
                </div>
              )}
              
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {/* Tasks Section */}
                <div className="px-4 py-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection(phase.id, 'tasks')}
                  >
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mr-1 p-0"
                      >
                        <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isTasksExpanded ? 'rotate-90' : ''}`} />
                      </Button>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        Tasks ({phase.tasks.length})
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddTask(showAddTask === phase.id ? null : phase.id);
                      }}
                      className="text-blue-600 dark:text-blue-400 h-7 px-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Add Task</span>
                    </Button>
                  </div>
                  
                  {/* Add Task Form */}
                  <AnimatePresence>
                    {showAddTask === phase.id && (
                      <m.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 my-3 border border-blue-100 dark:border-blue-900/30 rounded-md bg-blue-50/50 dark:bg-blue-900/10">
                          <div className="space-y-2">
                            <Input
                              placeholder="Task title"
                              value={newTask.title}
                              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                              className="mb-2"
                            />
                            <Textarea
                              placeholder="Task description (optional)"
                              value={newTask.description}
                              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                              className="min-h-[60px]"
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setShowAddTask(null)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => handleAddTask(phase.id)}
                                disabled={!newTask.title.trim()}
                              >
                                Add Task
                              </Button>
                            </div>
                          </div>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Task List */}
                  <AnimatePresence>
                    {isTasksExpanded && (
                      <m.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 mt-2">
                          {phase.tasks.length > 0 ? (
                            phase.tasks.map(task => (
                              <m.div
                                key={task.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className={`
                                  p-3 border rounded-md flex items-start justify-between
                                  ${task.completed 
                                    ? 'bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30' 
                                    : 'bg-white border-gray-200 dark:bg-gray-800/50 dark:border-gray-700'}
                                  hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors
                                `}
                              >
                                <div className="flex items-start space-x-3">
                                  <Checkbox
                                    checked={task.completed}
                                    onCheckedChange={() => toggleTaskCompletion(phase.id, task.id)}
                                    className="mt-1"
                                  />
                                  <div>
                                    <p className={`font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                      {task.title}
                                    </p>
                                    {task.description && (
                                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteTask(phase.id, task.id)}
                                  className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </m.div>
                            ))
                          ) : (
                            <div className="py-3 text-center">
                              <p className="text-sm text-gray-500 dark:text-gray-400 italic">No tasks added yet.</p>
                            </div>
                          )}
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Materials Section */}
                <div className="px-4 py-3">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection(phase.id, 'materials')}
                  >
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mr-1 p-0"
                      >
                        <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isMaterialsExpanded ? 'rotate-90' : ''}`} />
                      </Button>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        Materials ({phase.materials.length})
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddMaterial(showAddMaterial === phase.id ? null : phase.id);
                      }}
                      className="text-green-600 dark:text-green-400 h-7 px-2 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Add Material</span>
                    </Button>
                  </div>
                  
                  {/* Add Material Form */}
                  <AnimatePresence>
                    {showAddMaterial === phase.id && (
                      <m.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 my-3 border border-green-100 dark:border-green-900/30 rounded-md bg-green-50/50 dark:bg-green-900/10">
                          <div className="space-y-2">
                            <Input
                              placeholder="Material name"
                              value={newMaterial.name}
                              onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                            />
                            <div className="flex space-x-2">
                              <Input
                                placeholder="Quantity"
                                type="text"
                                inputMode="decimal"
                                value={newMaterial.quantity}
                                onChange={(e) => setNewMaterial({ ...newMaterial, quantity: e.target.value })}
                                className="flex-1"
                              />
                              <Select
                                value={newMaterial.unit}
                                onValueChange={(value) => setNewMaterial({ ...newMaterial, unit: value })}
                              >
                                <SelectTrigger className="w-[100px]">
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pcs">pcs</SelectItem>
                                  <SelectItem value="kg">kg</SelectItem>
                                  <SelectItem value="m">m</SelectItem>
                                  <SelectItem value="m²">m²</SelectItem>
                                  <SelectItem value="m³">m³</SelectItem>
                                  <SelectItem value="l">liters</SelectItem>
                                  <SelectItem value="bag">bags</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end space-x-2 mt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setShowAddMaterial(null)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => handleAddMaterial(phase.id)}
                                disabled={!newMaterial.name.trim() || !newMaterial.quantity.trim()}
                              >
                                Add Material
                              </Button>
                            </div>
                          </div>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Materials List */}
                  <AnimatePresence>
                    {isMaterialsExpanded && (
                      <m.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden mt-2"
                      >
                        {phase.materials.length > 0 ? (
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                  <tr>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Material
                                    </th>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Quantity
                                    </th>
                                    <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                  {phase.materials.map(material => (
                                    <tr 
                                      key={material.id}
                                      className="hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
                                    >
                                      <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {material.name}
                                      </td>
                                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300 font-mono text-xs">
                                          {material.quantity} {material.unit}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-right">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleDeleteMaterial(phase.id, material.id)}
                                          className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                        >
                                          <X className="h-3.5 w-3.5" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="py-3 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No materials added yet.</p>
                          </div>
                        )}
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Add this function to parse plan content into phases
const parsePlanContentToPhases = (content: string): Phase[] => {
  try {
    // Simple parser that looks for # Phase headers
    const lines = content.split('\n');
    const phases: Phase[] = [];
    let currentPhase: Partial<Phase> | null = null;
    let currentSection: 'description' | 'tasks' | 'materials' | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for phase header (e.g., "# Phase 1: Foundation Work")
      if (line.startsWith('# ') || line.startsWith('## ')) {
        // Save previous phase if exists
        if (currentPhase && currentPhase.title) {
          phases.push({
            id: `phase-${phases.length}`,
            title: currentPhase.title,
            duration: currentPhase.duration || 'TBD',
            description: currentPhase.description || '',
            tasks: currentPhase.tasks || [],
            materials: currentPhase.materials || [],
          });
        }
        
        // Start new phase
        const title = line.replace(/^#+ /, '');
        currentPhase = {
          title,
          tasks: [],
          materials: [],
        };
        
        // Look for duration in the next line
        if (i + 1 < lines.length && lines[i + 1].toLowerCase().includes('duration')) {
          const durationLine = lines[i + 1];
          const durationMatch = durationLine.match(/duration:?\s*(.+)/i);
          if (durationMatch) {
            currentPhase.duration = durationMatch[1].trim();
            i++; // Skip the duration line
          }
        }
        
        currentSection = 'description';
        continue;
      }
      
      if (!currentPhase) continue;
      
      // Check for section headers
      if (line.startsWith('### Tasks') || line.toLowerCase().includes('tasks:')) {
        currentSection = 'tasks';
        continue;
      } else if (line.startsWith('### Materials') || line.toLowerCase().includes('materials:')) {
        currentSection = 'materials';
        continue;
      } else if (line.startsWith('###')) {
        // Any other section header reverts to description
        currentSection = 'description';
        continue;
      }
      
      // Skip empty lines
      if (!line) continue;
      
      // Process based on current section
      switch (currentSection) {
        case 'description':
          currentPhase.description = (currentPhase.description || '') + line + '\n';
          break;
        case 'tasks':
          if (line.startsWith('- ')) {
            const taskText = line.substring(2).trim();
            // Check if there's a description in the next lines
            let taskDescription = '';
            let j = i + 1;
            while (j < lines.length && 
                  !lines[j].trim().startsWith('- ') && 
                  !lines[j].trim().startsWith('#') &&
                  !lines[j].trim().startsWith('###')) {
              if (lines[j].trim()) {
                taskDescription += lines[j].trim() + '\n';
              }
              j++;
            }
            
            if (taskDescription) {
              i = j - 1; // Skip the description lines
            }
            
            currentPhase.tasks?.push({
              id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: taskText,
              description: taskDescription.trim(),
              completed: false
            });
          }
          break;
        case 'materials':
          if (line.startsWith('- ')) {
            const materialText = line.substring(2).trim();
            // Try to match quantity and unit from text like "50 kg of cement"
            const matches = materialText.match(/^(?:(\d+(?:\.\d+)?)\s*([a-zA-Z²³]+)(?:\s+of)?\s+)?(.+)$/);
            
            if (matches) {
              const quantity = matches[1] || '1';
              const unit = matches[2] || 'pcs';
              const name = matches[3].trim();
              
              currentPhase.materials?.push({
                id: `material-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name,
                quantity,
                unit
              });
            } else {
              // If no quantity/unit pattern found, just add as name
              currentPhase.materials?.push({
                id: `material-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: materialText,
                quantity: '1',
                unit: 'pcs'
              });
            }
          }
          break;
      }
    }
    
    // Add the last phase if exists
    if (currentPhase && currentPhase.title) {
      phases.push({
        id: `phase-${phases.length}`,
        title: currentPhase.title,
        duration: currentPhase.duration || 'TBD',
        description: currentPhase.description || '',
        tasks: currentPhase.tasks || [],
        materials: currentPhase.materials || [],
      });
    }
    
    return phases;
  } catch (error) {
    console.error('Error parsing plan content to phases:', error);
    return [];
  }
};

// Function to convert phases back to markdown content
const phasesToMarkdown = (phases: Phase[]): string => {
  let markdown = '';
  
  phases.forEach((phase, index) => {
    markdown += `# ${phase.title}\n`;
    markdown += `Duration: ${phase.duration}\n\n`;
    
    if (phase.description) {
      markdown += `${phase.description}\n\n`;
    }
    
    if (phase.tasks.length > 0) {
      markdown += `### Tasks\n\n`;
      phase.tasks.forEach(task => {
        markdown += `- ${task.title}\n`;
        if (task.description) {
          markdown += `  ${task.description}\n`;
        }
      });
      markdown += '\n';
    }
    
    if (phase.materials.length > 0) {
      markdown += `### Materials\n\n`;
      phase.materials.forEach(material => {
        markdown += `- ${material.quantity} ${material.unit} of ${material.name}\n`;
      });
      markdown += '\n';
    }
    
    // Add a separator between phases
    if (index < phases.length - 1) {
      markdown += '\n---\n\n';
    }
  });
  
  return markdown;
};

// Update the function to trigger a hard refresh properly
const forceRefresh = () => {
  console.log('Forcing page refresh');
  // Use a different method to force a cache-bypassing reload
  window.location.href = window.location.href + '?refresh=' + Date.now();
};

// Main component
export default function GeneratedPlan() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('My Construction Project Plan');
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<string>('');
  const [editablePlan, setEditablePlan] = useState<string>('');  // For editing the plan
  const [isLoading, setIsLoading] = useState(true);
  const [showCollaborateModal, setShowCollaborateModal] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [planStatus, setPlanStatus] = useState<PlanStatus>('none');
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [phases, setPhases] = useState<Phase[]>([]);

  // Check dark mode
  useEffect(() => {
    const checkDarkMode = () => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();
    
    // Observer for changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Load project data without useCallback to avoid dependency issues
  const loadProjectData = () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Loading project data...");
      
      // In a real app, fetch from API
      // For demo, we'll generate a sample project plan based on localStorage data
      const savedPlanStatus = localStorage.getItem('planStatus') as PlanStatus || 'none';
      setPlanStatus(savedPlanStatus);
      
      const savedPlan = localStorage.getItem('projectPlan');
      
      if (savedPlan) {
        console.log("Found saved plan, parsing phases...");
        // If there's a saved plan, use it
        setGeneratedPlan(savedPlan);
        setEditablePlan(savedPlan);
        
        // Parse the saved plan into phases
        const extractedPhases = parsePlanContentToPhases(savedPlan);
        console.log("Extracted phases:", extractedPhases);
        setPhases(extractedPhases);
        
        setIsLoading(false);
      } else {
        console.log("No saved plan found, generating sample plan...");
        // Otherwise generate a new one
        generateSampleProjectPlan(null);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
      setError('Failed to load project data. Please try again.');
      setIsLoading(false);
    }
  };

  // Use regular useEffect without dependency on the function
  useEffect(() => {
    loadProjectData();
    // No dependencies needed as loadProjectData is defined outside the component
  }, []);

  // Generate sample project plan - updated to use external mock data
  const generateSampleProjectPlan = (data: ProjectData | null) => {
    try {
      setIsGenerating(true);
      
      // In a real app, this would be an API call to an LLM
      // For demo, we'll use mock data
      
      // Simulate API delay
    setTimeout(() => {
        // Use the imported sample plan instead of inline string
        const generatedPlan = SAMPLE_PROJECT_PLAN;

        setGeneratedPlan(generatedPlan);
        setEditablePlan(generatedPlan);
        
        // Parse the generated plan into phases
        const extractedPhases = parsePlanContentToPhases(generatedPlan);
        setPhases(extractedPhases);
        
        setIsGenerating(false);
        setIsLoading(false);
        setPlanStatus('none');
      }, 1500);
    } catch (error) {
      console.error('Error generating project plan:', error);
      setError('Failed to generate project plan. Please try again.');
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  // Add a new empty phase - updated to use createDefaultPhase
  const addNewPhase = () => {
    // Use the imported createDefaultPhase function
    const newPhase = createDefaultPhase(phases.length + 1);
    
    setPhases([...phases, newPhase]);
    setHasUnsavedChanges(true);
  };

  // Handle changes to the editable plan
  const handleEditablePlanChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditablePlan(e.target.value);
    setHasUnsavedChanges(true);
    
    // Parse the new content into phases when editing
    const extractedPhases = parsePlanContentToPhases(e.target.value);
    setPhases(extractedPhases);
  };
  
  // Save the plan (draft or final)
  const savePlan = async (status: PlanStatus) => {
    try {
    setSaving(true);
      
      // Convert current phases back to markdown content
      const updatedContent = editMode ? editablePlan : phasesToMarkdown(phases);
      
      // Save the plan with the updated content
      localStorage.setItem('projectPlan', updatedContent);
      localStorage.setItem('planStatus', status);
      
      setGeneratedPlan(updatedContent);
      setHasUnsavedChanges(false);
    setEditMode(false);
      setPlanStatus(status);
      
      toast({
        title: `Plan ${status === 'draft' ? 'saved as draft' : 'finalized'}`,
        description: `Your project plan has been ${status === 'draft' ? 'saved as a draft' : 'finalized and ready for execution'}.`,
      });
      
      setSaving(false);
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error saving plan',
        description: 'There was an error saving your plan. Please try again.',
        variant: 'destructive',
      });
      setSaving(false);
    }
  };
  
  // Cancel title editing
  const cancelTitleEdit = () => {
    // Reset to the original title if user cancels
    if (projectData && projectData.name) {
      setTitleValue(projectData.name);
    }
    setIsEditingTitle(false);
  };

  // Save edited title
  const saveTitleEdit = () => {
    if (!titleValue.trim()) {
      toast({
        title: "Invalid title",
        description: "Project title cannot be empty.",
        variant: "destructive"
      });
      return;
    }
    
    // Save the new title and update projectData
    if (projectData) {
      const updatedData = { ...projectData, name: titleValue };
      setProjectData(updatedData);
      // In a real app, you might save this back to localStorage or API
      localStorage.setItem('projectData', JSON.stringify(updatedData));
      
      toast({
        title: "Title updated",
        description: "Your project title has been updated.",
        variant: "default"
      });
    }
    setIsEditingTitle(false);
  };

  // Create a wrapper function for the generateSampleProjectPlan call to fix the type error
  const handleRegenerate = () => {
    generateSampleProjectPlan(null);
  };

  // Add a useEffect to log component rendering
  useEffect(() => {
    // Clear previous logs
    console.clear();
    console.log('%c GeneratedPlan Component - Updated Version', 'background: #4f46e5; color: white; padding: 4px 8px; border-radius: 4px;');
    console.log('Project Name:', projectData?.name || 'Not provided');
    console.log('Plan Status:', planStatus);
    console.log('Dark Mode:', isDarkMode);
    console.log('Component mounted with updated UI');
  }, []);

  return (
    <div className="container py-6 max-w-7xl">
      {/* Use the shared PageHeader component */}
      <PageHeader
        title="Construction Plan"
        description="AI-generated construction plan with customizable phases, tasks, and materials"
        icon={<FileText className="h-6 w-6" />}
        actions={
          <div className="flex items-center gap-3">
            {editMode && (
              <Button
                variant="default"
                size="default"
                onClick={() => setEditMode(false)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Check className="h-4 w-4 mr-1.5" />
                Done Editing
              </Button>
            )}
            
            <ActionButtons 
              isGenerating={isGenerating}
              handleRegenerate={handleRegenerate}
              navigateToProjectInput={() => navigate('/projects')}
              setShowCollaborateModal={setShowCollaborateModal}
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={forceRefresh}
              className="text-white/80 hover:text-white hover:bg-white/10"
              title="Force refresh page"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        }
      />
      
      {/* Add Phase and Save buttons moved outside of PageHeader */}
      {!editMode && (
        <div className="flex items-center justify-between mb-6 mt-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="default"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/30"
              onClick={addNewPhase}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Phase
            </Button>
            
            <Button 
              variant="outline" 
              size="default"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 relative"
              onClick={() => setShowActionMenu(!showActionMenu)}
            >
              <Save className="h-4 w-4 mr-1.5" />
              Save Plan
              {showActionMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-10 border border-gray-200 dark:border-gray-700 w-48">
                  <div className="flex flex-col gap-1">
                    <Button
                      onClick={() => {
                        savePlan('draft');
                        setShowActionMenu(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                      Save as Draft
                    </Button>
                    <Button
                      onClick={() => {
                        savePlan('final');
                        setShowActionMenu(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="justify-start text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                      Finalize Plan
                    </Button>
                  </div>
                </div>
              )}
            </Button>
          </div>
          
          {/* Project name display */}
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Project: <span className="font-medium text-gray-700 dark:text-gray-300">{projectData?.name || 'New Construction Project'}</span>
          </div>
        </div>
      )}
      
      {/* Main Content - Timeline focused */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading your project timeline...</p>
        </div>
        ) : (
          <>
            {/* Timeline View */}
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow transition-shadow duration-300 plan-card">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border-b border-gray-200 dark:border-gray-800 plan-card-header">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-blue-700 dark:text-blue-400 plan-card-title">
                      <Calendar className="h-5 w-5 mr-2" />
                      Proposed plan for {projectData?.name || 'your construction project'}
                    </CardTitle>
                    <CardDescription className="plan-card-description">
                      Construction phases with timeline, tasks, and material requirements
                    </CardDescription>
      </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditMode(!editMode)}
                    className="flex items-center gap-2"
                  >
                    {editMode ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Exit Edit Mode</span>
                      </>
                    ) : (
                      <>
                        <Pencil className="h-4 w-4" />
                        <span>Edit Plan</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {editMode ? (
                  <div className="p-6">
                    <MarkdownEditor 
                      value={editablePlan} 
                      onChange={handleEditablePlanChange}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                ) : (
                  <div className="p-6">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">Loading project phases...</p>
                      </div>
                    ) : error ? (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-red-800 dark:text-red-400">Error loading phases</h4>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                          </div>
                        </div>
                      </div>
                    ) : phases && phases.length > 0 ? (
                      <ProjectPhaseManager 
                        phases={phases} 
                        setPhases={(newPhases) => {
                          console.log("Updating phases:", newPhases);
                          setPhases(newPhases);
                          setHasUnsavedChanges(true);
                        }} 
                        isDarkMode={isDarkMode} 
                      />
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="mb-4">
                          <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No project phases found</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-2">
                          You haven't created any phases for this project yet. Generate a plan or add phases manually.
                        </p>
                        <div className="mt-6 flex justify-center gap-3">
                          <Button 
                            onClick={() => generateSampleProjectPlan(null)} 
                            variant="default"
                            className="gap-2"
                            disabled={isGenerating}
                          >
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            Generate Plan
                          </Button>
                          <Button 
                            onClick={addNewPhase} 
                            variant="outline" 
                            className="gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add Phase Manually
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {TIMELINE_INSIGHTS.map((insight, index) => (
                <InsightItem
                  key={`insight-${index}`}
                  title={insight.title}
                  description={insight.description}
                  icon={
                    insight.title === "Construction Schedule" ? <Calendar className="h-5 w-5" /> :
                    insight.title === "Milestone Planning" ? <CheckCircle className="h-5 w-5" /> :
                    insight.title === "Seasonal Considerations" ? <Sun className="h-5 w-5" /> : 
                    undefined
                  }
                  type={insight.type as 'default' | 'warning' | 'success'}
                  animationDelay={insight.animationDelay}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
