import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  ClipboardCheck,
  Calendar,
  Building2,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InspectionFinding {
  id: string | number;
  type: 'critical' | 'major' | 'minor' | 'observation';
  description: string;
  location: string;
  images?: string[];
  resolved?: boolean;
}

export interface InspectionDetails {
  id: string | number;
  title: string;
  type: string;
  project: string;
  location: string;
  date: string;
  status: 'scheduled' | 'completed' | 'failed' | 'postponed';
  inspector: {
    id: string | number;
    name: string;
    avatar?: string;
    role?: string;
  };
  findings?: InspectionFinding[];
  documents?: number;
  score?: number;
  notes?: string;
}

export interface InspectionCardProps {
  /** Inspection details */
  inspection: InspectionDetails;
  /** Additional styling and behavior */
  className?: string;
  onClick?: () => void;
  animate?: boolean;
}

/**
 * InspectionCard component for displaying inspection information.
 * Follows Buildese UI design principles:
 * - Card-based UI with subtle shadows for depth
 * - Clear visual feedback for interactions
 * - Consistent spacing system
 * - Modern, aesthetic look with warm blue (#2B6CB0) accents
 * - Progressive disclosure for complex information
 */
export function InspectionCard({
  inspection,
  className,
  onClick,
  animate = true
}: InspectionCardProps) {
  const statusConfig = {
    'scheduled': {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      indicator: 'bg-blue-500'
    },
    'completed': {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      indicator: 'bg-green-500'
    },
    'failed': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      indicator: 'bg-red-500'
    },
    'postponed': {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      indicator: 'bg-amber-500'
    }
  };

  // Count unresolved findings
  const unresolvedFindings = inspection.findings ? 
    inspection.findings.filter(finding => !finding.resolved).length : 0;

  // Count critical findings
  const criticalFindings = inspection.findings ? 
    inspection.findings.filter(finding => finding.type === 'critical').length : 0;

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-300',
        'hover:shadow-md cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="p-6 space-y-4">
        {/* Header with Title and Status */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ClipboardCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold">{inspection.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{inspection.type}</p>
          </div>
          <Badge 
            className={cn(
              'flex items-center',
              statusConfig[inspection.status].bg,
              statusConfig[inspection.status].text
            )}
          >
            <div className={cn('w-2 h-2 rounded-full mr-1.5', statusConfig[inspection.status].indicator)} />
            {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
          </Badge>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Building2 className="h-4 w-4 mr-2" />
            {inspection.project}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {inspection.location}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {inspection.date}
          </div>
          <div className="flex items-center">
            <Avatar className="h-5 w-5 mr-2">
              <AvatarImage src={inspection.inspector.avatar} alt={inspection.inspector.name} />
              <AvatarFallback className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {inspection.inspector.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground">{inspection.inspector.name}</span>
          </div>
        </div>

        {/* Score if available */}
        {inspection.score !== undefined && (
          <div className="flex items-center text-sm">
            <span className="text-muted-foreground mr-2">Score:</span>
            <span className={cn(
              'font-medium',
              inspection.score > 80 ? 'text-green-600 dark:text-green-400' :
              inspection.score > 60 ? 'text-amber-600 dark:text-amber-400' :
              'text-red-600 dark:text-red-400'
            )}>
              {inspection.score}/100
            </span>
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {inspection.findings && (
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                {inspection.findings.length} Findings
              </div>
            )}
            {inspection.documents !== undefined && (
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1.5" />
                {inspection.documents} Docs
              </div>
            )}
          </div>
          
          {/* Alerts */}
          {(unresolvedFindings > 0 || criticalFindings > 0) && (
            <div className="flex items-center space-x-3">
              {unresolvedFindings > 0 && (
                <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4 mr-1.5" />
                  {unresolvedFindings} Unresolved
                </div>
              )}
              {criticalFindings > 0 && (
                <div className="flex items-center text-sm text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4 mr-1.5" />
                  {criticalFindings} Critical
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
