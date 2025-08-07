/**
 * ProjectCommentsSection Component
 * Dedicated section for project comments in the ProjectDetails page
 * Integrates with the existing tab system and layout
 */

import { CommentsList } from '@/components/shared/Comments';
import { CommentsErrorBoundary } from '@/components/shared/Comments/CommentsErrorBoundary';

interface ProjectCommentsSectionProps {
  projectId: string;
}

export function ProjectCommentsSection({ projectId }: ProjectCommentsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Project Discussion</h2>
          <p className="text-sm text-muted-foreground">
            Share updates, ask questions, and collaborate with your team
          </p>
        </div>
      </div>

      <CommentsErrorBoundary>
        <CommentsList
          entityType="project"
          entityId={projectId}
          showTitle={false}
          maxHeight="max-h-[600px]"
          limit={100}
          orderBy="newest"
        />
      </CommentsErrorBoundary>
    </div>
  );
}