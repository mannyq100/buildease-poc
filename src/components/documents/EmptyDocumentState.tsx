/**
 * EmptyDocumentState component for displaying when no documents are found
 */
import React from 'react'
import { Button } from '@/components/ui/button'
import { File, Upload, Star } from 'lucide-react'

export interface EmptyDocumentStateProps {
  /**
   * Type of empty state to display
   */
  type?: 'all' | 'starred' | 'search'
  
  /**
   * Function to call when upload button is clicked
   */
  onUpload?: () => void
  
  /**
   * Search query that returned no results (for search type)
   */
  searchQuery?: string
}

export function EmptyDocumentState({ 
  type = 'all', 
  onUpload, 
  searchQuery 
}: EmptyDocumentStateProps) {
  const contentMap = {
    all: {
      icon: <File className="h-16 w-16 text-gray-300 dark:text-gray-500" />,
      title: 'No documents yet',
      description: 'Upload your first document to get started with document management.',
      button: 'Upload Document'
    },
    starred: {
      icon: <Star className="h-16 w-16 text-gray-300 dark:text-gray-500" />,
      title: 'No starred documents',
      description: 'Star important documents to access them quickly from this section.',
      button: 'Browse Documents'
    },
    search: {
      icon: <File className="h-16 w-16 text-gray-300 dark:text-gray-500" />,
      title: 'No matching documents',
      description: `No documents found matching "${searchQuery}". Try different search terms.`,
      button: 'Clear Search'
    }
  }

  const content = contentMap[type]

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
        {content.icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {content.title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {content.description}
      </p>
      {onUpload && (
        <Button 
          onClick={onUpload}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {content.button}
        </Button>
      )}
    </div>
  )
} 