/**
 * Shared components index
 * Following TypeScript principles:
 * - Named exports for all components
 * - Proper type exports
 * - Clear organization
 */

// Card Components
export { StatCard } from './StatCard';
export type { StatCardProps } from './StatCard';

export { MetricCard } from './MetricCard';
export type { MetricCardProps } from './MetricCard';

export { MaterialCard } from './MaterialCard';
export type { MaterialCardProps } from './MaterialCard';

export { TaskCard } from './TaskCard';
export type { TaskCardProps, PhaseTask, Assignee } from './TaskCard';

export { PhaseCard } from './PhaseCard';
export type { PhaseCardProps } from './PhaseCard';

export { ProjectCard } from './ProjectCard';
export type { ProjectCardProps, TeamMember } from './ProjectCard';

export { TeamCard } from './TeamCard';
export type { TeamCardProps, TeamMemberDetails } from './TeamCard';

export { ExpenseCard } from './ExpenseCard';
export type { ExpenseCardProps, ExpenseDetails } from './ExpenseCard';

export { PermitCard } from './PermitCard';
export type { PermitCardProps, PermitDetails } from './PermitCard';

export { EquipmentCard } from './EquipmentCard';
export type { EquipmentCardProps, EquipmentDetails, MaintenanceRecord } from './EquipmentCard';

export { InspectionCard } from './InspectionCard';
export type { InspectionCardProps, InspectionDetails, InspectionFinding } from './InspectionCard';

export { SafetyCard } from './SafetyCard';
export type { SafetyCardProps, SafetyIncident } from './SafetyCard';

export { WeatherCard } from './WeatherCard';
export type { WeatherCardProps, WeatherAlert, WeatherForecast } from './WeatherCard';

export { NotificationCard } from './NotificationCard';
export type { NotificationCardProps, NotificationDetails, NotificationAction } from './NotificationCard';

export { CommentCard } from './CommentCard';
export type { CommentCardProps, CommentDetails, CommentAttachment, CommentReply } from './CommentCard';

export { CalendarCard } from './CalendarCard';
export type { CalendarCardProps, CalendarEvent, CalendarEventAttendee } from './CalendarCard';

export { IssueCard } from './IssueCard';
export type { IssueCardProps, IssueDetails, IssueRelation } from './IssueCard';

export { ReportCard } from './ReportCard';
export type { ReportCardProps, ReportDetails, ReportSection } from './ReportCard';

// Document Components
export { DocumentItem } from './DocumentItem';
export type { DocumentItemProps } from '@/types/documents';

// Content Components
export { ContentSection } from './ContentSection';

// Legacy exports that need to be maintained for backward compatibility
export { ActivityItem } from './ActivityItem';
export { InsightItem } from './InsightItem';
export { StatusBadge } from './StatusBadge';
export { TaskItem } from './TaskItem';
export { MaterialItem } from './MaterialItem';
export { PageHeader } from './PageHeader';