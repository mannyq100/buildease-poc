/**
 * Utility functions for document management
 */
import React from 'react'
import { FileType, Archive, Image } from 'lucide-react'
import { Document } from '@/types/documents'

/**
 * Get an appropriate icon based on file type
 */
export function getFileIcon(type: string): React.ReactNode {
  switch(type.toLowerCase()) {
    case 'pdf': 
      return <FileType className="w-5 h-5 text-red-500" />
    case 'docx': 
      return <FileType className="w-5 h-5 text-blue-500" />
    case 'xlsx': 
      return <FileType className="w-5 h-5 text-green-500" />
    case 'zip': 
      return <Archive className="w-5 h-5 text-yellow-500" />
    case 'jpg':
    case 'png': 
      return <Image className="w-5 h-5 text-purple-500" />
    case 'dwg': 
      return <FileType className="w-5 h-5 text-orange-500" />
    default: 
      return <FileType className="w-5 h-5 text-gray-500" />
  }
}

/**
 * Filter documents based on search query and filters
 */
export function filterDocuments(
  documents: Document[], 
  searchQuery: string, 
  projectFilter: string, 
  categoryFilter: string, 
  statusFilter: string
): Document[] {
  return documents.filter(doc => {
    // Only do the case conversion once per document per filter operation
    const docNameLower = doc.name.toLowerCase()
    const docProjectLower = doc.project.toLowerCase()
    const searchQueryLower = searchQuery.toLowerCase()
    
    const matchesSearch = searchQuery === '' || 
      docNameLower.includes(searchQueryLower) ||
      docProjectLower.includes(searchQueryLower)
    
    const matchesProject = projectFilter === 'all' || 
      doc.project.includes(projectFilter === 'villa' ? 'Villa' : 'Office')
      
    const matchesCategory = categoryFilter === 'all' || 
      doc.category === categoryFilter
      
    const matchesStatus = statusFilter === 'all' || 
      doc.status === statusFilter
    
    return matchesSearch && matchesProject && matchesCategory && matchesStatus
  })
} 