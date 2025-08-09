/**
 * Comment Mutation Hooks
 * Handles comment creation, updates, and deletion with activity logging
 * Includes optimistic updates and real-time notifications
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { TABLE_NAMES } from '@/types/database';
import type { Comment, CommentInsert } from '@/types/database';
import { toast } from 'sonner';
import { useRetryableMutation } from '@/hooks/useRetryableMutation';
import { 
  COLLABORATION_ERRORS,
  COLLABORATION_SUCCESS
} from '@/constants/collaborationConstants';
import { truncateCommentContent } from '@/utils/collaborationUtils';
import * as activityService from '@/services/activityService';

/**
 * Comment mutation defaults and configuration
 */
const COMMENT_MUTATION_DEFAULTS = {
  RETRY_ATTEMPTS: 3,
  RETRY_BASE_DELAY: 1000,
  PREVIEW_LENGTH: 100,
  TOAST_DURATION: 4000
} as const;

/**
 * Standard error handler for comment operations
 */
function handleCommentError(error: unknown, operation: string): void {
  console.error(`Error ${operation}:`, error);
  
  if (error instanceof Error) {
    if (error.message.includes('not authenticated') || error.message.includes('JWT')) {
      toast.error(COLLABORATION_ERRORS.NOT_AUTHENTICATED);
    } else if (error.message.includes('unauthorized') || error.message.includes('permission')) {
      toast.error(COLLABORATION_ERRORS.UNAUTHORIZED);
    } else {
      // Show specific error message based on operation
      const message = {
        'creating comment': COLLABORATION_ERRORS.CREATE_COMMENT_FAILED,
        'updating comment': COLLABORATION_ERRORS.UPDATE_COMMENT_FAILED,
        'deleting comment': COLLABORATION_ERRORS.DELETE_COMMENT_FAILED,
        'bulk deleting comments': COLLABORATION_ERRORS.BULK_DELETE_FAILED
      }[operation] || 'An unexpected error occurred. Please try again.';
      
      toast.error(message);
    }
  } else {
    toast.error('An unexpected error occurred. Please try again.');
  }
}

interface CreateCommentData {
  entityType: 'project' | 'task' | 'phase';
  entityId: string;
  content: string;
  parentCommentId?: string;
}

interface UpdateCommentData {
  commentId: string;
  content: string;
}

interface DeleteCommentData {
  commentId: string;
  entityType: 'project' | 'task' | 'phase';
  entityId: string;
}

/**
 * Hook to create a new comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  return useRetryableMutation(
    async (data: CreateCommentData): Promise<Comment> => {
      if (!user) {
        throw new Error(COLLABORATION_ERRORS.NOT_AUTHENTICATED);
      }

      // Prepare comment data
      const commentData: CommentInsert = {
        entity_type: data.entityType,
        entity_id: data.entityId,
        user_id: user.id,
        content: data.content.trim(),
        parent_comment_id: data.parentCommentId || null,
      };

      // Insert comment
      const { data: comment, error } = await supabase
        .from(TABLE_NAMES.COMMENTS)
        .insert(commentData)
        .select(`
          id,
          entity_type,
          entity_id,
          user_id,
          content,
          parent_comment_id,
          created_at,
          updated_at,
          user:be_user!user_id (
            id,
            first_name,
            last_name,
            email,
            settings
          )
        `)
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        throw new Error(`Failed to create comment: ${error.message}`);
      }

      return comment as Comment;
    },
    {
      circuitBreakerKey: 'comment-creation',
      showRetryNotifications: true,
      enableManualRetry: true,
      retryOptions: {
        maxAttempts: COMMENT_MUTATION_DEFAULTS.RETRY_ATTEMPTS,
        baseDelay: COMMENT_MUTATION_DEFAULTS.RETRY_BASE_DELAY
      },
      onSuccess: async (newComment, variables) => {
        // Invalidate comment queries for this entity
        queryClient.invalidateQueries({
          queryKey: ['comments', variables.entityType, variables.entityId]
        });

        // If it's a reply, also invalidate the thread
        if (variables.parentCommentId) {
          queryClient.invalidateQueries({
            queryKey: ['comment-thread', variables.parentCommentId]
          });
        }

        // Invalidate comment counts
        queryClient.invalidateQueries({
          queryKey: ['comment-counts']
        });

        // Fire-and-forget activity logging with comprehensive debug logging
        if (variables.entityType === 'project') {
          console.log('[ACTIVITY_DEBUG] [useCreateComment] Starting activity logging for comment creation');
          
          (async () => {
            try {
              console.log('[ACTIVITY_DEBUG] [useCreateComment] Fetching auth user');
              const { data: auth, error: authError } = await supabase.auth.getUser();
              
              if (authError) {
                console.error('[ACTIVITY_DEBUG] [useCreateComment] Auth error:', authError);
                return;
              }
              
              console.log('[ACTIVITY_DEBUG] [useCreateComment] Auth user fetched successfully', {
                userId: auth?.user?.id,
                hasUser: !!auth?.user,
                userMetadata: auth?.user?.user_metadata
              });
              
              const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
                  (auth?.user?.user_metadata?.name as string | undefined) ||
                  (auth?.user?.email as string | undefined);
                  
              const preview = newComment.content.substring(0, COMMENT_MUTATION_DEFAULTS.PREVIEW_LENGTH);
              const truncated = newComment.content.length > COMMENT_MUTATION_DEFAULTS.PREVIEW_LENGTH;
              const isReply = !!variables.parentCommentId;
              
              const activityType = isReply ? 'comment_reply' : 'comment_create';
              const activityTitle = isReply ? 'Reply added to discussion' : 'New comment on project';
              const activityDescription = `${isReply ? 'Reply' : 'Comment'}: "${preview}${truncated ? '...' : ''}"`;     
                  
              console.log('[ACTIVITY_DEBUG] [useCreateComment] Adding comment creation to activity batch', {
                project_id: variables.entityId,
                activity_type: activityType,
                title: activityTitle,
                description: activityDescription,
                user_id: auth?.user?.id,
                user_name: userName,
                entity_type: 'comment',
                entity_id: newComment.id
              });
              
              // Use batching for comments to reduce noise from rapid commenting
              await activityService.createBatchedActivity({
                project_id: variables.entityId,
                activity_type: activityType,
                title: activityTitle,
                description: activityDescription,
                user_id: auth?.user?.id,
                user_name: userName,
                entity_type: 'comment',
                entity_id: newComment.id,
                metadata: {
                  commentContent: newComment.content,
                  contentPreview: preview,
                  commentLength: newComment.content.length,
                  isReply,
                  parentCommentId: variables.parentCommentId,
                  entityType: variables.entityType
                },
                status: 'info'
              });
              
              console.log('[ACTIVITY_DEBUG] [useCreateComment] Activity added to batch successfully');
              
            } catch (e) {
              console.error('[ACTIVITY_DEBUG] [useCreateComment] Activity logging failed:', {
                error: e,
                errorMessage: e instanceof Error ? e.message : String(e),
                errorStack: e instanceof Error ? e.stack : undefined,
                commentId: newComment.id,
                projectId: variables.entityId,
                timestamp: new Date().toISOString()
              });
            }
          })();
        }

        // Show success toast
        const message = variables.parentCommentId 
          ? COLLABORATION_SUCCESS.REPLY_CREATED 
          : COLLABORATION_SUCCESS.COMMENT_CREATED;
        
        toast.success(message, {
          duration: COMMENT_MUTATION_DEFAULTS.TOAST_DURATION
        });
      },
      onError: (error) => {
        handleCommentError(error, 'creating comment');
      }
    }
  );
}

/**
 * Hook to update an existing comment
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  return useMutation({
    mutationFn: async (data: UpdateCommentData): Promise<Comment> => {
      if (!user) {
        throw new Error(COLLABORATION_ERRORS.NOT_AUTHENTICATED);
      }

      // Update comment
      const { data: comment, error } = await supabase
        .from(TABLE_NAMES.COMMENTS)
        .update({ 
          content: data.content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', data.commentId)
        .eq('user_id', user.id) // Ensure user can only edit their own comments
        .select(`
          id,
          entity_type,
          entity_id,
          user_id,
          content,
          parent_comment_id,
          created_at,
          updated_at,
          user:be_user!user_id (
            id,
            first_name,
            last_name,
            email,
            settings
          )
        `)
        .single();

      if (error) {
        console.error('Error updating comment:', error);
        throw new Error(`Failed to update comment: ${error.message}`);
      }

      return comment as Comment;
    },
    onSuccess: async (updatedComment, variables) => {
      console.log('[ACTIVITY_DEBUG] [useUpdateComment] onSuccess called', {
        commentId: updatedComment.id,
        entityType: updatedComment.entity_type,
        entityId: updatedComment.entity_id,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate relevant comment queries
      queryClient.invalidateQueries({
        queryKey: ['comments', updatedComment.entity_type, updatedComment.entity_id]
      });

      // If it's a reply, also invalidate the thread
      if (updatedComment.parent_comment_id) {
        queryClient.invalidateQueries({
          queryKey: ['comment-thread', updatedComment.parent_comment_id]
        });
      }

      // Fire-and-forget activity logging with comprehensive debug logging  
      if (updatedComment.entity_type === 'project') {
        console.log('[ACTIVITY_DEBUG] [useUpdateComment] Starting activity logging for comment update');
        
        (async () => {
          try {
            console.log('[ACTIVITY_DEBUG] [useUpdateComment] Fetching auth user');
            const { data: auth, error: authError } = await supabase.auth.getUser();
            
            if (authError) {
              console.error('[ACTIVITY_DEBUG] [useUpdateComment] Auth error:', authError);
              return;
            }
            
            console.log('[ACTIVITY_DEBUG] [useUpdateComment] Auth user fetched successfully', {
              userId: auth?.user?.id,
              hasUser: !!auth?.user,
              userMetadata: auth?.user?.user_metadata
            });
            
            const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
                (auth?.user?.user_metadata?.name as string | undefined) ||
                (auth?.user?.email as string | undefined);
                
            const preview = updatedComment.content.substring(0, COMMENT_MUTATION_DEFAULTS.PREVIEW_LENGTH);
            const truncated = updatedComment.content.length > COMMENT_MUTATION_DEFAULTS.PREVIEW_LENGTH;
            
            const activityTitle = 'Comment edited in discussion';
            const activityDescription = `Updated comment: "${preview}${truncated ? '...' : ''}"`;     
                
            console.log('[ACTIVITY_DEBUG] [useUpdateComment] Calling activityService.createActivity', {
              project_id: updatedComment.entity_id,
              activity_type: 'comment_update',
              title: activityTitle,
              description: activityDescription,
              user_id: auth?.user?.id,
              user_name: userName,
              entity_type: 'comment',
              entity_id: updatedComment.id
            });
            
            const result = await activityService.createActivity({
              project_id: updatedComment.entity_id,
              activity_type: 'comment_update',
              title: activityTitle,
              description: activityDescription,
              user_id: auth?.user?.id,
              user_name: userName,
              entity_type: 'comment',
              entity_id: updatedComment.id,
              metadata: {
                updatedContent: updatedComment.content,
                contentPreview: preview,
                commentLength: updatedComment.content.length,
                isReply: !!updatedComment.parent_comment_id,
                parentCommentId: updatedComment.parent_comment_id
              },
              status: 'info'
            });
            
            console.log('[ACTIVITY_DEBUG] [useUpdateComment] Activity created successfully', {
              success: !!result,
              activityId: result?.id,
              result
            });
            
          } catch (e) {
            console.error('[ACTIVITY_DEBUG] [useUpdateComment] Activity logging failed:', {
              error: e,
              errorMessage: e instanceof Error ? e.message : String(e),
              errorStack: e instanceof Error ? e.stack : undefined,
              commentId: updatedComment.id,
              entityId: updatedComment.entity_id,
              timestamp: new Date().toISOString()
            });
          }
        })();
      }

      toast.success(COLLABORATION_SUCCESS.COMMENT_UPDATED, {
        duration: COMMENT_MUTATION_DEFAULTS.TOAST_DURATION
      });
    },
    onError: (error) => {
      handleCommentError(error, 'updating comment');
    }
  });
}

/**
 * Hook to delete a comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  return useMutation({
    mutationFn: async (data: DeleteCommentData): Promise<void> => {
      if (!user) {
        throw new Error(COLLABORATION_ERRORS.NOT_AUTHENTICATED);
      }

      // Delete comment (this will also delete replies due to CASCADE)
      const { error } = await supabase
        .from(TABLE_NAMES.COMMENTS)
        .delete()
        .eq('id', data.commentId)
        .eq('user_id', user.id); // Ensure user can only delete their own comments

      if (error) {
        console.error('Error deleting comment:', error);
        throw new Error(`Failed to delete comment: ${error.message}`);
      }
    },
    onSuccess: async (_, variables) => {
      console.log('[ACTIVITY_DEBUG] [useDeleteComment] onSuccess called', {
        commentId: variables.commentId,
        entityType: variables.entityType,
        entityId: variables.entityId,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate comment queries for this entity
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.entityType, variables.entityId]
      });

      // Invalidate comment counts
      queryClient.invalidateQueries({
        queryKey: ['comment-counts']
      });

      // Invalidate recent project comments
      queryClient.invalidateQueries({
        queryKey: ['recent-project-comments']
      });

      // Fire-and-forget activity logging with comprehensive debug logging
      if (variables.entityType === 'project') {
        console.log('[ACTIVITY_DEBUG] [useDeleteComment] Starting activity logging for comment deletion');
        
        (async () => {
          try {
            console.log('[ACTIVITY_DEBUG] [useDeleteComment] Fetching auth user');
            const { data: auth, error: authError } = await supabase.auth.getUser();
            
            if (authError) {
              console.error('[ACTIVITY_DEBUG] [useDeleteComment] Auth error:', authError);
              return;
            }
            
            console.log('[ACTIVITY_DEBUG] [useDeleteComment] Auth user fetched successfully', {
              userId: auth?.user?.id,
              hasUser: !!auth?.user,
              userMetadata: auth?.user?.user_metadata
            });
            
            const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
                (auth?.user?.user_metadata?.name as string | undefined) ||
                (auth?.user?.email as string | undefined);
            
            const activityTitle = 'Comment removed from discussion';
            const activityDescription = 'A comment was deleted from the project discussion';
                
            console.log('[ACTIVITY_DEBUG] [useDeleteComment] Calling activityService.createActivity', {
              project_id: variables.entityId,
              activity_type: 'comment_delete',
              title: activityTitle,
              description: activityDescription,
              user_id: auth?.user?.id,
              user_name: userName,
              entity_type: 'comment',
              entity_id: variables.commentId
            });
            
            const result = await activityService.createActivity({
              project_id: variables.entityId,
              activity_type: 'comment_delete',
              title: activityTitle,
              description: activityDescription,
              user_id: auth?.user?.id,
              user_name: userName,
              entity_type: 'comment',
              entity_id: variables.commentId,
              metadata: {
                commentId: variables.commentId,
                entityType: variables.entityType
              },
              status: 'warning'
            });
            
            console.log('[ACTIVITY_DEBUG] [useDeleteComment] Activity created successfully', {
              success: !!result,
              activityId: result?.id,
              result
            });
            
          } catch (e) {
            console.error('[ACTIVITY_DEBUG] [useDeleteComment] Activity logging failed:', {
              error: e,
              errorMessage: e instanceof Error ? e.message : String(e),
              errorStack: e instanceof Error ? e.stack : undefined,
              commentId: variables.commentId,
              entityId: variables.entityId,
              timestamp: new Date().toISOString()
            });
          }
        })();
      }

      toast.success(COLLABORATION_SUCCESS.COMMENT_DELETED, {
        duration: COMMENT_MUTATION_DEFAULTS.TOAST_DURATION
      });
    },
    onError: (error) => {
      handleCommentError(error, 'deleting comment');
    }
  });
}

/**
 * Hook to bulk delete comments (for admin/moderator actions)
 */
export function useBulkDeleteComments() {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  return useMutation({
    mutationFn: async (commentIds: string[]): Promise<void> => {
      if (!user) {
        throw new Error(COLLABORATION_ERRORS.NOT_AUTHENTICATED);
      }

      if (!commentIds.length) {
        throw new Error('No comments selected for deletion');
      }

      // Delete multiple comments
      const { error } = await supabase
        .from(TABLE_NAMES.COMMENTS)
        .delete()
        .in('id', commentIds)
        .eq('user_id', user.id); // Ensure user can only delete their own comments

      if (error) {
        console.error('Error bulk deleting comments:', error);
        throw new Error(`Failed to delete comments: ${error.message}`);
      }
    },
    onSuccess: (_, commentIds) => {
      // Invalidate all comment-related queries since we don't know which entities were affected
      queryClient.invalidateQueries({
        queryKey: ['comments']
      });

      queryClient.invalidateQueries({
        queryKey: ['comment-counts']
      });

      queryClient.invalidateQueries({
        queryKey: ['recent-project-comments']
      });

      toast.success(COLLABORATION_SUCCESS.BULK_DELETED(commentIds.length), {
        duration: COMMENT_MUTATION_DEFAULTS.TOAST_DURATION
      });
    },
    onError: (error) => {
      handleCommentError(error, 'bulk deleting comments');
    }
  });
}

/**
 * Utility function to get user display name for comments
 */
export function getCommentUserDisplayName(comment: Comment): string {
  if (!comment.user) {
    return 'Unknown User';
  }

  const { first_name, last_name } = comment.user;
  if (first_name && last_name) {
    return `${first_name} ${last_name}`;
  }
  
  if (first_name) {
    return first_name;
  }

  return comment.user.email || 'Unknown User';
}

/**
 * Utility function to get user avatar URL
 */
export function getCommentUserAvatar(comment: Comment): string | null {
  return comment.user?.settings?.picture_url || null;
}

/**
 * Utility function to format comment content (basic text processing)
 */
export function formatCommentContent(content: string): string {
  return content
    .trim()
    .replace(/\n\n+/g, '\n\n') // Normalize multiple line breaks
    .replace(/^\s+|\s+$/g, ''); // Trim whitespace
}

/**
 * Utility function to truncate comment content for previews
 */
export function truncateCommentContent(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) {
    return content;
  }
  
  return content.substring(0, maxLength).trim() + '...';
}