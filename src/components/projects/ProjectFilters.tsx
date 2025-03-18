import React from 'react';
import { Search, Filter } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ProjectStatus } from '@/types/project';
import { fadeInUpVariants } from '@/lib/animations';

interface ProjectFiltersProps {
  currentTab: 'all' | ProjectStatus;
  setCurrentTab: (tab: 'all' | ProjectStatus) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  resetFilters: () => void;
  className?: string;
}

/**
 * ProjectFilters - Display filtering options for projects
 */
export function ProjectFilters({
  currentTab,
  setCurrentTab,
  searchTerm,
  setSearchTerm,
  resetFilters,
  className
}: ProjectFiltersProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        className={className}
        variants={fadeInUpVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="bg-white/80 dark:bg-slate-800/80 shadow-xl backdrop-blur-sm border-0 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'all' | ProjectStatus)} className="w-full lg:w-auto">
                <TabsList className="grid grid-cols-5 w-full lg:w-auto bg-gray-100/70 dark:bg-slate-700/50 p-1">
                  <TabsTrigger value="all" className="text-sm">All Projects</TabsTrigger>
                  <TabsTrigger value="active" className="text-sm">Active</TabsTrigger>
                  <TabsTrigger value="planning" className="text-sm">Planning</TabsTrigger>
                  <TabsTrigger value="completed" className="text-sm">Completed</TabsTrigger>
                  <TabsTrigger value="upcoming" className="text-sm">Upcoming</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex w-full lg:w-auto items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search projects..." 
                    className="pl-9 w-full bg-white/80 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600 rounded-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-white/80 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Filter by Client</DropdownMenuItem>
                    <DropdownMenuItem>Filter by Location</DropdownMenuItem>
                    <DropdownMenuItem>Filter by Type</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={resetFilters}>Clear Filters</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  );
} 