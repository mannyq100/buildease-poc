/**
 * CommentItem Component
 * Displays individual comment with user info, timestamps, and actions
 * Supports edit/delete actions and user avatar display
 */

import { useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useUpdateComment, useDeleteComment, getCommentUserDisplayName, getCommentUserAvatar } from '@/hooks/mutations/useCommentMutations';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  MoreHorizontal, 
  Reply, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Clock,
  MessageCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Comment } from '@/types/database';
import { toast } from 'sonner';

interface CommentItemProps {
  comment: Comment;
  onReply?: (parentId: string) => void;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  showActions?: boolean;
  isReply?: boolean;
  isReplyMode?: boolean;
}

export function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  showActions = true,
  isReply = false,
  isReplyMode = false
}: CommentItemProps) {
  const { user } = useSupabaseAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  const isOwner = user?.id === comment.user_id;
  const userDisplayName = getCommentUserDisplayName(comment);
  const userAvatar = getCommentUserAvatar(comment);
  const userInitials = userDisplayName.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() === comment.content.trim()) {
      setIsEditing(false);
      return;
    }

    if (editContent.trim().length === 0) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      await updateCommentMutation.mutateAsync({
        commentId: comment.id,
        content: editContent.trim()
      });
      setIsEditing(false);
      onEdit?.(comment.id);
    } catch (error) {
      console.error('Failed to update comment:', error);
      // Error handled by mutation
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleDelete = async () => {
    try {
      await deleteCommentMutation.mutateAsync({
        commentId: comment.id,
        entityType: comment.entity_type,
        entityId: comment.entity_id
      });
      setShowDeleteDialog(false);
      onDelete?.(comment.id);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      // Error handled by mutation
    }
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const wasEdited = comment.created_at !== comment.updated_at;

  return (
    <div className={`group flex items-start space-x-3 ${isReply ? 'pl-2' : ''}`}>
      {/* User Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        {userAvatar && <AvatarImage src={userAvatar} alt={userDisplayName} />}
        <AvatarFallback className="text-xs">
          {userInitials}
        </AvatarFallback>
      </Avatar>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        {/* User info and timestamp */}
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-medium text-foreground">
            {userDisplayName}
          </span>
          
          {isReply && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              <MessageCircle className="h-2.5 w-2.5 mr-1" />
              Reply
            </Badge>
          )}
          
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatRelativeTime(comment.created_at)}</span>
            {wasEdited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>
        </div>

        {/* Comment content */}
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[80px] resize-none"
              placeholder="Edit your comment..."
              disabled={updateCommentMutation.isPending}
            />
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={updateCommentMutation.isPending || editContent.trim().length === 0}
              >
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={updateCommentMutation.isPending}
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-foreground whitespace-pre-wrap break-words">
            {/* Content is safely escaped by React's default text rendering */}
            {comment.content}
          </div>
        )}

        {/* Action buttons */}
        {showActions && !isEditing && (
          <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Reply button */}
            {!isReply && onReply && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onReply(comment.id)}
                className={`h-10 px-3 text-sm touch-manipulation ${isReplyMode ? 'bg-accent' : ''}`}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}

            {/* Owner actions */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-10 w-10 p-0 touch-manipulation">
                    <MoreHorizontal className="h-3 w-3" />
                    <span className="sr-only">Comment options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem 
                    onClick={handleEdit}
                    disabled={updateCommentMutation.isPending}
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={deleteCommentMutation.isPending}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
              {!isReply && " Any replies to this comment will also be deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCommentMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCommentMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}