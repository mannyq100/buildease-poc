import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  File,
  ArrowUpRight,
  Share2, 
  Star, 
  Trash2, 
  MoreVertical, 
  Download, 
  Edit, 
  Eye, 
  Copy, 
  Folder
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DocumentItemProps, Document } from '@/types/documents';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

/**
 * Unified DocumentItem component that supports all implementations
 * while following Buildese UI design principles:
 * - Card-based UI with subtle shadows
 * - Clear visual feedback
 * - Consistent spacing
 * - Modern, aesthetic look
 */
export function DocumentItem({ 
  // Basic document information
  title, 
  name,
  document: docObject,
  
  // Document metadata
  type: propType, 
  date: propDate, 
  size: propSize,
  status: propStatus,
  
  // Visual customization
  icon: customIcon,
  className,
  animated = false,
  simplified = false,
  
  // Actions and events
  onClick,
  onView,
  onDelete,
  onToggleStar,
  onRename,
  onMove,
  onCopy,
  onDownload
}: DocumentItemProps) {
  // Support both direct props and document object props for backward compatibility
  const displayName = title || name || (docObject ? docObject.name : '');
  const type = propType || (docObject ? docObject.type : 'UNKNOWN');
  const date = propDate || (docObject ? docObject.uploaded : '');
  const size = propSize || (docObject ? docObject.size : '');
  const status = propStatus || (docObject ? docObject.status : undefined);
  
  // Detect if we're in dark mode
  const isDarkMode = typeof window !== 'undefined' && 
    document.documentElement.classList.contains('dark');
  
  // Generate appropriate icon based on file type
  function getIcon() {
    if (customIcon) return customIcon;
    
    switch (type) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'DOC':
      case 'DOCX':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'DWG':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'XLSX':
      case 'XLS':
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      case 'JPG':
      case 'PNG':
      case 'GIF':
        return <FileImage className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  }
  
  // Get status badge styling based on Buildese UI color scheme
  function getStatusBadgeClass() {
    if (!status) return '';
    
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  }
  
  // Simplified version for project/phase views
  if (simplified) {
    return (
      <div className={cn(
        "flex items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all hover:shadow-sm",
        className
      )}>
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-grow">
          <h3 className="font-medium">{displayName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{date} &#183; {size}</p>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Full version with all actions
  const Wrapper = animated ? m.div : 'div';
  const animationProps = animated ? {
    whileHover: { x: 2 },
    className: cn(
      "flex items-center justify-between py-3 px-4 rounded-md",
      isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-50",
      className
    )
  } : {
    className: cn(
      "flex items-center justify-between py-3 px-4 rounded-md",
      isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-50",
      className
    )
  };

  return (
    <LazyMotion features={domAnimation}>
      <Wrapper {...animationProps}>
        <div className="flex items-center space-x-3">
          {getIcon()}
          <div>
            <div className={cn(
              "font-medium",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>{displayName}</div>
            <div className="text-xs flex items-center gap-2 mt-0.5">
              <span>{type}</span>
              <span className="text-xs text-gray-500">&#183;</span>
              <span>{size}</span>
              <span className="text-xs text-gray-500">&#183;</span>
              <span>{date}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {status && (
            <Badge className={getStatusBadgeClass()}>
              {status}
            </Badge>
          )}
          {onView && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={onView} className="h-8 w-8">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {(onRename || onMove || onCopy || onDownload || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {onView && (
                  <DropdownMenuItem onClick={onView}>
                    <Eye className="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                )}
                {onDownload && (
                  <DropdownMenuItem onClick={onDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download</span>
                  </DropdownMenuItem>
                )}
                {onCopy && (
                  <DropdownMenuItem onClick={onCopy}>
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Copy Link</span>
                  </DropdownMenuItem>
                )}
                {onRename && (
                  <DropdownMenuItem onClick={onRename}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                )}
                {onMove && (
                  <DropdownMenuItem onClick={onMove}>
                    <Folder className="mr-2 h-4 w-4" />
                    <span>Move to Folder</span>
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={onDelete}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </Wrapper>
    </LazyMotion>
  );
}