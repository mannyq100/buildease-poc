import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Helmet } from 'react-helmet-async'
import { motion as m } from 'framer-motion'
import { 
  FileText,
  Plus, 
  RefreshCw, 
  Save, 
  CheckCircle,
  Share2,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Home,
  Edit,
  MoreHorizontal,
  Layers,
  Package,
  DollarSign,
  Users,
  Printer,
  Download
} from 'lucide-react'

import { OverviewView } from '@/components/plan/OverviewView'
import { TimelineView } from '@/components/plan/TimelineView'
import { MaterialsView } from '@/components/plan/MaterialsView'
import { BudgetView } from '@/components/plan/BudgetView'
import { TeamView } from '@/components/plan/TeamView'
import { DocumentsView } from '@/components/plan/DocumentsView'
import { DistributeModal } from '@/components/plan/DistributeModal'
import { PhaseFormModal } from '@/components/plan/PhaseFormModal'
import { TaskFormModal } from '@/components/plan/TaskFormModal'
import { MaterialFormModal } from '@/components/plan/MaterialFormModal'
import { DateEditModal } from '@/components/plan/DateEditModal'
import { mockConstructionPlan, ConstructionPlan, Phase, Task, Material } from '@/data/mock/generatedPlan/planData'
import { toast } from 'sonner'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/shared/PageHeader'
import { v4 as uuidv4 } from 'uuid'

export default function GeneratedPlan() {
  const navigate = useNavigate()
  
  // State variables
  const [plan, setPlan] = useState<ConstructionPlan>(mockConstructionPlan)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeView, setActiveView] = useState('overview')
  const [showDistributeModal, setShowDistributeModal] = useState(false)
  const [isDistributing, setIsDistributing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form modal states
  const [showPhaseModal, setShowPhaseModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [showDateEditModal, setShowDateEditModal] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<Phase | undefined>(undefined)
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined)
  const [currentMaterial, setCurrentMaterial] = useState<Material | undefined>(undefined)
  const [currentPhaseId, setCurrentPhaseId] = useState<string>('')
  const [isNewItem, setIsNewItem] = useState(true)
  const [dateEditType, setDateEditType] = useState<'project' | 'phase'>('project')
  
  // Check system dark mode preference on component mount
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(darkModeMediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches)
    }
    
    darkModeMediaQuery.addEventListener('change', handleChange)
    return () => darkModeMediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Regenerate plan function
  const handleRegenerate = () => {
    setIsGenerating(true)
    
    // Simulate API call delay
    setTimeout(() => {
      // Reset to fresh mock data
      setPlan({...mockConstructionPlan})
      setIsGenerating(false)
      
      toast.success('Plan regenerated successfully')
    }, 2000)
  }

  // Save plan function
  const handleSavePlan = (status: 'draft' | 'final' = 'draft') => {
    setSaving(true)
    
    // Simulate API call delay
    setTimeout(() => {
      setPlan(prev => ({
        ...prev,
        status,
        lastUpdated: new Date().toISOString()
      }))
      setSaving(false)
      
      toast.success(`Plan saved as ${status === 'draft' ? 'Draft' : 'Final'}`)
    }, 1500)
  }

  // Distribute plan function
  const handleDistribute = () => {
    setIsDistributing(true)
    
    // Simulate API call delay
    setTimeout(() => {
      setIsDistributing(false)
      setShowDistributeModal(false)
      
      toast.success('Plan distributed to team members')
    }, 2000)
  }

  // Add a new phase
  const handleAddPhase = () => {
    setCurrentPhase(undefined)
    setIsNewItem(true)
    setShowPhaseModal(true)
  }

  // Functions for phase management
  const handleEditPhase = (phaseId: string) => {
    const phase = plan.phases.find(p => p.id === phaseId)
    if (phase) {
      setCurrentPhase(phase)
      setIsNewItem(false)
      setShowPhaseModal(true)
    }
  }

  const handleDeletePhase = (phaseId: string) => {
    // Confirm deletion
    if (window.confirm(`Are you sure you want to delete this phase?`)) {
      // Update the plan by removing the phase with the given ID
      setPlan(prev => ({
        ...prev,
        phases: prev.phases.filter(phase => phase.id !== phaseId)
      }))
      
      toast.success('Phase deleted successfully')
    }
  }

  const handleReorderPhase = (phaseId: string, direction: 'up' | 'down') => {
    // Find the phase and its current index
    const phaseIndex = plan.phases.findIndex(phase => phase.id === phaseId)
    if (phaseIndex === -1) return
    
    // Calculate new index based on direction
    const newIndex = direction === 'up' ? phaseIndex - 1 : phaseIndex + 1
    
    // Check if the new index is valid
    if (newIndex < 0 || newIndex >= plan.phases.length) return
    
    // Create a copy of the phases array
    const newPhases = [...plan.phases]
    
    // Swap the phases
    const temp = newPhases[phaseIndex]
    newPhases[phaseIndex] = newPhases[newIndex]
    newPhases[newIndex] = temp
    
    // Update the order property of the swapped phases
    newPhases[phaseIndex].order = phaseIndex + 1
    newPhases[newIndex].order = newIndex + 1
    
    // Update the plan with the new phases array
    setPlan(prev => ({
      ...prev,
      phases: newPhases
    }))
    
    toast.success(`Phase moved ${direction}`)
  }

  // Task management functions
  const handleAddTask = (phaseId: string) => {
    setCurrentTask(undefined)
    setCurrentPhaseId(phaseId)
    setIsNewItem(true)
    setShowTaskModal(true)
  }

  const handleEditTask = (phaseId: string, taskId: string) => {
    const phase = plan.phases.find(p => p.id === phaseId)
    if (phase) {
      const task = phase.tasks.find(t => t.id === taskId)
      if (task) {
        setCurrentTask(task)
        setCurrentPhaseId(phaseId)
        setIsNewItem(false)
        setShowTaskModal(true)
      }
    }
  }

  const handleDeleteTask = (phaseId: string, taskId: string) => {
    // Confirm deletion
    if (window.confirm(`Are you sure you want to delete this task?`)) {
      // Update the plan by removing the task from the specified phase
      setPlan(prev => {
        const updatedPhases = prev.phases.map(phase => {
          if (phase.id === phaseId) {
            return {
              ...phase,
              tasks: phase.tasks.filter(task => task.id !== taskId)
            }
          }
          return phase
        })
        
        return {
          ...prev,
          phases: updatedPhases
        }
      })
      
      toast.success('Task deleted successfully')
    }
  }

  // Material management functions
  const handleAddMaterial = (phaseId: string) => {
    setCurrentMaterial(undefined)
    setCurrentPhaseId(phaseId)
    setIsNewItem(true)
    setShowMaterialModal(true)
  }

  const handleEditMaterial = (phaseId: string, materialId: string) => {
    const phase = plan.phases.find(p => p.id === phaseId)
    if (phase) {
      const material = phase.materials.find(m => m.id === materialId)
      if (material) {
        setCurrentMaterial(material)
        setCurrentPhaseId(phaseId)
        setIsNewItem(false)
        setShowMaterialModal(true)
      }
    }
  }

  const handleDeleteMaterial = (phaseId: string, materialId: string) => {
    // Confirm deletion
    if (window.confirm(`Are you sure you want to delete this material?`)) {
      // Update the plan by removing the material from the specified phase
      setPlan(prev => {
        const updatedPhases = prev.phases.map(phase => {
          if (phase.id === phaseId) {
            return {
              ...phase,
              materials: phase.materials.filter(material => material.id !== materialId)
            }
          }
          return phase
        })
        
        return {
          ...prev,
          phases: updatedPhases
        }
      })
      
      toast.success('Material deleted successfully')
    }
  }

  // Save handlers for modals
  const handleSavePhase = (phaseData: Partial<Phase>) => {
    if (isNewItem) {
      // Add new phase
      const newPhase: Phase = {
        id: phaseData.id || uuidv4(),
        name: phaseData.name || '',
        description: phaseData.description || '',
        order: phaseData.order || plan.phases.length + 1,
        duration: phaseData.duration || '',
        startDate: phaseData.startDate,
        endDate: phaseData.endDate,
        status: phaseData.status as 'pending' | 'in-progress' | 'completed' | 'delayed',
        progress: phaseData.progress || 0,
        tasks: [],
        materials: []
      }
      
      setPlan(prev => ({
        ...prev,
        phases: [...prev.phases, newPhase].sort((a, b) => a.order - b.order)
      }))
      
      toast.success('New phase added successfully')
    } else {
      // Update existing phase
      setPlan(prev => {
        const updatedPhases = prev.phases.map(phase => {
          if (phase.id === phaseData.id) {
            return {
              ...phase,
              ...phaseData,
              status: phaseData.status as 'pending' | 'in-progress' | 'completed' | 'delayed'
            }
          }
          return phase
        })
        
        return {
          ...prev,
          phases: updatedPhases
        }
      })
      
      toast.success('Phase updated successfully')
    }
  }

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (isNewItem) {
      // Add new task to the current phase
      const newTask: Task = {
        id: taskData.id || uuidv4(),
        name: taskData.name || '',
        description: taskData.description || '',
        duration: taskData.duration || '',
        startDate: taskData.startDate,
        endDate: taskData.endDate,
        status: taskData.status as 'pending' | 'in-progress' | 'completed' | 'delayed',
        assignedTo: taskData.assignedTo,
        progress: taskData.progress || 0,
        dependencies: taskData.dependencies || []
      }
      
      setPlan(prev => {
        const updatedPhases = prev.phases.map(phase => {
          if (phase.id === currentPhaseId) {
            return {
              ...phase,
              tasks: [...phase.tasks, newTask]
            }
          }
          return phase
        })
        
        return {
          ...prev,
          phases: updatedPhases
        }
      })
      
      toast.success('New task added successfully')
    } else {
      // Update existing task
      setPlan(prev => {
        const updatedPhases = prev.phases.map(phase => {
          if (phase.id === currentPhaseId) {
            const updatedTasks = phase.tasks.map(task => {
              if (task.id === taskData.id) {
                return {
                  ...task,
                  ...taskData,
                  status: taskData.status as 'pending' | 'in-progress' | 'completed' | 'delayed'
                }
              }
              return task
            })
            
            return {
              ...phase,
              tasks: updatedTasks
            }
          }
          return phase
        })
        
        return {
          ...prev,
          phases: updatedPhases
        }
      })
      
      toast.success('Task updated successfully')
    }
  }

  const handleSaveMaterial = (materialData: Partial<Material>) => {
    if (isNewItem) {
      // Add new material to the current phase
      const newMaterial: Material = {
        id: materialData.id || uuidv4(),
        name: materialData.name || '',
        quantity: materialData.quantity || 0,
        unit: materialData.unit || '',
        unitPrice: materialData.unitPrice || 0,
        totalPrice: materialData.totalPrice || 0,
        supplier: materialData.supplier,
        status: materialData.status as 'ordered' | 'delivered' | 'pending',
        deliveryDate: materialData.deliveryDate
      }
      
      setPlan(prev => {
        const updatedPhases = prev.phases.map(phase => {
          if (phase.id === currentPhaseId) {
            return {
              ...phase,
              materials: [...phase.materials, newMaterial]
            }
          }
          return phase
        })
        
        return {
          ...prev,
          phases: updatedPhases
        }
      })
      
      toast.success('New material added successfully')
    } else {
      // Update existing material
      setPlan(prev => {
        const updatedPhases = prev.phases.map(phase => {
          if (phase.id === currentPhaseId) {
            const updatedMaterials = phase.materials.map(material => {
              if (material.id === materialData.id) {
                return {
                  ...material,
                  ...materialData,
                  status: materialData.status as 'ordered' | 'delivered' | 'pending'
                }
              }
              return material
            })
            
            return {
              ...phase,
              materials: updatedMaterials
            }
          }
          return phase
        })
        
        return {
          ...prev,
          phases: updatedPhases
        }
      })
      
      toast.success('Material updated successfully')
    }
  }

  // Date editing handlers
  const handleEditProjectDates = () => {
    setDateEditType('project');
    setShowDateEditModal(true);
  };

  const handleEditPhaseDates = (phaseId: string) => {
    const phase = plan.phases.find(p => p.id === phaseId);
    if (phase) {
      setCurrentPhase(phase);
      setDateEditType('phase');
      setShowDateEditModal(true);
    }
  };

  const handleSaveDates = (startDate: string, endDate: string) => {
    if (dateEditType === 'project') {
      // Update project dates
      setPlan(prev => ({
        ...prev,
        startDate,
        endDate,
        lastUpdated: new Date().toISOString()
      }));
      toast.success('Project dates updated successfully');
    } else if (dateEditType === 'phase' && currentPhase) {
      // Update phase dates
      setPlan(prev => {
        const updatedPhases = prev.phases.map(phase => {
          if (phase.id === currentPhase.id) {
            return {
              ...phase,
              startDate,
              endDate
            };
          }
          return phase;
        });
        
        return {
          ...prev,
          phases: updatedPhases,
          lastUpdated: new Date().toISOString()
        };
      });
      toast.success('Phase dates updated successfully');
    }
    
    setShowDateEditModal(false);
  };

  // Render the active view component
  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView plan={plan} onAddPhase={handleAddPhase} onEditPhase={handleEditPhase} onDeletePhase={handleDeletePhase} onReorderPhase={handleReorderPhase} onAddTask={handleAddTask} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} onAddMaterial={handleAddMaterial} onEditMaterial={handleEditMaterial} onDeleteMaterial={handleDeleteMaterial} onEditProjectDates={handleEditProjectDates} onEditPhaseDates={handleEditPhaseDates} />
      case 'timeline':
        return <TimelineView plan={plan} />
      case 'materials':
        return <MaterialsView plan={plan} onAddMaterial={handleAddMaterial} onEditMaterial={handleEditMaterial} onDeleteMaterial={handleDeleteMaterial} />
      case 'budget':
        return <BudgetView plan={plan} />
      case 'team':
        return <TeamView plan={plan} />
      case 'documents':
        return <DocumentsView plan={plan} />
      default:
        return <OverviewView plan={plan} onAddPhase={handleAddPhase} onEditPhase={handleEditPhase} onDeletePhase={handleDeletePhase} onReorderPhase={handleReorderPhase} onAddTask={handleAddTask} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} onAddMaterial={handleAddMaterial} onEditMaterial={handleEditMaterial} onDeleteMaterial={handleDeleteMaterial} onEditProjectDates={handleEditProjectDates} onEditPhaseDates={handleEditPhaseDates} />
    }
  }

  // Header actions for the PageHeader component
  const headerActions = (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#2B6CB0] dark:text-[#93C5FD] transition-all duration-200 shadow-sm"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => handleSavePlan('draft')}>
            <Save className="h-4 w-4 mr-2 text-[#2B6CB0]" />
            Save as Draft
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSavePlan('final')}>
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Save as Final
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        onClick={handleRegenerate}
        disabled={isGenerating}
        className="bg-white hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#2B6CB0] dark:text-[#93C5FD] transition-all duration-200 shadow-sm"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Regenerating...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-1" />
            Regenerate
          </>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#2B6CB0] dark:text-[#93C5FD] transition-all duration-200 shadow-sm"
          >
            <MoreHorizontal className="h-4 w-4 mr-1" />
            More
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDistributeModal(true)}>
            <Share2 className="h-4 w-4 mr-2 text-[#2B6CB0]" />
            Distribute Plan
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Printer className="h-4 w-4 mr-2 text-[#2B6CB0]" />
            Print Plan
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Download className="h-4 w-4 mr-2 text-[#2B6CB0]" />
            Export as PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Generated Plan | BuildEase</title>
      </Helmet>
      
      <PageHeader
        title={plan.name}
        description="AI generated construction phases with timeline, tasks, and material requirements."
        icon={<FileText className="h-6 w-6" />}
        status={plan.status}
        actions={headerActions}
      />

      {/* Tab navigation */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 flex items-center overflow-x-auto hide-scrollbar">
          <Button
            onClick={() => setActiveView('overview')}
            variant="ghost"
            size="sm"
            className={`${activeView === 'overview' ? 'border-b-2 border-[#2B6CB0] text-[#2B6CB0] font-medium' : 'text-gray-600 hover:text-[#2B6CB0]'} px-3 py-3 rounded-none text-sm transition-all`}
          >
            <Home className="h-4 w-4 mr-2" />
            Overview
          </Button>
          <Button
            onClick={() => setActiveView('timeline')}
            variant="ghost"
            size="sm"
            className={`${activeView === 'timeline' ? 'border-b-2 border-[#2B6CB0] text-[#2B6CB0] font-medium' : 'text-gray-600 hover:text-[#2B6CB0]'} px-3 py-3 rounded-none text-sm transition-all`}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Timeline
          </Button>
          <Button
            onClick={() => setActiveView('materials')}
            variant="ghost"
            size="sm"
            className={`${activeView === 'materials' ? 'border-b-2 border-[#2B6CB0] text-[#2B6CB0] font-medium' : 'text-gray-600 hover:text-[#2B6CB0]'} px-3 py-3 rounded-none text-sm transition-all`}
          >
            <Package className="h-4 w-4 mr-2" />
            Materials
          </Button>
          <Button
            onClick={() => setActiveView('budget')}
            variant="ghost"
            size="sm"
            className={`${activeView === 'budget' ? 'border-b-2 border-[#2B6CB0] text-[#2B6CB0] font-medium' : 'text-gray-600 hover:text-[#2B6CB0]'} px-3 py-3 rounded-none text-sm transition-all`}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Budget
          </Button>
          <Button
            onClick={() => setActiveView('team')}
            variant="ghost"
            size="sm"
            className={`${activeView === 'team' ? 'border-b-2 border-[#2B6CB0] text-[#2B6CB0] font-medium' : 'text-gray-600 hover:text-[#2B6CB0]'} px-3 py-3 rounded-none text-sm transition-all`}
          >
            <Users className="h-4 w-4 mr-2" />
            Team
          </Button>
          <Button
            onClick={() => setActiveView('documents')}
            variant="ghost"
            size="sm"
            className={`${activeView === 'documents' ? 'border-b-2 border-[#2B6CB0] text-[#2B6CB0] font-medium' : 'text-gray-600 hover:text-[#2B6CB0]'} px-3 py-3 rounded-none text-sm transition-all`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {isGenerating ? (
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <Loader2 className="h-10 w-10 text-[#2B6CB0] animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Regenerating your construction plan...</p>
          </m.div>
        ) : (
          <>
            {/* Render main content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
              {renderActiveView()}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <PhaseFormModal
        show={showPhaseModal}
        onClose={() => setShowPhaseModal(false)}
        onSave={handleSavePhase}
        phase={currentPhase}
        isNew={isNewItem}
        maxOrder={plan.phases.length}
      />
      
      <TaskFormModal
        show={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleSaveTask}
        task={currentTask}
        isNew={isNewItem}
        teamMembers={plan.team.map(member => ({ id: member.id, name: member.name }))}
      />
      
      <MaterialFormModal
        show={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        onSave={handleSaveMaterial}
        material={currentMaterial}
        isNew={isNewItem}
      />
      
      <DateEditModal
        show={showDateEditModal}
        onClose={() => setShowDateEditModal(false)}
        onSave={handleSaveDates}
        title={dateEditType === 'project' ? 'Edit Project Timeline' : 'Edit Phase Timeline'}
        startDate={dateEditType === 'project' ? plan.startDate : currentPhase?.startDate}
        endDate={dateEditType === 'project' ? plan.endDate : currentPhase?.endDate}
        saving={saving}
      />
      
      {/* Distribute Modal */}
      <DistributeModal
        show={showDistributeModal}
        onClose={() => setShowDistributeModal(false)}
        onDistribute={handleDistribute}
        saving={isDistributing}
      />
    </div>
  )
}