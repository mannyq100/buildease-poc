/**
 * Team data mock file
 * Consolidated team members, departments, statuses, and project data
 * Used for development and demonstration purposes
 */
import { TeamMember } from '@/types/team'

/**
 * Department options for team filtering
 */
export const DEPARTMENTS = [
  'All',
  'Management',
  'Engineering',
  'Design',
  'Procurement',
  'Safety',
  'Construction'
]

/**
 * Status options for filtering team members
 */
export const STATUS_OPTIONS = [
  'All',
  'Active',
  'Inactive',
  'On-Leave',
  'Remote'
]

/**
 * Available projects for team assignment
 */
export const PROJECTS = [
  'Downtown Office Complex',
  'Riverside Apartments',
  'Central Hospital Renovation',
  'Tech Park Development',
  'Harbor Bridge Repair',
  'Mountain View Residences',
  'City Center Mall',
  'University Campus Extension'
]

/**
 * Helper function to get all departments from team data
 */
export function getDepartments(): string[] {
  const departments = new Set<string>();
  teamData.forEach(member => {
    if (member.department) {
      departments.add(member.department);
    }
  });
  return ['All', ...Array.from(departments)];
}

/**
 * Helper function to get status options for team filtering
 */
export function getStatusOptions(): string[] {
  return ['All', 'Active', 'Inactive', 'On-Leave', 'Remote'];
}

/**
 * Helper function to get projects for assignment
 */
export function getProjects(): string[] {
  return PROJECTS;
}

/**
 * Team member mock data
 */
export const teamData: TeamMember[] = [
  {
    id: 1,
    name: 'Michael Johnson',
    position: 'Project Manager',
    email: 'michael.johnson@buildease.com',
    phone: '(555) 123-4567',
    avatar: '/avatars/michael-johnson.jpg',
    department: 'Management',
    completedTasks: 42,
    totalTasks: 50,
    performance: 92,
    availability: 'available',
    status: 'active',
    isTopPerformer: true,
    joinDate: 'Jan 2020'
  },
  {
    id: 2,
    name: 'Sarah Williams',
    position: 'Senior Engineer',
    email: 'sarah.williams@buildease.com',
    phone: '(555) 234-5678',
    avatar: '/avatars/sarah-williams.jpg',
    department: 'Engineering',
    completedTasks: 38,
    totalTasks: 45,
    performance: 84,
    availability: 'in-meeting',
    status: 'active',
    isTopPerformer: false,
    joinDate: 'Mar 2021'
  },
  {
    id: 3,
    name: 'David Miller',
    position: 'Architect',
    email: 'david.miller@buildease.com',
    phone: '(555) 345-6789',
    avatar: '/avatars/david-miller.jpg',
    department: 'Design',
    completedTasks: 45,
    totalTasks: 50,
    performance: 90,
    availability: 'available',
    status: 'active',
    isTopPerformer: true,
    joinDate: 'Feb 2020'
  },
  {
    id: 4,
    name: 'Emily Davis',
    position: 'Procurement Specialist',
    email: 'emily.davis@buildease.com',
    phone: '(555) 456-7890',
    avatar: '/avatars/emily-davis.jpg',
    department: 'Procurement',
    completedTasks: 30,
    totalTasks: 40,
    performance: 75,
    availability: 'off-site',
    status: 'active',
    isTopPerformer: false,
    joinDate: 'Jun 2021'
  },
  {
    id: 5,
    name: 'James Wilson',
    position: 'Safety Officer',
    email: 'james.wilson@buildease.com',
    phone: '(555) 567-8901',
    avatar: '/avatars/james-wilson.jpg',
    department: 'Safety',
    completedTasks: 25,
    totalTasks: 30,
    performance: 83,
    availability: 'available',
    status: 'active',
    isTopPerformer: false,
    joinDate: 'Apr 2022'
  },
  {
    id: 6,
    name: 'Olivia Thompson',
    position: 'Construction Supervisor',
    email: 'olivia.thompson@buildease.com',
    phone: '(555) 678-9012',
    avatar: '/avatars/olivia-thompson.jpg',
    department: 'Construction',
    completedTasks: 50,
    totalTasks: 55,
    performance: 91,
    availability: 'off-site',
    status: 'active',
    isTopPerformer: true,
    joinDate: 'Sep 2020'
  },
  {
    id: 7,
    name: 'Daniel Garcia',
    position: 'Electrical Engineer',
    email: 'daniel.garcia@buildease.com',
    phone: '(555) 789-0123',
    avatar: '/avatars/daniel-garcia.jpg',
    department: 'Engineering',
    completedTasks: 28,
    totalTasks: 35,
    performance: 80,
    availability: 'available',
    status: 'active',
    isTopPerformer: false,
    joinDate: 'May 2021'
  },
  {
    id: 8,
    name: 'Sophia Martinez',
    position: 'Interior Designer',
    email: 'sophia.martinez@buildease.com',
    phone: '(555) 890-1234',
    avatar: '/avatars/sophia-martinez.jpg',
    department: 'Design',
    completedTasks: 32,
    totalTasks: 40,
    performance: 80,
    availability: 'in-meeting',
    status: 'active',
    isTopPerformer: false,
    joinDate: 'Jul 2021'
  }
];
