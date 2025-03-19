/**
 * Team.tsx - Team management page
 * Manage team members, roles, and assignments across construction projects
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useToast } from '@/components/ui/use-toast'

// Icons
import { 
  Users, 
  UserCheck, 
  Briefcase, 
  Activity, 
  Search, 
  List, 
  Plus, 
  Mail, 
  Phone, 
  Building, 
  Award, 
  MapPin, 
  Calendar, 
  Clock, 
  User,
  ChevronRight,
  Grid2X2,
  ListFilter,
  RefreshCw,
  MessageSquare,
  FileText,
  Info
} from 'lucide-react'

// UI Components
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger 
} from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Shared Components
import { MainNavigation } from '@/components/navigation/MainNavigation'
import { PageHeader } from '@/components/shared'
import { Grid } from '@/components/layout/Grid'
import { StatCard } from '@/components/shared/StatCard'
import { TeamFilters, TeamFilters as TeamFiltersType } from '@/components/team/TeamFilters'
import { EmptyState } from '@/components/shared/EmptyState'
import { AnimatePresence, m } from 'framer-motion'

// Types
import { TeamMember, NewTeamMember } from '@/types/team'
import { ViewMode, AvailabilityStatus } from '@/types/common'

// Data Services
import { 
  getTeamMembers,
  getDepartments,
  getStatusOptions,
  getProjects
} from '@/data/teamService'

// Import mock team data
import { teamData } from '@/data/teamData'

// Utility functions
import { formatDate } from '@/lib/utils'
import { useErrorHandler } from '@/lib/errorUtils'
import { validateEmail, validateRequired, validatePhone } from '@/lib/validationUtils'

/**
 * MultiSelect component
 */
interface MultiSelectProps {
  values: string[]
  onChange: (values: string[]) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
}

const MultiSelect = ({ values, onChange, options, placeholder, className }: MultiSelectProps) => {
  const [open, setOpen] = useState(false)

  const toggleOption = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter(v => v !== value))
    } else {
      onChange([...values, value])
    }
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {values.length > 0 
              ? `${values.length} selected` 
              : placeholder || "Select options"}
            <ChevronRight className={`ml-2 h-4 w-4 shrink-0 opacity-50 ${open ? "rotate-90" : ""}`} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 dark:bg-slate-800 dark:border-slate-700">
          <div className="border-b border-gray-200 dark:border-gray-700 px-3 py-2">
            <div className="text-sm font-medium">Select Projects</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Choose the projects to assign</div>
          </div>
          <div className="max-h-[200px] overflow-y-auto p-2">
            {options.map((option) => (
              <div 
                key={option.value}
                className="flex items-center space-x-2 rounded-md px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <Checkbox
                  id={`option-${option.value}`}
                  checked={values.includes(option.value)}
                  onCheckedChange={() => toggleOption(option.value)}
                  className="h-4 w-4"
                />
                <label 
                  htmlFor={`option-${option.value}`}
                  className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-white"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
          {options.length === 0 && (
            <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No options available
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

/**
 * Team management page component
 */
export default function Team() {
  const { toast } = useToast()
  const { handleError, handleValidationError } = useErrorHandler()
  const navigate = useNavigate()
  
  // State management
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState('name')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<TeamFiltersType>({
    departments: [],
    availability: [],
    onlyTopPerformers: false
  })
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false)
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false)
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(teamData)
  
  // Load data from service
  const departments = getDepartments()
  const statusOptions = getStatusOptions()
  const projects = getProjects()
  const [newMember, setNewMember] = useState<NewTeamMember>({
    name: '',
    role: '',
    email: '',
    phone: '',
    department: '',
    projects: []
  })

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  // Filter and sort team members
  const filteredTeamMembers = useMemo(() => {
    if (!teamMembers) return []
    
    return teamMembers
      .filter(member => {
        // Filter by search query
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.department.toLowerCase().includes(searchQuery.toLowerCase())
        
        // Filter by department
        const matchesDepartment = filters.departments.length === 0 || 
          filters.departments.includes(member.department)
        
        // Filter by availability
        const matchesAvailability = filters.availability.length === 0 || 
          filters.availability.includes(member.status)
        
        // Filter by top performers
        const matchesTopPerformer = !filters.onlyTopPerformers || 
          member.projects?.length >= 3
          
        return matchesSearch && matchesDepartment && matchesAvailability && matchesTopPerformer
      })
      .sort((a, b) => {
        // Sort by selected criteria
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'department':
            return a.department.localeCompare(b.department)
          case 'tasks':
            return (b.tasks?.completed || 0) - (a.tasks?.completed || 0)
          default:
            return a.name.localeCompare(b.name)  // Default sort by name
        }
      })
  }, [teamMembers, searchQuery, filters, sortBy])

  // Calculate average workload
  const averageWorkload = useMemo(() => {
    if (teamMembers.length === 0) return 0
    const total = teamMembers.reduce((sum, member) => sum + member.workload, 0)
    return Math.round(total / teamMembers.length)
  }, [teamMembers])

  /**
   * Open the view profile dialog
   */
  function openViewProfile(member: TeamMember) {
    setCurrentMember(member)
    setIsViewProfileOpen(true)
  }

  /**
   * Open the confirm remove dialog
   */
  function openConfirmRemoveDialog(member: TeamMember) {
    setCurrentMember(member)
    setIsConfirmRemoveOpen(true)
  }

  /**
   * Handle adding a new team member
   */
  function handleAddMember() {
    try {
      // Validate required fields
      if (!newMember.name || !newMember.role || !newMember.email) return
      
      const id = Math.max(...teamMembers.map(m => m.id), 0) + 1
      const newTeamMember: TeamMember = {
        id,
        name: newMember.name,
        role: newMember.role,
        email: newMember.email,
        phone: newMember.phone,
        department: newMember.department,
        projects: newMember.projects,
        status: 'active',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newMember.name}`,
        skills: newMember.skills || [],
        workload: newMember.workload || 0,
        joinDate: newMember.joinDate || new Date().toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        }),
        certifications: newMember.certifications || [],
        availability: newMember.availability || 'Full-time',
        location: newMember.location || 'Accra, Ghana'
      }
      
      setTeamMembers([...teamMembers, newTeamMember])
      setNewMember({
        name: '',
        role: '',
        email: '',
        phone: '',
        department: '',
        projects: []
      })
      setIsAddMemberOpen(false)
      
      toast({
        title: 'Team Member Added',
        description: `${newTeamMember.name} has been added to the team`,
      })
    } catch (error) {
      handleError(error, 'Failed to Add Team Member')
    }
  }

  /**
   * Handle changing a team member's status
   */
  function handleStatusChange(id: number, newStatus: 'active' | 'inactive') {
    setTeamMembers(teamMembers.map(member => 
      member.id === id ? { ...member, status: newStatus } : member
    ))
    
    // If this is the currently viewed member, update current member state
    if (currentMember?.id === id) {
      setCurrentMember({
        ...currentMember,
        status: newStatus
      })
    }
  }

  /**
   * Handle deleting a team member
   */
  function handleDeleteMember(id: number) {
    setTeamMembers(teamMembers.filter(member => member.id !== id))
    setIsConfirmRemoveOpen(false)
  }

  /**
   * Handle project selection for a new team member
   */
  function handleProjectChange(value: string) {
    setNewMember({
      ...newMember,
      projects: [value]
    })
  }

  /**
   * Reset all filters to default values
   */
  function handleResetFilters() {
    setSearchQuery('')
    setFilters({
      departments: [],
      availability: [],
      onlyTopPerformers: false
    })
  }

  /**
   * Get the appropriate color for workload based on value
   */
  function getWorkloadColor(workload: number): string {
    if (workload > 80) return 'var(--red-500)'
    if (workload > 60) return 'var(--amber-500)'
    return 'var(--blue-500)'
  }

  /**
   * Handle multi-project selection for a new team member
   */
  function handleMultiProjectChange(values: string[]) {
    setNewMember({
      ...newMember,
      projects: values
    })
  }

  /**
   * Navigate to the messaging page with the selected team member for starting a chat
   */
  function handleStartChat(member: TeamMember) {
    console.log("Starting chat with team member:", member);
    
    // The ID in startChatWith needs to be a string, and should match the exact ID format
    // expected in the Messaging component
    navigate('/messaging', { 
      state: { 
        startChatWith: {
          id: String(member.id), // Convert number to string without adding 'user-' prefix
          name: member.name,
          avatar: member.avatar,
          role: member.role
        }
      } 
    });
  }

  // Render team member cards
  const renderTeamMembers = useCallback(() => {
    if (loading) {
      // Render skeleton loaders
      return Array.from({ length: 8 }).map((_, index) => (
        <div 
          key={index} 
          className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 h-[280px] animate-pulse"
        />
      ))
    }
    
    if (filteredTeamMembers.length === 0) {
      return (
        <div className="col-span-full">
          <EmptyState
            title="No team members found"
            description="Try changing your filters or search query"
            icon={<Users className="h-12 w-12 text-gray-400" />}
            actions={
              <Button 
                variant="outline" 
                onClick={handleResetFilters}
              >
                Clear All Filters
              </Button>
            }
          />
        </div>
      )
    }
    
    return filteredTeamMembers.map((member) => (
      <m.div
        key={member.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <TeamMemberCard
          member={member}
          viewMode={viewMode}
          onViewProfile={openViewProfile}
          onStartChat={handleStartChat}
        />
      </m.div>
    ))
  }, [loading, filteredTeamMembers, viewMode, openViewProfile, handleStartChat, handleResetFilters])

  // Profile dialog sections
  const PROFILE_TABS = [
    { id: 'overview', label: 'Overview', icon: <Info className="h-4 w-4 mr-2" /> },
    { id: 'projects', label: 'Projects', icon: <Briefcase className="h-4 w-4 mr-2" /> },
    { id: 'skills', label: 'Skills', icon: <Award className="h-4 w-4 mr-2" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4 mr-2" /> }
  ]

  return (
    <>
      <Helmet>
        <title>Team • BuildEase</title>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
        <MainNavigation
          title="Team"
          icon={<Users className="h-6 w-6" />}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <PageHeader
            title="Team Management"
            description="Manage your team members and assignments"
            icon={<Users className="h-8 w-8" />}
            actions={
              <Button
                variant="default"
                className="bg-white hover:bg-gray-100 text-blue-700 border border-white/20"
                onClick={() => setIsAddMemberOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Team Member
              </Button>
            }
          />

          {/* Team Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Members"
              value={teamMembers.length}
              icon={<Users className="h-6 w-6" />}
              color="blue"
              subtitle="team members"
            />
            
            <StatCard
              title="Active Members"
              value={teamMembers.filter(m => m.status === 'active').length}
              icon={<UserCheck className="h-6 w-6" />}
              color="green"
              subtitle="currently active"
            />
            
            <StatCard
              title="Projects Assigned"
              value={Array.from(new Set(teamMembers.flatMap(m => m.projects || []))).length}
              icon={<Briefcase className="h-6 w-6" />}
              color="amber"
              subtitle="active projects"
            />
            
            <StatCard
              title="Average Workload"
              value={`${Math.round(teamMembers.reduce((acc, member) => acc + member.workload, 0) / (teamMembers.length || 1))}%`}
              icon={<Activity className="h-6 w-6" />}
              color="purple"
              subtitle="team capacity"
            />
          </div>

          <div className="mt-6">
            <div className={!loading && filteredTeamMembers.length === 0 ? "" : "space-y-6"}>
              {/* Filters */}
              <TeamFilters
                onSearch={setSearchQuery}
                onFilterChange={setFilters}
              />
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {loading ? (
                      <div className="h-5 w-28 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                    ) : (
                      <>Showing {filteredTeamMembers.length} of {teamData.length} team members</>
                    )}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => {
                      setLoading(true)
                      setTimeout(() => {
                        setLoading(false)
                        toast({
                          title: 'Data Refreshed',
                          description: 'Team data has been updated',
                        })
                      }, 500)
                    }}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="sr-only">Refresh data</span>
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <ListFilter className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <Select 
                      defaultValue="name"
                      value={sortBy}
                      onValueChange={setSortBy}
                    >
                      <SelectTrigger className="w-[160px] h-9 bg-white dark:bg-slate-800">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Sort by Name</SelectItem>
                        <SelectItem value="department">Sort by Department</SelectItem>
                        <SelectItem value="tasks">Sort by Task Completion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="border-l border-gray-200 dark:border-gray-700 h-6 mx-1" />
                  
                  <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-md p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid2X2 className="h-4 w-4" />
                      <span className="sr-only">Grid view</span>
                    </Button>
                    
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                      <span className="sr-only">List view</span>
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Team Members Grid or List */}
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-4"
              }>
                <AnimatePresence>
                  {renderTeamMembers()}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Team Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-[650px] dark:bg-slate-800 dark:border-slate-700 p-0">
          <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg">
            <DialogTitle className="text-xl text-blue-950 dark:text-blue-100 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Add Team Member
            </DialogTitle>
            <DialogDescription className="text-blue-700/70 dark:text-blue-400/70">
              Add a new member to your construction team. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              <div className="w-full sm:w-1/3 flex flex-col items-center justify-start">
                <div className="relative w-32 h-32 mb-3 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden border-4 border-white dark:border-slate-600 shadow-md mx-auto">
                  {newMember.name ? (
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newMember.name)}`} 
                      alt="Preview avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                  Profile preview updates as you type the name
                </p>
                </div>
                
              <div className="w-full sm:w-2/3 space-y-5">
                <div className="space-y-1.5">
                  <Label className="dark:text-gray-300" htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="name" 
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                    placeholder="John Doe"
                  />
                  {!newMember.name && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 pl-1 h-4">
                      Name is required
                    </p>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <Label className="dark:text-gray-300" htmlFor="role">
                    Role / Position <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="role"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                    placeholder="Site Engineer"
                  />
                  {!newMember.role && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 pl-1 h-4">
                      Role is required
                    </p>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <Label className="dark:text-gray-300" htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                    placeholder="john.doe@example.com"
                  />
                  {!newMember.email ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400 pl-1 h-4">
                      Email is required
                    </p>
                  ) : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMember.email) && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 pl-1 h-4">
                      Please enter a valid email address
                    </p>
                  )}
                </div>
              </div>
                </div>
                
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="dark:text-gray-300" htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  placeholder="+233 20 123 4567"
                />
            </div>
            
              <div className="space-y-1.5">
                <Label className="dark:text-gray-300" htmlFor="department">
                  Department <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={newMember.department} 
                  onValueChange={(value) => setNewMember({ ...newMember, department: value })}
                  >
                  <SelectTrigger 
                    id="department"
                    className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  >
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                    {departments.filter(dept => dept !== 'All').map((department) => (
                      <SelectItem 
                        key={department} 
                        value={department}
                        className="dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-white"
                      >
                        {department}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                {!newMember.department && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 pl-1 h-4">
                    Department is required
                  </p>
                )}
                </div>
                
              <div className="space-y-1.5">
                <Label className="dark:text-gray-300" htmlFor="projects">Assigned Projects</Label>
                <MultiSelect 
                  values={newMember.projects}
                  onChange={handleMultiProjectChange}
                  options={projects.map(p => ({ value: p, label: p }))}
                  placeholder="Select projects"
                  className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="dark:text-gray-300" htmlFor="location">Location</Label>
                    <Input 
                  id="location" 
                  value={newMember.location || ''}
                  onChange={(e) => setNewMember({ ...newMember, location: e.target.value })}
                  className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  placeholder="Accra, Ghana"
                />
                </div>
                
              <div className="space-y-1.5">
                <Label className="dark:text-gray-300" htmlFor="availability">Availability</Label>
                <Select 
                  value={newMember.availability || 'Full-time'} 
                  onValueChange={(value) => setNewMember({ ...newMember, availability: value })}
                >
                  <SelectTrigger 
                    id="availability"
                    className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  >
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                    {['Full-time', 'Part-time', 'Contract', 'Temporary'].map((item) => (
                      <SelectItem 
                        key={item} 
                        value={item}
                        className="dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-white"
                      >
                        {item}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                </div>
                
              <div className="space-y-1.5">
                <Label className="dark:text-gray-300" htmlFor="skills">Skills</Label>
                  <Input 
                    id="skills" 
                  value={(newMember.skills || []).join(', ')}
                  onChange={(e) => setNewMember({ 
                    ...newMember, 
                    skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  placeholder="Concrete, Electrical, Planning (comma-separated)"
                  />
                </div>
            </div>
          </div>
          
          <DialogFooter className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 rounded-b-lg">
              <Button 
                variant="outline" 
                onClick={() => setIsAddMemberOpen(false)}
              className="dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 dark:border-slate-600"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddMember}
              disabled={!newMember.name || !newMember.role || !newMember.email || !newMember.department || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMember.email)}
              className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
              >
              <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog open={isViewProfileOpen} onOpenChange={setIsViewProfileOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 max-h-[85vh] overflow-hidden dark:bg-slate-800 dark:border-slate-700">
          {currentMember && (
            <>
              {/* Header */}
              <div className="relative">
                {/* Cover Image/Background */}
                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 rounded-t-lg" />
                
                {/* Avatar and Basic Info */}
                <div className="px-6 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-end -mt-16 sm:-mt-12 gap-4">
                    <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white dark:border-slate-700 shadow-md">
                      <AvatarImage src={currentMember.avatar} alt={currentMember.name} />
                      <AvatarFallback className={`text-2xl ${
                        currentMember.status === 'active'
                          ? 'bg-blue-600 dark:bg-blue-700 text-white'
                          : 'bg-gray-400 dark:bg-slate-600 text-white'
                      }`}>
                        {currentMember.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h2 className="text-2xl font-bold dark:text-white">{currentMember.name}</h2>
                          <p className="text-gray-600 dark:text-gray-400">{currentMember.role}</p>
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                          <Badge variant={currentMember.status === 'active' ? "success" : "secondary"}
                            className={currentMember.status === 'active' 
                              ? 'text-sm py-1 px-2 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30' 
                              : 'text-sm py-1 px-2 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600/30'}>
                            {currentMember.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="gap-1 bg-white/90 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
                            onClick={() => {
                              setIsViewProfileOpen(false);
                              handleStartChat(currentMember);
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tabbed Content */}
              <Tabs defaultValue="overview" className="px-6">
                <TabsList className="w-full grid grid-cols-4 mb-4">
                  {PROFILE_TABS.map(tab => (
                    <TabsTrigger key={tab.id} value={tab.id} className="gap-1">
                      {tab.icon}
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <div className="max-h-[calc(85vh-300px)] overflow-y-auto pr-2">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    {/* Contact Information */}
                    <Card className="border-0 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50">
                      <CardHeader className="px-4 py-3 border-b dark:border-slate-700/50">
                        <CardTitle className="text-base text-gray-900 dark:text-gray-200 flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          Contact Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                        <div className="flex items-center gap-2 group">
                          <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                          <span className="text-gray-700 dark:text-gray-300">{currentMember.email}</span>
                        </div>
                        <div className="flex items-center gap-2 group">
                          <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                          <span className="text-gray-700 dark:text-gray-300">{currentMember.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2 group">
                          <Building className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                          <span className="text-gray-700 dark:text-gray-300">{currentMember.department}</span>
                        </div>
                        <div className="flex items-center gap-2 group">
                          <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                          <span className="text-gray-700 dark:text-gray-300">{currentMember.location}</span>
                        </div>
                        <div className="flex items-center gap-2 group">
                          <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                          <span className="text-gray-700 dark:text-gray-300">Joined: {currentMember.joinDate}</span>
                        </div>
                        <div className="flex items-center gap-2 group">
                          <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                          <span className="text-gray-700 dark:text-gray-300">{currentMember.availability}</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Current Workload */}
                    <Card className="border-0 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50">
                      <CardHeader className="px-4 py-3 border-b dark:border-slate-700/50">
                        <CardTitle className="text-base text-gray-900 dark:text-gray-200 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          Workload Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500 dark:text-gray-400">Current Capacity</span>
                          <span className="font-medium dark:text-white">{currentMember.workload}%</span>
                        </div>
                        <Progress 
                          value={currentMember.workload} 
                          className="h-3 dark:bg-slate-700 rounded-lg"
                          style={{
                            '--progress-background': getWorkloadColor(currentMember.workload)
                          } as React.CSSProperties}
                        />
                        
                        <div className="flex justify-between mt-3 text-xs">
                          <span className="text-green-600 dark:text-green-400">Under Capacity</span>
                          <span className="text-amber-600 dark:text-amber-400">Optimal</span>
                          <span className="text-red-600 dark:text-red-400">Over Capacity</span>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Projects Tab */}
                  <TabsContent value="projects" className="space-y-6">
                    <Card className="border-0 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50">
                      <CardHeader className="px-4 py-3 border-b dark:border-slate-700/50">
                        <CardTitle className="text-base text-gray-900 dark:text-gray-200 flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          Assigned Projects
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        {currentMember.projects && currentMember.projects.length > 0 ? (
                          <div className="space-y-3">
                            {currentMember.projects.map((project, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-slate-700/40 p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-8 bg-blue-500 dark:bg-blue-600 rounded-full"></div>
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">{project}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Assigned {Math.floor(Math.random() * 12) + 1} weeks ago</p>
                                  </div>
                                </div>
                                <Badge className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50">
                                  Active
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                            No projects currently assigned
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Skills Tab */}
                  <TabsContent value="skills" className="space-y-6">
                    <Card className="border-0 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50">
                      <CardHeader className="px-4 py-3 border-b dark:border-slate-700/50">
                        <CardTitle className="text-base text-gray-900 dark:text-gray-200 flex items-center gap-2">
                          <Award className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          Skills & Expertise
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {currentMember.skills && currentMember.skills.length > 0 ? (
                            currentMember.skills.map((skill, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="py-1.5 text-xs dark:border-slate-600 dark:text-gray-300 dark:bg-slate-700/30"
                              >
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <div className="text-center w-full py-2 text-gray-500 dark:text-gray-400">
                              No skills listed
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50">
                      <CardHeader className="px-4 py-3 border-b dark:border-slate-700/50">
                        <CardTitle className="text-base text-gray-900 dark:text-gray-200 flex items-center gap-2">
                          <Award className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          Certifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {currentMember.certifications && currentMember.certifications.length > 0 ? (
                            currentMember.certifications.map((cert, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="py-1.5 text-xs border-blue-200 dark:border-blue-800/30 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20"
                              >
                                {cert}
                              </Badge>
                            ))
                          ) : (
                            <div className="text-center w-full py-2 text-gray-500 dark:text-gray-400">
                              No certifications listed
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Documents Tab */}
                  <TabsContent value="documents" className="space-y-6">
                    <Card className="border-0 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50">
                      <CardHeader className="px-4 py-3 border-b dark:border-slate-700/50">
                        <CardTitle className="text-base text-gray-900 dark:text-gray-200 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          Documents
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400 italic">
                          No documents available for this team member
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
              
              <DialogFooter className="flex justify-between items-center px-6 py-4 border-t dark:border-slate-700/50 mt-4">
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setIsViewProfileOpen(false)
                    openConfirmRemoveDialog(currentMember)
                  }}
                  className="dark:bg-red-700 dark:hover:bg-red-800"
                >
                  Remove Member
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewProfileOpen(false)}
                  className="dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 dark:border-slate-600"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Dialog */}
      <AlertDialog open={isConfirmRemoveOpen} onOpenChange={setIsConfirmRemoveOpen}>
        <AlertDialogContent className="dark:bg-slate-800 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              This action will remove {currentMember?.name} from the team. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 dark:border-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              onClick={() => currentMember && handleDeleteMember(currentMember.id)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/**
 * Empty state component when no team members are found
 */
interface EmptyTeamStateProps {
  hasFilters: boolean
  onAddMember: () => void
}

function EmptyTeamState({ hasFilters, onAddMember }: EmptyTeamStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No team members found</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {hasFilters
          ? "No team members match your current filters. Try adjusting your search criteria."
          : "Your team is empty. Add team members to get started."}
      </p>
          <Button 
        onClick={onAddMember} 
        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Team Member
          </Button>
        </div>
  )
}

/**
 * Import components from dedicated files to complete the page
 */
import { TeamMemberCard } from '@/components/team/TeamMemberCard' 