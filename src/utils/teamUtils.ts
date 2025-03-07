/**
 * Utility functions for team management
 */
import { TeamMember } from '@/types/team'

/**
 * Calculate the average workload of team members
 */
export function calculateAverageWorkload(members: TeamMember[]): number {
  if (members.length === 0) return 0
  
  const total = members.reduce((sum, member) => sum + member.workload, 0)
  return Math.round(total / members.length)
}

/**
 * Filter team members based on search query and filters
 */
export function filterTeamMembers(
  members: TeamMember[],
  searchQuery: string, 
  departmentFilter: string, 
  statusFilter: string
): TeamMember[] {
  return members.filter(member => {
    const matchesSearch = searchQuery === '' || 
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
}

/**
 * Get team member avatar fallback from name
 */
export function getInitials(name: string): string {
  if (!name) return ''
  
  const parts = name.split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Get departments from team members
 */
export function getUniqueDepartments(members: TeamMember[]): string[] {
  const departments = new Set(members.map(m => m.department))
  return Array.from(departments)
}

/**
 * Create a new team member with default values
 */
export function createNewTeamMember(
  id: number,
  data: {
    name: string
    role: string
    email: string
    phone: string
    department: string
    projects: string[]
    location?: string
    skills?: string[]
    certifications?: string[]
    workload?: number
    joinDate?: string
    availability?: string
  }
): TeamMember {
  return {
    id,
    name: data.name,
    role: data.role,
    email: data.email,
    phone: data.phone,
    department: data.department,
    projects: data.projects,
    status: 'active',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
    skills: data.skills || [],
    workload: data.workload || 0,
    joinDate: data.joinDate || new Date().toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }),
    certifications: data.certifications || [],
    availability: data.availability || 'Full-time',
    location: data.location || 'Accra, Ghana'
  }
} 