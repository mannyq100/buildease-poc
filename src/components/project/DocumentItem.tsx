import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { SimpleDocumentItem } from '@/types/documents';

/**
 * Document item component for displaying document details
 */
export function DocumentItem({ title, type, date, size }: SimpleDocumentItem) {
  function getIcon() {
    switch (type) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'DWG':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'XLSX':
        return <FileText className="h-5 w-5 text-green-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }
  
  return (
    <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all hover:shadow-sm">
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="flex-grow">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{date} · {size}</p>
      </div>
      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
} 