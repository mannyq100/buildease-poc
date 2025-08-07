/**
 * BulkOperationsToolbar Component
 * Multi-select toolbar for bulk document operations
 * Supports delete, tag, collection management, and metadata updates
 */

import { useState } from 'react';
import { useBulkDeleteDocuments, useBulkUpdateDocuments } from '@/hooks/mutations/useDocumentMutations';
import { useMediaCollections } from '@/hooks/queries/useAdvancedMedia';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Trash2, 
  Tag, 
  FolderPlus, 
  MoreHorizontal,
  Check,
  X,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';
import type { MediaSearchResult, DocumentType } from '@/types/database';

interface BulkOperationsToolbarProps {
  selectedDocuments: MediaSearchResult[];
  projectId: string;
  onClearSelection: () => void;
  onOperationComplete?: () => void;
  className?: string;
}

const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: 'PHOTO', label: 'Photo' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'DRAWING', label: 'Drawing' },
  { value: 'SPECIFICATION', label: 'Specification' },
  { value: 'REPORT', label: 'Report' },
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'RECEIPT', label: 'Receipt' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'PERMIT', label: 'Permit' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'SCHEDULE', label: 'Schedule' },
  { value: 'OTHER', label: 'Other' }
];

export function BulkOperationsToolbar({
  selectedDocuments,
  projectId,
  onClearSelection,
  onOperationComplete,
  className = ''
}: BulkOperationsToolbarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showTypeChangeDialog, setShowTypeChangeDialog] = useState(false);
  
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>('OTHER');

  // Data and mutations
  const { data: collections = [] } = useMediaCollections({ projectId });
  const bulkDeleteMutation = useBulkDeleteDocuments();
  const bulkUpdateMutation = useBulkUpdateDocuments();

  const documentIds = selectedDocuments.map(doc => doc.id);
  const selectedCount = selectedDocuments.length;

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMutation.mutateAsync({
        documentIds,
        projectId
      });
      
      toast.success(`Successfully deleted ${selectedCount} document${selectedCount !== 1 ? 's' : ''}`);
      setShowDeleteDialog(false);
      onClearSelection();
      onOperationComplete?.();
    } catch (error) {
      console.error('Bulk delete failed:', error);
      // Error handled by mutation
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !newTags.includes(trimmedTag)) {
      setNewTags(prev => [...prev, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleBulkTag = async () => {
    if (newTags.length === 0) {
      toast.error('Please add at least one tag');
      return;
    }

    try {
      await bulkUpdateMutation.mutateAsync({
        documentIds,
        updates: { tags: newTags },
        operation: 'add_tags'
      });
      
      toast.success(`Successfully tagged ${selectedCount} document${selectedCount !== 1 ? 's' : ''}`);
      setShowTagDialog(false);
      setNewTags([]);
      onClearSelection();
      onOperationComplete?.();
    } catch (error) {
      console.error('Bulk tagging failed:', error);
      // Error handled by mutation
    }
  };

  const handleMoveToCollection = async () => {
    if (!selectedCollectionId) {
      toast.error('Please select a collection');
      return;
    }

    try {
      await bulkUpdateMutation.mutateAsync({
        documentIds,
        updates: { collection_id: selectedCollectionId },
        operation: 'move_to_collection'
      });
      
      const collection = collections.find(c => c.id === selectedCollectionId);
      toast.success(`Moved ${selectedCount} document${selectedCount !== 1 ? 's' : ''} to "${collection?.name}"`);
      setShowMoveDialog(false);
      setSelectedCollectionId('');
      onClearSelection();
      onOperationComplete?.();
    } catch (error) {
      console.error('Move to collection failed:', error);
      // Error handled by mutation
    }
  };

  const handleChangeDocumentType = async () => {
    try {
      await bulkUpdateMutation.mutateAsync({
        documentIds,
        updates: { document_type: selectedDocumentType },
        operation: 'update_type'
      });
      
      const typeLabel = DOCUMENT_TYPE_OPTIONS.find(opt => opt.value === selectedDocumentType)?.label;
      toast.success(`Changed ${selectedCount} document${selectedCount !== 1 ? 's' : ''} to type "${typeLabel}"`);
      setShowTypeChangeDialog(false);
      onClearSelection();
      onOperationComplete?.();
    } catch (error) {
      console.error('Document type change failed:', error);
      // Error handled by mutation
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  const isOperationInProgress = bulkDeleteMutation.isPending || bulkUpdateMutation.isPending;

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className={`
        flex items-center justify-between p-3 bg-accent border rounded-lg
        sticky top-0 z-10 shadow-sm
        ${className}
      `}>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Check className="h-3 w-3" />
            {selectedCount} selected
          </Badge>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-2">
            {/* Quick actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTagDialog(true)}
              disabled={isOperationInProgress}
              className="flex items-center gap-2"
            >
              <Tag className="h-4 w-4" />
              Add Tags
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMoveDialog(true)}
              disabled={isOperationInProgress}
              className="flex items-center gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              Add to Collection
            </Button>
            
            {/* More actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isOperationInProgress}
                  className="flex items-center gap-2"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem 
                  onClick={() => setShowTypeChangeDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Hash className="h-4 w-4" />
                  Change Type
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={isOperationInProgress}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Clear Selection
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Documents</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} selected document{selectedCount !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete Documents'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Tags Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tags to Selected Documents</DialogTitle>
            <DialogDescription>
              Add tags to {selectedCount} selected document{selectedCount !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-input">New Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tag-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter tag name..."
                />
                <Button onClick={handleAddTag} disabled={!tagInput.trim()}>
                  Add
                </Button>
              </div>
            </div>
            
            {newTags.length > 0 && (
              <div className="space-y-2">
                <Label>Tags to add:</Label>
                <div className="flex flex-wrap gap-2">
                  {newTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkTag}
              disabled={newTags.length === 0 || bulkUpdateMutation.isPending}
            >
              {bulkUpdateMutation.isPending ? 'Adding Tags...' : 'Add Tags'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Collection Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Collection</DialogTitle>
            <DialogDescription>
              Add {selectedCount} selected document{selectedCount !== 1 ? 's' : ''} to a collection.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collection-select">Select Collection</Label>
              <Select value={selectedCollectionId} onValueChange={setSelectedCollectionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a collection..." />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                      {collection.document_count !== undefined && (
                        <span className="text-muted-foreground ml-2">
                          ({collection.document_count} files)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleMoveToCollection}
              disabled={!selectedCollectionId || bulkUpdateMutation.isPending}
            >
              {bulkUpdateMutation.isPending ? 'Moving...' : 'Add to Collection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Document Type Dialog */}
      <Dialog open={showTypeChangeDialog} onOpenChange={setShowTypeChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Document Type</DialogTitle>
            <DialogDescription>
              Change the document type for {selectedCount} selected document{selectedCount !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type-select">New Document Type</Label>
              <Select value={selectedDocumentType} onValueChange={(value: DocumentType) => setSelectedDocumentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTypeChangeDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleChangeDocumentType}
              disabled={bulkUpdateMutation.isPending}
            >
              {bulkUpdateMutation.isPending ? 'Updating...' : 'Change Type'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}