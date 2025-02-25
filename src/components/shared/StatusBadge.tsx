import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 'completed' | 'in-progress' | 'pending' | 'delayed' | 'cancelled' | 'warning' | 'success';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  label,
  className 
}) => {
  const statusConfig = {
    'completed': { bg: 'bg-green-100', text: 'text-green-600', defaultLabel: 'Completed' },
    'in-progress': { bg: 'bg-blue-100', text: 'text-blue-600', defaultLabel: 'In Progress' },
    'pending': { bg: 'bg-gray-100', text: 'text-gray-600', defaultLabel: 'Pending' },
    'delayed': { bg: 'bg-red-100', text: 'text-red-600', defaultLabel: 'Delayed' },
    'cancelled': { bg: 'bg-gray-100', text: 'text-gray-600', defaultLabel: 'Cancelled' },
    'warning': { bg: 'bg-yellow-100', text: 'text-yellow-600', defaultLabel: 'Warning' },
    'success': { bg: 'bg-green-100', text: 'text-green-600', defaultLabel: 'Success' }
  };

  const config = statusConfig[status];
  const displayLabel = label || config.defaultLabel;

  return (
    <Badge className={cn(config.bg, config.text, "transition-all", className)}>
      {displayLabel}
    </Badge>
  );
}; 