/**
 * Team.tsx - Team management page
 * Manage team members, roles, and assignments across construction projects
 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useToast } from '@/components/ui/use-toast'

// Icons
import { 
  Users, 
  Plus, 
  Grid2X2,
  List,
  RefreshCw
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
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

// Custom components
import { PageHeader } from '@/components/shared'
import { TeamMemberCard } from '@/components/team/TeamMemberCard'
import TeamFilters from '@/components/team/TeamFilters'
import { TeamStatistics } from '@/components/team/TeamStatistics'
import { TeamMemberDetail } from '@/components/team/TeamMemberDetail'

// Types and utilities
import type { TeamMember, NewTeamMember } from '@/types/team'
import type { ViewMode } from '@/types/common'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useTeamFilters } from '@/hooks/useTeamFilters'

// Mock data
import { teamData, getDepartments, getStatusOptions, getProjects } from '@/data/teamData'

/**
 * Team management page component
 * 
 * Following Buildese UI design principles:
 * - Card-based UI with subtle shadows
 * - Clear visual feedback
 * - Consistent spacing
 * - Modern, aesthetic look with warm blue accents
 * - Progressive disclosure for complex tasks
 */
export default function Team() {
  const { toast } = useToast()
  const { handleError, handleValidationError } = useErrorHandler()
  const navigate = useNavigate()
  
  // State management
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
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

  // Use our custom hook for filtering and sorting
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    filteredTeamMembers
  } = useTeamFilters(teamMembers)

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  // Handle adding a new team member
  const handleAddMember = () => {
    // Validation
    if (!newMember.name || !newMember.role || !newMember.email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }
    
    // Create new member with generated ID and default values
    const member: TeamMember = {
      id: `tm-${Date.now()}`,
      name: newMember.name,
      role: newMember.role,
      email: newMember.email,
      phone: newMember.phone,
      department: newMember.department,
      status: 'active',
      workload: 0,
      performance: 0,
      completedTasks: 0,
      totalTasks: 0,
      joinDate: new Date().toLocaleDateString(),
      availability: 'available',
      projects: []
    }
    
    // Add to team members
    setTeamMembers([...teamMembers, member])
    
    // Reset form and close dialog
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
      description: `${member.name} has been added to the team`,
    })
  }

  // Handle viewing a team member's profile
  const handleViewProfile = (member: TeamMember) => {
    setCurrentMember(member)
    setIsViewProfileOpen(true)
  }

  // Handle editing a team member
  const handleEditMember = (member: TeamMember) => {
    // Close the profile view
    setIsViewProfileOpen(false)
    
    // Navigate to edit page
    navigate(`/team/edit/${member.id}`)
  }

  // Handle removing a team member
  const handleRemoveMember = (member: TeamMember) => {
    // Close the profile view and open confirmation
    setIsViewProfileOpen(false)
    setCurrentMember(member)
    setIsConfirmRemoveOpen(true)
  }

  // Confirm removal of a team member
  const confirmRemoveMember = () => {
    if (!currentMember) return
    
    // Remove from team members
    setTeamMembers(teamMembers.filter(m => m.id !== currentMember.id))
    
    // Close dialog
    setIsConfirmRemoveOpen(false)
    setCurrentMember(null)
    
    toast({
      title: 'Team Member Removed',
      description: `${currentMember.name} has been removed from the team`,
    })
  }

  return (
    <>
      <Helmet>
        <title>Team Management | BuildEase Construction</title>
        <meta name="description" content="Manage your construction team members and assignments" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
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
          <TeamStatistics teamMembers={teamMembers} />

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
                    <Select 
                      defaultValue="name"
                      value={sortBy}
                      onValueChange={(value) => setSortBy(value as 'name' | 'role' | 'department' | 'workload' | 'performance')}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="role">Role</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="workload">Workload</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <Button 
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="icon"
                      className={`h-9 w-9 rounded-none ${viewMode === 'grid' ? 'bg-blue-600 text-white' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid2X2 className="h-4 w-4" />
                      <span className="sr-only">Grid view</span>
                    </Button>
                    <Button 
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="icon"
                      className={`h-9 w-9 rounded-none ${viewMode === 'list' ? 'bg-blue-600 text-white' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                      <span className="sr-only">List view</span>
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Team Members Grid/List */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div 
                      key={index} 
                      className="h-[220px] bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredTeamMembers.length === 0 ? (
                <EmptyTeamState 
                  hasFilters={searchQuery !== '' || filters.departments.length > 0 || filters.availability.length > 0 || filters.onlyTopPerformers}
                  onAddMember={() => setIsAddMemberOpen(true)}
                />
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTeamMembers.map(member => (
                    <TeamMemberCard 
                      key={member.id}
                      member={member}
                      onViewProfile={handleViewProfile}
                      onStartChat={(member) => navigate('/messaging', { state: { startChatWith: member } })}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Department</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Workload</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Projects</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeamMembers.map(member => (
                        <tr 
                          key={member.id} 
                          className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => handleViewProfile(member)}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-medium">
                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">{member.role}</td>
                          <td className="px-4 py-4">{member.department}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                              {member.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${member.workload > 80 ? 'bg-red-500' : member.workload > 60 ? 'bg-amber-500' : 'bg-green-500'}`}
                                  style={{ width: `${member.workload}%` }}
                                />
                              </div>
                              <span className="text-sm">{member.workload}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">{member.projects?.length || 0}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewProfile(member)
                                }}
                              >
                                View
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate('/messaging', { state: { startChatWith: member } })
                                }}
                              >
                                Message
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Team Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to your construction team.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input 
                id="name" 
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role *
              </Label>
              <Input 
                id="role" 
                value={newMember.role}
                onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <Input 
                id="email" 
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input 
                id="phone" 
                value={newMember.phone}
                onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Department
              </Label>
              <Select 
                value={newMember.department}
                onValueChange={(value) => setNewMember({...newMember, department: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Member Detail Dialog */}
      <TeamMemberDetail
        member={currentMember}
        open={isViewProfileOpen}
        onClose={() => {
          setIsViewProfileOpen(false)
          setCurrentMember(null)
        }}
        onEdit={handleEditMember}
        onRemove={handleRemoveMember}
      />

      {/* Confirm Remove Dialog */}
      <Dialog open={isConfirmRemoveOpen} onOpenChange={setIsConfirmRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {currentMember?.name} from the team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmRemoveOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemoveMember}>
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Empty state component when no team members are found
 */
interface EmptyTeamStateProps {
  hasFilters: boolean;
  onAddMember: () => void;
}

function EmptyTeamState({ hasFilters, onAddMember }: EmptyTeamStateProps) {
  return (
    <div className="text-center py-12 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
      <Users className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" />
      <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
        {hasFilters ? 'No matching team members' : 'No team members yet'}
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {hasFilters 
          ? 'Try adjusting your filters to find what you\'re looking for.'
          : 'Get started by adding your first team member.'}
      </p>
      {!hasFilters && (
        <Button
          onClick={onAddMember}
          className="mt-4"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Team Member
        </Button>
      )}
    </div>
  )
}

// Import components from dedicated files to complete the page
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'