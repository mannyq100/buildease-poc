import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, AlertCircle, Calendar, Info, MoreVertical } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { ProjectUpdate } from '@/types/update';

interface ProjectUpdateCardProps {
  update: ProjectUpdate;
  className?: string;
}

/**
 * Card component for displaying project updates
 */
export function ProjectUpdateCard({ update, className }: ProjectUpdateCardProps) {
  // Map update types to appropriate styling and icons
  const typeConfig = {
    progress: {
      icon: <CheckCircle className="h-5 w-5" />,
      badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      label: 'Progress Update'
    },
    issue: {
      icon: <AlertCircle className="h-5 w-5" />,
      badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      label: 'Issue'
    },
    milestone: {
      icon: <Calendar className="h-5 w-5" />,
      badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      label: 'Milestone'
    },
    general: {
      icon: <Info className="h-5 w-5" />,
      badgeClass: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
      label: 'General Info'
    }
  };

  const config = typeConfig[update.type];
  
  // Format the date
  const formattedDate = formatDistanceToNow(new Date(update.createdAt), { addSuffix: true });

  return (
    <Card className={cn("border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-10 w-10 mt-1">
              <AvatarImage src="/avatars/user-01.jpg" alt={update.createdBy} />
              <AvatarFallback className="bg-[#2B6CB0] text-white">
                {update.createdBy.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{update.title}</h3>
                <Badge className={cn("text-xs font-medium py-0.5", config.badgeClass)}>
                  <span className="flex items-center gap-1">
                    {config.icon}
                    <span>{config.label}</span>
                  </span>
                </Badge>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Posted by {update.createdBy} • {formattedDate}
              </p>
              
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {update.content}
              </div>
              
              {update.attachments && update.attachments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Attachments:</p>
                  <div className="flex flex-wrap gap-2">
                    {update.attachments.map((attachment, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 cursor-pointer"
                      >
                        {attachment}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
