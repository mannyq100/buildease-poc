import React from 'react';
import { Briefcase, Plus, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import type { Project, ProjectStatus, ViewMode } from '@/types/project';
import { ProjectCard } from '@/components/shared/ProjectCard';
import { fadeInUpVariants } from '@/lib/animations';

interface ProjectsListProps {
  projects: Project[];
  view: ViewMode;
  onViewDetails: (id: number | string) => void;
  emptyStateAction?: () => void;
  className?: string;
}

/**
 * ProjectsList - Displays a list of projects in either grid or list view
 */
export function ProjectsList({
  projects,
  view,
  onViewDetails,
  emptyStateAction,
  className
}: ProjectsListProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        className={className}
        variants={fadeInUpVariants}
        initial="hidden"
        animate="visible"
      >
        {projects.length === 0 ? (
          <EmptyProjectsState onAction={emptyStateAction} />
        ) : (
          view === 'grid' ? (
            <ProjectsGridView projects={projects} onViewDetails={onViewDetails} />
          ) : (
            <ProjectsListView projects={projects} onViewDetails={onViewDetails} />
          )
        )}
      </m.div>
    </LazyMotion>
  );
}

/**
 * EmptyProjectsState - Shown when no projects match the current filters
 */
function EmptyProjectsState({ onAction }: { onAction?: () => void }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 text-center">
      <div className="flex flex-col items-center justify-center py-12">
        <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects found</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
          We couldn't find any projects matching your search criteria. Try adjusting your filters or create a new project.
        </p>
        {onAction && (
          <Button onClick={onAction}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Project
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * ProjectsGridView - Displays projects in a grid layout
 */
function ProjectsGridView({ 
  projects, 
  onViewDetails 
}: { 
  projects: Project[]
  onViewDetails: (id: number | string) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          title={project.name}
          description={project.description}
          client={project.client}
          startDate={project.startDate}
          endDate={project.endDate}
          status={mapProjectStatus(project.status)}
          progress={project.progress}
          budget={{
            total: project.budget,
            spent: project.spent,
            currency: '$'
          }}
          team={project.teamMembers?.map((member, index) => ({
            id: index,
            name: member
          })) || []}
          documents={project.phases ? project.phases.length : 0}
          phases={project.phases ? project.phases.length : 0}
          onClick={() => onViewDetails(project.id)}
        />
      ))}
    </div>
  );
}

/**
 * Maps the project status to the format expected by the shared ProjectCard component
 */
function mapProjectStatus(status: ProjectStatus): 'active' | 'completed' | 'pending' | 'delayed' {
  switch (status) {
    case 'active':
      return 'active';
    case 'completed':
      return 'completed';
    case 'planning':
    case 'upcoming':
      return 'pending';
    case 'on-hold':
      return 'delayed';
    default:
      return 'pending';
  }
}

/**
 * ProjectsListView - Displays projects in a table/list format
 */
function ProjectsListView({ 
  projects, 
  onViewDetails 
}: { 
  projects: Project[]
  onViewDetails: (id: number | string) => void
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Project
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Budget
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Timeline
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Progress
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
            {projects.map((project) => (
              <tr 
                key={project.id} 
                className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer"
                onClick={() => onViewDetails(project.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 mr-3">
                      <img 
                        className="h-10 w-10 rounded-md object-cover" 
                        src={project.imageUrl} 
                        alt={project.name} 
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {project.client}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(project.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(project.budget)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(project.spent)} spent
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="mr-2 text-sm font-medium text-gray-900 dark:text-white">
                      {project.progress}%
                    </div>
                    <div className="w-24">
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(project.id);
                      }}
                    >
                      Details
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Returns the appropriate badge for a project status
 */
function getStatusBadge(status: ProjectStatus) {
  switch(status) {
    case 'active':
      return <Badge className="bg-[#1E3A8A] text-white">Active</Badge>;
    case 'planning':
      return <Badge className="bg-[#D97706] text-white">Planning</Badge>;
    case 'completed':
      return <Badge className="bg-green-600 text-white">Completed</Badge>;
    case 'upcoming':
      return <Badge className="bg-purple-600 text-white">Upcoming</Badge>;
    case 'on-hold':
      return <Badge className="bg-red-600 text-white">On Hold</Badge>;
    default:
      return <Badge className="bg-gray-500 text-white">{status}</Badge>;
  }
}

/**
 * Format currency values
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format date values
 */
function formatDate(dateString: string): string {
  const options = { year: 'numeric', month: 'short', day: 'numeric' } as Intl.DateTimeFormatOptions;
  return new Date(dateString).toLocaleDateString('en-US', options);
} 