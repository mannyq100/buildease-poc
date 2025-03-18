import React from 'react';
import { MoreVertical } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Project, ProjectStatus } from '@/types/project';
import { cardHoverVariants } from '@/lib/animations';

interface ProjectCardProps {
  project: Project;
  onViewDetails: (id: number | string) => void;
  className?: string;
}

/**
 * ProjectCard - Displays a card with project details
 */
export function ProjectCard({
  project,
  onViewDetails,
  className
}: ProjectCardProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        whileHover={cardHoverVariants}
        className={className}
      >
        <Card className="overflow-hidden h-full flex flex-col">
          <div 
            className="h-40 bg-cover bg-center" 
            style={{ backgroundImage: `url(${project.imageUrl})` }}
          >
            <div className="h-full w-full bg-gradient-to-b from-transparent to-black/60 p-4 flex flex-col justify-end">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="bg-white/20 backdrop-blur-sm text-white border-white/10">
                  {project.type}
                </Badge>
                {getStatusBadge(project.status)}
              </div>
            </div>
          </div>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.client}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2 flex-grow">
            <div className="grid grid-cols-2 gap-y-2 text-sm mb-2">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Budget:</span>
                <div className="font-medium">{formatCurrency(project.budget)}</div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Timeline:</span>
                <div className="font-medium">{formatDate(project.startDate)} - {formatDate(project.endDate)}</div>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500 dark:text-gray-400">Progress</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
          </CardContent>
          <CardFooter className="pt-2 flex justify-between border-t mt-auto">
            <Button variant="ghost" size="sm" onClick={() => onViewDetails(project.id)}>
              View Details
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Archive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardFooter>
        </Card>
      </m.div>
    </LazyMotion>
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