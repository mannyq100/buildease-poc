import { Users, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  // Process members to handle both string names and full TeamMember objects
  const processedMembers = members.map((member, index) => {
    if (typeof member === 'string') {
      return {
        id: `member-${index}`,
        name: member, // Use the actual name from the string
        role: 'Team Member',
      };
    }
    return member;
  });

  return (
    <div className={`${className || ''}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Team Members</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{members.length} members collaborating on this project</p>
          </div>
          {onManageTeam && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onManageTeam}
              className="text-buildease-blue-600 border-buildease-blue-300 hover:bg-buildease-blue-50 dark:text-buildease-blue-400 dark:border-buildease-blue-600 dark:hover:bg-buildease-blue-950/20"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Team
            </Button>
          )}
        </div>
      </div>
      
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedMembers.slice(0, 5).map((member) => (
            <div 
              key={member.id}
              className="group flex items-center gap-3 p-4 bg-gradient-to-r from-white to-slate-50/50 hover:from-buildease-blue-50/30 hover:to-slate-50 dark:from-slate-800/50 dark:to-slate-800/30 dark:hover:from-buildease-blue-950/20 dark:hover:to-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-buildease-blue-200/60 dark:hover:border-buildease-blue-700/60"
            >
              <Avatar className="h-12 w-12 border-2 border-buildease-blue-200/60 dark:border-buildease-blue-700/60 group-hover:border-buildease-blue-300 dark:group-hover:border-buildease-blue-600 transition-colors duration-300 shadow-sm">
                {member.avatar ? (
                  <AvatarImage src={member.avatar} alt={member.name || 'Team member'} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-buildease-blue-50 to-buildease-blue-100 text-buildease-blue-700 dark:from-buildease-blue-900/30 dark:to-buildease-blue-800/30 dark:text-buildease-blue-300 font-semibold text-sm">
                  {getInitials(member.name || member.id)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-buildease-blue-700 dark:group-hover:text-buildease-blue-300 transition-colors duration-300">{member.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate font-medium">{member.role || 'Team Member'}</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-buildease-blue-100 dark:hover:bg-buildease-blue-900/30">
                    <MoreHorizontal className="h-4 w-4 text-slate-600 dark:text-slate-400" />
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
          <div className="group flex items-center justify-center p-4 bg-gradient-to-br from-buildease-orange-50/50 to-buildease-orange-100/30 dark:from-buildease-orange-950/20 dark:to-buildease-orange-900/20 rounded-xl border-2 border-dashed border-buildease-orange-200/60 dark:border-buildease-orange-700/60 transition-all duration-300 hover:border-buildease-orange-300/80 dark:hover:border-buildease-orange-600/80 hover:shadow-md hover:scale-[1.02] cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-buildease-orange-100 to-buildease-orange-200 dark:from-buildease-orange-900/30 dark:to-buildease-orange-800/30 flex items-center justify-center text-buildease-orange-600 dark:text-buildease-orange-400 mb-2 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <Plus className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-buildease-orange-700 dark:text-buildease-orange-300 group-hover:text-buildease-orange-800 dark:group-hover:text-buildease-orange-200 transition-colors duration-300">Add Team Member</p>
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
                        {processedMembers.slice(6, 9).map((member) => (
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
      </div>
    </div>
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
