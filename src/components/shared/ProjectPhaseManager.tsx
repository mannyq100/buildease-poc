/**
 * Unified ProjectPhaseManager component
 * Displays and manages construction project phases with tasks and materials
 */
import React, { useState, useEffect } from 'react';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion';
import { 
  ChevronRight, 
  Clock, 
  Pencil, 
  Trash2, 
  Plus, 
  X, 
  Calendar,
  CheckCircle,
  Sun,
  Sparkles,
  AlertCircle,
  PlusCircle,
  Edit2,
  Package,
  Users
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import PhaseCard from './PhaseCard';
import { v4 as uuidv4 } from 'uuid';

// Types
interface Task {
  id: string;
  title: string;
  name?: string; // For compatibility with both implementations
  duration?: string;
  description?: string;
  completed: boolean;
  status?: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
}

interface Material {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface Phase {
  id: string;
  title: string;
  name?: string; // For compatibility with both implementations
  duration: string;
  startDate?: string;
  endDate?: string;
  tasks: Task[];
  materials: Material[];
  description?: string;
  progress?: number;
  status?: 'completed' | 'in-progress' | 'upcoming' | 'warning' | 'optimized';
  budget?: string;
  spent?: string;
  team?: TeamMember[];
}

interface ProjectPhaseManagerProps {
  phases: Phase[];
  setPhases: (phases: Phase[]) => void;
  isDarkMode?: boolean;
  editable?: boolean;
  showInsights?: boolean;
  title?: string;
  description?: string;
  onPhaseClick?: (phaseId: string) => void;
}

export function ProjectPhaseManager({ 
  phases, 
  setPhases, 
  isDarkMode = false,
  editable = true,
  showInsights = false,
  title = "Project Phases",
  description,
  onPhaseClick
}: ProjectPhaseManagerProps) {
  // State for editing and expanding phases
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState<string | null>(null);
  const [showAddMaterial, setShowAddMaterial] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [newMaterial, setNewMaterial] = useState({ name: '', quantity: '', unit: 'pcs' });
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  
  // Dialog states
  const [showAddPhaseDialog, setShowAddPhaseDialog] = useState(false);
  const [newPhase, setNewPhase] = useState<Partial<Phase>>({
    title: '',
    duration: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'upcoming'
  });
  
  // Toggle phase expansion
  const togglePhaseExpand = (phaseId: string) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  // Add a new phase
  const handleAddPhase = () => {
    if (!newPhase.title) {
      toast.error("Phase title is required");
      return;
    }

    const phase: Phase = {
      id: uuidv4(),
      title: newPhase.title || '',
      name: newPhase.title || '', // For compatibility
      duration: newPhase.duration || '2 weeks',
      startDate: newPhase.startDate,
      endDate: newPhase.endDate,
      description: newPhase.description,
      status: newPhase.status || 'upcoming',
      progress: 0,
      tasks: [],
      materials: [],
      team: []
    };

    setPhases([...phases, phase]);
    setNewPhase({
      title: '',
      duration: '',
      startDate: '',
      endDate: '',
      description: '',
      status: 'upcoming'
    });
    setShowAddPhaseDialog(false);
    toast.success("Phase added successfully");
  };

  // Delete a phase
  const handleDeletePhase = (phaseId: string) => {
    const updatedPhases = phases.filter(phase => phase.id !== phaseId);
    setPhases(updatedPhases);
    toast.success("Phase deleted successfully");
  };

  // Edit a phase
  const handleEditPhase = (phaseId: string) => {
    setEditingPhaseId(phaseId);
    const phase = phases.find(p => p.id === phaseId);
    if (phase) {
      setNewPhase({
        title: phase.title || phase.name,
        duration: phase.duration,
        startDate: phase.startDate,
        endDate: phase.endDate,
        description: phase.description,
        status: phase.status || 'upcoming'
      });
      setShowAddPhaseDialog(true);
    }
  };

  // Update a phase
  const handleUpdatePhase = () => {
    if (!editingPhaseId) return;
    
    const updatedPhases = phases.map(phase => {
      if (phase.id === editingPhaseId) {
        return {
          ...phase,
          title: newPhase.title || '',
          name: newPhase.title || '', // For compatibility
          duration: newPhase.duration || phase.duration,
          startDate: newPhase.startDate,
          endDate: newPhase.endDate,
          description: newPhase.description,
          status: newPhase.status || phase.status
        };
      }
      return phase;
    });
    
    setPhases(updatedPhases);
    setEditingPhaseId(null);
    setShowAddPhaseDialog(false);
    toast.success("Phase updated successfully");
  };

  // Add a task to a phase
  const handleAddTask = (phaseId: string) => {
    if (!newTask.title) {
      toast.error("Task title is required");
      return;
    }

    const task: Task = {
      id: uuidv4(),
      title: newTask.title,
      name: newTask.title, // For compatibility
      description: newTask.description,
      completed: false,
      status: 'pending'
    };

    const updatedPhases = phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: [...phase.tasks, task]
        };
      }
      return phase;
    });

    setPhases(updatedPhases);
    setNewTask({ title: '', description: '' });
    setShowAddTask(null);
    toast.success("Task added successfully");
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
    toast.success("Task deleted successfully");
  };

  // Add a material to a phase
  const handleAddMaterial = (phaseId: string) => {
    if (!newMaterial.name || !newMaterial.quantity) {
      toast.error("Material name and quantity are required");
      return;
    }

    const material: Material = {
      id: uuidv4(),
      name: newMaterial.name,
      quantity: newMaterial.quantity,
      unit: newMaterial.unit
    };

    const updatedPhases = phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          materials: [...phase.materials, material]
        };
      }
      return phase;
    });

    setPhases(updatedPhases);
    setNewMaterial({ name: '', quantity: '', unit: 'pcs' });
    setShowAddMaterial(null);
    toast.success("Material added successfully");
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
    toast.success("Material deleted successfully");
  };

  // Toggle task completion
  const toggleTaskCompletion = (phaseId: string, taskId: string) => {
    const updatedPhases = phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map(task => {
            if (task.id === taskId) {
              const completed = !task.completed;
              return {
                ...task,
                completed,
                status: completed ? 'completed' : 'pending'
              };
            }
            return task;
          })
        };
      }
      return phase;
    });

    setPhases(updatedPhases);
  };

  // Calculate phase progress based on completed tasks
  useEffect(() => {
    if (phases.length > 0) {
      const updatedPhases = phases.map(phase => {
        const totalTasks = phase.tasks.length;
        const completedTasks = phase.tasks.filter(task => task.completed).length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Determine status based on progress
        let status: Phase['status'] = phase.status;
        if (!status || status === 'upcoming' || status === 'in-progress') {
          if (progress === 100) {
            status = 'completed';
          } else if (progress > 0) {
            status = 'in-progress';
          } else {
            status = 'upcoming';
          }
        }
        
        return {
          ...phase,
          progress,
          status
        };
      });
      
      if (JSON.stringify(updatedPhases) !== JSON.stringify(phases)) {
        setPhases(updatedPhases);
      }
    }
  }, [phases]);

  return (
    <LazyMotion features={domAnimation}>
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold flex items-center">
              {title}
              {showInsights && (
                <Badge className="ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  AI Enhanced
                </Badge>
              )}
            </CardTitle>
            {editable && (
              <Button 
                onClick={() => {
                  setEditingPhaseId(null);
                  setNewPhase({
                    title: '',
                    duration: '',
                    startDate: '',
                    endDate: '',
                    description: '',
                    status: 'upcoming'
                  });
                  setShowAddPhaseDialog(true);
                }}
                size="sm"
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Phase
              </Button>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {phases.length > 0 ? (
            <div className="space-y-4">
              {phases.map((phase) => (
                <PhaseCard
                  key={phase.id}
                  name={phase.title || phase.name || ''}
                  progress={phase.progress || 0}
                  status={phase.status || 'upcoming'}
                  duration={phase.duration}
                  startDate={phase.startDate}
                  endDate={phase.endDate}
                  budget={phase.budget}
                  spent={phase.spent}
                  expanded={expandedPhases[phase.id]}
                  onToggleExpand={() => togglePhaseExpand(phase.id)}
                  tasks={phase.tasks.map(task => ({
                    id: task.id,
                    name: task.title || task.name || '',
                    duration: task.duration,
                    status: task.status || (task.completed ? 'completed' : 'pending')
                  }))}
                  materials={phase.materials}
                  team={phase.team}
                  editable={editable}
                  onEditPhase={() => handleEditPhase(phase.id)}
                  onAddTask={() => setShowAddTask(phase.id)}
                  onAddMaterial={() => setShowAddMaterial(phase.id)}
                  onClick={onPhaseClick ? () => onPhaseClick(phase.id) : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No phases added yet</p>
              {editable && (
                <Button 
                  onClick={() => {
                    setEditingPhaseId(null);
                    setNewPhase({
                      title: '',
                      duration: '',
                      startDate: '',
                      endDate: '',
                      description: '',
                      status: 'upcoming'
                    });
                    setShowAddPhaseDialog(true);
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Your First Phase
                </Button>
              )}
            </div>
          )}

          {/* Add/Edit Phase Dialog */}
          <Dialog open={showAddPhaseDialog} onOpenChange={setShowAddPhaseDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingPhaseId ? 'Edit Phase' : 'Add New Phase'}</DialogTitle>
                <DialogDescription>
                  {editingPhaseId 
                    ? 'Update the details of this construction phase' 
                    : 'Add a new phase to your construction project'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="phase-title">Phase Title</Label>
                  <Input
                    id="phase-title"
                    value={newPhase.title || ''}
                    onChange={(e) => setNewPhase({...newPhase, title: e.target.value})}
                    placeholder="e.g., Foundation Work"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phase-duration">Duration</Label>
                  <Input
                    id="phase-duration"
                    value={newPhase.duration || ''}
                    onChange={(e) => setNewPhase({...newPhase, duration: e.target.value})}
                    placeholder="e.g., 2 weeks"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phase-start">Start Date</Label>
                    <Input
                      id="phase-start"
                      type="date"
                      value={newPhase.startDate || ''}
                      onChange={(e) => setNewPhase({...newPhase, startDate: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phase-end">End Date</Label>
                    <Input
                      id="phase-end"
                      type="date"
                      value={newPhase.endDate || ''}
                      onChange={(e) => setNewPhase({...newPhase, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phase-status">Status</Label>
                  <Select
                    value={newPhase.status}
                    onValueChange={(value) => setNewPhase({...newPhase, status: value as Phase['status']})}
                  >
                    <SelectTrigger id="phase-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="warning">Needs Attention</SelectItem>
                      <SelectItem value="optimized">AI Optimized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phase-description">Description (Optional)</Label>
                  <Textarea
                    id="phase-description"
                    value={newPhase.description || ''}
                    onChange={(e) => setNewPhase({...newPhase, description: e.target.value})}
                    placeholder="Brief description of this phase"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddPhaseDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={editingPhaseId ? handleUpdatePhase : handleAddPhase}>
                  {editingPhaseId ? 'Update Phase' : 'Add Phase'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Task Form */}
          {showAddTask && (
            <Dialog open={!!showAddTask} onOpenChange={() => setShowAddTask(null)}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>
                    Add a task to this construction phase
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input
                      id="task-title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      placeholder="e.g., Pour concrete foundation"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="task-description">Description (Optional)</Label>
                    <Textarea
                      id="task-description"
                      value={newTask.description || ''}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      placeholder="Brief description of this task"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddTask(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleAddTask(showAddTask)}>
                    Add Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Add Material Form */}
          {showAddMaterial && (
            <Dialog open={!!showAddMaterial} onOpenChange={() => setShowAddMaterial(null)}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Material</DialogTitle>
                  <DialogDescription>
                    Add a material requirement to this construction phase
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="material-name">Material Name</Label>
                    <Input
                      id="material-name"
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                      placeholder="e.g., Cement"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="material-quantity">Quantity</Label>
                      <Input
                        id="material-quantity"
                        value={newMaterial.quantity}
                        onChange={(e) => setNewMaterial({...newMaterial, quantity: e.target.value})}
                        placeholder="e.g., 50"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="material-unit">Unit</Label>
                      <Select
                        value={newMaterial.unit}
                        onValueChange={(value) => setNewMaterial({...newMaterial, unit: value})}
                      >
                        <SelectTrigger id="material-unit">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pcs">Pieces</SelectItem>
                          <SelectItem value="kg">Kilograms</SelectItem>
                          <SelectItem value="tons">Tons</SelectItem>
                          <SelectItem value="bags">Bags</SelectItem>
                          <SelectItem value="m">Meters</SelectItem>
                          <SelectItem value="m2">Square Meters</SelectItem>
                          <SelectItem value="m3">Cubic Meters</SelectItem>
                          <SelectItem value="liters">Liters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddMaterial(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleAddMaterial(showAddMaterial)}>
                    Add Material
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </LazyMotion>
  );
}

export default ProjectPhaseManager; 