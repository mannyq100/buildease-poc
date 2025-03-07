/**
 * Mock data for expenses management
 * Contains initial expenses, categories, projects, phases, and other static data
 */
import { FileText, FileDown, FilePlus } from 'lucide-react';
import { Expense } from '@/types/expenses';

/**
 * Initial mock expenses data
 */
export const initialExpenses: Expense[] = [
  {
    id: 1,
    description: 'Cement Purchase',
    category: 'Materials',
    amount: 1200.00,
    date: '2024-05-05',
    project: 'Villa Construction',
    phase: 'Foundation',
    paymentMethod: 'Cash',
    vendor: 'BuildSupply Inc.',
    receiptUploaded: true,
    receiptUrl: '/api/placeholder/500/300',
    status: 'approved'
  },
  {
    id: 2,
    description: 'Labor Payment - Week 1',
    category: 'Labor',
    amount: 850.00,
    date: '2024-05-02',
    project: 'Villa Construction',
    phase: 'Foundation',
    paymentMethod: 'Bank Transfer',
    vendor: 'ABC Construction',
    receiptUploaded: true,
    receiptUrl: '/api/placeholder/500/300',
    status: 'approved'
  },
  {
    id: 3,
    description: 'Sand Delivery',
    category: 'Materials',
    amount: 560.00,
    date: '2024-05-07',
    project: 'Villa Construction',
    phase: 'Foundation',
    paymentMethod: 'Cash',
    vendor: 'Quarry Solutions',
    receiptUploaded: true,
    receiptUrl: '/api/placeholder/500/300',
    status: 'pending'
  },
  {
    id: 4,
    description: 'Steel Reinforcement Bars',
    category: 'Materials',
    amount: 3200.00,
    date: '2024-05-10',
    project: 'Villa Construction',
    phase: 'Foundation',
    paymentMethod: 'Credit Card',
    vendor: 'Steel Masters Ltd.',
    receiptUploaded: true,
    receiptUrl: '/api/placeholder/500/300',
    status: 'approved'
  },
  {
    id: 5,
    description: 'Excavation Equipment Rental',
    category: 'Equipment',
    amount: 1500.00,
    date: '2024-04-28',
    project: 'Villa Construction',
    phase: 'Site Preparation',
    paymentMethod: 'Bank Transfer',
    vendor: 'Equipment Rentals Co.',
    receiptUploaded: false,
    status: 'approved'
  },
  {
    id: 6,
    description: 'Building Permit Fees',
    category: 'Permits',
    amount: 750.00,
    date: '2024-04-15',
    project: 'Villa Construction',
    phase: 'Permitting',
    paymentMethod: 'Bank Transfer',
    vendor: 'City Government',
    receiptUploaded: true,
    receiptUrl: '/api/placeholder/500/300',
    status: 'approved'
  },
  {
    id: 7,
    description: 'Architect Consultation',
    category: 'Professional Services',
    amount: 1200.00,
    date: '2024-04-10',
    project: 'Villa Construction',
    phase: 'Design and Planning',
    paymentMethod: 'Bank Transfer',
    vendor: 'John Smith Architects',
    receiptUploaded: true,
    receiptUrl: '/api/placeholder/500/300',
    status: 'approved'
  },
  {
    id: 8,
    description: 'Plumbing Materials',
    category: 'Materials',
    amount: 1800.00,
    date: '2024-05-12',
    project: 'Office Renovation',
    phase: 'Plumbing',
    paymentMethod: 'Credit Card',
    vendor: 'Plumbing Plus',
    receiptUploaded: true,
    receiptUrl: '/api/placeholder/500/300',
    status: 'pending'
  },
  {
    id: 9,
    description: 'Electrical Supplies',
    category: 'Materials',
    amount: 2200.00,
    date: '2024-05-14',
    project: 'Office Renovation',
    phase: 'Electrical',
    paymentMethod: 'Credit Card',
    vendor: 'Power Systems Ltd.',
    receiptUploaded: false,
    status: 'rejected'
  },
  {
    id: 10,
    description: 'Labor Payment - Week 2',
    category: 'Labor',
    amount: 1100.00,
    date: '2024-05-09',
    project: 'Villa Construction',
    phase: 'Foundation',
    paymentMethod: 'Cash',
    vendor: 'ABC Construction',
    receiptUploaded: true,
    receiptUrl: '/api/placeholder/500/300',
    status: 'approved'
  }
];

/**
 * Category options for filtering and forms
 */
export const EXPENSE_CATEGORIES = [
  'All Categories',
  'Materials',
  'Labor',
  'Equipment',
  'Permits',
  'Professional Services',
  'Transportation',
  'Miscellaneous'
];

/**
 * Project options for filtering and forms
 */
export const EXPENSE_PROJECTS = [
  'All Projects',
  'Villa Construction',
  'Office Renovation'
];

/**
 * Phase options for filtering and forms
 */
export const EXPENSE_PHASES = [
  'All Phases',
  'Design and Planning',
  'Permitting',
  'Site Preparation',
  'Foundation',
  'Structural Work',
  'Roofing',
  'Electrical',
  'Plumbing',
  'Finishing'
];

/**
 * Status options for filtering
 */
export const EXPENSE_STATUSES = [
  'All Statuses',
  'approved',
  'pending',
  'rejected'
];

/**
 * Export format options
 */
export const EXPORT_OPTIONS = [
  { id: 'csv', label: 'CSV', icon: FileText },
  { id: 'excel', label: 'Excel', icon: FileDown },
  { id: 'pdf', label: 'PDF', icon: FilePlus }
];

/**
 * Chart colors for data visualization
 */
export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1']; 