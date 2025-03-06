/**
 * Mock document data for development and testing
 */
import { Document, DocumentCategory } from '@/types/documents'

/**
 * Initial documents for the document management page
 */
export const INITIAL_DOCUMENTS: Document[] = [
  { 
    id: 1, 
    name: 'Villa Construction - Foundation Plans.pdf', 
    project: 'Villa Construction',
    type: 'PDF', 
    category: 'plans',
    size: '2.4 MB', 
    uploaded: '15 Feb 2024',
    uploadedBy: 'John Doe',
    status: 'approved',
    starred: true
  },
  { 
    id: 2, 
    name: 'Building Permit - Final Approval.pdf', 
    project: 'Villa Construction',
    type: 'PDF', 
    category: 'permits',
    size: '1.8 MB', 
    uploaded: '10 Feb 2024',
    uploadedBy: 'Sarah Chen',
    status: 'approved',
    starred: false
  },
  { 
    id: 3, 
    name: 'Site Analysis Report.docx', 
    project: 'Office Renovation',
    type: 'DOCX', 
    category: 'reports',
    size: '1.2 MB', 
    uploaded: '05 Feb 2024',
    uploadedBy: 'James Wilson',
    status: 'pending',
    starred: false
  },
  { 
    id: 4, 
    name: 'Vendor Agreement - Cement Supply.pdf', 
    project: 'Villa Construction',
    type: 'PDF', 
    category: 'contracts',
    size: '3.1 MB', 
    uploaded: '03 Feb 2024',
    uploadedBy: 'Maria Lopez',
    status: 'approved',
    starred: true
  },
  { 
    id: 5, 
    name: 'Progress Photos - Week 4.zip', 
    project: 'Villa Construction',
    type: 'ZIP', 
    category: 'reports',
    size: '15.7 MB', 
    uploaded: '01 Feb 2024',
    uploadedBy: 'John Doe',
    status: 'pending',
    starred: false
  },
  { 
    id: 6, 
    name: 'Architectural Blueprints - Office Layout.dwg', 
    project: 'Office Renovation',
    type: 'DWG', 
    category: 'plans',
    size: '8.3 MB', 
    uploaded: '28 Jan 2024',
    uploadedBy: 'Ahmed Patel',
    status: 'approved',
    starred: false
  }
]

/**
 * Document categories with counts
 */
export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  { id: 'all', name: 'All Documents', count: 28 },
  { id: 'plans', name: 'Plans & Blueprints', count: 8 },
  { id: 'permits', name: 'Permits & Approvals', count: 5 },
  { id: 'contracts', name: 'Contracts', count: 6 },
  { id: 'reports', name: 'Reports', count: 9 }
]

/**
 * Project options for filtering
 */
export const PROJECT_OPTIONS = [
  { value: 'all', label: 'All Projects' },
  { value: 'villa', label: 'Villa Construction' },
  { value: 'office', label: 'Office Renovation' }
]

/**
 * File type options for filtering
 */
export const FILE_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'DOCX' },
  { value: 'dwg', label: 'DWG' },
  { value: 'images', label: 'Images' }
]

/**
 * Status options for filtering
 */
export const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending Approval' }
] 