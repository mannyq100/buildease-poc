import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Grid3X3, List } from 'lucide-react';

interface MediaFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: 'all' | 'images' | 'documents';
  onFilterTypeChange: (type: 'all' | 'images' | 'documents') => void;
  filterCategory: string;
  onFilterCategoryChange: (category: string) => void;
  availableCategories: string[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  getCategoryDisplayName: (category: string) => string;
  onClearFilters: () => void;
  onShowUploadOptions: () => void;
}

export function MediaFilters({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterCategory,
  onFilterCategoryChange,
  availableCategories,
  viewMode,
  onViewModeChange,
  getCategoryDisplayName,
  onClearFilters,
  onShowUploadOptions
}: MediaFiltersProps) {

  return (
    <div className="bg-slate-50/50 p-4 rounded-xl space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Enhanced Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={filterType} onValueChange={(value: 'all' | 'images' | 'documents') => onFilterTypeChange(value)}>
            <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-slate-200/50 hover:border-buildease-blue-300 hover:bg-white transition-all duration-200 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-md border-slate-200/50 shadow-xl">
              <SelectItem value="all" className="hover:bg-slate-50/80">
                All Media Types
              </SelectItem>
              <SelectItem value="images" className="hover:bg-buildease-blue-50/80">
                Images Only
              </SelectItem>
              <SelectItem value="documents" className="hover:bg-purple-50/80">
                Documents Only
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterCategory} onValueChange={onFilterCategoryChange}>
            <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-slate-200/50 hover:border-buildease-blue-300 hover:bg-white transition-all duration-200 shadow-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-md border-slate-200/50 shadow-xl">
              <SelectItem value="all" className="hover:bg-slate-50/80">
                All Categories
              </SelectItem>
              
              {/* Image Categories */}
              {availableCategories.filter(cat => ['profile', 'inspiration', 'progress'].includes(cat)).length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50/50">
                    📸 Image Categories
                  </div>
                  {availableCategories.filter(cat => ['profile', 'inspiration', 'progress'].includes(cat)).map(category => (
                    <SelectItem key={category} value={category} className="hover:bg-buildease-blue-50/80">
                      {getCategoryDisplayName(category)}
                    </SelectItem>
                  ))}
                </>
              )}
              
              {/* Document Categories */}
              {availableCategories.filter(cat => !['profile', 'inspiration', 'progress'].includes(cat)).length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50/50 border-t border-slate-100">
                    📄 Document Categories
                  </div>
                  {availableCategories.filter(cat => !['profile', 'inspiration', 'progress'].includes(cat)).map(category => (
                    <SelectItem key={category} value={category} className="hover:bg-purple-50/80">
                      {getCategoryDisplayName(category)}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(filterType !== 'all' || filterCategory !== 'all' || searchTerm) && (
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200/50">
          <span className="text-xs font-medium text-slate-500">Active filters:</span>
          {filterType !== 'all' && (
            <Badge className="bg-buildease-blue-100 text-buildease-blue-700 border-0 rounded-full px-3 py-1">
              {filterType === 'images' ? '📸 Images' : '📄 Documents'}
              <button
                onClick={() => onFilterTypeChange('all')}
                className="ml-2 hover:text-buildease-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterCategory !== 'all' && (
            <Badge className="bg-purple-100 text-purple-700 border-0 rounded-full px-3 py-1">
              {getCategoryDisplayName(filterCategory)}
              <button
                onClick={() => onFilterCategoryChange('all')}
                className="ml-2 hover:text-purple-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {searchTerm && (
            <Badge className="bg-green-100 text-green-700 border-0 rounded-full px-3 py-1">
              🔍 {searchTerm}
              <button
                onClick={() => onSearchChange('')}
                className="ml-2 hover:text-green-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 h-auto"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Add Media Button and View Mode Toggle */}
      <div className="flex justify-between items-center">
        <Button
          onClick={onShowUploadOptions}
          className="bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200"
        >
          <span className="mr-2">+</span>
          Add Media
        </Button>
        
        <div className="flex items-center bg-white/80 border border-slate-200 rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-r-none border-r"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
