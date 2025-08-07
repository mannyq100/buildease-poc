/**
 * CommentsModal Component
 * Modal dialog for viewing and adding comments to any entity
 * Used for task comments, phase comments, etc.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CommentsList } from './CommentsList';
import { MessageCircle } from 'lucide-react';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'project' | 'task' | 'phase';
  entityId: string;
  entityName?: string; // For display purposes
}

export function CommentsModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName
}: CommentsModalProps) {
  const getTitle = () => {
    const entityTypeLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1);
    if (entityName) {
      return `${entityTypeLabel} Comments: ${entityName}`;
    }
    return `${entityTypeLabel} Comments`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full sm:max-w-2xl md:max-w-4xl max-h-[90vh] sm:max-h-[80vh] flex flex-col mx-4 sm:mx-auto">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <CommentsList
            entityType={entityType}
            entityId={entityId}
            showTitle={false}
            maxHeight="max-h-[calc(90vh-8rem)] sm:max-h-[calc(80vh-8rem)]"
            limit={100}
            orderBy="newest"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}