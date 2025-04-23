/**
 * Team domain utilities
 * Functions for handling team data, filtering, and display
 */
import { TeamMember } from '@/types/team';

// BuildEase color scheme based on design principles
const BUILDEASE_COLORS = {
  primary: '#2B6CB0', // Warm blue for trust and professionalism
  accent: '#ED8936', // Warm orange for calls-to-action
  success: '#48BB78', // Green for success
  warning: '#F6AD55', // Amber for in-progress
  error: '#F56565', // Red for error
  earthTone1: '#9C6F44', // Muted earth tones for construction context
  earthTone2: '#8D6E63',
  earthTone3: '#A1887F'
};

/**
 * Calculate the average workload of team members
 * @param members Array of team members
 * @returns Average workload percentage
 */
export function calculateAverageWorkload(members: TeamMember[]): number {
  if (members.length === 0) return 0;
  
  const total = members.reduce((sum, member) => {
    // Use workload if it exists, otherwise compute from completed vs total tasks
    if (typeof member.workload === 'number') {
      return sum + member.workload;
    } else if (member.totalTasks && member.completedTasks) {
      return sum + (member.completedTasks / member.totalTasks * 100);
    }
    return sum;
  }, 0);
  
  return Math.round(total / members.length);
}

/**
 * Filter team members based on search query and filters
 * @param members Full list of team members
 * @param searchQuery Text to search for in name, role, email
 * @param departmentFilter Department to filter by
 * @param statusFilter Status to filter by
 * @returns Filtered list of team members
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
      member.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = 
      departmentFilter === 'All' || 
      member.department === departmentFilter;
    
    const matchesStatus = 
      statusFilter === 'All' || 
      (statusFilter === 'Active' && member.status === 'active') ||
      (statusFilter === 'Inactive' && member.status === 'inactive');
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });
}

/**
 * Get team member avatar fallback from name
 * @param name Full name of team member
 * @returns Initials of first and last name
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get unique departments from team members
 * @param members Array of team members
 * @returns Array of unique department names
 */
export function getUniqueDepartments(members: TeamMember[]): string[] {
  const departments = new Set(members.map(m => m.department));
  return Array.from(departments).sort();
}

/**
 * Calculate performance color based on performance score
 * Uses BuildEase color scheme
 * @param score Performance score (0-100)
 * @returns HEX color code
 */
export function getPerformanceColor(score: number): string {
  if (score >= 80) return BUILDEASE_COLORS.success;
  if (score >= 60) return BUILDEASE_COLORS.warning;
  return BUILDEASE_COLORS.error;
}

/**
 * Create a new team member with default values
 * @param id Unique identifier
 * @param data Team member basic data
 * @returns Complete TeamMember object
 */
export function createNewTeamMember(
  id: string,
  data: {
    name: string
    position?: string
    email: string
    phone?: string
    department: string
    projects?: string[]
    location?: string
    skills?: string[]
    certifications?: string[]
    performance?: number
    availability?: number
    joinDate?: string
  }
): TeamMember {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  
  return {
    id,
    name: data.name,
    position: data.position || 'Team Member',
    email: data.email,
    phone: data.phone || '',
    department: data.department,
    status: 'active',
    completedTasks: 0,
    totalTasks: 0,
    performance: data.performance || 0,
    availability: data.availability || 100,
    isTopPerformer: Boolean(data.performance >= 90), // Fix the isTopPerformer property to be a boolean
    joinDate: data.joinDate || formattedDate,
    skills: data.skills || [],
    certifications: data.certifications || [],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
    location: data.location || 'Accra, Ghana'
  };
}

/**
 * Calculate workload status based on current workload percentage
 * @param workload Current workload percentage
 * @returns Status string: 'Available', 'Light', 'Medium', or 'Heavy'
 */
export function getWorkloadStatus(workload: number): string {
  if (workload <= 25) return 'Available';
  if (workload <= 50) return 'Light';
  if (workload <= 75) return 'Medium';
  return 'Heavy';
}

/**
 * Get CSS classes for a team member's status indicator
 * @param status Status of the team member
 * @returns Tailwind CSS classes for the status badge
 */
export function getStatusClasses(status: string): string {
  // Use the BuildEase color scheme with Tailwind
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'inactive':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'on-leave':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
}
