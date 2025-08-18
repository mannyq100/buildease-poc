/**
 * AssigneeSelect - Team member selection dropdown for task assignment
 * Mobile-optimized with search, avatars, and clear assignment functionality
 */

import React, { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Check, ChevronsUpDown, X, User, UserPlus } from 'lucide-react';
import { cn } from '@/utils/core/ui';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'pending';
  workload?: number;
}

interface AssigneeSelectProps {
  value?: string | null;
  onValueChange: (value: string | null) => void;
  teamMembers: TeamMember[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showWorkload?: boolean;
  showClearButton?: boolean;
  variant?: 'default' | 'compact'; // Add compact variant for task cards
}

/**
 * Enhanced AssigneeSelect component for task assignment
 * Features:
 * - Search functionality for large teams
 * - Avatar display with fallbacks
 * - Workload indicators (if available)
 * - Mobile-optimized touch targets
 * - Clear assignment option
 * - Role badges
 */
export function AssigneeSelect({
  value,
  onValueChange,
  teamMembers,
  placeholder = "Select assignee...",
  disabled = false,
  className,
  showWorkload = true,
  showClearButton = true,
  variant = 'default'
}: AssigneeSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Find the selected team member
  const selectedMember = useMemo(() => {
    return teamMembers.find(member => member.id === value);
  }, [teamMembers, value]);

  // Filter team members based on search
  const filteredMembers = useMemo(() => {
    if (!searchValue) return teamMembers;
    
    return teamMembers.filter(member =>
      member.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      member.role.toLowerCase().includes(searchValue.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [teamMembers, searchValue]);

  // Get workload color
  const getWorkloadColor = (workload?: number) => {
    if (!workload) return 'bg-gray-100 text-gray-600';
    if (workload >= 90) return 'bg-red-100 text-red-700';
    if (workload >= 75) return 'bg-amber-100 text-amber-700';
    if (workload >= 50) return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  };

  // Handle clear assignment
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(null);
  };

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              variant === 'compact' 
                ? 'h-11 px-3 py-2 text-sm border-gray-200' // Increased to 44px (h-11) for better touch
                : 'w-full justify-between min-h-[44px] px-3 py-2',
              'border-gray-200 hover:border-blue-300 focus:border-blue-500',
              'transition-all duration-200',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {selectedMember ? (
                variant === 'compact' ? (
                  // Compact version for task cards
                  <>
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      {selectedMember.avatar ? (
                        <AvatarImage src={selectedMember.avatar} alt={selectedMember.name} />
                      ) : (
                        <AvatarFallback className="text-xs bg-blue-500 text-white">
                          {selectedMember.name.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {selectedMember.name}
                    </span>
                  </>
                ) : (
                  // Full version for modals
                  <>
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      {selectedMember.avatar ? (
                        <AvatarImage src={selectedMember.avatar} alt={selectedMember.name} />
                      ) : (
                        <AvatarFallback className="text-xs bg-blue-500 text-white">
                          {selectedMember.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {selectedMember.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs text-gray-600">
                          {selectedMember.role}
                        </Badge>
                        {showWorkload && selectedMember.workload !== undefined && (
                          <Badge 
                            variant="outline" 
                            className={cn('text-xs', getWorkloadColor(selectedMember.workload))}
                          >
                            {selectedMember.workload === 0 ? 'Available' : `${selectedMember.workload}% busy`}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {showClearButton && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={handleClear}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </>
                )
              ) : (
                variant === 'compact' ? (
                  // Compact placeholder
                  <span className="text-xs text-gray-500">{placeholder}</span>
                ) : (
                  // Full placeholder
                  <>
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">{placeholder}</span>
                  </>
                )
              )}
            </div>
            {variant !== 'compact' && (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search team members..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="h-9"
            />
            <CommandEmpty>
              <div className="flex flex-col items-center py-6 text-center">
                <UserPlus className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No team members found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Try adjusting your search
                </p>
              </div>
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {/* Clear option */}
              {showClearButton && value && (
                <CommandItem
                  onSelect={() => {
                    onValueChange(null);
                    setOpen(false);
                  }}
                  className="text-gray-500 italic"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear assignment
                </CommandItem>
              )}
              
              {filteredMembers.map((member) => (
                <CommandItem
                  key={member.id}
                  onSelect={() => {
                    onValueChange(member.id);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-3 p-3 cursor-pointer',
                    'hover:bg-blue-50 focus:bg-blue-50',
                    'transition-colors duration-150',
                    member.status === 'inactive' && 'opacity-60'
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      {member.avatar ? (
                        <AvatarImage src={member.avatar} alt={member.name} />
                      ) : (
                        <AvatarFallback className="text-xs bg-blue-500 text-white">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {member.name}
                        </span>
                        {value === member.id && (
                          <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs text-gray-600">
                          {member.role}
                        </Badge>
                        {showWorkload && member.workload !== undefined && (
                          <Badge 
                            variant="outline" 
                            className={cn('text-xs', getWorkloadColor(member.workload))}
                          >
                            {member.workload === 0 ? 'Available' : `${member.workload}% busy`}
                          </Badge>
                        )}
                        {member.status === 'inactive' && (
                          <Badge variant="outline" className="text-xs text-amber-600 bg-amber-50">
                            On Break
                          </Badge>
                        )}
                        {member.status === 'active' && member.workload && member.workload >= 90 && (
                          <Badge variant="outline" className="text-xs text-red-600 bg-red-50">
                            Overloaded
                          </Badge>
                        )}
                      </div>
                      
                      {member.email && (
                        <span className="text-xs text-gray-500 truncate mt-1">
                          {member.email}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * Simple AssigneeSelect variant for forms
 * Uses standard Select component for better form integration
 */
export function SimpleAssigneeSelect({
  value,
  onValueChange,
  teamMembers,
  placeholder = "Select assignee...",
  disabled = false,
  className
}: Omit<AssigneeSelectProps, 'showWorkload' | 'showClearButton'>) {
  const selectedMember = teamMembers.find(member => member.id === value);

  return (
    <Select value={value || ''} onValueChange={(val) => onValueChange(val || null)}>
      <SelectTrigger className={cn('w-full min-h-[44px]', className)} disabled={disabled}>
        <SelectValue placeholder={placeholder}>
          {selectedMember && (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                {selectedMember.avatar ? (
                  <AvatarImage src={selectedMember.avatar} alt={selectedMember.name} />
                ) : (
                  <AvatarFallback className="text-xs bg-blue-500 text-white">
                    {selectedMember.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="truncate">{selectedMember.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">No assignee</SelectItem>
        {teamMembers.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                {member.avatar ? (
                  <AvatarImage src={member.avatar} alt={member.name} />
                ) : (
                  <AvatarFallback className="text-xs bg-blue-500 text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                )}
              </Avatar>
              <span>{member.name}</span>
              <Badge variant="outline" className="text-xs ml-auto">
                {member.role}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}