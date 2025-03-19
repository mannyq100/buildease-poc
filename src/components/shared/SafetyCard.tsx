import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShieldAlert,
  Calendar,
  Building2,
  MapPin,
  FileText,
  AlertTriangle,
  Users,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SafetyIncident {
  id: string | number;
  type: 'injury' | 'near-miss' | 'property-damage' | 'environmental';
  severity: 'critical' | 'major' | 'minor';
  description: string;
  location: string;
  date: string;
  involvedPersons: number;
  status: 'investigating' | 'resolved' | 'pending';
  reportedBy: string;
}

export interface SafetyCardProps {
  /** Safety incident details */
  incident: SafetyIncident;
  /** Additional styling and behavior */
  className?: string;
  onClick?: () => void;
  animate?: boolean;
}

/**
 * SafetyCard component for displaying safety incident information.
 * Follows Buildese UI design principles:
 * - Card-based UI with subtle shadows for depth
 * - Clear visual feedback for interactions
 * - Consistent spacing system
 * - Modern, aesthetic look with warm blue (#2B6CB0) accents
 * - Progressive disclosure for complex information
 */
export function SafetyCard({
  incident,
  className,
  onClick,
  animate = true
}: SafetyCardProps) {
  const typeConfig = {
    'injury': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      indicator: 'bg-red-500'
    },
    'near-miss': {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      indicator: 'bg-amber-500'
    },
    'property-damage': {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      indicator: 'bg-blue-500'
    },
    'environmental': {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      indicator: 'bg-green-500'
    }
  };

  const severityConfig = {
    'critical': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      indicator: 'bg-red-500'
    },
    'major': {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      indicator: 'bg-amber-500'
    },
    'minor': {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      indicator: 'bg-blue-500'
    }
  };

  const statusConfig = {
    'investigating': {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      indicator: 'bg-blue-500'
    },
    'resolved': {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      indicator: 'bg-green-500'
    },
    'pending': {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      indicator: 'bg-amber-500'
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
        {/* Header with Type and Severity */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-semibold">
                {incident.type.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              ID: {incident.id}
            </p>
          </div>
          <div className="flex space-x-2">
            <Badge 
              className={cn(
                'flex items-center',
                severityConfig[incident.severity].bg,
                severityConfig[incident.severity].text
              )}
            >
              <div className={cn('w-2 h-2 rounded-full mr-1.5', severityConfig[incident.severity].indicator)} />
              {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
            </Badge>
            <Badge 
              className={cn(
                'flex items-center',
                statusConfig[incident.status].bg,
                statusConfig[incident.status].text
              )}
            >
              <div className={cn('w-2 h-2 rounded-full mr-1.5', statusConfig[incident.status].indicator)} />
              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm line-clamp-2">
          {incident.description}
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {incident.location}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {incident.date}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            {incident.involvedPersons} {incident.involvedPersons === 1 ? 'Person' : 'People'}
          </div>
          <div className="flex items-center text-muted-foreground">
            <FileText className="h-4 w-4 mr-2" />
            Reported by: {incident.reportedBy}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1.5" />
            {incident.status === 'resolved' ? 'Resolved' : 'Open'} Incident
          </div>
          
          {/* Alert for critical incidents */}
          {incident.severity === 'critical' && incident.status !== 'resolved' && (
            <div className="flex items-center text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4 mr-1.5" />
              Critical Incident
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
