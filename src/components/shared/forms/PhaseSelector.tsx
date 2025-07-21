/**
 * Phase Selector Component
 * Provides a dropdown for selecting phase categories with task preview
 */

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { 
  getPhaseTemplatesForProjectType, 
  getDefaultTasksForPhase, 
  searchPhaseTemplates,
  type ProjectType,
  type PhaseTemplate 
} from '@/utils/phaseUtils';

interface PhaseSelectorProps {
  projectType: ProjectType;
  selectedCategory?: string;
  onCategorySelect: (category: string, phaseName: string) => void;
  onTasksPreview?: (tasks: { id: string; name: string; alternativeNames: string[] }[]) => void;
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
            className="w-full justify-between"
          >
            {selectedPhase ? (
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedPhase.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {selectedPhase.tasks.length} tasks
                </Badge>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search phases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0"
            />
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {filteredPhases.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No phases found for "{searchQuery}"
              </div>
            ) : (
              <div className="p-1">
                {filteredPhases.map((phase) => (
                  <div
                    key={phase.category}
                    className="relative flex cursor-pointer items-start gap-3 rounded-sm p-3 hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handlePhaseSelect(phase)}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">
                          {phase.name}
                        </p>
                        {phase.isRemodelingPhase && (
                          <Badge variant="outline" className="text-xs">
                            Remodeling
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {phase.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{phase.tasks.length} default tasks</span>
                        {phase.alternativeNames.length > 1 && (
                          <span>• Also known as: {phase.alternativeNames.slice(1).join(', ')}</span>
                        )}
                      </div>
                    </div>
                    
                    {selectedCategory === phase.category && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {showTaskPreview && selectedPhase && (
            <div className="border-t p-3">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Info className="h-4 w-4" />
                Default Tasks Preview
              </div>
              <div className="space-y-1">
                {selectedPhase.tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="text-xs text-muted-foreground">
                    • {task.name}
                  </div>
                ))}
                {selectedPhase.tasks.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    ... and {selectedPhase.tasks.length - 3} more tasks
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
