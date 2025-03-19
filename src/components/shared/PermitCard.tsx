import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileCheck,
  Calendar,
  Building2,
  FileText,
  MapPin,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PermitDetails {
  id: string | number;
  permitNumber: string;
  type: string;
  project: string;
  location: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'pending' | 'expired' | 'revoked';
  authority: string;
  requirements?: string[];
  notes?: string;
  documents?: number;
  warnings?: number;
}

export interface PermitCardProps {
  /** Permit details */
  permit: PermitDetails;
  /** Additional styling and behavior */
  className?: string;
  onClick?: () => void;
  animate?: boolean;
}

/**
 * PermitCard component for displaying permit information.
 * Follows Buildese UI design principles:
 * - Card-based UI with subtle shadows for depth
 * - Clear visual feedback for interactions
 * - Consistent spacing system
 * - Modern, aesthetic look with warm blue (#2B6CB0) accents
 * - Progressive disclosure for complex information
 */
export function PermitCard({
  permit,
  className,
  onClick,
  animate = true
}: PermitCardProps) {
  const statusConfig = {
    'active': {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      indicator: 'bg-green-500'
    },
    'pending': {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      indicator: 'bg-amber-500'
    },
    'expired': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      indicator: 'bg-red-500'
    },
    'revoked': {
      bg: 'bg-slate-100 dark:bg-slate-900/30',
      text: 'text-slate-700 dark:text-slate-400',
      indicator: 'bg-slate-500'
    }
  };

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
        {/* Header with Permit Number and Status */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold">{permit.permitNumber}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{permit.type}</p>
          </div>
          <Badge 
            className={cn(
              'flex items-center',
              statusConfig[permit.status].bg,
              statusConfig[permit.status].text
            )}
          >
            <div className={cn('w-2 h-2 rounded-full mr-1.5', statusConfig[permit.status].indicator)} />
            {permit.status.charAt(0).toUpperCase() + permit.status.slice(1)}
          </Badge>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Building2 className="h-4 w-4 mr-2" />
            {permit.project}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {permit.location}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Issued: {permit.issueDate}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            Expires: {permit.expiryDate}
          </div>
        </div>

        {/* Authority */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Building2 className="h-4 w-4 mr-2" />
          Issuing Authority: {permit.authority}
        </div>

        {/* Requirements if available */}
        {permit.requirements && permit.requirements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Key Requirements</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {permit.requirements.slice(0, 2).map((req, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span className="line-clamp-1">{req}</span>
                </li>
              ))}
              {permit.requirements.length > 2 && (
                <li className="text-blue-600 dark:text-blue-400">
                  +{permit.requirements.length - 2} more requirements
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {permit.documents !== undefined && (
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1.5" />
                {permit.documents} Documents
              </div>
            )}
            {permit.warnings !== undefined && permit.warnings > 0 && (
              <div className="flex items-center text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4 mr-1.5" />
                {permit.warnings} Warnings
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
