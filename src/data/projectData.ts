import React from 'react';
import {
  Calendar, 
  CheckSquare,
  FileText,
  Home,
  Image,
  MessageSquare,
  Package,
  Users,
  LayoutDashboard
} from 'lucide-react';
import { Phase, Project } from '@/types';

/**
 * Navigation items for the project
 */
export const PROJECT_NAV_ITEMS = (id?: string) => [
  {
    label: 'Overview',
    value: 'overview',
    icon: React.createElement(LayoutDashboard, { className: "h-4 w-4" }),
    tooltip: 'Project overview',
    href: `/projects/${id}`
  },
  {
    label: 'Tasks',
    value: 'tasks',
    icon: React.createElement(CheckSquare, { className: "h-4 w-4" }),
    tooltip: 'Project tasks',
    href: `/projects/${id}/tasks`
  },
  {
    label: 'Calendar',
    value: 'calendar',
    icon: React.createElement(Calendar, { className: "h-4 w-4" }),
    tooltip: 'Project calendar',
    href: `/projects/${id}/calendar`
  },
  {
    label: 'Team',
    value: 'team',
    icon: React.createElement(Users, { className: "h-4 w-4" }),
    tooltip: 'Project team',
    href: `/projects/${id}/team`
  },
  {
    label: 'Materials',
    value: 'materials',
    icon: React.createElement(Package, { className: "h-4 w-4" }),
    tooltip: 'Project materials',
    href: `/projects/${id}/materials`
  },
  {
    label: 'Documents',
    value: 'documents',
    icon: React.createElement(FileText, { className: "h-4 w-4" }),
    tooltip: 'Project documents',
    href: `/projects/${id}/documents`
  },
  {
    label: 'Photos',
    value: 'photos',
    icon: React.createElement(Image, { className: "h-4 w-4" }),
    tooltip: 'Project photos',
    href: `/projects/${id}/photos`
  },
  {
    label: 'Discussions',
    value: 'discussions',
    icon: React.createElement(MessageSquare, { className: "h-4 w-4" }),
    tooltip: 'Project discussions',
    href: `/projects/${id}/discussions`
  }
];

/**
 * Breadcrumb items for the project
 */
export const BREADCRUMB_ITEMS = (id?: string) => [
  {
    label: 'Home',
    icon: React.createElement(Home, { className: "h-4 w-4" }),
    href: '/'
  },
  {
    label: 'Projects',
    href: '/projects'
  },
  {
    label: `Project ${id}`,
    href: `/projects/${id}`,
    active: true
  }
];

/**
 * Mock data for recent activity
 */
export const RECENT_ACTIVITY = [
  {
    date: 'Today, 10:30 AM',
    title: 'Material Order Placed',
    description: 'Order #123456 for kitchen cabinets was placed with supplier',
    icon: React.createElement(Package, { className: "h-5 w-5 text-blue-500" }),
    user: {
      name: 'John Smith',
      avatar: ''
    }
  },
  {
    date: 'Yesterday, 3:45 PM',
    title: 'Phase Completed',
    description: 'Demolition phase marked as completed',
    icon: React.createElement(CheckSquare, { className: "h-5 w-5 text-green-500" }),
    user: {
      name: 'Sarah Johnson',
      avatar: ''
    }
  },
  {
    date: 'Yesterday, 11:15 AM',
    title: 'Document Uploaded',
    description: 'New electrical blueprints uploaded to documents',
    icon: React.createElement(FileText, { className: "h-5 w-5 text-purple-500" }),
    user: {
      name: 'Mike Richards',
      avatar: ''
    }
  },
  {
    date: '2 days ago',
    title: 'Team Meeting Scheduled',
    description: 'Weekly progress meeting scheduled for Friday at 2PM',
    icon: React.createElement(Calendar, { className: "h-5 w-5 text-amber-500" }),
    user: {
      name: 'Amanda Peterson',
      avatar: ''
    }
  }
];

/**
 * Mock data for recent documents
 */
export const RECENT_DOCUMENTS = [
  {
    title: 'Architectural Blueprints v2.1',
    type: 'PDF',
    size: '4.2 MB',
    date: '2 days ago'
  },
  {
    title: 'Material Specifications',
    type: 'XLSX',
    size: '1.8 MB',
    date: '3 days ago'
  },
  {
    title: 'Contractor Agreement',
    type: 'DOC',
    size: '320 KB',
    date: '1 week ago'
  },
  {
    title: 'Budget Forecast Q2',
    type: 'XLSX',
    size: '980 KB',
    date: '1 week ago'
  }
];

/**
 * Initial mock data for phases
 */
export const INITIAL_PHASES: Phase[] = [
  {
    id: "1",
    name: 'Demolition & Site Preparation',
    completion: 100,
    startDate: new Date('2023-01-15'),
    endDate: new Date('2023-02-05'),
    status: 'completed',
    budget: '12000',
    description: 'Removal of existing structures and preparation of the site for construction.',
    tasks: [
      { 
        id: "1", 
        name: "Clear site", 
        status: "completed", 
        description: "Remove vegetation and debris",
        startDate: new Date('2023-01-15'),
        endDate: new Date('2023-01-20'),
        assignedTo: "John Doe",
        progress: 100,
        phaseId: "1",
        priority: "High"
      },
      { 
        id: "2", 
        name: "Demolish old structure", 
        status: "completed", 
        description: "Safely demolish existing structure",
        startDate: new Date('2023-01-21'),
        endDate: new Date('2023-02-05'),
        assignedTo: "Mike Wilson",
        progress: 100,
        phaseId: "1",
        priority: "High"
      },
    ],
  },
  {
    id: "2",
    name: 'Foundation & Framing',
    completion: 85,
    startDate: new Date('2023-02-06'),
    endDate: new Date('2023-03-20'),
    status: 'in-progress',
    budget: '45000',
    description: 'Laying of foundation and construction of the frame structure.',
    tasks: [
      { 
        id: "3", 
        name: "Pour foundation", 
        status: "completed", 
        description: "Pour concrete foundation",
        startDate: new Date('2023-02-06'),
        endDate: new Date('2023-02-13'),
        assignedTo: "Jane Smith",
        progress: 100,
        phaseId: "2",
        priority: "High"
      },
      { 
        id: "4", 
        name: "Erect framing", 
        status: "in-progress", 
        description: "Install structural framing",
        startDate: new Date('2023-02-14'),
        endDate: new Date('2023-03-20'),
        assignedTo: "Sarah Johnson",
        progress: 70,
        phaseId: "2",
        priority: "High"
      },
    ],
  },
  {
    id: "3",
    name: 'Electrical & Plumbing',
    completion: 10,
    startDate: new Date('2023-03-15'),
    endDate: new Date('2023-04-30'),
    status: 'in-progress',
    budget: '28000',
    description: 'Installation of electrical wiring and plumbing systems.',
    tasks: [
      { 
        id: "5", 
        name: "Rough-in electrical", 
        status: "pending", 
        description: "Install electrical rough-in",
        startDate: new Date('2023-03-15'),
        endDate: new Date('2023-04-10'),
        assignedTo: "",
        progress: 0,
        phaseId: "3",
        priority: "Medium"
      },
      { 
        id: "6", 
        name: "Rough-in plumbing", 
        status: "pending", 
        description: "Install plumbing rough-in",
        startDate: new Date('2023-03-20'),
        endDate: new Date('2023-04-30'),
        assignedTo: "",
        progress: 0,
        phaseId: "3",
        priority: "Medium"
      },
    ],
  },
  {
    id: "4",
    name: 'Interior Finishing',
    completion: 0,
    startDate: new Date('2023-05-01'),
    endDate: new Date('2023-06-15'),
    status: 'upcoming',
    budget: '35000',
    description: 'Installation of interior fixtures, flooring, and finishes.',
    tasks: [],
  },
  {
    id: "5",
    name: 'Final Inspection & Handover',
    completion: 0,
    startDate: new Date('2023-06-16'),
    endDate: new Date('2023-07-01'),
    status: 'upcoming',
    budget: '8000',
    description: 'Final inspections, punch list completion, and handover to client.',
    tasks: [],
  }
];

export const projectData: Project[] = [
  {
    id: "1",
    name: "Luxury Home Build",
    description: "Construction of a modern luxury home in the hills.",
    client: "Smith Family",
    type: "Residential Construction",
    location: "Beverly Hills, CA",
    budget: 500000,
    spent: 300000,
    startDate: new Date("2023-01-15"),
    endDate: new Date("2023-07-01"),
    status: "in-progress",
    progress: 60,
    imageUrl: "/images/luxury-home.jpg",
    teamMembers: ["John Doe", "Jane Smith", "Mike Wilson", "Sarah Johnson"],
    tags: ["luxury", "residential", "modern"],
    phases: INITIAL_PHASES,
    activities: RECENT_ACTIVITY,
  },
  {
    id: "2",
    name: "Office Renovation",
    description: "Complete renovation of a 3-story office building.",
    client: "TechCorp Inc.",
    type: "Commercial Renovation",
    location: "Downtown LA, CA",
    budget: 250000,
    spent: 25000,
    startDate: new Date("2023-03-01"),
    endDate: new Date("2023-09-30"),
    status: "planning",
    progress: 10,
    imageUrl: "/images/office-renovation.jpg",
    teamMembers: ["Mike Johnson", "Emily White", "David Chen"],
    tags: ["commercial", "renovation", "office"],
    phases: [],
    activities: [],
  },
];