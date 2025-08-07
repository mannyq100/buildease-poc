/**
 * AddCommentForm Component
 * Form for creating new comments with textarea and submission logic
 * Supports both top-level comments and replies
 */

import { useState, useRef } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useCreateComment } from '@/hooks/mutations/useCommentMutations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Send, X } from 'lucide-react';
import type { Comment } from '@/types/database';

interface AddCommentFormProps {
  entityType: 'project' | 'task' | 'phase';
  entityId: string;
  parentCommentId?: string; // For replies
  onCommentAdded?: (comment: Comment) => void;
  placeholder?: string;
  compact?: boolean; // For reply forms
  autoFocus?: boolean;
}

const MAX_COMMENT_LENGTH = 2000;

export function AddCommentForm({
  entityType,
  entityId,
  parentCommentId,
  onCommentAdded,
  placeholder = 'Add a comment...',
  compact = false,
  autoFocus = false
}: AddCommentFormProps) {
  const { user } = useSupabaseAuth();
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const createCommentMutation = useCreateComment();

  const isReply = !!parentCommentId;
  const remainingChars = MAX_COMMENT_LENGTH - content.length;
  const isOverLimit = remainingChars < 0;
  const canSubmit = content.trim().length > 0 && !isOverLimit && !createCommentMutation.isPending;

  // Get user display info using utility function from utils/projectUtils.ts
  const userDisplayName = user?.email || 'Unknown User';
  
  const userInitials = userDisplayName.split(' ').map(n => n[0]).join('').toUpperCase();
  const userAvatar = null; // Will be populated from database user data later

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) return;

    try {
      const newComment = await createCommentMutation.mutateAsync({
        entityType,
        entityId,
        content: content.trim(),
        parentCommentId
      });

      // Reset form
      setContent('');
      setIsFocused(false);
      
      // Blur textarea to hide the form if compact
      if (compact && textareaRef.current) {
        textareaRef.current.blur();
      }

      onCommentAdded?.(newComment);
    } catch (error) {
      console.error('Failed to create comment:', error);
      // Error is handled by the mutation hook
    }
  };

  const handleCancel = () => {
    setContent('');
    setIsFocused(false);
    if (textareaRef.current) {
      textareaRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (canSubmit) {
        handleSubmit(e as any);
      }
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setContent(textarea.value);
    
    // Auto-resize
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  if (!user) {
    return (
      <Card className={compact ? 'border-dashed' : ''}>
        <CardContent className="p-4 text-center text-muted-foreground">
          Please sign in to add comments.
        </CardContent>
      </Card>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-start space-x-3">
        {/* User Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          {userAvatar && <AvatarImage src={userAvatar} alt={userDisplayName} />}
          <AvatarFallback className="text-xs">
            {userInitials}
          </AvatarFallback>
        </Avatar>

        {/* Textarea */}
        <div className="flex-1 space-y-2">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className={`min-h-[80px] resize-none transition-all ${
              isFocused ? 'ring-2 ring-primary' : ''
            } ${isOverLimit ? 'border-destructive' : ''}`}
            disabled={createCommentMutation.isPending}
            autoFocus={autoFocus}
          />
          
          {/* Character count and validation */}
          <div className="flex items-center justify-between text-xs">
            <div className="space-x-2">
              {isFocused && (
                <span className="text-muted-foreground">
                  Ctrl+Enter to submit
                </span>
              )}
            </div>
            <div className={`${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {remainingChars} characters remaining
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {(isFocused || content.length > 0) && (
        <div className="flex items-center justify-end space-x-2 pl-11">
          {/* Cancel button (for replies or when content exists) */}
          {(isReply || content.length > 0) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={createCommentMutation.isPending}
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          )}
          
          {/* Submit button */}
          <Button
            type="submit"
            size="sm"
            disabled={!canSubmit}
          >
            <Send className="h-3 w-3 mr-1" />
            {createCommentMutation.isPending 
              ? (isReply ? 'Replying...' : 'Posting...') 
              : (isReply ? 'Reply' : 'Comment')
            }
          </Button>
        </div>
      )}
    </form>
  );

  if (compact) {
    return (
      <div className="border rounded-lg p-3 bg-muted/30">
        {formContent}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        {formContent}
      </CardContent>
    </Card>
  );
}