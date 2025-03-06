import { useState } from 'react';
import { Task, TeamMember, TaskComment, TaskAttachment } from '@/types/schedule';
import { formatDate, formatDateTime, getStatusColor, getPriorityColor, getTaskDependencies } from '@/utils/scheduleUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  MessageSquare, 
  Paperclip, 
  FileText, 
  Link2, 
  X,
  CheckCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskDetailProps {
  task: Task;
  allTasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
  onStatusChange?: (taskId: number, newStatus: string) => void;
}

export const TaskDetail = ({ 
  task, 
  allTasks,
  isOpen, 
  onClose, 
  onEdit,
  onDelete,
  onStatusChange
}: TaskDetailProps) => {
  const [activeTab, setActiveTab] = useState('details');
  const dependencies = getTaskDependencies(task.id, allTasks);
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
    onClose();
  };
  
  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(task.id, newStatus);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Badge className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
            </div>
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
            <DialogDescription className="mt-2">
              <div className="flex items-center text-sm">
                <span>{task.project}</span>
                <span className="mx-2">•</span>
                <span>{task.phase}</span>
              </div>
            </DialogDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            {onStatusChange && task.status !== 'Completed' && (
              <Button 
                variant="outline" 
                size="sm"
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => handleStatusChange('Completed')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark Complete
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Task
                  </DropdownMenuItem>
                )}
                
                {onDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Task
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this task? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                
                {onStatusChange && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange('Not Started')}
                      disabled={task.status === 'Not Started'}
                    >
                      Mark as Not Started
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange('In Progress')}
                      disabled={task.status === 'In Progress'}
                    >
                      Mark as In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange('Delayed')}
                      disabled={task.status === 'Delayed'}
                    >
                      Mark as Delayed
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange('Blocked')}
                      disabled={task.status === 'Blocked'}
                    >
                      Mark as Blocked
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">
              Comments
              {task.comments && task.comments.length > 0 && ` (${task.comments.length})`}
            </TabsTrigger>
            <TabsTrigger value="attachments">
              Attachments
              {task.attachments && task.attachments.length > 0 && ` (${task.attachments.length})`}
            </TabsTrigger>
            <TabsTrigger value="dependencies">
              Dependencies
              {dependencies.length > 0 && ` (${dependencies.length})`}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6 pt-4 pb-2">
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Start Date</h3>
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(task.startDate)}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Due Date</h3>
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(task.dueDate)}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Progress</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Completion</span>
                  <span>{task.completion}%</span>
                </div>
                <Progress value={task.completion} className="h-2" />
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Assigned Team Members</h3>
              <div className="space-y-2">
                {task.assignedTo.map(member => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="comments" className="space-y-4 pt-4 pb-2">
            {task.comments && task.comments.length > 0 ? (
              <div className="space-y-4">
                {task.comments.map(comment => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No comments yet</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="attachments" className="space-y-4 pt-4 pb-2">
            {task.attachments && task.attachments.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {task.attachments.map(attachment => (
                  <AttachmentItem key={attachment.id} attachment={attachment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Paperclip className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No attachments</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="dependencies" className="space-y-4 pt-4 pb-2">
            {dependencies.length > 0 ? (
              <div className="space-y-3">
                {dependencies.map(dependency => (
                  <div key={dependency.id} className="p-3 border rounded-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{dependency.title}</h4>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span>Due: {formatDate(dependency.dueDate)}</span>
                          <span className="mx-2">•</span>
                          <Badge className={getStatusColor(dependency.status)}>
                            {dependency.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Link2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No dependencies</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

interface CommentItemProps {
  comment: TaskComment;
}

const CommentItem = ({ comment }: CommentItemProps) => {
  return (
    <div className="flex space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
        <AvatarFallback>
          {comment.author.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="font-medium">{comment.author.name}</div>
          <span className="text-sm text-gray-500">{formatDateTime(comment.date)}</span>
        </div>
        <p className="text-gray-700 mt-1">{comment.text}</p>
      </div>
    </div>
  );
};

interface AttachmentItemProps {
  attachment: TaskAttachment;
}

const AttachmentItem = ({ attachment }: AttachmentItemProps) => {
  return (
    <div className="flex items-start p-3 border rounded-md">
      <div className="p-2 bg-gray-100 rounded mr-3">
        <FileText className="h-6 w-6 text-gray-500" />
      </div>
      <div className="flex-1">
        <div className="font-medium">{attachment.name}</div>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <span>{attachment.size}</span>
          <span className="mx-2">•</span>
          <span>Added {formatDateTime(attachment.uploadDate)}</span>
        </div>
      </div>
      <Button variant="ghost" size="sm">
        Download
      </Button>
    </div>
  );
}; 