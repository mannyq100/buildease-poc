import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Edit2, PlusCircle, AlertCircle } from 'lucide-react';
import PhaseCard from './PhaseCard';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Sample data for phases
const projectPhases = [
  {
    id: 'phase-1',
    name: 'Site Preparation & Foundation',
    duration: '6 weeks',
    budget: '₵30,000',
    team: 5,
    tasks: 12,
    status: 'optimized' as const,
    taskItems: [
      {
        id: 'task-1-1',
        name: 'Site clearing and leveling',
        duration: '1 week',
        status: 'completed' as const
      },
      {
        id: 'task-1-2',
        name: 'Soil testing and analysis',
        duration: '3 days',
        status: 'completed' as const
      },
      {
        id: 'task-1-3',
        name: 'Foundation excavation',
        duration: '1 week',
        status: 'in-progress' as const
      },
      {
        id: 'task-1-4',
        name: 'Foundation reinforcement',
        duration: '1 week',
        status: 'pending' as const
      },
      {
        id: 'task-1-5',
        name: 'Concrete pouring and curing',
        duration: '2 weeks',
        status: 'pending' as const
      }
    ],
    materialItems: [
      {
        id: 'mat-1-1',
        name: 'Portland cement',
        quantity: '120',
        unit: 'bags',
        status: 'delivered' as const
      },
      {
        id: 'mat-1-2',
        name: 'Sand',
        quantity: '15',
        unit: 'cubic meters',
        status: 'delivered' as const
      },
      {
        id: 'mat-1-3',
        name: 'Gravel',
        quantity: '20',
        unit: 'cubic meters',
        status: 'ordered' as const
      },
      {
        id: 'mat-1-4',
        name: 'Steel reinforcement bars',
        quantity: '2.5',
        unit: 'tons',
        status: 'not-ordered' as const
      }
    ]
  },
  {
    id: 'phase-2',
    name: 'Structural Work',
    duration: '12 weeks',
    budget: '₵45,000',
    team: 8,
    tasks: 15,
    status: 'warning' as const,
    warning: 'Consider additional skilled labor',
    taskItems: [
      {
        id: 'task-2-1',
        name: 'Column and beam framing',
        duration: '3 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-2-2',
        name: 'Wall construction - Ground floor',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-2-3',
        name: 'First floor slab construction',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-2-4',
        name: 'Wall construction - First floor',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-2-5',
        name: 'Staircase construction',
        duration: '1 week',
        status: 'pending' as const
      }
    ],
    materialItems: [
      {
        id: 'mat-2-1',
        name: 'Concrete blocks (6-inch)',
        quantity: '3,200',
        unit: 'pieces',
        status: 'ordered' as const
      },
      {
        id: 'mat-2-2',
        name: 'Portland cement',
        quantity: '280',
        unit: 'bags',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-2-3',
        name: 'Steel reinforcement bars',
        quantity: '4',
        unit: 'tons',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-2-4',
        name: 'Sand',
        quantity: '28',
        unit: 'cubic meters',
        status: 'not-ordered' as const
      }
    ]
  },
  {
    id: 'phase-3',
    name: 'Roofing & Exterior',
    duration: '8 weeks',
    budget: '₵35,000',
    team: 6,
    tasks: 10,
    status: 'optimized' as const,
    taskItems: [
      {
        id: 'task-3-1',
        name: 'Roof truss installation',
        duration: '1 week',
        status: 'pending' as const
      },
      {
        id: 'task-3-2',
        name: 'Roof sheeting and flashing',
        duration: '1 week',
        status: 'pending' as const
      },
      {
        id: 'task-3-3',
        name: 'External rendering and plastering',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-3-4',
        name: 'External painting and finishing',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-3-5',
        name: 'External door and window installation',
        duration: '1 week',
        status: 'pending' as const
      }
    ],
    materialItems: [
      {
        id: 'mat-3-1',
        name: 'Roof timbers (treated)',
        quantity: '250',
        unit: 'meters',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-3-2',
        name: 'Metal roofing sheets',
        quantity: '85',
        unit: 'sheets',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-3-3',
        name: 'Aluminum windows',
        quantity: '18',
        unit: 'pieces',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-3-4',
        name: 'External doors',
        quantity: '6',
        unit: 'pieces',
        status: 'not-ordered' as const
      }
    ]
  },
  {
    id: 'phase-4',
    name: 'Interior & Finishing',
    duration: '10 weeks',
    budget: '₵38,000',
    team: 7,
    tasks: 14,
    status: 'optimized' as const,
    taskItems: [
      {
        id: 'task-4-1',
        name: 'Internal wall plastering',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-4-2',
        name: 'Electrical wiring and fixtures',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-4-3',
        name: 'Plumbing installations',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-4-4',
        name: 'Flooring installation',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-4-5',
        name: 'Interior painting and decoration',
        duration: '2 weeks',
        status: 'pending' as const
      }
    ],
    materialItems: [
      {
        id: 'mat-4-1',
        name: 'Ceramic floor tiles',
        quantity: '180',
        unit: 'square meters',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-4-2',
        name: 'Electrical cables and fixtures',
        quantity: '1',
        unit: 'lot',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-4-3',
        name: 'Plumbing pipes and fixtures',
        quantity: '1',
        unit: 'lot',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-4-4',
        name: 'Interior doors',
        quantity: '12',
        unit: 'pieces',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-4-5',
        name: 'Interior paint',
        quantity: '80',
        unit: 'liters',
        status: 'not-ordered' as const
      }
    ]
  }
];

const ProjectPhases = () => {
  // Check if dark mode is enabled
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const [phases, setPhases] = useState(projectPhases);
  const [showAddPhaseDialog, setShowAddPhaseDialog] = useState(false);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [currentPhaseId, setCurrentPhaseId] = useState<string | null>(null);
  
  // New phase form state
  const [newPhase, setNewPhase] = useState({
    name: '',
    duration: '',
    budget: '',
    team: '1',
    status: 'optimized' as const
  });
  
  // New task form state
  const [newTask, setNewTask] = useState({
    name: '',
    duration: '',
    status: 'pending' as const
  });
  
  const handleAddPhase = () => {
    const phaseId = `phase-${Date.now()}`;
    const newPhaseData = {
      id: phaseId,
      name: newPhase.name,
      duration: newPhase.duration,
      budget: newPhase.budget.startsWith('₵') ? newPhase.budget : `₵${newPhase.budget}`,
      team: parseInt(newPhase.team, 10),
      tasks: 0,
      status: newPhase.status,
      taskItems: [],
      materialItems: []
    };
    
    setPhases(prev => [...prev, newPhaseData]);
    setShowAddPhaseDialog(false);
    setNewPhase({
      name: '',
      duration: '',
      budget: '',
      team: '1',
      status: 'optimized'
    });
    
    toast({
      title: "Phase Added",
      description: `${newPhase.name} has been added to your project.`,
    });
  };
  
  const handleAddTask = () => {
    if (!currentPhaseId) return;
    
    const taskId = `task-${Date.now()}`;
    const newTaskData = {
      id: taskId,
      name: newTask.name,
      duration: newTask.duration,
      status: newTask.status
    };
    
    setPhases(prev => prev.map(phase => {
      if (phase.id === currentPhaseId) {
        const updatedTaskItems = [...phase.taskItems, newTaskData];
        return {
          ...phase,
          tasks: updatedTaskItems.length,
          taskItems: updatedTaskItems
        };
      }
      return phase;
    }));
    
    setShowAddTaskDialog(false);
    setNewTask({
      name: '',
      duration: '',
      status: 'pending'
    });
    
    toast({
      title: "Task Added",
      description: `${newTask.name} has been added to the phase.`,
    });
  };
  
  const openAddTaskDialog = (phaseId: string) => {
    setCurrentPhaseId(phaseId);
    setShowAddTaskDialog(true);
  };
  
  return (
    <Card className={`overflow-hidden border ${
      isDarkMode ? "bg-slate-800/90 border-slate-700" : "border-gray-200 bg-white"
    }`}>
      <CardHeader className={isDarkMode ? "border-b border-slate-700" : "bg-gray-50/50 border-b border-gray-100"}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className={isDarkMode ? "w-5 h-5 text-blue-400" : "w-5 h-5 text-blue-600"} />
            <span className={isDarkMode ? "text-xl text-white" : "text-xl text-gray-900"}>Generated Project Phases</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={isDarkMode 
                ? "hover:bg-slate-700 border-slate-700 text-slate-300" 
                : "hover:bg-gray-50 transition-colors"
              }
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Adjust Phases
            </Button>
            <Button 
              size="sm" 
              onClick={() => setShowAddPhaseDialog(true)}
              className={isDarkMode 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-blue-600 hover:bg-blue-700"
              }
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Phase
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {phases.map((phase) => (
          <div key={phase.id} className="relative group">
            <PhaseCard 
              name={phase.name}
              duration={phase.duration}
              budget={phase.budget}
              team={phase.team}
              tasks={phase.tasks}
              status={phase.status}
              warning={phase.warning}
              taskItems={phase.taskItems}
              materialItems={phase.materialItems}
            />
            <div className="absolute top-4 right-16 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost" 
                      size="icon"
                      onClick={() => openAddTaskDialog(phase.id)}
                      className={`w-8 h-8 rounded-full ${
                        isDarkMode 
                          ? "bg-slate-700 text-slate-300 hover:bg-slate-600" 
                          : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add task to this phase</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}
        
        {phases.length === 0 && (
          <div className={`text-center py-12 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No phases have been created yet</p>
            <Button 
              className="mt-4"
              variant="outline"
              onClick={() => setShowAddPhaseDialog(true)}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Your First Phase
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Add Phase Dialog */}
      <Dialog open={showAddPhaseDialog} onOpenChange={setShowAddPhaseDialog}>
        <DialogContent className={isDarkMode ? "bg-slate-800 border-slate-700 text-white" : ""}>
          <DialogHeader>
            <DialogTitle>Add New Phase</DialogTitle>
            <DialogDescription className={isDarkMode ? "text-slate-400" : ""}>
              Create a new phase for your construction project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phase-name" className={isDarkMode ? "text-slate-300" : ""}>Phase Name</Label>
              <Input 
                id="phase-name" 
                value={newPhase.name}
                onChange={(e) => setNewPhase({...newPhase, name: e.target.value})}
                className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : ""}
                placeholder="e.g., Foundation Work"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phase-duration" className={isDarkMode ? "text-slate-300" : ""}>Duration</Label>
                <Input 
                  id="phase-duration" 
                  value={newPhase.duration}
                  onChange={(e) => setNewPhase({...newPhase, duration: e.target.value})}
                  className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : ""}
                  placeholder="e.g., 4 weeks"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phase-budget" className={isDarkMode ? "text-slate-300" : ""}>Budget</Label>
                <Input 
                  id="phase-budget" 
                  value={newPhase.budget}
                  onChange={(e) => setNewPhase({...newPhase, budget: e.target.value})}
                  className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : ""}
                  placeholder="e.g., ₵25,000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phase-team" className={isDarkMode ? "text-slate-300" : ""}>Team Size</Label>
                <Input 
                  id="phase-team" 
                  type="number"
                  min="1"
                  value={newPhase.team}
                  onChange={(e) => setNewPhase({...newPhase, team: e.target.value})}
                  className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : ""}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phase-status" className={isDarkMode ? "text-slate-300" : ""}>Status</Label>
                <Select 
                  value={newPhase.status} 
                  onValueChange={(value) => setNewPhase({...newPhase, status: value as "optimized" | "warning"})}
                >
                  <SelectTrigger id="phase-status" className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="optimized">Optimized</SelectItem>
                    <SelectItem value="warning">Needs Attention</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddPhaseDialog(false)}
              className={isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-700" : ""}
            >
              Cancel
            </Button>
            <Button onClick={handleAddPhase}>Add Phase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Task Dialog */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent className={isDarkMode ? "bg-slate-800 border-slate-700 text-white" : ""}>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription className={isDarkMode ? "text-slate-400" : ""}>
              Add a task to the selected phase.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-name" className={isDarkMode ? "text-slate-300" : ""}>Task Name</Label>
              <Input 
                id="task-name" 
                value={newTask.name}
                onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : ""}
                placeholder="e.g., Pour concrete foundation"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="task-duration" className={isDarkMode ? "text-slate-300" : ""}>Duration</Label>
              <Input 
                id="task-duration" 
                value={newTask.duration}
                onChange={(e) => setNewTask({...newTask, duration: e.target.value})}
                className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : ""}
                placeholder="e.g., 3 days"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="task-status" className={isDarkMode ? "text-slate-300" : ""}>Status</Label>
              <Select 
                value={newTask.status} 
                onValueChange={(value) => setNewTask({...newTask, status: value as "pending" | "in-progress" | "completed"})}
              >
                <SelectTrigger id="task-status" className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : ""}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddTaskDialog(false)}
              className={isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-700" : ""}
            >
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProjectPhases;
