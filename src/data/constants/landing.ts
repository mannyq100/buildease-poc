import { Step, Stat, Testimonial } from '@/types/landing'

// Define feature data without JSX
export const LANDING_FEATURES_DATA = [
  {
    title: 'Project Dashboard',
    description: 'Get a complete overview of your project status, tasks, and expenses all in one place.',
    iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    title: 'Budget Tracking',
    description: 'Track your expenses against your budget and get alerts when approaching limits.',
    iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Schedule Management',
    description: 'Plan and track your construction timeline with interactive Gantt chart and notifications.',
    iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    title: 'Team Collaboration',
    description: 'Coordinate with contractors, suppliers, and team members through a virtual platform.',
    iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    title: 'Material Management',
    description: 'Keep track of all your building materials, inventory, and deliveries to prevent delays.',
    iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    title: 'Document Management',
    description: 'Store and organize all your construction documents, permits, and contracts in one secure location.',
    iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
]

export const HOW_IT_WORKS_STEPS: Step[] = [
  {
    number: 1,
    title: 'Create your project',
    description: 'Set up your construction project with details.',
  },
  {
    number: 2,
    title: 'Add your team',
    description: 'Invite contractors, suppliers, and team members to collaborate on your project.',
  },
  {
    number: 3,
    title: 'Track progress',
    description: 'Monitor construction progress in real time with photos, updates, and milestone tracking.',
  },
  {
    number: 4,
    title: 'Complete on budget',
    description: 'Finish your construction project on time and within budget with BuildEase\'s tools.',
  },
]

export const LANDING_STATS: Stat[] = [
  {
    value: '1,500+',
    label: 'Projects Completed',
  },
  {
    value: '30%',
    label: 'Time Saved',
  },
  {
    value: '97%',
    label: 'Schedule Management',
  },
]

export const LANDING_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Kofi Mensah',
    role: 'Client Builder',
    location: 'Accra',
    content: 'BuildEase has all I needed for my dream journey as a first-time homebuilder. It helped me stay organized!',
    avatar: '/images/avatars/person-2.jpg',
  },
  {
    id: '2',
    name: 'Ama Owusu',
    role: 'Small Contractor',
    location: 'Kumasi',
    content: 'As a contractor, I find the tools so easy to use. My clients love how transparent the process is!',
    avatar: '/images/avatars/person-3.jpg',
  },
]