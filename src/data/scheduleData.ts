import { Task, TeamMember } from '@/types/schedule';

// Mock data for tasks
export const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Foundation Inspection',
    description: 'Perform comprehensive inspection of foundation work to ensure compliance with building codes and project specifications.',
    project: 'Villa Construction',
    phase: 'Foundation',
    startDate: '2024-05-15',
    dueDate: '2024-05-16',
    status: 'Completed',
    priority: 'High',
    assignedTo: [
      { id: 1, name: 'John Doe', avatar: '/api/placeholder/32/32', role: 'Project Manager' },
      { id: 2, name: 'Jane Smith', avatar: '/api/placeholder/32/32', role: 'Civil Engineer' }
    ],
    completion: 100,
    comments: [
      { 
        id: 1, 
        author: { id: 1, name: 'John Doe', avatar: '/api/placeholder/32/32', role: 'Project Manager' },
        text: 'Inspection completed successfully. All foundation elements meet specifications.',
        date: '2024-05-16T14:30:00'
      }
    ],
    attachments: [
      {
        id: 1,
        name: 'foundation_inspection_report.pdf',
        type: 'application/pdf',
        size: '2.4 MB',
        uploadedBy: { id: 1, name: 'John Doe', avatar: '/api/placeholder/32/32', role: 'Project Manager' },
        uploadDate: '2024-05-16T16:00:00'
      }
    ]
  },
  {
    id: 2,
    title: 'Framing Work',
    description: 'Complete structural framing including wall frames, roof trusses, and floor joists according to architectural plans.',
    project: 'Villa Construction',
    phase: 'Structure',
    startDate: '2024-05-17',
    dueDate: '2024-05-25',
    status: 'In Progress',
    priority: 'High',
    assignedTo: [
      { id: 3, name: 'Mike Johnson', avatar: '/api/placeholder/32/32', role: 'Lead Carpenter' },
      { id: 4, name: 'Sarah Williams', avatar: '/api/placeholder/32/32', role: 'Structural Engineer' }
    ],
    completion: 45,
    dependencies: [1],
    comments: [
      { 
        id: 2, 
        author: { id: 3, name: 'Mike Johnson', avatar: '/api/placeholder/32/32', role: 'Lead Carpenter' },
        text: 'First floor framing completed. Moving to second floor tomorrow.',
        date: '2024-05-20T17:15:00'
      }
    ]
  },
  {
    id: 3,
    title: 'Electrical Wiring',
    description: 'Install all electrical systems including wiring, outlets, switches, and panel boxes according to electrical plans.',
    project: 'Villa Construction',
    phase: 'Electrical',
    startDate: '2024-05-26',
    dueDate: '2024-06-02',
    status: 'Not Started',
    priority: 'Medium',
    assignedTo: [
      { id: 5, name: 'David Brown', avatar: '/api/placeholder/32/32', role: 'Electrician' }
    ],
    completion: 0,
    dependencies: [2]
  },
  {
    id: 4,
    title: 'Plumbing Installation',
    description: 'Install all plumbing systems including water supply lines, drainage, fixtures, and water heater.',
    project: 'Villa Construction',
    phase: 'Plumbing',
    startDate: '2024-05-26',
    dueDate: '2024-06-02',
    status: 'Not Started',
    priority: 'Medium',
    assignedTo: [
      { id: 6, name: 'Emily Davis', avatar: '/api/placeholder/32/32', role: 'Plumber' }
    ],
    completion: 0,
    dependencies: [2]
  },
  {
    id: 5,
    title: 'Interior Painting',
    description: 'Complete interior painting including walls, ceilings, trim, and doors according to color scheme.',
    project: 'Office Renovation',
    phase: 'Finishing',
    startDate: '2024-05-20',
    dueDate: '2024-05-27',
    status: 'In Progress',
    priority: 'Medium',
    assignedTo: [
      { id: 7, name: 'Robert Wilson', avatar: '/api/placeholder/32/32', role: 'Painter' },
      { id: 8, name: 'Lisa Taylor', avatar: '/api/placeholder/32/32', role: 'Interior Designer' }
    ],
    completion: 60,
    comments: [
      { 
        id: 3, 
        author: { id: 7, name: 'Robert Wilson', avatar: '/api/placeholder/32/32', role: 'Painter' },
        text: 'Main area and conference room completed. Starting on offices tomorrow.',
        date: '2024-05-23T16:45:00'
      }
    ]
  },
  {
    id: 6,
    title: 'Flooring Installation',
    description: 'Install all flooring materials including hardwood, carpet, and tile according to floor plans.',
    project: 'Office Renovation',
    phase: 'Finishing',
    startDate: '2024-05-28',
    dueDate: '2024-06-04',
    status: 'Not Started',
    priority: 'Medium',
    assignedTo: [
      { id: 9, name: 'Thomas Moore', avatar: '/api/placeholder/32/32', role: 'Flooring Specialist' }
    ],
    completion: 0,
    dependencies: [5]
  },
  {
    id: 7,
    title: 'Final Inspection',
    description: 'Conduct final inspection to ensure all work meets quality standards and project requirements.',
    project: 'Office Renovation',
    phase: 'Completion',
    startDate: '2024-06-05',
    dueDate: '2024-06-06',
    status: 'Not Started',
    priority: 'High',
    assignedTo: [
      { id: 1, name: 'John Doe', avatar: '/api/placeholder/32/32', role: 'Project Manager' },
      { id: 10, name: 'Amanda Clark', avatar: '/api/placeholder/32/32', role: 'Quality Inspector' }
    ],
    completion: 0,
    dependencies: [6]
  },
  {
    id: 8,
    title: 'Client Walkthrough',
    description: 'Final walkthrough with client to demonstrate completed project and address any questions or concerns.',
    project: 'Villa Construction',
    phase: 'Completion',
    startDate: '2024-06-10',
    dueDate: '2024-06-10',
    status: 'Not Started',
    priority: 'High',
    assignedTo: [
      { id: 1, name: 'John Doe', avatar: '/api/placeholder/32/32', role: 'Project Manager' },
      { id: 11, name: 'Michael Scott', avatar: '/api/placeholder/32/32', role: 'Client Representative' }
    ],
    completion: 0,
    dependencies: [3, 4]
  }
];

// Define team members
export const teamMembers: TeamMember[] = [
  { id: 1, name: 'John Doe', avatar: '/api/placeholder/32/32', role: 'Project Manager', department: 'Management' },
  { id: 2, name: 'Jane Smith', avatar: '/api/placeholder/32/32', role: 'Civil Engineer', department: 'Engineering' },
  { id: 3, name: 'Mike Johnson', avatar: '/api/placeholder/32/32', role: 'Lead Carpenter', department: 'Construction' },
  { id: 4, name: 'Sarah Williams', avatar: '/api/placeholder/32/32', role: 'Structural Engineer', department: 'Engineering' },
  { id: 5, name: 'David Brown', avatar: '/api/placeholder/32/32', role: 'Electrician', department: 'Electrical' },
  { id: 6, name: 'Emily Davis', avatar: '/api/placeholder/32/32', role: 'Plumber', department: 'Plumbing' },
  { id: 7, name: 'Robert Wilson', avatar: '/api/placeholder/32/32', role: 'Painter', department: 'Finishing' },
  { id: 8, name: 'Lisa Taylor', avatar: '/api/placeholder/32/32', role: 'Interior Designer', department: 'Design' },
  { id: 9, name: 'Thomas Moore', avatar: '/api/placeholder/32/32', role: 'Flooring Specialist', department: 'Finishing' },
  { id: 10, name: 'Amanda Clark', avatar: '/api/placeholder/32/32', role: 'Quality Inspector', department: 'Quality Assurance' },
  { id: 11, name: 'Michael Scott', avatar: '/api/placeholder/32/32', role: 'Client Representative', department: 'Client' }
];

// Project options for selection
export const availableProjects = [
  'Residential Renovation', 
  'Commercial Office Space', 
  'Lakeside Apartment Complex', 
  'Historic Building Restoration',
  'Villa Construction',
  'Office Renovation'
];

// Phases per project
export const phasesByProject: Record<string, string[]> = {
  'Residential Renovation': ['Foundation Work', 'Framing', 'Electrical & Plumbing', 'Interior & Finishing'],
  'Commercial Office Space': ['Planning', 'Site Preparation', 'Construction', 'Inspection'],
  'Lakeside Apartment Complex': ['Design', 'Foundation', 'Structure', 'Utilities', 'Finishing'],
  'Historic Building Restoration': ['Assessment', 'Preservation Planning', 'Restoration Work', 'Final Review'],
  'Villa Construction': ['Foundation', 'Structure', 'Electrical', 'Plumbing', 'Finishing', 'Completion'],
  'Office Renovation': ['Planning', 'Demolition', 'Framing', 'Electrical', 'Plumbing', 'Finishing', 'Completion']
}; 