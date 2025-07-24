/**
 * Team Components - Barrel exports
 * Centralized exports for team-related components following BuildEase patterns
 */

export { TeamMembersList } from './TeamMembersList';
export { TeamMemberCard } from './TeamMemberCard';

// Re-export team-related types for convenience
export type { 
  TeamMember, 
  TeamMembersListProps, 
  TeamMemberCardProps 
} from '@/types/projectDetails';