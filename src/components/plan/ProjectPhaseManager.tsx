/**
 * ProjectPhaseManager component
 * Displays and manages construction project phases with tasks and materials
 */
import React, { useState, useEffect } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { 
  ChevronRight, 
  Clock, 
  Pencil, 
  Trash2, 
  Plus, 
  X, 
  Calendar,
  CheckCircle,
  Sun
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

import { Phase, Task, Material } from '@/types/projectInputs';

interface ProjectPhaseManagerProps {
  phases: Phase[];
  setPhases: (phases: Phase[]) => void;
  isDarkMode: boolean;
}

export function ProjectPhaseManager({ phases, setPhases, isDarkMode }: ProjectPhaseManagerProps) {
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState<string | null>(null);
  const [showAddMaterial, setShowAddMaterial] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [newMaterial, setNewMaterial] = useState({ name: '', quantity: '', unit: 'pcs' });
  
  // Track expanded sections state
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
      {phases.map((phase, index) => {
        const phaseProgress = calculatePhaseProgress(phase);
        const hasExpandedSections = expandedSections[phase.id];
        const isTasksExpanded = hasExpandedSections?.tasks;
        const isMaterialsExpanded = hasExpandedSections?.materials;
        
        return (
          <Card 
            key={phase.id} 
            className="border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
          >
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
                  Phase {index + 1}: {phase.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setEditingPhaseId(editingPhaseId === phase.id ? null : phase.id)}
                    className="h-8 w-8 text-gray-500"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeletePhase(phase.id)}
                    className="h-8 w-8 text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4 mr-1" />
                <span>Duration: {phase.duration}</span>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{phaseProgress}% complete</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {phase.tasks.filter(t => t.completed).length}/{phase.tasks.length} tasks
                </span>
              </div>
            </div>
            
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
            
            {phase.description && editingPhaseId !== phase.id && (
              <div className="p-4 border-b border-gray-100 dark:border-gray-800/70">
                <p className="text-gray-600 dark:text-gray-300 text-sm">{phase.description}</p>
              </div>
            )}
            
            <div>
              {/* Tasks Section */}
              <div className="border-b border-gray-100 dark:border-gray-800">
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => toggleSection(phase.id, 'tasks')}
                >
                  <div className="flex items-center">
                    <ChevronRight className={`h-5 w-5 mr-2 text-gray-400 transition-transform duration-200 ${isTasksExpanded ? 'rotate-90' : ''}`} />
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Tasks ({phase.tasks.length})
                    </h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddTask(showAddTask === phase.id ? null : phase.id);
                    }}
                    className="text-blue-600 dark:text-blue-400 h-7 px-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
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
                      <div className="p-4 mx-4 mb-4 border border-blue-100 dark:border-blue-900/30 rounded-md bg-blue-50/50 dark:bg-blue-900/10">
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
                      <div className="space-y-1 p-4 pt-0">
                        {phase.tasks.length > 0 ? (
                          phase.tasks.map(task => (
                            <div
                              key={task.id}
                              className="p-3 border border-gray-200 dark:border-gray-700 rounded-md flex items-start justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
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
                            </div>
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
              <div>
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => toggleSection(phase.id, 'materials')}
                >
                  <div className="flex items-center">
                    <ChevronRight className={`h-5 w-5 mr-2 text-gray-400 transition-transform duration-200 ${isMaterialsExpanded ? 'rotate-90' : ''}`} />
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Materials ({phase.materials.length})
                    </h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddMaterial(showAddMaterial === phase.id ? null : phase.id);
                    }}
                    className="text-green-600 dark:text-green-400 h-7 px-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
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
                      <div className="p-4 mx-4 mb-4 border border-green-100 dark:border-green-900/30 rounded-md bg-green-50/50 dark:bg-green-900/10">
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
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0">
                        {phase.materials.length > 0 ? (
                          <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
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
                        ) : (
                          <div className="py-3 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No materials added yet.</p>
                          </div>
                        )}
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// Insight cards component
export function PlanInsights() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30">
        <CardContent className="p-4">
          <div className="flex items-start">
            <div className="bg-blue-100 dark:bg-blue-800/30 p-2 rounded-md mr-3">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-blue-700 dark:text-blue-400">Construction Schedule</h3>
              <p className="text-sm text-blue-600/80 dark:text-blue-300/80 mt-1">
                The timeline follows local construction best practices with contingency planning for weather delays.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30">
        <CardContent className="p-4">
          <div className="flex items-start">
            <div className="bg-green-100 dark:bg-green-800/30 p-2 rounded-md mr-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-green-700 dark:text-green-400">Milestone Planning</h3>
              <p className="text-sm text-green-600/80 dark:text-green-300/80 mt-1">
                Critical path analysis shows key dependencies between phases to minimize delays.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30">
        <CardContent className="p-4">
          <div className="flex items-start">
            <div className="bg-amber-100 dark:bg-amber-800/30 p-2 rounded-md mr-3">
              <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium text-amber-700 dark:text-amber-400">Seasonal Considerations</h3>
              <p className="text-sm text-amber-600/80 dark:text-amber-300/80 mt-1">
                Foundation work scheduled outside rainy season (April-July) to avoid delays.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}