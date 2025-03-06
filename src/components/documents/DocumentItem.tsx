import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Share2, 
  Star, 
  Trash2, 
  MoreVertical, 
  Download, 
  FileText, 
  Edit, 
  Eye, 
  Copy, 
  Folder
} from 'lucide-react'
import { DocumentItemProps } from '@/types/documents'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Component to display a single document item in the document list
 */
export function DocumentItem({ 
  document, 
  icon, 
  onView, 
  onDelete, 
  onToggleStar, 
  onRename, 
  onMove, 
  onCopy, 
  onDownload 
}: DocumentItemProps) {
  // Get status badge class
  const getStatusBadgeClass = (status: string): string => {
    switch(status) {
      case 'approved': 
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
  }

  const statusBadgeClass = getStatusBadgeClass(document.status)

  // Handler functions
  function handleStarClick(e: React.MouseEvent) {
    e.stopPropagation()
    onToggleStar()
  }

  function handleViewClick(e: React.MouseEvent) {
    e.stopPropagation()
    onView()
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation()
    onDelete()
  }

  function handleDownloadClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (onDownload) onDownload()
  }

  function handleRenameClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (onRename) onRename()
  }

  function handleMoveClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (onMove) onMove()
  }

  function handleCopyClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (onCopy) onCopy()
  }

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.01] will-change-transform">
      <div className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700">
        <div className="p-2 mr-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-6">
            {document.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">{document.project}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{document.size}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusBadgeClass}`}>
              {document.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStarClick}
            className={document.starred ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-500'}
            title={document.starred ? "Unstar document" : "Star document"}
          >
            <Star className="w-4 h-4" fill={document.starred ? 'currentColor' : 'none'} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewClick}
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/20"
            title="View document details"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadClick}
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/20"
            title="Download document"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/20"
                title="More actions"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleViewClick}>
                <Eye className="mr-2 h-4 w-4" />
                <span>View Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadClick} disabled={!onDownload}>
                <Download className="mr-2 h-4 w-4" />
                <span>Download</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyClick} disabled={!onCopy}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy Link</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRenameClick} disabled={!onRename}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMoveClick} disabled={!onMove}>
                <Folder className="mr-2 h-4 w-4" />
                <span>Move to Folder</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleViewClick}>
                <Share2 className="mr-2 h-4 w-4" />
                <span>Share</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDeleteClick}
                className="text-red-600 hover:text-red-700 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
} 