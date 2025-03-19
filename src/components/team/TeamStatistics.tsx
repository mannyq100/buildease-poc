import React from 'react';
import { Users, UserCheck, Briefcase, Activity } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import type { TeamMember } from '@/types/team';

interface TeamStatisticsProps {
  teamMembers: TeamMember[];
}

/**
 * TeamStatistics - Displays key statistics about the team
 * 
 * Following Buildese UI design principles:
 * - Card-based UI with subtle shadows
 * - Clear visual feedback
 * - Consistent spacing
 * - Modern, aesthetic look with warm blue accents
 */
export function TeamStatistics({ teamMembers }: TeamStatisticsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Members"
        value={teamMembers.length}
        icon={<Users className="h-6 w-6" />}
        colorScheme="blue"
        subtitle="team members"
      />
      
      <StatCard
        title="Active Members"
        value={teamMembers.filter(m => m.status === 'active').length}
        icon={<UserCheck className="h-6 w-6" />}
        colorScheme="green"
        subtitle="currently active"
      />
      
      <StatCard
        title="Projects Assigned"
        value={Array.from(new Set(teamMembers.flatMap(m => m.projects || []))).length}
        icon={<Briefcase className="h-6 w-6" />}
        colorScheme="amber"
        subtitle="active projects"
      />
      
      <StatCard
        title="Average Workload"
        value={`${Math.round(teamMembers.reduce((acc, member) => acc + member.workload, 0) / (teamMembers.length || 1))}%`}
        icon={<Activity className="h-6 w-6" />}
        colorScheme="purple"
        subtitle="team capacity"
      />
    </div>
  );
}
