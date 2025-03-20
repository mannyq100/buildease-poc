import React from 'react';
import { Users, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface TeamMember {
  id: string;
  name?: string;
  avatar?: string;
  role?: string;
}

interface TeamMembersSectionProps {
  members?: TeamMember[] | string[];
  onManageTeam?: () => void;
  className?: string;
}

/**
 * TeamMembersSection - Displays project team members with actions
 */
export function TeamMembersSection({
  members = [],
  onManageTeam,
  className
}: TeamMembersSectionProps) {
  // Process members to handle both string IDs and full TeamMember objects
  const processedMembers = members.map((member, index) => {
    if (typeof member === 'string') {
      return {
        id: member,
        name: `Team Member ${index + 1}`,
        role: 'Team Member',
      };
    }
    return member;
  });

  return (
    <Card className={`border border-slate-200 dark:border-slate-700 shadow-sm ${className || ''}`}>
      <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-row justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Team Members</h2>
          <p className="text-sm text-muted-foreground">{members.length} members on this project</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onManageTeam}
          className="text-[#2B6CB0] border-[#2B6CB0] hover:bg-[#2B6CB0]/10 dark:text-blue-400 dark:border-blue-400/40 dark:hover:bg-blue-400/10"
        >
          <Users className="h-4 w-4 mr-2" />
          Manage Team
        </Button>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {processedMembers.slice(0, 5).map((member) => (
            <div 
              key={member.id}
              className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors duration-200"
            >
              <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                {member.avatar ? (
                  <AvatarImage src={member.avatar} alt={member.name || 'Team member'} />
                ) : null}
                <AvatarFallback className="bg-[#2B6CB0]/10 text-[#2B6CB0] dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                  {getInitials(member.name || member.id)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground truncate">{member.role || 'Team Member'}</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>Assign Tasks</DropdownMenuItem>
                  <DropdownMenuItem>Send Message</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          
          {/* Add new team member button */}
          <div className="flex items-center justify-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 transition-colors duration-200 hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-[#ED8936]/10 dark:bg-[#ED8936]/20 flex items-center justify-center text-[#ED8936] mb-1">
                <Plus className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Add Team Member</p>
            </div>
          </div>
          
          {/* Show the remaining count if more than 6 members */}
          {members.length > 6 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <div className="flex flex-col items-center text-center">
                      <div className="flex -space-x-2 overflow-hidden">
                        {processedMembers.slice(6, 9).map((member, index) => (
                          <Avatar key={member.id} className="h-8 w-8 border-2 border-white dark:border-slate-800">
                            <AvatarFallback className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-xs">
                              {getInitials(member.name || member.id)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <p className="text-sm font-medium mt-2">+{members.length - 6} more</p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View all team members</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Helper function to get initials from a name
 * @param name The name to extract initials from
 * @returns The initials (up to 2 characters)
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}
