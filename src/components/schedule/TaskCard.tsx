import { Task } from '@/types/schedule';
import { formatDate, getDaysRemaining, getStatusColor, getPriorityColor } from '@/utils/scheduleUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Paperclip, MessageSquare, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const daysRemaining = getDaysRemaining(task.dueDate);
  const statusColor = getStatusColor(task.status);
  const priorityColor = getPriorityColor(task.priority);
  
  const handleClick = () => {
    if (onClick) {
      onClick(task);
    }
  };
  
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header Section with Title and Status */}
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg line-clamp-2">{task.title}</h3>
            <Badge className={statusColor}>{task.status}</Badge>
          </div>
          
          {/* Project and Phase Info */}
          <div className="flex items-center text-sm text-gray-600">
            <span>{task.project}</span>
            <span className="mx-2">•</span>
            <span>{task.phase}</span>
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
          
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{task.completion}%</span>
            </div>
            <Progress value={task.completion} className="h-2" />
          </div>
          
          {/* Dates */}
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-gray-500">Start:</p>
              <p>{formatDate(task.startDate)}</p>
            </div>
            <div>
              <p className="text-gray-500">Due:</p>
              <p className={daysRemaining < 0 ? 'text-red-600 font-medium' : ''}>
                {formatDate(task.dueDate)}
                {daysRemaining < 0 && ' (Overdue)'}
              </p>
            </div>
          </div>
          
          {/* Bottom Section - Indicators and Assignees */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-3">
              {/* Priority Badge */}
              <Badge className={priorityColor}>{task.priority}</Badge>
              
              {/* Indicators */}
              <div className="flex items-center space-x-2 text-gray-500">
                {task.comments && task.comments.length > 0 && (
                  <div className="flex items-center text-xs">
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    <span>{task.comments.length}</span>
                  </div>
                )}
                
                {task.attachments && task.attachments.length > 0 && (
                  <div className="flex items-center text-xs">
                    <Paperclip className="h-3.5 w-3.5 mr-1" />
                    <span>{task.attachments.length}</span>
                  </div>
                )}
                
                {task.dependencies && task.dependencies.length > 0 && (
                  <div className="flex items-center text-xs">
                    <Link2 className="h-3.5 w-3.5 mr-1" />
                    <span>{task.dependencies.length}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Assignees */}
            <div className="flex -space-x-2">
              {task.assignedTo.slice(0, 3).map(member => (
                <Avatar key={member.id} className="h-6 w-6 border border-white">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {task.assignedTo.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs border border-white">
                  +{task.assignedTo.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 