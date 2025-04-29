import { useState, useRef } from 'react';
import { Task, TeamMember, TaskComment, TaskAttachment } from '@/types/schedule';
import { formatDate, formatDateTime, getStatusColor, getPriorityColor, getTaskDependencies } from '@/utils/scheduleUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
  CheckCircle,
  Clock,
  AlertTriangle,
  Ban,
  Send,
  Plus,
  CalendarDays
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/core/ui';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

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
  const [activeTab, setActiveTab] = useState('comments');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<TaskComment[]>(task.comments || []);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  
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
  
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const newCommentObj: TaskComment = {
      id: Date.now(),
      text: newComment,
      date: new Date().toISOString(),
      author: {
        id: 1, 
        name: 'Current User',
        avatar: null,
        role: 'User'
      }
    };
    
    setComments([...comments, newCommentObj]);
    setNewComment('');
    
    // Focus back on the comment input
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };
  
  // Status options with icons
  const statusOptions = [
    { value: 'Not Started', label: 'Not Started', icon: <Clock className="h-4 w-4 mr-2" />, color: 'bg-gray-100 text-gray-800' },
    { value: 'In Progress', label: 'In Progress', icon: <Clock className="h-4 w-4 mr-2 text-blue-600" />, color: 'bg-blue-100 text-blue-800' },
    { value: 'Completed', label: 'Completed', icon: <CheckCircle className="h-4 w-4 mr-2 text-green-600" />, color: 'bg-green-100 text-green-800' },
    { value: 'Delayed', label: 'Delayed', icon: <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />, color: 'bg-amber-100 text-amber-800' },
    { value: 'Blocked', label: 'Blocked', icon: <Ban className="h-4 w-4 mr-2 text-red-600" />, color: 'bg-red-100 text-red-800' }
  ];
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>Task details for {task.title}</DialogDescription>
        </DialogHeader>
        
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-t-lg">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge className="bg-white/20 text-white border-none">
                  {task.status}
                </Badge>
                <Badge className="bg-white/20 text-white border-none">
                  {task.priority}
                </Badge>
              </div>
              <h2 className="text-2xl font-semibold">{task.title}</h2>
              <p className="text-sm text-white/80">
                <span>{task.project}</span>
                <span className="mx-2">•</span>
                <span>{task.phase}</span>
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {onEdit && (
                    <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem className="text-muted-foreground" disabled>
                    Change Status
                  </DropdownMenuItem>
                  
                  {statusOptions.map(status => (
                    <DropdownMenuItem 
                      key={status.value}
                      onClick={() => handleStatusChange(status.value)}
                      disabled={task.status === status.value}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        {status.icon}
                        <span>{status.label}</span>
                      </div>
                      {task.status === status.value && (
                        <CheckCircle className="h-4 w-4 ml-auto" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            onSelect={(e) => e.preventDefault()}
                            className="text-red-600 cursor-pointer focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Task
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the task
                              and remove it from the system.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDelete}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        {/* Task Details */}
        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{task.completion}%</span>
            </div>
            <Progress 
              value={task.completion} 
              className="h-2" 
              indicatorClassName={cn(
                task.completion === 100 ? "bg-green-500" : 
                task.completion > 50 ? "bg-blue-500" : 
                "bg-amber-500"
              )}
            />
          </div>
          
          {/* Key Information */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Due Date</div>
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-blue-500" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Assigned To</div>
              <div className="flex -space-x-2">
                {task.assignedTo && task.assignedTo.length > 0 ? (
                  task.assignedTo.map((member) => (
                    <Avatar key={member.id} className="h-7 w-7 border-2 border-white ring-2 ring-blue-100">
                      {member.avatar ? (
                        <AvatarImage src={member.avatar} alt={member.name} />
                      ) : (
                        <AvatarFallback className="bg-blue-500 text-white text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  ))
                ) : (
                  <div className="flex items-center text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    <span>Unassigned</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Description */}
          {task.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <div className="text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-100">
                {task.description}
              </div>
            </div>
          )}
          
          <Separator className="my-6" />
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="comments" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments
              </TabsTrigger>
              <TabsTrigger value="attachments" className="flex items-center">
                <Paperclip className="h-4 w-4 mr-2" />
                Attachments
              </TabsTrigger>
              <TabsTrigger value="dependencies" className="flex items-center">
                <Link2 className="h-4 w-4 mr-2" />
                Dependencies
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="comments" className="space-y-4">
              {/* Comment Input */}
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                  <AvatarFallback className="bg-blue-500 text-white">
                    CU
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    ref={commentInputRef}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              {/* Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map(comment => (
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
            
            <TabsContent value="attachments" className="space-y-4">
              {/* Upload Button */}
              <div className="flex justify-end">
                <Button variant="outline" className="flex items-center border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <Plus className="h-4 w-4 mr-2 text-blue-600" />
                  Add Attachment
                </Button>
              </div>
              
              {/* Attachments List */}
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
            
            <TabsContent value="dependencies" className="space-y-4">
              {dependencies.length > 0 ? (
                <div className="space-y-3">
                  {dependencies.map(dependency => (
                    <div key={dependency.id} className="p-4 border border-gray-200 rounded-md hover:border-blue-300 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{dependency.title}</h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            <span>{formatDate(dependency.dueDate)}</span>
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
        </div>
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
      <Avatar className="h-8 w-8 ring-2 ring-blue-100">
        <AvatarImage src={comment.author.avatar || undefined} alt={comment.author.name} />
        <AvatarFallback className="bg-blue-500 text-white">
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
    <div className="flex items-start p-4 border border-gray-200 rounded-md hover:border-blue-300 hover:shadow-sm transition-all">
      <div className="p-2 bg-blue-50 rounded-md mr-3">
        <FileText className="h-6 w-6 text-blue-500" />
      </div>
      <div className="flex-1">
        <div className="font-medium">{attachment.name}</div>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <span>{attachment.size}</span>
          <span className="mx-2">•</span>
          <span>Added {formatDateTime(attachment.uploadDate)}</span>
        </div>
      </div>
      <Button variant="outline" size="sm" className="flex items-center border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
        Download
      </Button>
    </div>
  );
};