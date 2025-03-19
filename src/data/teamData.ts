/**
 * Mock team data for the construction management application
 * In a real app, this would come from an API
 */
import { TeamMember } from '@/types/team'

/**
 * Get all departments from the team data
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
 * Get all status options for team members
 */
export function getStatusOptions(): string[] {
  return ['active', 'inactive', 'on-leave', 'remote'];
}

/**
 * Get all projects for assignment
 */
export function getProjects(): string[] {
  return [
    'Downtown Office Complex',
    'Riverside Apartments',
    'Central Hospital Renovation',
    'Tech Park Development',
    'Harbor Bridge Repair',
    'Mountain View Residences',
    'City Center Mall',
    'University Campus Extension'
  ];
}

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
    position: 'Lead Architect',
    email: 'sarah.williams@buildease.com',
    phone: '(555) 234-5678',
    avatar: '/avatars/sarah-williams.jpg',
    department: 'Architecture',
    completedTasks: 31,
    totalTasks: 35,
    performance: 88,
    availability: 'busy',
    status: 'active',
    isTopPerformer: true,
    joinDate: 'Mar 2020'
  },
  {
    id: 3,
    name: 'Robert Chen',
    position: 'Construction Manager',
    email: 'robert.chen@buildease.com',
    phone: '(555) 345-6789',
    avatar: '/avatars/robert-chen.jpg',
    department: 'Construction',
    completedTasks: 27,
    totalTasks: 35,
    performance: 77,
    availability: 'available',
    status: 'active',
    joinDate: 'Jun 2020'
  },
  {
    id: 4,
    name: 'Emily Rodriguez',
    position: 'Electrical Engineer',
    email: 'emily.rodriguez@buildease.com',
    phone: '(555) 456-7890',
    avatar: '/avatars/emily-rodriguez.jpg',
    department: 'Electrical',
    completedTasks: 18,
    totalTasks: 20,
    performance: 90,
    availability: 'available',
    status: 'active',
    isTopPerformer: true,
    joinDate: 'Sep 2020'
  },
  {
    id: 5,
    name: 'Daniel Kim',
    position: 'Plumbing Engineer',
    email: 'daniel.kim@buildease.com',
    phone: '(555) 567-8901',
    avatar: '/avatars/daniel-kim.jpg',
    department: 'Plumbing',
    completedTasks: 15,
    totalTasks: 18,
    performance: 83,
    availability: 'busy',
    status: 'active',
    isTopPerformer: true,
    joinDate: 'Nov 2020'
  },
  {
    id: 6,
    name: 'Madison Clark',
    position: 'Safety Manager',
    email: 'madison.clark@buildease.com',
    phone: '(555) 678-9012',
    department: 'Management',
    completedTasks: 12,
    totalTasks: 15,
    performance: 80,
    availability: 'available',
    status: 'active',
    isTopPerformer: true,
    joinDate: 'Feb 2021'
  },
  {
    id: 7,
    name: 'Thomas Wright',
    position: 'Carpenter',
    email: 'thomas.wright@buildease.com',
    phone: '(555) 789-0123',
    avatar: '/avatars/thomas-wright.jpg',
    department: 'Carpentry',
    completedTasks: 22,
    totalTasks: 30,
    performance: 73,
    availability: 'busy',
    status: 'active',
    joinDate: 'Apr 2021'
  },
  {
    id: 8,
    name: 'Lisa Henderson',
    position: 'Financial Analyst',
    email: 'lisa.henderson@buildease.com',
    phone: '(555) 890-1234',
    avatar: '/avatars/lisa-henderson.jpg',
    department: 'Finance',
    completedTasks: 19,
    totalTasks: 25,
    performance: 76,
    availability: 'available',
    status: 'active',
    joinDate: 'Jul 2021'
  },
  {
    id: 9,
    name: 'James Wilson',
    position: 'HR Manager',
    email: 'james.wilson@buildease.com',
    phone: '(555) 901-2345',
    department: 'HR',
    completedTasks: 8,
    totalTasks: 12,
    performance: 67,
    availability: 'on-leave',
    status: 'active',
    joinDate: 'Sep 2021'
  },
  {
    id: 10,
    name: 'Olivia Martinez',
    position: 'Junior Architect',
    email: 'olivia.martinez@buildease.com',
    phone: '(555) 012-3456',
    avatar: '/avatars/olivia-martinez.jpg',
    department: 'Architecture',
    completedTasks: 14,
    totalTasks: 20,
    performance: 70,
    availability: 'available',
    status: 'active',
    joinDate: 'Dec 2021'
  },
  {
    id: 11,
    name: 'William Lee',
    position: 'Sales Manager',
    email: 'william.lee@buildease.com',
    phone: '(555) 123-4567',
    avatar: '/avatars/william-lee.jpg',
    department: 'Sales',
    completedTasks: 25,
    totalTasks: 40,
    performance: 63,
    availability: 'busy',
    status: 'active',
    joinDate: 'Feb 2022'
  },
  {
    id: 12,
    name: 'Sophia Patel',
    position: 'Marketing Specialist',
    email: 'sophia.patel@buildease.com',
    phone: '(555) 234-5678',
    avatar: '/avatars/sophia-patel.jpg',
    department: 'Marketing',
    completedTasks: 18,
    totalTasks: 25,
    performance: 72,
    availability: 'available',
    status: 'active',
    joinDate: 'May 2022'
  },
  {
    id: 13,
    name: 'Benjamin Davis',
    position: 'Junior Engineer',
    email: 'benjamin.davis@buildease.com',
    phone: '(555) 345-6789',
    department: 'Engineering',
    completedTasks: 8,
    totalTasks: 15,
    performance: 53,
    availability: 'available',
    status: 'active',
    joinDate: 'Aug 2022'
  },
  {
    id: 14,
    name: 'Aiden Thompson',
    position: 'Site Inspector',
    email: 'aiden.thompson@buildease.com',
    phone: '(555) 456-7890',
    avatar: '/avatars/aiden-thompson.jpg',
    department: 'Construction',
    completedTasks: 12,
    totalTasks: 30,
    performance: 40,
    availability: 'busy',
    status: 'active',
    joinDate: 'Oct 2022'
  },
  {
    id: 15,
    name: 'Grace Nguyen',
    position: 'Designer',
    email: 'grace.nguyen@buildease.com',
    phone: '(555) 567-8901',
    avatar: '/avatars/grace-nguyen.jpg',
    department: 'Architecture',
    completedTasks: 15,
    totalTasks: 20,
    performance: 75,
    availability: 'available',
    status: 'active',
    joinDate: 'Jan 2023'
  },
  {
    id: 16,
    name: 'Alexander Brown',
    position: 'Estimator',
    email: 'alexander.brown@buildease.com',
    phone: '(555) 678-9012',
    department: 'Finance',
    completedTasks: 5,
    totalTasks: 15,
    performance: 33,
    availability: 'on-leave',
    status: 'inactive',
    joinDate: 'Mar 2023'
  },
  {
    id: 17,
    name: 'Isabella Scott',
    position: 'Administrative Assistant',
    email: 'isabella.scott@buildease.com',
    phone: '(555) 789-0123',
    department: 'HR',
    completedTasks: 22,
    totalTasks: 25,
    performance: 88,
    availability: 'available',
    status: 'active',
    isTopPerformer: true,
    joinDate: 'May 2023'
  },
  {
    id: 18,
    name: 'Jacob Turner',
    position: 'Construction Worker',
    email: 'jacob.turner@buildease.com',
    phone: '(555) 890-1234',
    department: 'Construction',
    completedTasks: 18,
    totalTasks: 20,
    performance: 90,
    availability: 'busy',
    status: 'active',
    isTopPerformer: true,
    joinDate: 'Jul 2023'
  },
  {
    id: 19,
    name: 'Emma Collins',
    position: 'Client Relations',
    email: 'emma.collins@buildease.com',
    phone: '(555) 901-2345',
    avatar: '/avatars/emma-collins.jpg',
    department: 'Sales',
    completedTasks: 14,
    totalTasks: 20,
    performance: 70,
    availability: 'available',
    status: 'active',
    joinDate: 'Sep 2023'
  },
  {
    id: 20,
    name: 'Nathan Garcia',
    position: 'Apprentice',
    email: 'nathan.garcia@buildease.com',
    phone: '(555) 012-3456',
    department: 'Engineering',
    completedTasks: 5,
    totalTasks: 10,
    performance: 50,
    availability: 'available',
    status: 'active',
    joinDate: 'Dec 2023'
  }
] 