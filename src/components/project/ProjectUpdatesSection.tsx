import React from 'react';
import { Plus, MessageSquare } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { ProjectUpdateCard } from './ProjectUpdateCard';
import { ProjectUpdate } from '@/types/update';

interface ProjectUpdatesSectionProps {
  updates: ProjectUpdate[];
  onAddUpdate: () => void;
  className?: string;
}

/**
 * Section component for displaying project updates
 */
export function ProjectUpdatesSection({ updates, onAddUpdate, className }: ProjectUpdatesSectionProps) {
  return (
    <Card className={cn(
      "bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden", 
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-6">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#2B6CB0]" />
          Project Updates
        </CardTitle>
        <Button
          size="sm"
          className="text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-white hover:bg-blue-50 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 shadow-sm"
          onClick={onAddUpdate}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Update
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        {updates.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No updates have been posted for this project yet.</p>
            <Button 
              onClick={onAddUpdate}
              className="bg-[#2B6CB0] hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" /> Post First Update
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <ProjectUpdateCard key={update.id} update={update} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
