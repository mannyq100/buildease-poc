/**
 * Phase Selector Component
 * Provides a dropdown for selecting phase categories with task preview
 */

import { useState, useMemo } from 'react';
import { Search, ChevronDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { 
  getPhaseTemplatesForProjectType, 
  searchPhaseTemplates,
  type ProjectType,
  type PhaseTemplate,
  type TaskTemplate 
} from '@/utils/phaseUtils';

interface PhaseSelectorProps {
  projectType: ProjectType;
  selectedCategory?: string;
  onCategorySelect: (category: string, phaseName: string) => void;
  onTasksPreview?: (tasks: TaskTemplate[]) => void;
  placeholder?: string;
  showTaskPreview?: boolean;
  className?: string;
}

export function PhaseSelector({
  projectType,
  selectedCategory,
  onCategorySelect,
  onTasksPreview,
  placeholder = "Select a phase...",
  showTaskPreview = true,
  className = ""
}: PhaseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Get available phases for the project type
  const availablePhases = useMemo(() => 
    getPhaseTemplatesForProjectType(projectType), 
    [projectType]
  );
  
  // Filter phases based on search query
  const filteredPhases = useMemo(() => {
    if (!searchQuery.trim()) return availablePhases;
    return searchPhaseTemplates(searchQuery, projectType);
  }, [searchQuery, projectType, availablePhases]);
  
  // Get selected phase details
  const selectedPhase = useMemo(() => 
    availablePhases.find(phase => phase.category === selectedCategory),
    [availablePhases, selectedCategory]
  );
  
  const handlePhaseSelect = (phase: PhaseTemplate) => {
    onCategorySelect(phase.category, phase.name);
    
    if (onTasksPreview && showTaskPreview) {
      // Pass complete task objects instead of just names
      onTasksPreview(phase.tasks);
    }
    
    setIsOpen(false);
    setSearchQuery('');
  };
  
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="phase-selector">Phase Category</Label>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="phase-selector"
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className={`
              w-full justify-between h-12 px-4 py-3
              transition-all duration-200 ease-in-out
              border-2 hover:border-blue-300 focus:border-blue-400
              hover:bg-gradient-to-r hover:from-blue-50 hover:to-orange-50
              hover:shadow-md focus:shadow-lg
              ${selectedPhase 
                ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-orange-50' 
                : 'border-gray-200 hover:border-blue-200'
              }
            `}
          >
            {selectedPhase ? (
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-orange-500" />
                <span className="font-semibold text-gray-800">{selectedPhase.name}</span>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                  {selectedPhase.tasks.length} tasks
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-gray-300" />
                <span className="text-gray-500 font-medium">{placeholder}</span>
              </div>
            )}
            <ChevronDown className={`ml-2 h-4 w-4 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-600' : 'text-gray-400'
            }`} />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0 shadow-xl border-0 bg-white/95 backdrop-blur-sm" align="start">
          {/* Enhanced Search Header */}
          <div className="flex items-center border-b border-gray-100 px-4 py-3 bg-gradient-to-r from-blue-50 to-orange-50">
            <Search className="mr-3 h-4 w-4 shrink-0 text-blue-600" />
            <Input
              placeholder="Search construction phases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 bg-transparent placeholder:text-gray-500 text-sm font-medium"
            />
          </div>
          
          {/* Enhanced Scrollable Options List */}
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {filteredPhases.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-gray-400 mb-2">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  No phases found for "{searchQuery}"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try a different search term
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredPhases.map((phase, index) => (
                  <div
                    key={phase.category}
                    className={`
                      relative flex cursor-pointer items-start gap-4 rounded-lg p-4 
                      transition-all duration-200 ease-in-out
                      hover:bg-gradient-to-r hover:from-blue-50 hover:to-orange-50
                      hover:shadow-md hover:scale-[1.02]
                      ${selectedCategory === phase.category 
                        ? 'bg-gradient-to-r from-blue-100 to-orange-100 shadow-md border border-blue-200' 
                        : 'hover:border hover:border-gray-200'
                      }
                      ${index === 0 ? 'mt-0' : ''}
                    `}
                    onClick={() => handlePhaseSelect(phase)}
                  >
                    {/* Phase Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold leading-none text-gray-800">
                          {phase.name}
                        </p>
                        {phase.isRemodelingPhase && (
                          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                            Remodeling
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {phase.description}
                      </p>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          <span>{phase.tasks.length} default tasks</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Selection Indicator */}
                    {selectedCategory === phase.category && (
                      <div className="flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 shadow-sm" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {showTaskPreview && selectedPhase && (
            <div className="border-t border-gray-100 bg-gradient-to-r from-blue-50/50 to-orange-50/50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold mb-3 text-gray-700">
                <Info className="h-4 w-4 text-blue-600" />
                Default Tasks Preview
              </div>
              <div className="space-y-2">
                {selectedPhase.tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="h-1 w-1 rounded-full bg-blue-500" />
                    <span className="font-medium">{task.name}</span>
                  </div>
                ))}
                {selectedPhase.tasks.length > 3 && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 italic">
                    <div className="h-1 w-1 rounded-full bg-gray-400" />
                    <span>... and {selectedPhase.tasks.length - 3} more tasks</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
      
      {selectedPhase && (
        <div className="text-xs text-muted-foreground">
          {selectedPhase.description}
        </div>
      )}
    </div>
  );
}
