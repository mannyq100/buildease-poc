/**
 * Comment Query Hooks
 * Provides data fetching for comments with real-time updates
 * Supports threaded comments and user information joins
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TABLE_NAMES } from '@/types/database';
import type { Comment } from '@/types/database';
import { useRetryableQuery } from '@/hooks/useRetryableQuery';

interface UseCommentsOptions {
  entityType: 'project' | 'task' | 'phase';
  entityId: string;
  includeReplies?: boolean;
  limit?: number;
  orderBy?: 'newest' | 'oldest';
  realtime?: boolean;
}

interface UseCommentThreadOptions {
  parentCommentId: string;
  realtime?: boolean;
}

/**
 * Hook to fetch comments for a specific entity (project, task, or phase)
 */
export function useComments({
  entityType,
  entityId,
  includeReplies = true,
  limit = 50,
  orderBy = 'newest',
  realtime = true
}: UseCommentsOptions) {
  // Optimize query key for better caching
  const queryKey = ['comments', entityType, entityId, includeReplies, limit, orderBy];

  const query = useRetryableQuery(
    queryKey,
    async (): Promise<Comment[]> => {
      let query = supabase
        .from(TABLE_NAMES.COMMENTS)
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
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      // Filter for top-level comments or include replies
      if (!includeReplies) {
        query = query.is('parent_comment_id', null);
      }

      // Apply ordering
      const ascending = orderBy === 'oldest';
      query = query.order('created_at', { ascending });

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching comments:', error);
        throw new Error(`Failed to fetch comments: ${error.message}`);
      }

      return (data || []) as Comment[];
    },
    {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      circuitBreakerKey: `comments-${entityType}-${entityId}`,
      showRetryNotifications: false, // Don't spam users with comment retry notifications
      retryOptions: {
        maxAttempts: 2,
        baseDelay: 1000
      },
      // Enable background refetching for better UX
      refetchOnWindowFocus: false, // Avoid excessive refetches
      refetchOnMount: true,
      // Optimize for performance with large comment lists
      select: limit > 100 ? (data: Comment[]) => {
        // For large datasets, only keep essential data in memory
        return data.map(comment => ({
          ...comment,
          // Keep full user data but optimize other fields if needed
          user: comment.user ? {
            id: comment.user.id,
            first_name: comment.user.first_name,
            last_name: comment.user.last_name,
            email: comment.user.email,
            settings: comment.user.settings
          } : null
        }));
      } : undefined
    }
  );

  // Set up real-time subscription for new comments with throttling
  useEffect(() => {
    if (!realtime || !entityId) return;

    let refetchTimeout: NodeJS.Timeout;
    let isRefetching = false;

    const throttledRefetch = () => {
      if (isRefetching) return;
      
      if (refetchTimeout) {
        clearTimeout(refetchTimeout);
      }
      
      refetchTimeout = setTimeout(async () => {
        if (isRefetching) return;
        isRefetching = true;
        
        try {
          await query.refetch();
        } catch (error) {
          console.warn('Failed to refetch comments:', error);
        } finally {
          isRefetching = false;
        }
      }, 500); // Throttle refetches to max once per 500ms
    };

    const channel = supabase
      .channel(`comments-${entityType}-${entityId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: TABLE_NAMES.COMMENTS,
          filter: `entity_type=eq.${entityType} AND entity_id=eq.${entityId}`
        },
        throttledRefetch
      )
      .subscribe();

    return () => {
      if (refetchTimeout) {
        clearTimeout(refetchTimeout);
      }
      channel.unsubscribe();
    };
  }, [entityType, entityId, realtime, query]);

  return query;
}

/**
 * Hook to fetch replies for a specific comment (threaded comments)
 */
export function useCommentThread({
  parentCommentId,
  realtime = true
}: UseCommentThreadOptions) {
  const queryKey = ['comment-thread', parentCommentId];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.COMMENTS)
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
        .eq('parent_comment_id', parentCommentId)
        .order('created_at', { ascending: true }); // Replies in chronological order

      if (error) {
        console.error('Error fetching comment thread:', error);
        throw new Error(`Failed to fetch comment thread: ${error.message}`);
      }

      return (data || []) as Comment[];
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!parentCommentId, // Only run query if parentCommentId is provided
  });

  // Real-time subscription for thread replies
  useEffect(() => {
    if (!realtime || !parentCommentId) return;

    const channel = supabase
      .channel(`comment-thread-${parentCommentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLE_NAMES.COMMENTS,
          filter: `parent_comment_id=eq.${parentCommentId}`
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [parentCommentId, realtime, query]);

  return query;
}

/**
 * Hook to get comment counts for multiple entities at once
 * Useful for showing comment counts on cards/lists
 */
export function useCommentCounts(
  entities: Array<{ type: 'project' | 'task' | 'phase'; id: string }>
) {
  const queryKey = ['comment-counts', entities];

  return useQuery({
    queryKey,
    queryFn: async (): Promise<Record<string, number>> => {
      if (!entities.length) return {};

      // Build a query for each entity type
      const promises = entities.map(async (entity) => {
        const { count, error } = await supabase
          .from(TABLE_NAMES.COMMENTS)
          .select('*', { count: 'exact', head: true })
          .eq('entity_type', entity.type)
          .eq('entity_id', entity.id);

        if (error) {
          console.warn(`Error fetching comment count for ${entity.type}:${entity.id}:`, error);
          return { key: `${entity.type}:${entity.id}`, count: 0 };
        }

        return { key: `${entity.type}:${entity.id}`, count: count || 0 };
      });

      const results = await Promise.all(promises);
      
      // Convert to object with entity keys
      return results.reduce((acc, { key, count }) => {
        acc[key] = count;
        return acc;
      }, {} as Record<string, number>);
    },
    staleTime: 60 * 1000, // 1 minute - comment counts don't need to be as fresh
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: entities.length > 0,
  });
}

/**
 * Hook to get recent comments across all entities for a project
 * Useful for activity feeds and project overview
 */
export function useRecentProjectComments(
  projectId: string,
  limit: number = 10
) {
  const queryKey = ['recent-project-comments', projectId, limit];

  return useQuery({
    queryKey,
    queryFn: async (): Promise<Comment[]> => {
      // Get all entity IDs related to this project
      // For now, we'll just get project comments, but this can be expanded
      // to include task and phase comments from the project
      
      const { data, error } = await supabase
        .from(TABLE_NAMES.COMMENTS)
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
        .eq('entity_type', 'project')
        .eq('entity_id', projectId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent project comments:', error);
        throw new Error(`Failed to fetch recent project comments: ${error.message}`);
      }

      return (data || []) as Comment[];
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!projectId,
  });
}

/**
 * Hook to get comment count for a single entity
 * Useful for showing comment badges on task/phase cards
 */
export function useCommentCount(entityType: 'project' | 'task' | 'phase', entityId: string) {
  const queryKey = ['comment-count', entityType, entityId];

  return useQuery({
    queryKey,
    queryFn: async (): Promise<number> => {
      if (!entityId) return 0;

      const { count, error } = await supabase
        .from(TABLE_NAMES.COMMENTS)
        .select('*', { count: 'exact', head: true })
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (error) {
        console.warn(`Error fetching comment count for ${entityType}:${entityId}:`, error);
        return 0;
      }

      return count || 0;
    },
    staleTime: 60 * 1000, // 1 minute - comment counts don't need to be as fresh
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!entityId,
  });
}