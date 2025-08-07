/**
 * AdvancedMediaSearch Component
 * Comprehensive search interface for project media with filters
 * Supports text search, type filters, date ranges, and tag filtering
 */

import { useState, useEffect, useMemo } from 'react';
import { useAdvancedMediaSearch, useDocumentTags, useMediaStats } from '@/hooks/queries/useAdvancedMedia';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';


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
import { Calendar } from '@/components/ui/calendar';
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  FileType,
  Tags,
  SlidersHorizontal,
  RotateCcw,
  TrendingUp,
  File,
  Image,
  Video
} from 'lucide-react';
import { formatBytes } from '@/utils/fileUtils';
import { format } from 'date-fns';
import type { MediaSearchFilters, DocumentType, MediaSearchResult } from '@/types/database';

interface AdvancedMediaSearchProps {
  projectId: string;
  onResultsChange?: (results: MediaSearchResult[]) => void;
  onFilterChange?: (filters: MediaSearchFilters) => void;
  className?: string;
}

const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string; icon: React.ReactNode }[] = [
  { value: 'PHOTO', label: 'Photos', icon: <Image className="h-4 w-4" /> },
  { value: 'VIDEO', label: 'Videos', icon: <Video className="h-4 w-4" /> },
  { value: 'DRAWING', label: 'Drawings', icon: <File className="h-4 w-4" /> },
  { value: 'SPECIFICATION', label: 'Specifications', icon: <FileType className="h-4 w-4" /> },
  { value: 'REPORT', label: 'Reports', icon: <File className="h-4 w-4" /> },
  { value: 'INVOICE', label: 'Invoices', icon: <File className="h-4 w-4" /> },
  { value: 'RECEIPT', label: 'Receipts', icon: <File className="h-4 w-4" /> },
  { value: 'CONTRACT', label: 'Contracts', icon: <File className="h-4 w-4" /> },
  { value: 'PERMIT', label: 'Permits', icon: <File className="h-4 w-4" /> },
  { value: 'CERTIFICATE', label: 'Certificates', icon: <File className="h-4 w-4" /> },
  { value: 'MANUAL', label: 'Manuals', icon: <File className="h-4 w-4" /> },
  { value: 'SCHEDULE', label: 'Schedules', icon: <File className="h-4 w-4" /> },
  { value: 'OTHER', label: 'Other', icon: <File className="h-4 w-4" /> }
];

const FILE_SIZE_PRESETS = [
  { label: 'Any size', min: undefined, max: undefined },
  { label: 'Small (< 1MB)', min: undefined, max: 1024 * 1024 },
  { label: 'Medium (1-10MB)', min: 1024 * 1024, max: 10 * 1024 * 1024 },
  { label: 'Large (10-100MB)', min: 10 * 1024 * 1024, max: 100 * 1024 * 1024 },
  { label: 'Very Large (> 100MB)', min: 100 * 1024 * 1024, max: undefined }
];

export function AdvancedMediaSearch({
  projectId,
  onResultsChange,
  onFilterChange,
  className = ''
}: AdvancedMediaSearchProps) {
  const [filters, setFilters] = useState<MediaSearchFilters>({
    searchTerm: '',
    tags: [],
    documentTypes: [],
    dateFrom: undefined,
    dateTo: undefined,
    minFileSize: undefined,
    maxFileSize: undefined
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  // Data fetching
  const { data: searchResults = [], isLoading, error } = useAdvancedMediaSearch({
    projectId,
    filters,
    limit: 100,
    enabled: true
  });
  
  const { data: availableTags = [] } = useDocumentTags(projectId);
  const { data: mediaStats } = useMediaStats({ projectId });

  // Notify parent of results changes
  useEffect(() => {
    onResultsChange?.(searchResults);
  }, [searchResults, onResultsChange]);

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (field: keyof MediaSearchFilters, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !filters.tags?.includes(trimmedTag)) {
      handleFilterChange('tags', [...(filters.tags || []), trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleFilterChange('tags', (filters.tags || []).filter(tag => tag !== tagToRemove));
  };

  const handleDocumentTypeToggle = (docType: DocumentType) => {
    const currentTypes = filters.documentTypes || [];
    const newTypes = currentTypes.includes(docType)
      ? currentTypes.filter(type => type !== docType)
      : [...currentTypes, docType];
    
    handleFilterChange('documentTypes', newTypes.length > 0 ? newTypes : undefined);
  };

  const handleFileSizePreset = (preset: typeof FILE_SIZE_PRESETS[0]) => {
    handleFilterChange('minFileSize', preset.min);
    handleFilterChange('maxFileSize', preset.max);
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      tags: [],
      documentTypes: [],
      dateFrom: undefined,
      dateTo: undefined,
      minFileSize: undefined,
      maxFileSize: undefined
    });
    setTagInput('');
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.searchTerm ||
      (filters.tags && filters.tags.length > 0) ||
      (filters.documentTypes && filters.documentTypes.length > 0) ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.minFileSize ||
      filters.maxFileSize
    );
  }, [filters]);

  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(tagInput.toLowerCase()) &&
    !filters.tags?.includes(tag)
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Search Media</h3>
          {mediaStats && (
            <Badge variant="outline" className="ml-2">
              {mediaStats.total_documents} files
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Main Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by filename, caption, or description..."
          value={filters.searchTerm || ''}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Document Types */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <FileType className="h-4 w-4" />
                Document Types
              </Label>
              <div className="flex flex-wrap gap-2">
                {DOCUMENT_TYPE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.documentTypes?.includes(option.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDocumentTypeToggle(option.value)}
                    className="flex items-center gap-2"
                  >
                    {option.icon}
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Tags className="h-4 w-4" />
                Tags
              </Label>
              
              {/* Selected tags */}
              {filters.tags && filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {filters.tags.map((tag) => (
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
              )}

              {/* Tag input */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    Add tags...
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search tags..." 
                      value={tagInput}
                      onValueChange={setTagInput}
                    />
                    <CommandEmpty>
                      {tagInput.trim() && (
                        <div className="p-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => handleAddTag(tagInput)}
                          >
                            Add "{tagInput.trim()}"
                          </Button>
                        </div>
                      )}
                    </CommandEmpty>
                    {filteredTags.length > 0 && (
                      <CommandGroup>
                        {filteredTags.slice(0, 10).map((tag) => (
                          <CommandItem
                            key={tag}
                            value={tag}
                            onSelect={() => handleAddTag(tag)}
                          >
                            {tag}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <Separator />

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Date Range
              </Label>
              <div className="flex gap-2">
                <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(new Date(filters.dateFrom), 'MMM dd, yyyy') : 'From date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                      onSelect={(date) => {
                        handleFilterChange('dateFrom', date?.toISOString());
                        setDateFromOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(new Date(filters.dateTo), 'MMM dd, yyyy') : 'To date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                      onSelect={(date) => {
                        handleFilterChange('dateTo', date?.toISOString());
                        setDateToOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Separator />

            {/* File Size */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">File Size</Label>
              <div className="flex flex-wrap gap-2">
                {FILE_SIZE_PRESETS.map((preset, index) => (
                  <Button
                    key={index}
                    variant={
                      filters.minFileSize === preset.min && filters.maxFileSize === preset.max
                        ? "default" 
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleFileSizePreset(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          {isLoading && <span>Searching...</span>}
          {!isLoading && (
            <>
              <TrendingUp className="h-4 w-4" />
              <span>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </span>
            </>
          )}
        </div>
        
        {mediaStats && (
          <div className="flex items-center gap-4">
            <span>{formatBytes(mediaStats.total_size_bytes)} total</span>
            <span>{mediaStats.recent_uploads} recent uploads</span>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          Failed to search media: {error.message}
        </div>
      )}
    </div>
  );
}