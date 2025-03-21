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
  LayoutDashboard,
  DollarSign,
  FileBarChart
} from 'lucide-react';
import { Phase } from '@/types/phase';

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
    id: 1,
    name: 'Demolition & Site Preparation',
    progress: 100,
    startDate: 'Jan 15, 2023',
    endDate: 'Feb 5, 2023',
    status: 'completed',
    budget: '$12,000',
    spent: '$11,450',
    description: 'Removal of existing structures and preparation of the site for construction.'
  },
  {
    id: 2,
    name: 'Foundation & Framing',
    progress: 85,
    startDate: 'Feb 6, 2023',
    endDate: 'Mar 20, 2023',
    status: 'in-progress',
    budget: '$45,000',
    spent: '$38,500',
    description: 'Laying of foundation and construction of the frame structure.'
  },
  {
    id: 3,
    name: 'Electrical & Plumbing',
    progress: 10,
    startDate: 'Mar 15, 2023',
    endDate: 'Apr 30, 2023',
    status: 'in-progress',
    budget: '$28,000',
    spent: '$4,200',
    description: 'Installation of electrical wiring and plumbing systems.'
  },
  {
    id: 4,
    name: 'Interior Finishing',
    progress: 0,
    startDate: 'May 1, 2023',
    endDate: 'Jun 15, 2023',
    status: 'upcoming',
    budget: '$35,000',
    spent: '$0',
    description: 'Installation of interior fixtures, flooring, and finishes.'
  },
  {
    id: 5,
    name: 'Final Inspection & Handover',
    progress: 0,
    startDate: 'Jun 16, 2023',
    endDate: 'Jul 1, 2023',
    status: 'upcoming',
    budget: '$8,000',
    spent: '$0',
    description: 'Final inspections, punch list completion, and handover to client.'
  }
];
