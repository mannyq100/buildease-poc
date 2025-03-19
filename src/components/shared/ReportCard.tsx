import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Calendar,
  Download,
  Eye,
  Share2,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ReportSection {
  id: string | number;
  title: string;
  type: 'chart' | 'table' | 'summary' | 'metrics' | 'images';
  description?: string;
}

export interface ReportDetails {
  id: string | number;
  title: string;
  description: string;
  type: 'financial' | 'progress' | 'safety' | 'quality' | 'resource' | 'custom';
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  author: string;
  project?: string;
  period?: string;
  sections?: ReportSection[];
  views?: number;
  downloads?: number;
  shared?: number;
  fileSize?: string;
  fileType?: 'pdf' | 'excel' | 'word' | 'html';
}

export interface ReportCardProps {
  /** Report details */
  report: ReportDetails;
  /** Additional styling and behavior */
  className?: string;
  onClick?: () => void;
  onDownload?: (id: string | number) => void;
  onShare?: (id: string | number) => void;
  animate?: boolean;
}

/**
 * ReportCard component for displaying report information.
 * Follows Buildese UI design principles:
 * - Card-based UI with subtle shadows for depth
 * - Clear visual feedback for interactions
 * - Consistent spacing system
 * - Modern, aesthetic look with warm blue (#2B6CB0) accents
 * - Progressive disclosure for complex information
 */
export function ReportCard({
  report,
  className,
  onClick,
  onDownload,
  onShare,
  animate = true
}: ReportCardProps) {
  const typeConfig = {
    'financial': {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      icon: <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
    },
    'progress': {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      icon: <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    },
    'safety': {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      icon: <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
    },
    'quality': {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-400',
      icon: <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
    },
    'resource': {
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
      text: 'text-cyan-700 dark:text-cyan-400',
      icon: <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
    },
    'custom': {
      bg: 'bg-slate-100 dark:bg-slate-900/30',
      text: 'text-slate-700 dark:text-slate-400',
      icon: <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
    }
  };

  const statusConfig = {
    'draft': {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      indicator: 'bg-amber-500'
    },
    'published': {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      indicator: 'bg-green-500'
    },
    'archived': {
      bg: 'bg-slate-100 dark:bg-slate-900/30',
      text: 'text-slate-700 dark:text-slate-400',
      indicator: 'bg-slate-500'
    }
  };

  const fileTypeConfig = {
    'pdf': {
      color: 'text-red-600 dark:text-red-400',
      label: 'PDF'
    },
    'excel': {
      color: 'text-green-600 dark:text-green-400',
      label: 'Excel'
    },
    'word': {
      color: 'text-blue-600 dark:text-blue-400',
      label: 'Word'
    },
    'html': {
      color: 'text-orange-600 dark:text-orange-400',
      label: 'HTML'
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(report.id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(report.id);
    }
  };

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-300',
        'hover:shadow-md',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        {/* Header with Type Icon and Title */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={cn(
              'p-2 rounded-md',
              typeConfig[report.type].bg
            )}>
              {typeConfig[report.type].icon}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">{report.title}</h3>
              {report.project && (
                <p className="text-xs text-muted-foreground">
                  Project: {report.project}
                </p>
              )}
            </div>
          </div>
          <Badge 
            className={cn(
              'flex items-center',
              statusConfig[report.status].bg,
              statusConfig[report.status].text
            )}
          >
            <div className={cn('w-2 h-2 rounded-full mr-1.5', statusConfig[report.status].indicator)} />
            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm line-clamp-2">{report.description}</p>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1.5" />
            {report.updatedAt}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-1.5" />
            By: {report.author}
          </div>
          {report.period && (
            <div className="flex items-center text-muted-foreground col-span-2">
              Period: {report.period}
            </div>
          )}
        </div>

        {/* Sections Summary */}
        {report.sections && report.sections.length > 0 && (
          <div className="pt-2 border-t">
            <h4 className="text-xs font-medium mb-2">Sections ({report.sections.length})</h4>
            <div className="flex flex-wrap gap-1.5">
              {report.sections.map((section) => (
                <Badge 
                  key={section.id}
                  variant="outline"
                  className="text-xs"
                >
                  {section.title}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Footer with Stats and Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
            {report.views !== undefined && (
              <div className="flex items-center">
                <Eye className="h-3.5 w-3.5 mr-1" />
                {report.views}
              </div>
            )}
            {report.downloads !== undefined && (
              <div className="flex items-center">
                <Download className="h-3.5 w-3.5 mr-1" />
                {report.downloads}
              </div>
            )}
            {report.shared !== undefined && (
              <div className="flex items-center">
                <Share2 className="h-3.5 w-3.5 mr-1" />
                {report.shared}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {report.fileType && report.fileSize && (
              <span className={cn(
                'text-xs font-medium',
                fileTypeConfig[report.fileType].color
              )}>
                {fileTypeConfig[report.fileType].label} ({report.fileSize})
              </span>
            )}
            <button 
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900/30 text-blue-600 dark:text-blue-400"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </button>
            <button 
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900/30 text-blue-600 dark:text-blue-400"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
