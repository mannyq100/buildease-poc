import { Step, Stat, Testimonial, FeatureData } from '@/types/landing'

// Define feature data without JSX
export const LANDING_FEATURES_DATA: FeatureData[] = [
  { title: 'Projects Dashboard', description: 'See progress, risks, and next actions at a glance.', iconName: 'dashboard' },
  { title: 'Budget & Expenses', description: 'Approve, batch, and export—always know your burn.', iconName: 'budget' },
  { title: 'Flexible Phases', description: 'Use templates or build your own workflow with default tasks.', iconName: 'phases' },
  { title: 'Schedule Tracking', description: 'Track milestones and timelines to keep projects on time.', iconName: 'schedule' },
  { title: 'Team Management', description: 'Manage roles, contacts, and collaboration in one place.', iconName: 'team' },
  { title: 'Documents & Media', description: 'Auto-save images and organize permits, contracts, and files.', iconName: 'documents' },
  { title: 'Reports & Analytics', description: 'Share progress vs plan, trends, and insights with stakeholders.', iconName: 'reports' },
  { title: 'Mobile-First', description: 'Fast on-site, touch-friendly, and optimized for the field.', iconName: 'mobile' },
  { title: 'Secure by Design', description: 'Supabase auth, storage, and RLS-powered data protection.', iconName: 'security' },
]

export const HOW_IT_WORKS_STEPS: Step[] = [
  { number: 1, title: 'Create', description: 'Set project basics—location, type, currency, and timeline.' },
  { number: 2, title: 'Plan', description: 'Choose phases and default tasks or customize your workflow.' },
  { number: 3, title: 'Track', description: 'Add expenses, upload progress photos, and keep the team aligned.' },
  { number: 4, title: 'Report', description: 'Share insights and exports to keep stakeholders informed.' },
]

export const LANDING_STATS: Stat[] = [
  { value: '1,500+', label: 'Projects Tracked' },
  { value: '30%', label: 'Faster Approvals' },
  { value: '97%', label: 'On‑time Phases' },
]

export const LANDING_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Kofi Mensah',
    role: 'Homeowner',
    location: 'Accra',
    content: 'BuildEase helped me stay organized and on budget from day one. I always knew what was next.',
    avatar: '/images/avatars/person-2.jpg',
  },
  {
    id: '2',
    name: 'Ama Owusu',
    role: 'Contractor',
    location: 'Kumasi',
    content: 'Simple to use, powerful where it matters. My clients love the transparency and quick updates.',
    avatar: '/images/avatars/person-3.jpg',
  },
]