import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Wrench,
  Calendar,
  Building2,
  AlertTriangle,
  Settings,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MaintenanceRecord {
  id: string | number;
  type: 'inspection' | 'repair' | 'service';
  date: string;
  technician: string;
  notes?: string;
}

export interface EquipmentDetails {
  id: string | number;
  name: string;
  model: string;
  serialNumber: string;
  project?: string;
  location: string;
  status: 'operational' | 'maintenance' | 'repair' | 'offline';
  condition: number; // 0-100
  lastMaintenance: string;
  nextMaintenance: string;
  hoursUsed: number;
  maintenanceRecords?: MaintenanceRecord[];
  alerts?: number;
}

export interface EquipmentCardProps {
  /** Equipment details */
  equipment: EquipmentDetails;
  /** Additional styling and behavior */
  className?: string;
  onClick?: () => void;
  animate?: boolean;
}

/**
 * EquipmentCard component for displaying equipment information.
 * Follows Buildese UI design principles:
 * - Card-based UI with subtle shadows for depth
 * - Clear visual feedback for interactions
 * - Consistent spacing system
 * - Modern, aesthetic look with warm blue (#2B6CB0) accents
 * - Progressive disclosure for complex information
 */
export function EquipmentCard({
  equipment,
  className,
  onClick,
  animate = true
}: EquipmentCardProps) {
  const statusConfig = {
    'operational': {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      indicator: 'bg-green-500'
    },
    'maintenance': {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      indicator: 'bg-amber-500'
    },
    'repair': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      indicator: 'bg-red-500'
    },
    'offline': {
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
        {/* Header with Name and Status */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold">{equipment.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Model: {equipment.model}
            </p>
          </div>
          <Badge 
            className={cn(
              'flex items-center',
              statusConfig[equipment.status].bg,
              statusConfig[equipment.status].text
            )}
          >
            <div className={cn('w-2 h-2 rounded-full mr-1.5', statusConfig[equipment.status].indicator)} />
            {equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)}
          </Badge>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Settings className="h-4 w-4 mr-2" />
            S/N: {equipment.serialNumber}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Building2 className="h-4 w-4 mr-2" />
            {equipment.location}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Last: {equipment.lastMaintenance}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            Next: {equipment.nextMaintenance}
          </div>
        </div>

        {/* Condition Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Condition</span>
            <span className={cn(
              'font-medium',
              equipment.condition > 70 ? 'text-green-600 dark:text-green-400' :
              equipment.condition > 30 ? 'text-amber-600 dark:text-amber-400' :
              'text-red-600 dark:text-red-400'
            )}>
              {equipment.condition}%
            </span>
          </div>
          <Progress 
            value={equipment.condition} 
            className={cn(
              'h-2',
              equipment.condition > 70 ? 'bg-green-100 dark:bg-green-900/30' :
              equipment.condition > 30 ? 'bg-amber-100 dark:bg-amber-900/30' :
              'bg-red-100 dark:bg-red-900/30'
            )}
          />
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1.5" />
              {equipment.hoursUsed} Hours
            </div>
            {equipment.maintenanceRecords && (
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                {equipment.maintenanceRecords.length} Records
              </div>
            )}
          </div>
          {equipment.alerts && equipment.alerts > 0 && (
            <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 mr-1.5" />
              {equipment.alerts} Alerts
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
