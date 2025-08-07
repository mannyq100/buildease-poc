/**
 * MediaMetadataEditor Component
 * Comprehensive metadata editing interface for media files
 * Supports captions, descriptions, tags, and custom metadata
 */

import { useState, useEffect } from 'react';
import { useUpdateDocumentMetadata } from '@/hooks/mutations/useDocumentMutations';
import { useDocumentTags } from '@/hooks/queries/useAdvancedMedia';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { 
  Tags, 
  Save, 
  X, 
  Plus, 
  Check, 
  ChevronsUpDown,
  FileText,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { formatBytes } from '@/utils/fileUtils';
import { formatDistanceToNow } from 'date-fns';
import type { Document, DocumentType } from '@/types/database';

interface MediaMetadataEditorProps {
  document: Document;
  projectId: string;
  onClose: () => void;
  onSave?: (updatedDocument: Document) => void;
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

export function MediaMetadataEditor({
  document,
  projectId,
  onClose,
  onSave,
  className = ''
}: MediaMetadataEditorProps) {
  const [formData, setFormData] = useState({
    caption: document.caption || '',
    description: document.description || '',
    document_type: document.document_type,
    tags: document.tags || []
  });
  const [newTag, setNewTag] = useState('');
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateMetadataMutation = useUpdateDocumentMetadata();
  const { data: existingTags = [] } = useDocumentTags(projectId);

  // Track changes
  useEffect(() => {
    const hasChanges = 
      formData.caption !== (document.caption || '') ||
      formData.description !== (document.description || '') ||
      formData.document_type !== document.document_type ||
      JSON.stringify(formData.tags.sort()) !== JSON.stringify((document.tags || []).sort());
    
    setHasChanges(hasChanges);
  }, [formData, document]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      handleInputChange('tags', [...formData.tags, trimmedTag]);
      setNewTag('');
      setTagPopoverOpen(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    try {
      const updatedDocument = await updateMetadataMutation.mutateAsync({
        documentId: document.id,
        metadata: {
          caption: formData.caption.trim() || null,
          description: formData.description.trim() || null,
          document_type: formData.document_type,
          tags: formData.tags.length > 0 ? formData.tags : null
        }
      });

      toast.success('Document metadata updated successfully');
      onSave?.(updatedDocument);
      onClose();
    } catch (error) {
      console.error('Failed to update metadata:', error);
      // Error handled by mutation
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return 'Unknown size';
    return formatBytes(bytes);
  };

  const formatCreatedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString()} (${formatDistanceToNow(date, { addSuffix: true })})`;
    } catch {
      return 'Unknown date';
    }
  };

  const suggestedTags = existingTags.filter(tag => 
    !formData.tags.includes(tag) && 
    tag.toLowerCase().includes(newTag.toLowerCase())
  ).slice(0, 5);

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Edit Media Metadata
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* File info summary */}
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="font-medium truncate">{document.name}</div>
          <div className="flex items-center gap-4 text-xs">
            <span>{formatFileSize(document.file_size_bytes)}</span>
            <span>{document.mime_type}</span>
            <span>{formatCreatedDate(document.created_at)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Document Type */}
        <div className="space-y-2">
          <Label htmlFor="document-type" className="text-sm font-medium flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Document Type
          </Label>
          <Select 
            value={formData.document_type} 
            onValueChange={(value: DocumentType) => handleInputChange('document_type', value)}
          >
            <SelectTrigger id="document-type">
              <SelectValue placeholder="Select document type" />
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

        <Separator />

        {/* Caption */}
        <div className="space-y-2">
          <Label htmlFor="caption" className="text-sm font-medium">
            Caption / Title
          </Label>
          <Input
            id="caption"
            value={formData.caption}
            onChange={(e) => handleInputChange('caption', e.target.value)}
            placeholder="Brief description or title for this document"
            maxLength={200}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground text-right">
            {formData.caption.length}/200 characters
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Detailed description of the document content, purpose, or context"
            className="min-h-[100px] resize-none"
            maxLength={1000}
          />
          <div className="text-xs text-muted-foreground text-right">
            {formData.description.length}/1000 characters
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Tags
          </Label>
          
          {/* Current tags */}
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
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

          {/* Add new tag */}
          <div className="flex gap-2">
            <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={tagPopoverOpen}
                  className="flex-1 justify-between text-left font-normal"
                >
                  {newTag || "Add a tag..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search or create tag..." 
                    value={newTag}
                    onValueChange={setNewTag}
                  />
                  <CommandEmpty>
                    {newTag.trim() && (
                      <div className="p-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left"
                          onClick={() => handleAddTag(newTag)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create "{newTag.trim()}"
                        </Button>
                      </div>
                    )}
                  </CommandEmpty>
                  {suggestedTags.length > 0 && (
                    <CommandGroup heading="Existing Tags">
                      {suggestedTags.map((tag) => (
                        <CommandItem
                          key={tag}
                          value={tag}
                          onSelect={() => handleAddTag(tag)}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              formData.tags.includes(tag) ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {tag}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Tags help organize and search your documents. Press Enter or click to add.
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!hasChanges || updateMetadataMutation.isPending}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {updateMetadataMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  );
}