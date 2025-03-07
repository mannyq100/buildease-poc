/**
 * Team.tsx - Team management page
 * Manage team members, roles, and assignments across construction projects
 */
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

// Icons
import { 
  Users, 
  UserCheck, 
  Briefcase, 
  Radar, 
  Search, 
  GridIcon, 
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
  Activity
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

// Shared Components
import { MainNavigation } from '@/components/navigation/MainNavigation'
import { PageHeader } from '@/components/shared'
import { Grid } from '@/components/layout/Grid'
import { StatCard } from '@/components/shared/StatCard'

// Types
import { TeamMember, NewTeamMember, ViewMode } from '@/types/team'

// Mock Data
import { INITIAL_TEAM_MEMBERS, DEPARTMENTS, STATUS_OPTIONS, PROJECTS } from '@/data/mock/teamMembers'

/**
 * Team management page component
 */
export function Team() {
  const navigate = useNavigate()
  
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false)
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false)
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS)
  const [newMember, setNewMember] = useState<NewTeamMember>({
    name: '',
    role: '',
    email: '',
    phone: '',
    department: '',
    projects: []
  })

  // Filter team members based on search and filters
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDepartment = 
      departmentFilter === 'All' || 
        member.department === departmentFilter
    
    const matchesStatus = 
      statusFilter === 'All' || 
      (statusFilter === 'Active' && member.status === 'active') ||
        (statusFilter === 'Inactive' && member.status === 'inactive')
      
      return matchesSearch && matchesDepartment && matchesStatus
    })
  }, [teamMembers, searchQuery, departmentFilter, statusFilter])

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
    setDepartmentFilter('All')
    setStatusFilter('All')
  }

  /**
   * Get the appropriate color for workload based on value
   */
  function getWorkloadColor(workload: number): string {
    if (workload > 80) return 'var(--red-500)'
    if (workload > 60) return 'var(--amber-500)'
    return 'var(--blue-500)'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
      <MainNavigation
        title="Team"
        icon={<Users className="h-6 w-6" />}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title="Team Management"
          description="Manage your team members, roles, and assignments"
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

        {/* Filters and Controls */}
        <Card className="mb-6 dark:bg-slate-800 border dark:border-slate-700">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                  icon={<Search className="h-4 w-4 dark:text-gray-500" />}
                />
              </div>
              <div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                    {DEPARTMENTS.map((department) => (
                      <SelectItem 
                        key={department} 
                        value={department}
                        className="dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-white"
                      >
                        {department === 'All' ? 'All Departments' : department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem 
                        key={status} 
                        value={status}
                        className="dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-white"
                      >
                        {status === 'All' ? 'All Status' : status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`dark:border-slate-700 ${
                      viewMode === 'grid' 
                        ? 'dark:bg-slate-700/50 dark:text-white' 
                        : 'dark:bg-slate-900 dark:text-gray-400'
                    }`}
                  >
                    <GridIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`dark:border-slate-700 ${
                      viewMode === 'list' 
                        ? 'dark:bg-slate-700/50 dark:text-white' 
                        : 'dark:bg-slate-900 dark:text-gray-400'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                
                  <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleResetFilters}
                  className="dark:bg-slate-900 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
                >
                  Reset Filters
                  </Button>
                </div>
            </div>
          </CardContent>
              </Card>

        {/* Team Members */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <TeamMemberCard 
                  key={member.id} 
                  member={member} 
                  onView={openViewProfile}
                  onRemove={openConfirmRemoveDialog}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <EmptyTeamState 
                hasFilters={searchQuery !== '' || departmentFilter !== 'All' || statusFilter !== 'All'}
                onAddMember={() => setIsAddMemberOpen(true)}
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                      <TeamMemberListItem 
                        key={member.id} 
                        member={member} 
                  onView={openViewProfile}
                  onRemove={openConfirmRemoveDialog}
                  onStatusChange={handleStatusChange}
                      />
                    ))
            ) : (
              <EmptyTeamState 
                hasFilters={searchQuery !== '' || departmentFilter !== 'All' || statusFilter !== 'All'}
                onAddMember={() => setIsAddMemberOpen(true)}
              />
                  )}
            </div>
        )}
      </div>

      {/* Add Team Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-[550px] dark:bg-slate-800 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Add Team Member</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Add a new member to your construction team
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
              <Label className="dark:text-gray-300" htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />
                </div>
                
                <div className="space-y-2">
              <Label className="dark:text-gray-300" htmlFor="role">Role / Position</Label>
                  <Input 
                id="role"
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />
                </div>
                
                <div className="space-y-2">
              <Label className="dark:text-gray-300" htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />
                </div>
                
                <div className="space-y-2">
              <Label className="dark:text-gray-300" htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />
            </div>
            
                <div className="space-y-2">
              <Label className="dark:text-gray-300" htmlFor="department">Department</Label>
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
                  {DEPARTMENTS.filter(dept => dept !== 'All').map((department) => (
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
                </div>
                
                <div className="space-y-2">
              <Label className="dark:text-gray-300" htmlFor="projects">Assigned Projects</Label>
              <Select 
                value={newMember.projects[0]}
                onValueChange={handleProjectChange}
              >
                <SelectTrigger 
                  id="projects"
                  className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                >
                  <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  {PROJECTS.map((project) => (
                    <SelectItem 
                      key={project} 
                      value={project}
                      className="dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-white"
                    >
                      {project}
                    </SelectItem>
                  ))}
                    </SelectContent>
                  </Select>
              </div>
            </div>
            
          <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddMemberOpen(false)}
              className="dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 dark:border-slate-600"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddMember}
              disabled={!newMember.name || !newMember.role || !newMember.email}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                Add Member
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog open={isViewProfileOpen} onOpenChange={setIsViewProfileOpen}>
        <DialogContent className="sm:max-w-[600px] dark:bg-slate-800 dark:border-slate-700">
              <DialogHeader>
                <DialogTitle className="dark:text-white">Team Member Profile</DialogTitle>
              </DialogHeader>
              
          {currentMember && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                <Avatar className="h-24 w-24 ring-4 ring-white/10 dark:ring-slate-700/50">
                    <AvatarImage src={currentMember.avatar} alt={currentMember.name} />
                  <AvatarFallback className={`text-xl ${
                    currentMember.status === 'active'
                      ? 'bg-blue-600 dark:bg-blue-700 text-white'
                      : 'bg-gray-400 dark:bg-slate-600 text-white'
                  }`}>
                    {currentMember.name.charAt(0)}
                  </AvatarFallback>
                  </Avatar>
                
                <div className="text-center sm:text-left flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-semibold dark:text-white">{currentMember.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400">{currentMember.role}</p>
                    </div>
                    <Badge variant={currentMember.status === 'active' ? "success" : "secondary"}
                    className={currentMember.status === 'active' 
                      ? 'dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30' 
                        : 'dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600/30'}>
                    {currentMember.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center text-sm group">
                        <Mail className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                      <span className="text-gray-600 dark:text-gray-300">{currentMember.email}</span>
                    </div>
                    <div className="flex items-center text-sm group">
                        <Phone className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                      <span className="text-gray-600 dark:text-gray-300">{currentMember.phone}</span>
                    </div>
                    <div className="flex items-center text-sm group">
                        <Building className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                      <span className="text-gray-600 dark:text-gray-300">{currentMember.department}</span>
                    </div>
                    <div className="flex items-center text-sm group">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                      <span className="text-gray-600 dark:text-gray-300">{currentMember.location}</span>
                    </div>
                    <div className="flex items-center text-sm group">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                      <span className="text-gray-600 dark:text-gray-300">Joined: {currentMember.joinDate}</span>
                    </div>
                    <div className="flex items-center text-sm group">
                        <Clock className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                      <span className="text-gray-600 dark:text-gray-300">{currentMember.availability}</span>
                    </div>
                  </div>
                    </div>
                  </div>
                  
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                  <h4 className="text-sm font-medium mb-2 dark:text-gray-300 flex items-center">
                    <Award className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    Skills & Expertise
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {currentMember.skills.map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                        className="text-xs dark:border-slate-600 dark:text-gray-300 dark:bg-slate-700/30"
                        >
                        {skill}
                        </Badge>
                      ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 dark:text-gray-300 flex items-center">
                    <Award className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    Certifications
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {currentMember.certifications.map((cert, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs dark:border-slate-600 dark:text-blue-300 dark:bg-blue-900/20"
                      >
                        {cert}
                      </Badge>
                    ))}
                  </div>
                    </div>
                  </div>
                  
                  <div>
                <h4 className="text-sm font-medium mb-2 dark:text-gray-300 flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                  Assigned Projects
                </h4>
                <div className="flex flex-wrap gap-1">
                  {currentMember.projects.map((project, index) => (
                        <Badge 
                          key={index} 
                      className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/20"
                        >
                      {project}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Current Workload</span>
                  <span className="font-medium dark:text-white">{currentMember.workload}%</span>
                      </div>
                      <Progress 
                        value={currentMember.workload} 
                        className="h-2 dark:bg-slate-700"
                        style={{
                    '--progress-background': getWorkloadColor(currentMember.workload)
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            <Button 
              variant="destructive" 
              onClick={() => {
                setIsViewProfileOpen(false)
                if (currentMember) {
                  openConfirmRemoveDialog(currentMember)
                }
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
    </div>
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
import { TeamMemberListItem } from '@/components/team/TeamMemberListItem'

export default Team 