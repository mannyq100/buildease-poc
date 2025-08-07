/**
 * Comment List View Component
 * Displays the list of comments with loading and empty states
 */

import { MessageCircle, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CommentsList } from '@/components/shared/Comments/CommentsList';
import type { Comment } from '@/types/database';

interface CommentListViewProps {
  comments: Comment[];
  entityType: 'project' | 'phase' | 'task';
  entityId: string;
  isLoading: boolean;
  maxHeight: string;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  newCommentIds: Set<string>;
}

export function CommentListView({
  comments,
  entityType,
  entityId,
  isLoading,
  maxHeight,
  scrollAreaRef,
  newCommentIds
}: CommentListViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading comments...</span>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No comments yet</p>
        <p className="text-xs">Be the first to start the conversation</p>
      </div>
    );
  }

  return (
    <ScrollArea 
      ref={scrollAreaRef}
      className="pr-4" 
      style={{ height: maxHeight }}
    >
      <div className="space-y-4">
        {comments.map(comment => (
          <div
            key={comment.id}
            className={`transition-all duration-500 ${
              newCommentIds.has(comment.id) 
                ? 'bg-primary/5 border-l-4 border-primary pl-3 -ml-3' 
                : ''
            }`}
          >
            <CommentsList 
              comments={[comment]}
              entityType={entityType}
              entityId={entityId}
              className=""
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}