import { cn } from '@/utils/core/ui';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TeamMembersSection } from '@/components/project/TeamMembersSection';
import { 
  Users, 
  UserPlus,
  Shield
} from 'lucide-react';
import type { TeamMember } from '@/types/project';

interface TeamAndResourcesProps {
  projectId: string;
  projectName: string;
  teamMembers: TeamMember[];
  onManageTeam: () => void;
  className?: string;
}

export function TeamAndResources({ 
  projectId,
  projectName,
  teamMembers,
  onManageTeam,
  className 
}: TeamAndResourcesProps) {
  // Calculate team stats
  const activeMembers = teamMembers.filter(member => member.status === 'active').length;
  const totalMembers = teamMembers.length;
  const pendingMembers = teamMembers.filter(member => member.status === 'pending').length;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Team Management Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-buildease-blue-50/80 via-white to-buildease-blue-100/60 dark:from-buildease-blue-950/30 dark:via-slate-800/50 dark:to-buildease-blue-900/20 rounded-2xl border border-buildease-blue-200/40 dark:border-buildease-blue-700/40 shadow-lg backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-buildease-blue-500/5 to-buildease-blue-600/5 dark:from-buildease-blue-400/10 dark:to-buildease-blue-500/10" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-buildease-blue-100 dark:bg-buildease-blue-900/30 rounded-xl">
                  <Users className="h-6 w-6 text-buildease-blue-600 dark:text-buildease-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Team Management
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                    Manage team members, roles, and collaboration
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 sm:gap-8">
              <div className="text-center group">
                <div className="text-2xl sm:text-3xl font-bold text-buildease-blue-600 dark:text-buildease-blue-400 transition-colors group-hover:text-buildease-blue-700 dark:group-hover:text-buildease-blue-300">
                  {activeMembers}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Active Members
                </div>
              </div>
              <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center group">
                <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 transition-colors group-hover:text-amber-700 dark:group-hover:text-amber-300">
                  {pendingMembers}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Pending
                </div>
              </div>
              <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center group">
                <div className="text-2xl sm:text-3xl font-bold text-slate-600 dark:text-slate-400 transition-colors group-hover:text-slate-700 dark:group-hover:text-slate-300">
                  {totalMembers}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Total
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Management Content */}
      <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-buildease-blue-50/10 dark:from-slate-900 dark:via-slate-800/30 dark:to-buildease-blue-950/10 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-buildease-blue-500 to-buildease-orange-500 rounded-full" />
                  Team Collaboration
                </h4>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  Manage team members, roles, and responsibilities for optimal project coordination
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="default"
                  className="border-buildease-blue-200 text-buildease-blue-700 hover:bg-buildease-blue-50 dark:border-buildease-blue-800 dark:text-buildease-blue-300 dark:hover:bg-buildease-blue-900/20"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
                <Button
                  onClick={onManageTeam}
                  size="default"
                  className="bg-gradient-to-r from-buildease-blue-600 to-buildease-blue-700 hover:from-buildease-blue-700 hover:to-buildease-blue-800 text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] rounded-xl font-semibold"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Manage Roles
                </Button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50/50 to-buildease-blue-50/30 dark:from-slate-800/50 dark:to-buildease-blue-950/30 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm">
              <TeamMembersSection 
                members={teamMembers} 
                onManageTeam={undefined} // Remove duplicate button
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}