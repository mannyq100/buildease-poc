/**
 * Offline Indicator for construction sites with poor connectivity
 * Shows connection status and provides helpful actions
 */

import React from 'react';
import { Wifi, WifiOff, CloudOff, RefreshCcw } from 'lucide-react';
import { TouchOptimizedButton } from '@/components/ui/TouchOptimizedButton';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/core/ui';

interface OfflineIndicatorProps {
  isOnline: boolean;
  onRetry?: () => void;
  className?: string;
}

export function OfflineIndicator({ 
  isOnline, 
  onRetry,
  className 
}: OfflineIndicatorProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };
  
  if (isOnline) {
    return null; // Don't show when online
  }
  
  return (
    <Card className={cn("border-orange-200 bg-orange-50", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <WifiOff className="h-5 w-5 text-orange-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-900">
              You're offline
            </p>
            <p className="text-xs text-orange-700">
              Some features may not work until connection is restored
            </p>
          </div>
          <TouchOptimizedButton
            touchSize="sm"
            variant="outline"
            onClick={handleRetry}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <RefreshCcw className="h-3 w-3" />
          </TouchOptimizedButton>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Connection Quality Indicator for adaptive loading
 */
interface ConnectionIndicatorProps {
  quality: 'excellent' | 'good' | 'poor' | 'offline';
  className?: string;
}

export function ConnectionIndicator({ quality, className }: ConnectionIndicatorProps) {
  const getIndicatorInfo = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return {
          icon: Wifi,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Excellent',
          message: 'All features available',
        };
      case 'good':
        return {
          icon: Wifi,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Good',
          message: 'Full functionality',
        };
      case 'poor':
        return {
          icon: Wifi,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: 'Slow',
          message: 'Limited features for better performance',
        };
      case 'offline':
        return {
          icon: WifiOff,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Offline',
          message: 'Using cached data only',
        };
      default:
        return {
          icon: CloudOff,
          color: 'text-slate-600',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          label: 'Unknown',
          message: 'Connection status unknown',
        };
    }
  };
  
  const { icon: Icon, color, bgColor, borderColor, label, message } = getIndicatorInfo(quality);
  
  // Only show for poor or offline connections
  if (quality === 'excellent' || quality === 'good') {
    return null;
  }
  
  return (
    <Card className={cn(`${bgColor} ${borderColor}`, className)}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${color}`}>
              {label} Connection
            </p>
            <p className={`text-xs ${color.replace('600', '700')}`}>
              {message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}