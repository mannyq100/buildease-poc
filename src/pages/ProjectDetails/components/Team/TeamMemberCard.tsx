/**
 * TeamMemberCard Component
 * Individual team member display with status indicators and action buttons
 * Mobile-first design with proper touch targets and status indicators
 * Performance optimized with React.memo
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared';
import { Edit3, X, Phone, Mail } from 'lucide-react';
import { TeamMemberCardProps } from '@/types/projectDetails';

function TeamMemberCardComponent({ 
  member, 
  onEdit, 
  onDelete, 
  variant = 'full',
  showActions = true 
}: TeamMemberCardProps) {
  // Memoized helper functions to prevent re-calculations on every render
  const getInitials = React.useMemo(() => {
    return (name: string) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    };
  }, []);

  const getStatusColor = React.useMemo(() => {
    return (status: string) => {
      switch (status) {
        case 'active':
          return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'on-break':
          return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'off-site':
          return 'bg-slate-100 text-slate-700 border-slate-200';
        default:
          return 'bg-slate-100 text-slate-700 border-slate-200';
      }
    };
  }, []);

  const getAvailabilityIndicator = React.useCallback((availability?: string, isOnline?: boolean) => {
    if (!availability && isOnline === undefined) return null;
    
    const color = isOnline 
      ? availability === 'available' ? 'bg-emerald-500' : 
        availability === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
      : 'bg-slate-400';
    
    return (
      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${color}`} />
    );
  }, []);

  // Memoized computed values
  const memberInitials = React.useMemo(() => getInitials(member.name), [member.name, getInitials]);
  const statusColorClass = React.useMemo(() => getStatusColor(member.availability || ''), [member.availability, getStatusColor]);
  const availabilityIndicator = React.useMemo(() => 
    getAvailabilityIndicator(member.availability, member.isOnline), 
    [member.availability, member.isOnline, getAvailabilityIndicator]
  );

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 bg-slate-50/50 rounded-lg p-2 min-w-0 hover:bg-slate-100/50 transition-colors">
        <div className="relative w-8 h-8 bg-buildease-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-buildease-blue-700">
            {memberInitials}
          </span>
          {availabilityIndicator}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-slate-900 truncate">{member.name}</div>
          <div className="text-xs text-slate-600">{member.role}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors group min-h-[80px]">
      {/* Avatar with Status Indicator */}
      <div className="relative w-12 h-12 bg-buildease-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
        {member.avatar ? (
          <img 
            src={member.avatar} 
            alt={member.name} 
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-buildease-blue-700">
            {memberInitials}
          </span>
        )}
        {availabilityIndicator}
      </div>

      {/* Member Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-slate-900 truncate">{member.name}</h4>
            <p className="text-sm text-slate-600">{member.role}</p>
          </div>
          
          {/* Action Buttons - Mobile optimized */}
          {showActions && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(member)}
                className="h-8 w-8 p-0 hover:bg-emerald-100 hover:text-emerald-700 touch-manipulation"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(member.id)}
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 touch-manipulation"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Status and Contact Info */}
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge 
            status={member.status as 'in-progress' | 'pending' | 'cancelled'} 
            size="sm" 
          />
          
          {/* Contact Info */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {(member.phone || member.contactInfo?.phone) && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{member.phone || member.contactInfo?.phone}</span>
              </div>
            )}
            {(member.email || member.contactInfo?.email) && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-[120px]">
                  {member.email || member.contactInfo?.email}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Availability Status */}
        {member.availability && (
          <div className="mt-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColorClass}`}>
              <div className={`w-2 h-2 rounded-full ${
                member.availability === 'available' ? 'bg-emerald-500' :
                member.availability === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
              {member.availability.charAt(0).toUpperCase() + member.availability.slice(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Export memoized component with custom comparison for performance
export const TeamMemberCard = React.memo(TeamMemberCardComponent, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.member.id === nextProps.member.id &&
    prevProps.member.name === nextProps.member.name &&
    prevProps.member.role === nextProps.member.role &&
    prevProps.member.status === nextProps.member.status &&
    prevProps.member.availability === nextProps.member.availability &&
    prevProps.member.isOnline === nextProps.member.isOnline &&
    prevProps.variant === nextProps.variant &&
    prevProps.showActions === nextProps.showActions &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete
  );
});