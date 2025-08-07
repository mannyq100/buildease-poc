/**
 * CommentsList Component
 * Displays paginated list of comments with real-time updates
 * Supports threaded comments and activity tracking
 */

import { useState, useMemo } from 'react';
import { useComments } from '@/hooks/queries/useComments';
import { CommentItem } from './CommentItem';
import { AddCommentForm } from './AddCommentForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, MessageCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Comment } from '@/types/database';

interface CommentsListProps {
  entityType: 'project' | 'task' | 'phase';
  entityId: string;
  maxHeight?: string;
  showAddForm?: boolean;
  title?: string;
  showTitle?: boolean;
  limit?: number;
  orderBy?: 'newest' | 'oldest';
  realtime?: boolean;
}

export function CommentsList({
  entityType,
  entityId,
  maxHeight = 'max-h-96',
  showAddForm = true,
  title,
  showTitle = true,
  limit = 50,
  orderBy = 'newest',
  realtime = true
}: CommentsListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  const {
    data: comments = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching
  } = useComments({
    entityType,
    entityId,
    includeReplies: true,
    limit,
    orderBy,
    realtime
  });

  const handleReply = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  const handleCommentAdded = () => {
    setReplyingTo(null);
    // Comments will update automatically via real-time subscription
  };

  const getDisplayTitle = () => {
    if (title) return title;
    const entityTypeLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1);
    return `${entityTypeLabel} Comments`;
  };

  // Group comments by parent/child relationship - Memoized for performance
  const groupedComments = useMemo(() => {
    return comments.reduce((acc, comment) => {
      if (!comment.parent_comment_id) {
        // Top-level comment
        if (!acc[comment.id]) {
          acc[comment.id] = { parent: comment, replies: [] };
        } else {
          acc[comment.id].parent = comment;
        }
      } else {
        // Reply comment
        if (!acc[comment.parent_comment_id]) {
          acc[comment.parent_comment_id] = { parent: null, replies: [] };
        }
        acc[comment.parent_comment_id].replies.push(comment);
      }
      return acc;
    }, {} as Record<string, { parent: Comment | null; replies: Comment[] }>);
  }, [comments]);

  // Get top-level comments sorted by creation date - Memoized for performance
  const topLevelComments = useMemo(() => {
    return Object.values(groupedComments)
      .filter(group => group.parent !== null)
      .map(group => group.parent!)
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return orderBy === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [groupedComments, orderBy]);

  if (isLoading) {
    return (
      <Card className="w-full">
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {getDisplayTitle()}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {/* Loading skeletons */}
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full">
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {getDisplayTitle()}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Failed to load comments: {error?.message || 'Unknown error'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {getDisplayTitle()}
            {comments.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({comments.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {/* Add comment form */}
        {showAddForm && (
          <AddCommentForm
            entityType={entityType}
            entityId={entityId}
            onCommentAdded={handleCommentAdded}
            placeholder={`Add a comment to this ${entityType}...`}
          />
        )}

        {/* Comments list */}
        <div className={`space-y-4 ${maxHeight} overflow-y-auto`}>
          {topLevelComments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                No comments yet. Be the first to add one!
              </p>
            </div>
          ) : (
            topLevelComments.map((comment) => {
              const replies = groupedComments[comment.id]?.replies || [];
              
              return (
                <div key={comment.id} className="space-y-3">
                  {/* Main comment */}
                  <CommentItem
                    comment={comment}
                    onReply={() => handleReply(comment.id)}
                    showActions={true}
                    isReplyMode={replyingTo === comment.id}
                  />

                  {/* Reply form */}
                  {replyingTo === comment.id && (
                    <div className="ml-10 border-l-2 border-muted pl-4">
                      <AddCommentForm
                        entityType={entityType}
                        entityId={entityId}
                        parentCommentId={comment.id}
                        onCommentAdded={handleCommentAdded}
                        placeholder="Write a reply..."
                        compact={true}
                      />
                    </div>
                  )}

                  {/* Replies */}
                  {replies.length > 0 && (
                    <div className="ml-10 border-l-2 border-muted pl-4 space-y-3">
                      {replies
                        .sort((a, b) => 
                          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                        )
                        .map((reply) => (
                          <CommentItem
                            key={reply.id}
                            comment={reply}
                            showActions={true}
                            isReply={true}
                          />
                        ))
                      }
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Load more indicator */}
        {comments.length >= limit && (
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {comments.length} comments. 
              <Button variant="link" className="p-0 ml-1 h-auto">
                Load more
              </Button>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}