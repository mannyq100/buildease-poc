/**
 * Document-related type definitions
 * Used in document management and viewing components
 */

export interface Document {
  id: number
  name: string
  project: string
  type: string
  category: string
  size: string
  uploaded: string
  uploadedBy: string
  status: 'approved' | 'pending' | 'rejected'
  starred: boolean
}

export interface NewDocument {
  name: string
  project: string
  category: string
  type: string
  size: string
  status: 'approved' | 'pending' | 'rejected'
}

export interface DocumentCategory {
  id: string
  name: string
  count: number
}

export interface DocumentItemProps {
  document: Document
  icon: React.ReactNode
  onView: () => void
  onDelete: () => void
  onToggleStar: () => void
  onRename?: () => void
  onMove?: () => void
  onCopy?: () => void
  onDownload?: () => void
} 