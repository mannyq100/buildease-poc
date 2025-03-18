import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Calendar, MessageSquare, Paperclip, UserRound, Clock } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AssigneeProps {
  id: number;
  name: string;
  avatar: string | null;
}

interface TaskCardProps {
  title: string;
  description: string;
  dueDate: string;
  status: 'completed' | 'in-progress' | 'pending' | 'delayed';
  priority?: 'high' | 'medium' | 'low';
  assignees?: AssigneeProps[];
  comments?: number;
  attachments?: number;
}

/**
 * TaskCard component for displaying individual task details in a card format
 */
export function TaskCard({ 
  title, 
  description, 
  dueDate, 
  status,
  priority = 'medium',
  assignees = [],
  comments = 0,
  attachments = 0
}: TaskCardProps) {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return isDarkMode ? 'text-red-400' : 'text-red-600';
      case 'medium':
        return isDarkMode ? 'text-amber-400' : 'text-amber-600';
      case 'low':
        return isDarkMode ? 'text-green-400' : 'text-green-600';
      default:
        return isDarkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
        <Card className={cn(
          "relative overflow-hidden border transition-all duration-300 shadow-sm hover:shadow-md",
          status === 'completed' ? (isDarkMode ? "border-l-4 border-l-green-500" : "border-l-4 border-l-green-500") :
          status === 'in-progress' ? (isDarkMode ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-blue-500") :
          status === 'delayed' ? (isDarkMode ? "border-l-4 border-l-red-500" : "border-l-4 border-l-red-500") :
          (isDarkMode ? "border-l-4 border-l-gray-500" : "border-l-4 border-l-gray-500")
        )}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className={cn("font-medium", isDarkMode ? "text-white" : "text-gray-900")}>{title}</h3>
              <Badge className={cn(
                status === 'completed' ? (isDarkMode ? "bg-green-600" : "bg-green-100 text-green-800") :
                status === 'in-progress' ? (isDarkMode ? "bg-blue-600" : "bg-blue-100 text-blue-800") :
                status === 'delayed' ? (isDarkMode ? "bg-red-600" : "bg-red-100 text-red-800") :
                (isDarkMode ? "bg-gray-600" : "bg-gray-100 text-gray-800")
              )}>
                {status}
              </Badge>
            </div>
            <p className={cn("text-sm mb-3", isDarkMode ? "text-gray-300" : "text-gray-600")}>{description}</p>
            
            {/* Due date and priority */}
            <div className="flex justify-between items-center text-xs mb-3">
              <div className={cn("flex items-center", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                <Calendar className="w-3 h-3 inline mr-1" />
                Due {dueDate}
              </div>
              <div className={cn("flex items-center", getPriorityColor(priority))}>
                <Clock className="w-3 h-3 inline mr-1" />
                {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
              </div>
            </div>
            
            {/* Progress section */}
            <div className="flex justify-between items-center mb-4">
              {/* Assignees */}
              <div className="flex items-center -space-x-2">
                {assignees.slice(0, 3).map((assignee, index) => (
                  <Avatar key={index} className="w-6 h-6 border-2 border-white dark:border-slate-800">
                    {assignee.avatar ? (
                      <img src={assignee.avatar} alt={assignee.name} />
                    ) : (
                      <AvatarFallback className="text-xs bg-blue-500 text-white">
                        {assignee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                ))}
                {assignees.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-xs border-2 border-white dark:border-slate-800">
                    +{assignees.length - 3}
                  </div>
                )}
              </div>
              
              {/* Comments and attachments */}
              <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                {comments > 0 && (
                  <div className="flex items-center">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {comments}
                  </div>
                )}
                {attachments > 0 && (
                  <div className="flex items-center">
                    <Paperclip className="w-3 h-3 mr-1" />
                    {attachments}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  );
} 