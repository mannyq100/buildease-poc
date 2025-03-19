/**
 * Team-related type definitions
 * Used for managing team members and their information
 */

export interface TeamMember {
  id: number | string
  name: string
  role?: string
  position?: string
  email: string
  phone: string
  department: string
  projects?: string[]
  status: 'active' | 'inactive' | 'on-leave' | 'remote'
  avatar?: string
  skills?: string[]
  workload?: number
  joinDate: string
  certifications?: string[]
  availability: string
  location?: string
  completedTasks?: number
  totalTasks?: number
  performance?: number
  isTopPerformer?: boolean
  tags?: string[]
}

export interface NewTeamMember {
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

export interface TeamMemberCardProps {
  member: TeamMember
  viewMode?: 'grid' | 'list'
  onViewProfile?: (member: TeamMember) => void
  onStartChat?: (member: TeamMember) => void
  className?: string
}

export type ViewMode = 'grid' | 'list' 