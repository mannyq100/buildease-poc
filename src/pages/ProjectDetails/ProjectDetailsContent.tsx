/**
 * Streamlined ProjectDetailsContent - Single page layout focused on essential features
 * Optimized for construction workers using mobile devices with minimal clutter
 * Mobile-first layout with only the most critical information and actions
 */

import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import { useProjectDetailsData } from '@/hooks/queries/useProjectDetails';
import {
  useCreateBudgetExpense,
  useUpdateBudgetExpense,
  useDeleteBudgetExpense,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
  useCreateProjectDetailsPhase,
  useUpdateProjectDetailsPhase,
  useDeleteProjectDetailsPhase,
  type BudgetExpense,
  type TeamMember as SupabaseTeamMember,
  type ProjectDetailsPhase
} from '@/hooks/mutations';

import { ProjectDetailsSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseModal } from '@/components/ui/BaseModal';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Users, 
  Phone, 
  Package,
  CalendarCheck,
  Plus,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  FileText,
  Upload,
  ChevronDown,
  ChevronUp,
  Eye,
  Calendar,
  ImageIcon,
  Edit3,
  X,
  Layers,
  Target,
  Building2,
  Save
} from 'lucide-react';
import { PhaseSelector } from '@/components/shared/forms/PhaseSelector';
import { EnhancedPhaseSelector } from '@/components/shared/forms/EnhancedPhaseSelector';
import { ProjectType } from '@/utils/phaseUtils';
import { ProjectContext } from '@/utils/enhancedPhaseUtils';
import { adaptSupabaseProjectToProject } from '@/utils/dataAdapters';

interface ProjectDetailsContentProps {
  projectId: string;
}

interface TaskItem {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'on-break' | 'off-site';
  phone?: string;
}

// Error Fallback Component
function ProjectErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-6">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-slate-600 mb-4">
          {error.message || 'Failed to load project details'}
        </p>
        <Button onClick={resetErrorBoundary} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
}

// Loading Skeleton Component
function ProjectDetailsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-6">
        <ProjectDetailsSkeleton />
      </div>
    </div>
  );
}

// Streamlined Project Details Content
function ProjectDetailsMain({ projectId }: ProjectDetailsContentProps) {
  const navigate = useNavigate();
  
  // Use comprehensive project details data with Supabase integration
  const {
    project: projectData,
    budgetExpenses,
    teamMembers,
    phases,
    isLoading: projectLoading,
    error: projectError
  } = useProjectDetailsData(projectId);
  
  // Supabase CRUD mutations
  const createBudgetExpense = useCreateBudgetExpense();
  const updateBudgetExpense = useUpdateBudgetExpense();
  const deleteBudgetExpense = useDeleteBudgetExpense();
  
  const createTeamMember = useCreateTeamMember();
  const updateTeamMember = useUpdateTeamMember();
  const deleteTeamMember = useDeleteTeamMember();
  
  const createPhase = useCreateProjectDetailsPhase();
  const updatePhase = useUpdateProjectDetailsPhase();
  const deletePhase = useDeleteProjectDetailsPhase();
  
  // State for flexible phase system
  const [selectedPhaseCategory, setSelectedPhaseCategory] = useState<string>('');
  const [defaultTasks, setDefaultTasks] = useState<{
    id: string;
    name: string;
    alternativeNames: string[];
    enabled: boolean;
  }[]>([]);
  const [phaseFormData, setPhaseFormData] = useState<{
    name: string;
    category: string;
    description: string;
    startDate: string;
    endDate: string;
  }>({
    name: '',
    category: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState<{
    phases: boolean;
    budget: boolean;
    team: boolean;
    documents: boolean;
  }>({
    phases: false,
    budget: false,
    team: false,
    documents: false
  });
  
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imagesCollapsed, setImagesCollapsed] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; caption?: string } | null>(null);
  
  // CRUD Modal States
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    type: 'budget' | 'phase' | 'team';
    data: Record<string, unknown>;
  } | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // CRUD Helper Functions
  const openCreateModal = (type: 'budget' | 'phase' | 'team') => {
    setModalMode('create');
    setEditingItem(null);
    
    // Reset flexible phase system state
    if (type === 'phase') {
      setSelectedPhaseCategory('');
      setDefaultTasks([]);
      setPhaseFormData({
        name: '',
        category: '',
        description: '',
        startDate: '',
        endDate: ''
      });
    }
    
    if (type === 'budget') setShowBudgetModal(true);
    if (type === 'phase') setShowPhaseModal(true);
    if (type === 'team') setShowTeamModal(true);
  };
  
  const openEditModal = (type: 'budget' | 'phase' | 'team', data: Record<string, unknown>) => {
    setModalMode('edit');
    setEditingItem({ type, data });
    if (type === 'budget') setShowBudgetModal(true);
    if (type === 'phase') setShowPhaseModal(true);
    if (type === 'team') setShowTeamModal(true);
  };
  
  const closeModals = () => {
    setShowBudgetModal(false);
    setShowPhaseModal(false);
    setShowTeamModal(false);
    setEditingItem(null);
    
    // Reset flexible phase system state
    setSelectedPhaseCategory('');
    setDefaultTasks([]);
    setPhaseFormData({
      name: '',
      category: '',
      description: '',
      startDate: '',
      endDate: ''
    });
  };
  
  const handleDelete = async (type: 'budget' | 'phase' | 'team', id: string) => {
    try {
      if (type === 'budget') {
        await deleteBudgetExpense.mutateAsync(id);
      } else if (type === 'phase') {
        await deletePhase.mutateAsync(id);
      } else if (type === 'team') {
        await deleteTeamMember.mutateAsync({ memberId: id, projectId });
      }
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
    }
  };
  
  const handleSave = async (type: 'budget' | 'phase' | 'team', data: Record<string, unknown>) => {
    try {
      if (type === 'budget') {
        if (modalMode === 'create') {
          await createBudgetExpense.mutateAsync({
            projectId,
            expense: {
              name: 'New Expense',
              amount: 1000,
              category: 'Materials',
              status: 'planned',
              paymentDate: new Date().toISOString().split('T')[0],
              vendorName: 'TBD',
              description: 'New expense item'
            }
          });
        } else if (editingItem) {
          await updateBudgetExpense.mutateAsync({
            expenseId: editingItem.id,
            expense: {
              name: 'Updated Expense',
              amount: 1500,
              category: 'Labor',
              status: 'approved'
            }
          });
        }
      } else if (type === 'phase') {
        if (modalMode === 'create') {
          // Create phase with flexible category and default tasks
          const phaseData = {
            name: phaseFormData.name,
            description: phaseFormData.description,
            status: 'pending' as const,
            category: selectedPhaseCategory,
            timeline: {
              startDate: phaseFormData.startDate,
              endDate: phaseFormData.endDate,
              duration: phaseFormData.startDate && phaseFormData.endDate 
                ? Math.ceil((new Date(phaseFormData.endDate).getTime() - new Date(phaseFormData.startDate).getTime()) / (1000 * 60 * 60 * 24))
                : 0
            }
          };
          
          // Create the phase
          const createdPhase = await createPhase.mutateAsync({
            projectId,
            phase: phaseData
          });
          
          // Create enabled default tasks for the phase
          const enabledTasks = defaultTasks.filter(task => task.enabled);
          if (enabledTasks.length > 0) {
            console.log(`Creating ${enabledTasks.length} default tasks for phase:`, createdPhase);
            console.log('Enabled tasks:', enabledTasks.map(t => t.name));
            // TODO: Integrate with task creation hooks when available
            // Future: Create tasks using task creation hooks
          }
        } else if (editingItem) {
          await updatePhase.mutateAsync({
            phaseId: editingItem.id,
            phase: {
              name: phaseFormData.name,
              description: phaseFormData.description,
              status: 'in-progress'
            }
          });
        }
      } else if (type === 'team') {
        if (modalMode === 'create') {
          await createTeamMember.mutateAsync({
            projectId,
            member: {
              name: 'New Member',
              role: 'Contractor',
              status: 'active',
              contactInfo: {
                phone: '555-0123',
                email: 'member@example.com'
              }
            }
          });
        } else if (editingItem) {
          await updateTeamMember.mutateAsync({
            memberId: editingItem.id,
            member: {
              name: 'Updated Member',
              role: 'Site Supervisor',
              status: 'active'
            }
          });
        }
      }
      
      closeModals();
    } catch (error) {
      console.error(`Failed to save ${type}:`, error);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle loading states
  if (projectLoading) {
    return <ProjectDetailsLoading />;
  }

  // Handle error states
  if (projectError) {
    throw projectError;
  }

  // Handle missing project
  if (!projectData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Project Not Found
          </h2>
          <p className="text-slate-600 mb-4">
            The project with ID "{projectId}" could not be found.
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Adapt Supabase data to Project interface
  const project = adaptSupabaseProjectToProject(projectData);
  const currentPhase = phases?.find(p => p.status === 'in-progress') || phases?.[0];
  // Mock current tasks since phase.tasks may not exist in current data structure
  const currentTasks: TaskItem[] = [
    { id: '1', name: 'Foundation inspection', status: 'completed' as const },
    { id: '2', name: 'Install electrical wiring', status: 'in-progress' as const },
    { id: '3', name: 'Plumbing rough-in', status: 'pending' as const },
    { id: '4', name: 'Frame inspection', status: 'pending' as const }
  ];
  const activeTeamMembers: TeamMember[] = Array.isArray(project.teamMembers) 
    ? (project.teamMembers as TeamMember[]).filter((m: TeamMember) => m.status === 'active')
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Streamlined Project Status */}
        <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-buildease-blue-50/30 to-buildease-orange-50/20 backdrop-blur-md rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
                  <StatusBadge status={project.status} size="sm" />
                </div>
                {project.location && (
                  <div className="flex items-center text-sm text-slate-600 mb-3">
                    <MapPin className="h-4 w-4 mr-2 text-buildease-orange-500" />
                    {project.location}
                  </div>
                )}
                <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
              </div>
              
              {/* Progress Circle */}
              <div className="flex-shrink-0 text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                    <circle 
                      cx="50" cy="50" r="40" 
                      stroke="#2B6CB0" strokeWidth="8" fill="none"
                      strokeDasharray={`${(project.progress || 0) * 2.51} 251`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-buildease-blue-600">{project.progress || 0}%</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 font-medium">Complete</div>
              </div>
            </div>
            
            {/* Key Metrics with Detail Access */}
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => toggleSection('budget')}
                className="text-center p-3 bg-buildease-blue-50/50 rounded-xl hover:bg-buildease-blue-100/50 transition-colors group"
              >
                <DollarSign className="h-5 w-5 text-buildease-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-lg font-bold text-slate-900">
                  ${typeof project.budget === 'object' ? Math.round((project.budget?.allocated || 0) / 1000) : Math.round((project.budget || 0) / 1000)}K
                </div>
                <div className="text-xs text-slate-600 flex items-center justify-center gap-1">
                  Budget <Eye className="h-3 w-3" />
                </div>
              </button>
              <button 
                onClick={() => toggleSection('phases')}
                className="text-center p-3 bg-buildease-orange-50/50 rounded-xl hover:bg-buildease-orange-100/50 transition-colors group"
              >
                <Clock className="h-5 w-5 text-buildease-orange-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-lg font-bold text-slate-900">
                  {project.endDate ? Math.max(0, Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : '---'}
                </div>
                <div className="text-xs text-slate-600 flex items-center justify-center gap-1">
                  Timeline <Eye className="h-3 w-3" />
                </div>
              </button>
              <button 
                onClick={() => toggleSection('team')}
                className="text-center p-3 bg-emerald-50/50 rounded-xl hover:bg-emerald-100/50 transition-colors group"
              >
                <Users className="h-5 w-5 text-emerald-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-lg font-bold text-slate-900">{activeTeamMembers.length}</div>
                <div className="text-xs text-slate-600 flex items-center justify-center gap-1">
                  Team <Eye className="h-3 w-3" />
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Project Images Section - Enhanced & Collapsible */}
        <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-buildease-blue-50/20 backdrop-blur-md rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setImagesCollapsed(!imagesCollapsed)}
                className="flex items-center gap-3 text-left group hover:bg-slate-50/50 -m-2 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-buildease-blue-500 to-buildease-blue-600 rounded-xl group-hover:scale-105 transition-transform">
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">Project Images</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    {!imagesCollapsed ? 'Click to collapse' : 'Profile, inspiration & progress photos'}
                  </p>
                </div>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${imagesCollapsed ? 'rotate-0' : 'rotate-180'}`} />
              </button>
              
              {!imagesCollapsed && (
                <Button
                  onClick={() => setShowImageUpload(!showImageUpload)}
                  variant="outline"
                  size="sm"
                  className="text-buildease-blue-600 border-buildease-blue-200 hover:bg-buildease-blue-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Images
                </Button>
              )}
            </div>
          </CardHeader>
          
          {!imagesCollapsed && (
            <CardContent className="space-y-8">
              {/* Profile Picture Section */}
              <div className="bg-gradient-to-br from-buildease-blue-50/30 to-white p-4 rounded-xl border border-buildease-blue-100/50">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-buildease-blue-600" />
                  Profile Picture
                  <span className="text-xs text-slate-500 font-normal">Main project photo</span>
                </h4>
                <div className="relative group">
                  {project.profileImage ? (
                    <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-lg cursor-pointer"
                         onClick={() => setPreviewImage({ url: project.profileImage!, caption: 'Project Profile' })}>
                      <img 
                        src={project.profileImage} 
                        alt="Project profile" 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 text-slate-700 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowImageUpload(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 text-slate-700 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage({ url: project.profileImage!, caption: 'Project Profile' });
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowImageUpload(true)}
                      className="w-40 h-40 rounded-xl border-2 border-dashed border-slate-300 hover:border-buildease-blue-400 bg-slate-50 hover:bg-buildease-blue-50/50 transition-colors flex flex-col items-center justify-center group"
                    >
                      <ImageIcon className="h-10 w-10 text-slate-400 group-hover:text-buildease-blue-500 mb-2" />
                      <span className="text-sm text-slate-500 group-hover:text-buildease-blue-600 font-medium">Add Profile Photo</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Inspirational Images Section */}
              <div className="bg-gradient-to-br from-buildease-orange-50/30 to-white p-4 rounded-xl border border-buildease-orange-100/50">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-buildease-orange-600" />
                  Inspirational Images
                  <span className="text-xs text-slate-500 font-normal">Design references & ideas</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {project.inspirationalImages?.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden shadow-md cursor-pointer"
                           onClick={() => setPreviewImage({ url: image.url, caption: image.caption || `Inspiration ${index + 1}` })}>
                        <img 
                          src={image.url} 
                          alt={image.caption || `Inspiration ${index + 1}`} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 text-slate-700 hover:bg-white p-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage({ url: image.url, caption: image.caption || `Inspiration ${index + 1}` });
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="bg-red-500/90 hover:bg-red-600 p-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            /* Handle remove image */
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )) || []}
                  
                  {/* Add More Inspiration Images */}
                  <button
                    onClick={() => setShowImageUpload(true)}
                    className="aspect-square rounded-lg border-2 border-dashed border-buildease-orange-300 hover:border-buildease-orange-400 bg-buildease-orange-50/50 hover:bg-buildease-orange-100/50 transition-colors flex flex-col items-center justify-center group"
                  >
                    <Plus className="h-5 w-5 text-buildease-orange-400 group-hover:text-buildease-orange-500 mb-1" />
                    <span className="text-xs text-buildease-orange-600 group-hover:text-buildease-orange-700 font-medium">Add</span>
                  </button>
                </div>
              </div>
              
              {/* Progress Images Section */}
              <div className="bg-gradient-to-br from-green-50/30 to-white p-4 rounded-xl border border-green-100/50">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  Progress Images
                  <span className="text-xs text-slate-500 font-normal">Construction progress photos</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {project.progressImages?.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden shadow-md cursor-pointer"
                           onClick={() => setPreviewImage({ url: image.url, caption: image.caption || `Progress ${index + 1}` })}>
                        <img 
                          src={image.url} 
                          alt={image.caption || `Progress ${index + 1}`} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 text-slate-700 hover:bg-white p-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage({ url: image.url, caption: image.caption || `Progress ${index + 1}` });
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="bg-red-500/90 hover:bg-red-600 p-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            /* Handle remove image */
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )) || []}
                  
                  {/* Add More Progress Images */}
                  <button
                    onClick={() => setShowImageUpload(true)}
                    className="aspect-square rounded-lg border-2 border-dashed border-green-300 hover:border-green-400 bg-green-50/50 hover:bg-green-100/50 transition-colors flex flex-col items-center justify-center group"
                  >
                    <Plus className="h-5 w-5 text-green-400 group-hover:text-green-500 mb-1" />
                    <span className="text-xs text-green-600 group-hover:text-green-700 font-medium">Add</span>
                  </button>
                </div>
              </div>
              
              {/* Enhanced Image Upload Section */}
              {showImageUpload && (
                <div className="p-6 bg-gradient-to-br from-slate-50 to-buildease-blue-50/30 rounded-xl border border-slate-200 shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                      <Upload className="h-5 w-5 text-buildease-blue-600" />
                      Upload Images
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowImageUpload(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Image Type Selection */}
                    <div className="grid grid-cols-3 gap-3">
                      <button className="p-3 rounded-lg border-2 border-buildease-blue-200 bg-buildease-blue-50 text-buildease-blue-700 hover:bg-buildease-blue-100 transition-colors">
                        <ImageIcon className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-xs font-medium">Profile</div>
                      </button>
                      <button className="p-3 rounded-lg border-2 border-buildease-orange-200 bg-buildease-orange-50 text-buildease-orange-700 hover:bg-buildease-orange-100 transition-colors">
                        <ImageIcon className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-xs font-medium">Inspiration</div>
                      </button>
                      <button className="p-3 rounded-lg border-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                        <Calendar className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-xs font-medium">Progress</div>
                      </button>
                    </div>
                    
                    {/* File Upload Area */}
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-buildease-blue-400 hover:bg-buildease-blue-50/30 transition-colors">
                      <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-600 mb-2 font-medium">Drop images here or click to browse</p>
                      <p className="text-xs text-slate-500">Supports JPG, PNG, WebP up to 10MB</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                        onChange={(e) => {
                          // Handle file upload
                          console.log('Files selected:', e.target.files);
                        }}
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-block mt-4 px-6 py-3 bg-buildease-blue-600 text-white rounded-lg hover:bg-buildease-blue-700 cursor-pointer transition-colors font-medium"
                      >
                        Choose Files
                      </label>
                    </div>
                    
                    {/* Upload Actions */}
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowImageUpload(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-buildease-blue-600 hover:bg-buildease-blue-700"
                        onClick={() => {
                          // Handle upload
                          setShowImageUpload(false);
                        }}
                      >
                        Upload Images
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
        
        {/* Image Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setPreviewImage(null)}>
            <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
              <img 
                src={previewImage.url} 
                alt={previewImage.caption || 'Preview'} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
              {previewImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 rounded-b-lg">
                  <p className="text-center font-medium">{previewImage.caption}</p>
                </div>
              )}
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                onClick={() => setPreviewImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Expandable Budget Details */}
        {expandedSections.budget && (
          <Card className="border-buildease-blue-200/60 shadow-xl bg-gradient-to-br from-buildease-blue-50/30 to-white backdrop-blur-md rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-buildease-blue-600" />
                  Budget & Materials
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => openCreateModal('budget')}
                    className="bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Expense
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleSection('budget')}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50/50 p-4 rounded-xl">
                  <div className="text-sm text-slate-600 mb-1">Total Budget</div>
                  <div className="text-xl font-bold text-slate-900">
                    ${typeof project.budget === 'object' ? (project.budget?.allocated || 0).toLocaleString() : (project.budget || 0).toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-xl">
                  <div className="text-sm text-slate-600 mb-1">Spent</div>
                  <div className="text-xl font-bold text-slate-900">
                    ${typeof project.budget === 'object' ? (project.budget?.spent || 0).toLocaleString() : '0'}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-700">Recent Expenses</div>
                <div className="space-y-2">
                  {[
                    { id: '1', name: 'Foundation materials', amount: 15000, category: 'Materials', date: '2024-01-15' },
                    { id: '2', name: 'Electrical supplies', amount: 8500, category: 'Materials', date: '2024-01-14' },
                    { id: '3', name: 'Labor costs', amount: 12000, category: 'Labor', date: '2024-01-13' }
                  ].map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors group">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900">{expense.name}</span>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditModal('budget', expense)}
                              className="h-6 w-6 p-0 hover:bg-buildease-blue-100 hover:text-buildease-blue-700"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete('budget', expense.id)}
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{expense.category}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">{new Date(expense.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 ml-3">${expense.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expandable Phases & Timeline Details */}
        {expandedSections.phases && (
          <Card className="border-buildease-orange-200/60 shadow-xl bg-gradient-to-br from-buildease-orange-50/30 to-white backdrop-blur-md rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-buildease-orange-600" />
                  Phases & Timeline
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => openCreateModal('phase')}
                    className="bg-buildease-orange-600 hover:bg-buildease-orange-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Phase
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleSection('phases')}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {phases && phases.length > 0 ? (
                phases.map((phase, index) => (
                  <div key={phase.id} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors group">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                        phase.status === 'completed' ? 'bg-green-100 text-green-700' :
                        phase.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-900">{phase.name}</div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal('phase', phase)}
                            className="h-6 w-6 p-0 hover:bg-buildease-orange-100 hover:text-buildease-orange-700"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete('phase', phase.id)}
                            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-slate-600">{phase.description}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {phase.timeline?.startDate && phase.timeline?.endDate && (
                          `${new Date(phase.timeline.startDate).toLocaleDateString()} - ${new Date(phase.timeline.endDate).toLocaleDateString()}`
                        )}
                      </div>
                    </div>
                    <StatusBadge status={phase.status} size="sm" />
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No phases defined yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Today's Focus */}
        {currentPhase && (
          <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-buildease-blue-50/20 backdrop-blur-md rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Today's Focus
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">{currentPhase.name}</p>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {currentTasks.filter((t: TaskItem) => t.status === 'completed').length}/{currentTasks.length} Done
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentTasks.length > 0 ? (
                currentTasks.map((task: TaskItem) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/40 hover:bg-slate-50/50 transition-all duration-200">
                    <button className="flex-shrink-0">
                      <CheckCircle2 className={`h-5 w-5 transition-colors ${
                        task.status === 'completed' ? 'text-emerald-600' : 'text-slate-400 hover:text-buildease-blue-500'
                      }`} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={`block text-sm font-medium truncate ${
                        task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}>
                        {task.name}
                      </span>
                    </div>
                    <StatusBadge status={task.status} size="sm" variant="outline" />
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No tasks scheduled for today</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1 bg-buildease-blue-600 hover:bg-buildease-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-buildease-orange-50/20 backdrop-blur-md rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                size="lg" 
                className="h-14 bg-buildease-blue-600 hover:bg-buildease-blue-700 flex-col gap-1"
                onClick={() => navigate('/materials')}
              >
                <Package className="h-5 w-5" />
                <span className="text-xs">Manage Materials</span>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 flex-col gap-1 border-buildease-orange-200 text-buildease-orange-700 hover:bg-buildease-orange-50"
                onClick={() => navigate('/schedule')}
              >
                <CalendarCheck className="h-5 w-5" />
                <span className="text-xs">Manage Tasks</span>
              </Button>
              <Button size="lg" variant="outline" className="h-14 flex-col gap-1">
                <Upload className="h-5 w-5" />
                <span className="text-xs">Upload Doc</span>
              </Button>
              <Button size="lg" variant="outline" className="h-14 flex-col gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <Phone className="h-5 w-5" />
                <span className="text-xs">Contact Team</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Status - Collapsible */}
        {expandedSections.team ? (
          <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-emerald-50/20 backdrop-blur-md rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Team Management
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => openCreateModal('team')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Member
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleSection('team')}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeTeamMembers.length > 0 ? (
                activeTeamMembers.map((member: TeamMember) => (
                  <div key={member.id} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors group">
                    <div className="w-10 h-10 bg-buildease-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-buildease-blue-700">
                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-900">{member.name}</div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal('team', member)}
                            className="h-6 w-6 p-0 hover:bg-emerald-100 hover:text-emerald-700"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete('team', member.id)}
                            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-slate-600">{member.role}</div>
                      <div className="flex items-center gap-4 mt-1">
                        <StatusBadge status={member.status as 'in-progress' | 'pending' | 'cancelled'} size="sm" />
                        {member.phone && (
                          <div className="text-xs text-slate-500">{member.phone}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No team members added yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          activeTeamMembers.length > 0 && (
            <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-emerald-50/20 backdrop-blur-md rounded-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    Team On-Site
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {activeTeamMembers.length} Active
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleSection('team')}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {activeTeamMembers.slice(0, 6).map((member: TeamMember) => (
                    <div key={member.id} className="flex items-center gap-2 bg-slate-50/50 rounded-lg p-2 min-w-0 hover:bg-slate-100/50 transition-colors">
                      <div className="w-8 h-8 bg-buildease-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-buildease-blue-700">
                          {member.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-900 truncate">{member.name}</div>
                        <div className="text-xs text-slate-600">{member.role}</div>
                      </div>
                    </div>
                  ))}
                  {activeTeamMembers.length > 6 && (
                    <div className="flex items-center justify-center bg-slate-100 rounded-lg p-2 min-w-[60px]">
                      <span className="text-xs text-slate-600">+{activeTeamMembers.length - 6} more</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        )}

        {/* Documents Section with Expand Option */}
        <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-purple-50/20 backdrop-blur-md rounded-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Documents & Updates
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleSection('documents')}
                className="text-slate-500 hover:text-slate-700"
              >
                {expandedSections.documents ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900">Foundation inspection completed</div>
                  <div className="text-xs text-slate-600">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900">Materials delivered on schedule</div>
                  <div className="text-xs text-slate-600">5 hours ago</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900">Weather delay - rescheduled roofing</div>
                  <div className="text-xs text-slate-600">1 day ago</div>
                </div>
              </div>
              
              {expandedSections.documents && (
                <div className="mt-4 pt-4 border-t border-slate-200/50">
                  <div className="text-sm font-medium text-slate-700 mb-3">Recent Documents</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-white/50 rounded-lg hover:bg-white/80 transition-colors cursor-pointer">
                      <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">Building Plans v2.1.pdf</div>
                        <div className="text-xs text-slate-600">Updated 3 days ago</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white/50 rounded-lg hover:bg-white/80 transition-colors cursor-pointer">
                      <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">Electrical Permit.pdf</div>
                        <div className="text-xs text-slate-600">Approved 1 week ago</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white/50 rounded-lg hover:bg-white/80 transition-colors cursor-pointer">
                      <FileText className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">Material Specifications.xlsx</div>
                        <div className="text-xs text-slate-600">Updated 2 weeks ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* CRUD Modals */}
        {/* Budget Modal */}
        <BaseModal
          isOpen={showBudgetModal}
          onClose={closeModals}
          title={modalMode === 'create' ? 'Add Expense' : 'Edit Expense'}
          description="Manage project budget expenses"
          size="md"
          footer={
            <div className="flex gap-3">
              <Button 
                onClick={() => handleSave('budget', {})}
                className="flex-1 bg-buildease-blue-600 hover:bg-buildease-blue-700"
              >
                {modalMode === 'create' ? 'Add Expense' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={closeModals} className="flex-1">
                Cancel
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Expense Name</label>
              <input 
                type="text" 
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent"
                placeholder="Enter expense name"
                defaultValue={editingItem?.data?.name as string || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
              <input 
                type="number" 
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent"
                placeholder="Enter amount"
                defaultValue={editingItem?.data?.amount as string || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent">
                <option value="Materials">Materials</option>
                <option value="Labor">Labor</option>
                <option value="Equipment">Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </BaseModal>
        
        {/* Phase Modal - Stunning BuildEase Design */}
        <BaseModal
          isOpen={showPhaseModal}
          onClose={closeModals}
          title={modalMode === 'create' ? 'Create New Phase' : 'Edit Phase'}
          description="Build your project timeline with precision and style"
          size="lg"
          footer={
            <div className="flex gap-3 p-6 bg-gradient-to-r from-slate-50 to-white border-t border-slate-200">
              <Button 
                onClick={() => handleSave('phase', phaseFormData)}
                className="flex-1 bg-gradient-to-r from-buildease-orange-500 to-buildease-orange-600 hover:from-buildease-orange-600 hover:to-buildease-orange-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border-0"
                disabled={!phaseFormData.name.trim()}
              >
                <div className="flex items-center justify-center gap-2">
                  {modalMode === 'create' ? (
                    <>
                      <Plus className="h-5 w-5" />
                      Create Phase
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </div>
              </Button>
            </div>
          }
        >
          <div className="space-y-6 p-4 max-h-[70vh] overflow-y-auto">
            {/* Phase Template Selection */}
            {modalMode === 'create' && (
              <>
                {/* Enhanced Phase Selection */}
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center mb-3">
                    <Building2 className="h-5 w-5 mr-2" />
                    <h3 className="font-semibold">Choose Phase Template</h3>
                  </div>
                  
                  {/* Project Context Display */}
                  {projectData && (
                    <div className="mb-4 p-3 bg-buildease-blue-50 rounded-lg border border-buildease-blue-200">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="font-medium text-slate-700">
                            {projectData.type?.replace('_', ' ').replace('-', ' ') || 'Standard Project'}
                          </span>
                          {projectData.details?.specs?.building_size && (
                            <>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-600">
                                {typeof projectData.details.specs.building_size === 'object' 
                                  ? `${projectData.details.specs.building_size.value || projectData.details.specs.building_size} ${projectData.details.specs.building_size.unit || 'sq-m'}`
                                  : `${projectData.details.specs.building_size} sq-m`
                                }
                              </span>
                            </>
                          )}
                          {projectData.details?.specs?.floors && (
                            <>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-600">
                                {projectData.details.specs.floors} floor{projectData.details.specs.floors > 1 ? 's' : ''}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-buildease-blue-600 font-medium">
                          Smart Recommendations
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <PhaseSelector
                      projectType={projectData?.type as ProjectType || 'new_construction'}
                      selectedCategory={selectedPhaseCategory}
                      onCategorySelect={(category, phaseName) => {
                        setSelectedPhaseCategory(category);
                        setPhaseFormData(prev => ({
                          ...prev,
                          name: phaseName,
                          category: category
                        }));
                      }}
                      onTasksPreview={(tasks) => {
                        const editableTasks = tasks.map(task => ({
                          ...task,
                          enabled: true
                        }));
                        setDefaultTasks(editableTasks);
                      }}
                      showTaskPreview={true}
                    />
                  </div>
                </div>

                {/* Default Tasks - Compact Design */}
                {defaultTasks.length > 0 && (
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="bg-emerald-500 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center text-white">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        <span className="font-medium text-sm">
                          Default Tasks ({defaultTasks.filter(t => t.enabled).length}/{defaultTasks.length})
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDefaultTasks(tasks => tasks.map(t => ({ ...t, enabled: true })))}
                          className="text-white hover:bg-white/20 text-xs px-2 py-1 h-auto"
                        >
                          All
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDefaultTasks(tasks => tasks.map(t => ({ ...t, enabled: false })))}
                          className="text-white hover:bg-white/20 text-xs px-2 py-1 h-auto"
                        >
                          None
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {defaultTasks.map((task, index) => (
                          <div 
                            key={task.id} 
                            className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                              task.enabled 
                                ? 'bg-emerald-50 border border-emerald-200' 
                                : 'bg-slate-50 border border-slate-200 opacity-60'
                            }`}
                          >
                            <input
                              type="checkbox"
                              id={`task-${task.id}`}
                              checked={task.enabled}
                              onChange={(e) => {
                                const updatedTasks = [...defaultTasks];
                                updatedTasks[index].enabled = e.target.checked;
                                setDefaultTasks(updatedTasks);
                              }}
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <label 
                                htmlFor={`task-${task.id}`}
                                className={`block text-sm cursor-pointer ${
                                  task.enabled 
                                    ? 'text-slate-900 font-medium' 
                                    : 'text-slate-500 line-through'
                                }`}
                              >
                                {task.name}
                              </label>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedTasks = defaultTasks.filter((_, i) => i !== index);
                                setDefaultTasks(updatedTasks);
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      {defaultTasks.filter(t => t.enabled).length === 0 && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
                            <p className="text-amber-800 text-sm">
                              No tasks selected - phase will be created without default tasks
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Phase Details - Streamlined Form */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-buildease-blue-500 rounded-lg text-white mr-3">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-slate-900">Phase Details</h3>
              </div>
              
              <div className="space-y-4">
                {/* Phase Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phase Name
                  </label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-buildease-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Foundation & Structural Work"
                    value={phaseFormData.name}
                    onChange={(e) => setPhaseFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea 
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-buildease-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows={3}
                    placeholder="Describe the phase objectives and key deliverables..."
                    value={phaseFormData.description}
                    onChange={(e) => setPhaseFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* Timeline - Compact Design */}
                <div className="bg-buildease-blue-50 rounded-lg p-4 border border-buildease-blue-200">
                  <div className="flex items-center mb-3">
                    <Calendar className="h-4 w-4 text-buildease-blue-600 mr-2" />
                    <h4 className="font-medium text-slate-900">Timeline</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Start Date
                      </label>
                      <input 
                        type="date" 
                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-transparent text-sm"
                        value={phaseFormData.startDate}
                        onChange={(e) => setPhaseFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        End Date
                      </label>
                      <input 
                        type="date" 
                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-red-500 focus:border-transparent text-sm"
                        value={phaseFormData.endDate}
                        onChange={(e) => setPhaseFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  {/* Duration Display */}
                  {phaseFormData.startDate && phaseFormData.endDate && (
                    <div className="mt-3 p-2 bg-white rounded border border-buildease-blue-200">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-slate-600">
                          <Clock className="h-4 w-4 mr-1" />
                          Duration
                        </div>
                        <span className="font-semibold text-buildease-orange-600">
                          {Math.ceil((new Date(phaseFormData.endDate).getTime() - new Date(phaseFormData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </BaseModal>
        
        {/* Team Modal */}
        <BaseModal
          isOpen={showTeamModal}
          onClose={closeModals}
          title={modalMode === 'create' ? 'Add Team Member' : 'Edit Team Member'}
          description="Manage project team members"
          size="md"
          footer={
            <div className="flex gap-3">
              <Button 
                onClick={() => handleSave('team', {})}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {modalMode === 'create' ? 'Add Member' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={closeModals} className="flex-1">
                Cancel
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input 
                type="text" 
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter full name"
                defaultValue={(editingItem?.data as any)?.name || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
              <select className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option value="Project Manager">Project Manager</option>
                <option value="Site Supervisor">Site Supervisor</option>
                <option value="Foreman">Foreman</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Laborer">Laborer</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option value="active">Active</option>
                <option value="on-break">On Break</option>
                <option value="off-site">Off Site</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input 
                type="tel" 
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter phone number"
                defaultValue={(editingItem?.data as any)?.phone || ''}
              />
            </div>
          </div>
        </BaseModal>
      </div>
    </div>
  );
}

// Main Export with Error Boundary and Suspense
export function ProjectDetailsContent({ projectId }: ProjectDetailsContentProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ProjectErrorFallback}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={<ProjectDetailsLoading />}>
        <ProjectDetailsMain projectId={projectId} />
      </Suspense>
    </ErrorBoundary>
  );
}
