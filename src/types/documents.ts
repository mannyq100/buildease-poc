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

/**
 * Legacy document props interface used in the documents directory
 */
export interface DocumentItemLegacyProps {
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

/**
 * Simple document item for display purposes
 */
export interface SimpleDocumentItem {
  title: string
  type: string
  date: string
  size: string
}

/**
 * Consolidated DocumentItemProps interface that supports all the different implementations
 */
export interface DocumentItemProps {
  // Basic document information (at least one of these must be provided)
  title?: string; // Project/Simple version
  name?: string; // Shared/Phases version
  document?: Document; // Full document object (documents version)
  
  // Document metadata
  type?: string; // File type (PDF, DOCX, etc.)
  date?: string; // Upload/modified date
  size?: string; // File size
  status?: 'current' | 'approved' | 'rejected' | 'pending' | 'archived'; // Document status
  
  // Visual customization
  icon?: React.ReactNode; // Custom icon override
  className?: string; // Additional classes
  animated?: boolean; // Whether to use animation effects
  simplified?: boolean; // Whether to use simplified display
  
  // Actions and events
  onClick?: () => void; // General click handler
  onView?: () => void; // View document action
  onDelete?: () => void; // Delete document action
  onToggleStar?: () => void; // Star/unstar action
  onRename?: () => void; // Rename document action
  onMove?: () => void; // Move document action
  onCopy?: () => void; // Copy document action
  onDownload?: () => void; // Download document action
}