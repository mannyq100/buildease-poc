import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  ThumbsUp,
  Reply,
  MoreHorizontal,
  Edit2,
  Trash2,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CommentAttachment {
  id: string | number;
  type: 'image' | 'document' | 'link';
  name: string;
  url: string;
  thumbnail?: string;
}

export interface CommentReply {
  id: string | number;
  author: {
    id: string | number;
    name: string;
    avatar?: string;
    role?: string;
  };
  content: string;
  timestamp: string;
  likes?: number;
  userLiked?: boolean;
}

export interface CommentDetails {
  id: string | number;
  author: {
    id: string | number;
    name: string;
    avatar?: string;
    role?: string;
  };
  content: string;
  timestamp: string;
  likes?: number;
  userLiked?: boolean;
  attachments?: CommentAttachment[];
  replies?: CommentReply[];
  edited?: boolean;
  contextType?: 'task' | 'document' | 'material' | 'issue' | 'general';
  contextId?: string | number;
  contextName?: string;
}

export interface CommentCardProps {
  /** Comment details */
  comment: CommentDetails;
  /** Additional styling and behavior */
  className?: string;
  /** Show reply form */
  showReplyForm?: boolean;
  /** Handlers */
  onLike?: (id: string | number) => void;
  onReply?: (id: string | number, content: string) => void;
  onEdit?: (id: string | number, content: string) => void;
  onDelete?: (id: string | number) => void;
  onAttachmentClick?: (attachment: CommentAttachment) => void;
  /** Animation */
  animate?: boolean;
}

/**
 * CommentCard component for displaying comments and replies.
 * Follows Buildese UI design principles:
 * - Card-based UI with subtle shadows for depth
 * - Clear visual feedback for interactions
 * - Consistent spacing system
 * - Modern, aesthetic look with warm blue (#2B6CB0) accents
 * - Progressive disclosure for complex information
 */
export function CommentCard({
  comment,
  className,
  showReplyForm = false,
  onLike,
  onReply,
  onEdit,
  onDelete,
  onAttachmentClick,
  animate = true
}: CommentCardProps) {
  const [isReplying, setIsReplying] = React.useState(showReplyForm);
  const [replyContent, setReplyContent] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(comment.content);
  const [showActions, setShowActions] = React.useState(false);

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    // This is a placeholder - in a real app, you would use a proper date library
    // like date-fns or dayjs to calculate the relative time
    return timestamp;
  };

  const handleLike = () => {
    if (onLike) {
      onLike(comment.id);
    }
  };

  const handleReplySubmit = () => {
    if (onReply && replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleEditSubmit = () => {
    if (onEdit && editContent.trim()) {
      onEdit(comment.id, editContent);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(comment.id);
    }
  };

  const toggleActions = () => {
    setShowActions(!showActions);
  };

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-300',
        'hover:shadow-sm',
        className
      )}
    >
      <div className="p-4 space-y-3">
        {/* Comment Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
              <AvatarFallback className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {comment.author.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold">{comment.author.name}</h3>
                {comment.author.role && (
                  <span className="text-xs text-muted-foreground">{comment.author.role}</span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{formatRelativeTime(comment.timestamp)}</span>
                {comment.edited && (
                  <span className="italic">(edited)</span>
                )}
                {comment.contextName && (
                  <span>on {comment.contextType} "{comment.contextName}"</span>
                )}
              </div>
            </div>
          </div>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={toggleActions}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-900 shadow-md rounded-md overflow-hidden z-10">
                <button 
                  className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                  onClick={() => {
                    setIsEditing(true);
                    setShowActions(false);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button 
                  className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                  onClick={() => {
                    handleDelete();
                    setShowActions(false);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              className="w-full p-2 border rounded-md text-sm"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleEditSubmit}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-line">{comment.content}</p>
        )}

        {/* Attachments */}
        {comment.attachments && comment.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {comment.attachments.map((attachment) => (
              <div 
                key={attachment.id}
                className="flex items-center p-2 bg-slate-50 dark:bg-slate-900/30 rounded-md text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50"
                onClick={() => onAttachmentClick && onAttachmentClick(attachment)}
              >
                {attachment.type === 'image' ? (
                  <div className="w-8 h-8 mr-2 bg-cover bg-center rounded" style={{ backgroundImage: `url(${attachment.thumbnail || attachment.url})` }} />
                ) : (
                  <div className="w-8 h-8 mr-2 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded">
                    <FileIcon type={attachment.type} />
                  </div>
                )}
                <span className="truncate max-w-[120px]">{attachment.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Comment Actions */}
        <div className="flex items-center space-x-4 pt-1">
          <button 
            className={cn(
              'flex items-center space-x-1 text-xs',
              comment.userLiked ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
            )}
            onClick={handleLike}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{comment.likes || 0}</span>
          </button>
          <button 
            className="flex items-center space-x-1 text-xs text-muted-foreground"
            onClick={() => setIsReplying(!isReplying)}
          >
            <Reply className="h-3.5 w-3.5" />
            <span>Reply</span>
          </button>
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="pl-8 space-y-2">
            <textarea
              className="w-full p-2 border rounded-md text-sm"
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={2}
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsReplying(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleReplySubmit}
              >
                Reply
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="pl-8 space-y-3 mt-2">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="space-y-2">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={reply.author.avatar} alt={reply.author.name} />
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {reply.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-semibold">{reply.author.name}</h4>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(reply.timestamp)}</span>
                    </div>
                    <p className="text-xs mt-1">{reply.content}</p>
                    <button 
                      className={cn(
                        'flex items-center space-x-1 text-xs mt-1',
                        reply.userLiked ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
                      )}
                      onClick={() => onLike && onLike(reply.id)}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>{reply.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// Helper component for file icons
function FileIcon({ type }: { type: string }) {
  switch (type) {
    case 'document':
      return <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    case 'link':
      return <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    default:
      return <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
  }
}
