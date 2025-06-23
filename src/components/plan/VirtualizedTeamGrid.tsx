/**
 * VirtualizedTeamGrid Component
 * High-performance grid for large team member lists using react-window
 * Optimized for smooth scrolling with many team members
 */

import React, { useMemo, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Calendar, Edit, Trash2 } from 'lucide-react';
import { motion as m } from 'framer-motion';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'busy';
  joinDate: string;
  taskCount?: number;
  completedTasks?: number;
}

interface VirtualizedTeamGridProps {
  teamMembers: TeamMember[];
  onEditMember?: (memberId: string) => void;
  onDeleteMember?: (memberId: string) => void;
  onContactMember?: (member: TeamMember, type: 'email' | 'phone') => void;
  height?: number;
  itemWidth?: number;
  itemHeight?: number;
  columnsCount?: number;
}

interface GridItemData {
  teamMembers: TeamMember[];
  onEditMember?: (memberId: string) => void;
  onDeleteMember?: (memberId: string) => void;
  onContactMember?: (member: TeamMember, type: 'email' | 'phone') => void;
  columnsCount: number;
}

// Optimized team member card component for virtualization
const TeamMemberGridItem = React.memo(({ columnIndex, rowIndex, style, data }: {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: GridItemData;
}) => {
  const { teamMembers, onEditMember, onDeleteMember, onContactMember, columnsCount } = data;
  const index = rowIndex * columnsCount + columnIndex;
  const member = teamMembers[index];

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  }, []);

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const handleEdit = useCallback(() => {
    onEditMember?.(member.id);
  }, [onEditMember, member.id]);

  const handleDelete = useCallback(() => {
    onDeleteMember?.(member.id);
  }, [onDeleteMember, member.id]);

  const handleEmailContact = useCallback(() => {
    onContactMember?.(member, 'email');
  }, [onContactMember, member]);

  const handlePhoneContact = useCallback(() => {
    onContactMember?.(member, 'phone');
  }, [onContactMember, member]);

  if (!member) {
    return <div style={style} />;
  }

  const statusColorClass = getStatusColor(member.status);
  const memberInitials = getInitials(member.name);
  const completionRate = member.taskCount && member.completedTasks 
    ? Math.round((member.completedTasks / member.taskCount) * 100)
    : 0;

  return (
    <div style={style} className="p-2">
      <Card className="h-full border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800/20">
        <CardContent className="p-4 h-full flex flex-col">
          {/* Header with avatar and status */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="bg-[#2B6CB0] text-white font-semibold">
                  {memberInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {member.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {member.role}
                </p>
              </div>
            </div>
            <Badge className={`${statusColorClass} text-xs px-2 py-1`}>
              {member.status}
            </Badge>
          </div>

          {/* Contact info */}
          <div className="space-y-2 mb-3 flex-1">
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
              <span className="truncate">{member.email}</span>
            </div>
            {member.phone && (
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="truncate">{member.phone}</span>
              </div>
            )}
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <Calendar className="h-3 w-3 mr-2 flex-shrink-0" />
              <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Task stats */}
          {member.taskCount !== undefined && (
            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-lg p-2 mb-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 dark:text-gray-400">Tasks</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {member.completedTasks || 0}/{member.taskCount}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-[#2B6CB0] h-1.5 rounded-full transition-all duration-200" 
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex gap-1">
              {onContactMember && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-500 hover:text-[#2B6CB0] hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={handleEmailContact}
                  >
                    <Mail className="h-3 w-3" />
                  </Button>
                  {member.phone && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-gray-500 hover:text-[#2B6CB0] hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={handlePhoneContact}
                    >
                      <Phone className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-1">
              {onEditMember && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-gray-500 hover:text-[#2B6CB0] hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={handleEdit}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              {onDeleteMember && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

TeamMemberGridItem.displayName = 'TeamMemberGridItem';

export const VirtualizedTeamGrid = React.memo(function VirtualizedTeamGrid({
  teamMembers,
  onEditMember,
  onDeleteMember,
  onContactMember,
  height = 600,
  itemWidth = 320,
  itemHeight = 220,
  columnsCount = 3
}: VirtualizedTeamGridProps) {
  // Memoize the data for the virtual grid
  const itemData = useMemo((): GridItemData => ({
    teamMembers,
    onEditMember,
    onDeleteMember,
    onContactMember,
    columnsCount
  }), [teamMembers, onEditMember, onDeleteMember, onContactMember, columnsCount]);

  if (teamMembers.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        No team members found
      </div>
    );
  }

  const rowCount = Math.ceil(teamMembers.length / columnsCount);

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Grid
        columnCount={columnsCount}
        columnWidth={itemWidth}
        height={Math.min(height, rowCount * itemHeight)}
        rowCount={rowCount}
        rowHeight={itemHeight}
        itemData={itemData}
        className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
      >
        {TeamMemberGridItem}
      </Grid>
    </m.div>
  );
});