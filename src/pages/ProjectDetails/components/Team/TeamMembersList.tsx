/**
 * TeamMembersList Component
 * Team management interface with expandable view, member cards, and CRUD operations
 * Mobile-first grid layout that adapts to screen size
 */

import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProCard } from '@/components/ui/ProCard';
import { Users, Plus } from 'lucide-react';
import { TeamMember } from '@/types/projectDetails';
import { TeamMemberCard } from './TeamMemberCard';

interface TeamMembersListProps {
  teamMembers: TeamMember[];
  onEditMember: (member: TeamMember) => void;
  onDeleteMember: (id: string) => void;
  onCreateMember: () => void;
  className?: string;
}

export function TeamMembersList({
  teamMembers,
  onEditMember,
  onDeleteMember,
  onCreateMember,
  className
}: TeamMembersListProps) {
  return (
    <ProCard accent="green" className={className}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg font-bold text-slate-900">
              Team Management
            </CardTitle>
          </div>
          <Button 
            size="sm" 
            onClick={onCreateMember}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Member
          </Button>
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
          <div className="text-center py-10 text-slate-600">
            <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">No Team Members Yet</h3>
            <p className="text-sm mb-4">Invite your contractor, designer, or crew to collaborate.</p>
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
    </ProCard>
  );
}