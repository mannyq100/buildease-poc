/**
 * TeamMembersList Component
 * Team management interface with expandable view, member cards, and CRUD operations
 * Mobile-first grid layout that adapts to screen size
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, ChevronUp } from 'lucide-react';
import { TeamMembersListProps, TeamMember } from '@/types/projectDetails';
import { TeamMemberCard } from './TeamMemberCard';

export function TeamMembersList({
  teamMembers,
  onEditMember,
  onDeleteMember,
  onCreateMember,
  isExpanded,
  onToggleExpanded
}: TeamMembersListProps) {
  // Only render when expanded - completely hidden when collapsed
  if (!isExpanded) {
    return null;
  }

  // Expanded view with full team management
  return (
    <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-emerald-50/20 backdrop-blur-md rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={onToggleExpanded}
            className="flex items-center gap-2 hover:text-emerald-600 transition-colors"
          >
            <Users className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg font-bold text-slate-900">
              Team Management
            </CardTitle>
            <ChevronUp className="h-4 w-4 text-slate-500" />
          </button>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={onCreateMember}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Member
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member: TeamMember) => (
              <div key={member.id} className="min-h-[120px]">
                <TeamMemberCard
                  member={member}
                  onEdit={onEditMember}
                  onDelete={onDeleteMember}
                  variant="full"
                  showActions={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No Team Members</h3>
            <p className="text-sm mb-4">Start building your team by adding the first member</p>
            <Button 
              onClick={onCreateMember}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Member
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}