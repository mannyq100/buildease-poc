/**
 * Mock data for team members
 * Used for development and demonstration purposes
 */
import { TeamMember } from '@/types/team'

export const DEPARTMENTS = [
  'All',
  'Management',
  'Engineering',
  'Design',
  'Procurement',
  'Safety',
  'Construction'
]

export const STATUS_OPTIONS = [
  'All',
  'Active',
  'Inactive'
]

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Project Manager',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    department: 'Management',
    projects: ['Villa Construction', 'Office Renovation'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    skills: ['Project Planning', 'Resource Management', 'Budgeting'],
    workload: 85,
    joinDate: '15 Jan 2023',
    certifications: ['PMP', 'LEED Green Associate'],
    availability: 'Full-time',
    location: 'Accra, Ghana'
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'Architect',
    email: 'sarah.chen@example.com',
    phone: '+1 (555) 234-5678',
    department: 'Design',
    projects: ['Villa Construction'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    skills: ['AutoCAD', 'Sustainable Design', '3D Modeling'],
    workload: 75,
    joinDate: '3 Mar 2023',
    certifications: ['Licensed Architect', 'LEED AP'],
    availability: 'Full-time',
    location: 'Accra, Ghana'
  },
  {
    id: 3,
    name: 'Michael Osei',
    role: 'Civil Engineer',
    email: 'm.osei@example.com',
    phone: '+1 (555) 345-6789',
    department: 'Engineering',
    projects: ['Office Renovation'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    skills: ['Structural Analysis', 'Site Planning', 'Construction Management'],
    workload: 90,
    joinDate: '22 Feb 2023',
    certifications: ['PE', 'Construction Safety Certificate'],
    availability: 'Full-time',
    location: 'Accra, Ghana'
  },
  {
    id: 4,
    name: 'Emma Thompson',
    role: 'Interior Designer',
    email: 'emma.t@example.com',
    phone: '+1 (555) 456-7890',
    department: 'Design',
    projects: ['Villa Construction', 'Office Renovation'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    skills: ['Space Planning', 'Color Theory', 'Material Selection'],
    workload: 65,
    joinDate: '10 Apr 2023',
    certifications: ['NCIDQ', 'Sustainable Interior Design'],
    availability: 'Full-time',
    location: 'Accra, Ghana'
  },
  {
    id: 5,
    name: 'David Kwesi',
    role: 'Safety Officer',
    email: 'd.kwesi@example.com',
    phone: '+1 (555) 567-8901',
    department: 'Safety',
    projects: ['Villa Construction'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    skills: ['Risk Assessment', 'Safety Training', 'Compliance Management'],
    workload: 70,
    joinDate: '5 May 2023',
    certifications: ['OSHA Certified', 'First Aid Trainer'],
    availability: 'Full-time',
    location: 'Accra, Ghana'
  },
  {
    id: 6,
    name: 'Lisa Mensah',
    role: 'Procurement Specialist',
    email: 'lisa.m@example.com',
    phone: '+1 (555) 678-9012',
    department: 'Procurement',
    projects: ['Office Renovation'],
    status: 'inactive',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    skills: ['Vendor Management', 'Contract Negotiation', 'Supply Chain'],
    workload: 0,
    joinDate: '15 Jan 2023',
    certifications: ['CPSM', 'Contract Management'],
    availability: 'On Leave',
    location: 'Accra, Ghana'
  },
  {
    id: 7,
    name: 'James Addo',
    role: 'Electrical Engineer',
    email: 'j.addo@example.com',
    phone: '+1 (555) 789-0123',
    department: 'Engineering',
    projects: ['Villa Construction', 'Office Renovation'],
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    skills: ['Power Systems', 'Lighting Design', 'Energy Efficiency'],
    workload: 80,
    joinDate: '20 Mar 2023',
    certifications: ['Licensed Electrician', 'Energy Auditor'],
    availability: 'Full-time',
    location: 'Accra, Ghana'
  }
]

export const PROJECTS = [
  'Villa Construction',
  'Office Renovation',
  'Commercial Complex',
  'Residential Development'
] 