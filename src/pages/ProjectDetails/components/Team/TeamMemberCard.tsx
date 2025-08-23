/**
 * TeamMemberCard Component
 * Individual team member display with status indicators and action buttons
 * Mobile-first design with proper touch targets and status indicators
 * Performance optimized with React.memo
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared';
import { Edit3, X, Phone, Mail, Building2, Shield, ShieldCheck } from 'lucide-react';
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

  // Memoized computed values
  const memberInitials = React.useMemo(() => getInitials(member.name), [member.name, getInitials]);
  const statusColorClass = React.useMemo(() => getStatusColor(member.availability || ''), [member.availability, getStatusColor]);

  if (variant === 'compact') {
    return (
      <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 hover:border-slate-300/80 transition-all duration-200 group hover:shadow-md overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-slate-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        
        <div className="relative p-4">
          <div className="flex items-center gap-3">
            {/* Compact Avatar */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-buildease-blue-100 to-buildease-blue-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ring-1 ring-white/30">
                {(member.profile_picture_url || member.avatar) ? (
                  <img 
                    src={member.profile_picture_url || member.avatar} 
                    alt={member.name} 
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-buildease-blue-700">
                    {memberInitials}
                  </span>
                )}
              </div>
              {/* Compact availability indicator */}
              <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                member.isOnline 
                  ? member.availability === 'available' ? 'bg-emerald-500' : 
                    member.availability === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
                  : 'bg-slate-400'
              }`} />
            </div>
            
            {/* Compact Member Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h4 className="text-sm font-semibold text-slate-900 truncate">{member.name}</h4>
                {member.email_verified && (
                  <div className="flex items-center justify-center w-4 h-4 bg-emerald-100 rounded-full">
                    <ShieldCheck className="h-2.5 w-2.5 text-emerald-600" />
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-slate-600 truncate">{member.role}</p>
            </div>
            
            {/* Compact Actions */}
            {showActions && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(member)}
                  className="h-7 w-7 p-0 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(member.id)}
                  className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 hover:border-slate-300/80 transition-all duration-300 group hover:shadow-lg hover:shadow-slate-200/50 overflow-hidden">
      {/* Modern gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6">
        {/* Header with Avatar and Actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Enhanced Avatar */}
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-buildease-blue-100 via-buildease-blue-200 to-buildease-blue-300 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-white/50">
                {(member.profile_picture_url || member.avatar) ? (
                  <img 
                    src={member.profile_picture_url || member.avatar} 
                    alt={member.name} 
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-buildease-blue-700">
                    {memberInitials}
                  </span>
                )}
              </div>
              {/* Enhanced availability indicator */}
              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-3 border-white shadow-sm ${
                member.isOnline 
                  ? member.availability === 'available' ? 'bg-emerald-500' : 
                    member.availability === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
                  : 'bg-slate-400'
              }`} />
            </div>
            
            {/* Member Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-slate-900 truncate">{member.name}</h4>
                {member.email_verified && (
                  <div className="flex items-center justify-center w-5 h-5 bg-emerald-100 rounded-full" title="Email verified">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  </div>
                )}
                {member.phone_verified && (
                  <div className="flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full" title="Phone verified">
                    <Shield className="h-3 w-3 text-blue-600" />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">{member.role}</p>
              {member.company_name && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Building2 className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[140px] font-medium">{member.company_name}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Always visible action buttons for better UX */}
          {showActions && (
            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(member)}
                className="h-8 w-8 p-0 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(member.id)}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between mb-3">
          <StatusBadge 
            status={member.status as 'in-progress' | 'pending' | 'cancelled'} 
            size="sm" 
          />
          {member.availability && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColorClass}`}>
              <div className={`w-2 h-2 rounded-full ${
                member.availability === 'available' ? 'bg-emerald-500' :
                member.availability === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
              {member.availability.charAt(0).toUpperCase() + member.availability.slice(1)}
            </span>
          )}
        </div>
        
        {/* Contact Information */}
        <div className="space-y-2">
          {(member.phone || member.contactInfo?.phone) && (
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${
                member.phone_verified ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
              }`}>
                <Phone className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">{member.phone || member.contactInfo?.phone}</span>
              {member.phone_verified && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Verified</span>
              )}
            </div>
          )}
          {(member.email || member.contactInfo?.email) && (
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${
                member.email_verified ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
              }`}>
                <Mail className="h-3.5 w-3.5" />
              </div>
              <span className="truncate max-w-[160px] font-medium">
                {member.email || member.contactInfo?.email}
              </span>
              {member.email_verified && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Verified</span>
              )}
            </div>
          )}
        </div>

        {/* Join Date */}
        {member.joined_at && (
          <div className="mt-4 pt-3 border-t border-slate-200/60">
            <span className="text-xs text-slate-500 font-medium">
              Member since {new Date(member.joined_at).toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              })}
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
    prevProps.member.profile_picture_url === nextProps.member.profile_picture_url &&
    prevProps.member.avatar === nextProps.member.avatar &&
    prevProps.member.email_verified === nextProps.member.email_verified &&
    prevProps.member.phone_verified === nextProps.member.phone_verified &&
    prevProps.member.company_name === nextProps.member.company_name &&
    prevProps.member.joined_at === nextProps.member.joined_at &&
    prevProps.variant === nextProps.variant &&
    prevProps.showActions === nextProps.showActions &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete
  );
});