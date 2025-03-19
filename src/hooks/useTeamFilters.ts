import { useState, useMemo } from 'react';
import type { TeamMember } from '@/types/team';

export interface TeamFilters {
  departments: string[];
  availability: string[];
  onlyTopPerformers: boolean;
}

type SortOption = 'name' | 'role' | 'department' | 'workload' | 'performance';

/**
 * Custom hook to handle team filtering and sorting logic
 * 
 * This hook encapsulates the filtering and sorting logic for team members,
 * making it reusable and reducing complexity in the main Team component.
 */
export function useTeamFilters(teamMembers: TeamMember[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TeamFilters>({
    departments: [],
    availability: [],
    onlyTopPerformers: false
  });
  const [sortBy, setSortBy] = useState<SortOption>('name');

  // Filter and sort team members
  const filteredTeamMembers = useMemo(() => {
    if (!teamMembers) return [];
    
    return teamMembers
      .filter(member => {
        // Filter by search query
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.department.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filter by department
        const matchesDepartment = filters.departments.length === 0 || 
          filters.departments.includes(member.department);
        
        // Filter by availability
        const matchesAvailability = filters.availability.length === 0 || 
          filters.availability.includes(member.status);
        
        // Filter by performance
        const matchesPerformance = !filters.onlyTopPerformers || 
          (member.performance && member.performance >= 80);
        
        return matchesSearch && matchesDepartment && matchesAvailability && matchesPerformance;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'role':
            return a.role.localeCompare(b.role);
          case 'department':
            return a.department.localeCompare(b.department);
          case 'workload':
            return b.workload - a.workload;
          case 'performance':
            return (b.performance || 0) - (a.performance || 0);
          default:
            return 0;
        }
      });
  }, [teamMembers, searchQuery, filters, sortBy]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    filteredTeamMembers
  };
}
