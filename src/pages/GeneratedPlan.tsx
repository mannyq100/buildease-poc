import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DistributeModal } from '@/components/plan/DistributeModal'
import { ActionButtons } from '@/components/plan/ActionButtons'
import { SAMPLE_PROJECT_PLAN, markdownPlan } from '@/data/sampleProjectPlan'
import { InsightItemProps, Phase, PlanStatus, ProjectData } from '@/types/projectInputs'
import { 
  AlertCircle, 
  Calendar, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Edit, 
  Grip, 
  Info, 
  Loader2, 
  Package, 
  Pencil, 
  Plus, 
  RefreshCw, 
  Save, 
  Trash, 
  X,
  FileText,
  Share2,
  Download,
  Printer,
  Users,
  CheckCircle,
  Code,
  AlignLeft,
  LayoutGrid
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

import { ProjectPhaseManager, PlanInsights } from '@/components/plan/ProjectPhaseManager'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MarkdownEditor } from '@/components/plan/MarkdownEditor'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

export default function GeneratedPlan() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('visual')
  const [projectData, setProjectData] = useState<ProjectData>({
    name: 'New Construction Project',
    description: 'Complete renovation of a 2-story residential home including kitchen, bathrooms, and outdoor spaces.'
  })
  const [phases, setPhases] = useState<Phase[]>(SAMPLE_PROJECT_PLAN)
  const [markdownContent, setMarkdownContent] = useState(markdownPlan)
  const [isGenerating, setIsGenerating] = useState(false)
  const [planStatus, setPlanStatus] = useState<PlanStatus>('draft')
  const [showDistributeModal, setShowDistributeModal] = useState(false)
  const [isDistributing, setIsDistributing] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editablePlan, setEditablePlan] = useState(markdownPlan)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState<'markdown' | 'text'>('markdown')
  
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

  const handleRegenerate = () => {
    setIsGenerating(true)
    
    // Simulate API call delay
    setTimeout(() => {
      // Refresh the phases with the sample data
      setPhases([...SAMPLE_PROJECT_PLAN])
      setMarkdownContent(markdownPlan)
      setIsGenerating(false)
      
      toast.success('Plan regenerated successfully')
    }, 2000)
  }

  const handleDistribute = () => {
    setIsDistributing(true)
    
    // Simulate API call delay
    setTimeout(() => {
      setIsDistributing(false)
      setShowDistributeModal(false)
      setPlanStatus('final')
      
      toast.success('Plan distributed to project areas')
    }, 2000)
  }

  const handleSavePlan = (status: PlanStatus = 'draft') => {
    setSaving(true)
    
    // Simulate API call delay
    setTimeout(() => {
      setPlanStatus(status)
      setSaving(false)
      
      if (status === 'final') {
        toast.success('Plan finalized and saved')
      } else {
        toast.success('Plan saved as draft')
      }
      
      setEditMode(false)
    }, 1500)
  }

  const handleEditPlan = () => {
    setEditMode(true)
    setEditablePlan(markdownContent)
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    setEditablePlan(markdownContent)
  }

  const handleSaveEdit = () => {
    setMarkdownContent(editablePlan)
    setEditMode(false)
    toast.success('Plan content updated')
  }

  const handlePhaseClick = (phaseId: string) => {
    // Navigate to phase details page with the phase ID
    console.log(`Navigating to phase details for phase: ${phaseId}`);
    navigate(`/phase-details/${phaseId}`);
    toast.success(`Viewing details for phase ${phaseId}`);
  }

  // Toggle view mode between markdown and plain text
  const handleViewModeChange = (value: string) => {
    if (value === 'markdown' || value === 'text') {
      setViewMode(value)
    }
  }

  const handleAddPhase = () => {
    const newPhase: Phase = {
      id: uuidv4(),
      title: 'New Phase',
      description: 'Description of this phase',
      duration: '2-3 weeks',
      tasks: [],
      materials: []
    }
    
    setPhases([...phases, newPhase])
  }

  const handleEditablePlanChange = (value: string) => {
    setEditablePlan(value)
  }

  const addNewPhase = () => {
    handleAddPhase()
    setShowActionMenu(false)
  }

  const forceRefresh = () => {
    handleRegenerate()
    setShowActionMenu(false)
  }

  const setShowCollaborateModal = (value: boolean) => {
    // Implementation of setShowCollaborateModal
  }

  return (
    <div className="container py-6 max-w-7xl">
      {/* Blue gradient header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl mb-6 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-lg mr-4">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Construction Plan</h1>
              <p className="text-white/80 mt-1">
                AI-generated construction plan with customizable phases, tasks, and materials
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Regenerate
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setShowCollaborateModal(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  <span>Collaborate</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/create-project')}>
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
            
            <Button
              variant="ghost"
              size="icon"
              onClick={forceRefresh}
              className="text-white/80 hover:text-white hover:bg-white/10"
              title="Force refresh page"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Add Phase and Save Plan buttons */}
      <div className="flex items-center justify-between mb-6">
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
                      handleSavePlan('draft');
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
                      handleSavePlan('final');
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
        <div className="text-gray-500 dark:text-gray-400">
          Project: <span className="font-medium text-gray-700 dark:text-gray-300">{projectData?.name || 'New Construction Project'}</span>
        </div>
      </div>
      
      {/* Main Content - Timeline focused */}
      <div className="space-y-6">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading your project timeline...</p>
          </div>
        ) : (
          <>
            {/* Timeline View */}
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow transition-shadow duration-300">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/10 p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      <CardTitle className="text-blue-700 dark:text-blue-400">
                        Proposed plan for your construction project
                      </CardTitle>
                    </div>
                    <CardDescription className="mt-1 ml-7">
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
                    <ProjectPhaseManager phases={phases} setPhases={setPhases} isDarkMode={isDarkMode} />
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Insight Cards */}
            <PlanInsights />
          </>
        )}
      </div>
      
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