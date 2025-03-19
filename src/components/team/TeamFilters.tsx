import React, { useState } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { AvailabilityStatus } from '@/types/common'

// Define the department options
const DEPARTMENTS = [
  'Management',
  'Engineering',
  'Architecture',
  'Construction',
  'Electrical',
  'Plumbing',
  'Carpentry',
  'Finance',
  'HR',
  'Sales',
  'Marketing'
]

// Define the availability status options
const AVAILABILITY_OPTIONS = [
  { value: 'available' as AvailabilityStatus, label: 'Available' },
  { value: 'busy' as AvailabilityStatus, label: 'Busy' },
  { value: 'on-leave' as AvailabilityStatus, label: 'On Leave' },
  { value: 'offline' as AvailabilityStatus, label: 'Offline' }
]

export interface TeamFiltersProps {
  onSearch: (query: string) => void
  onFilterChange: (filters: TeamFilters) => void
  className?: string
}

export interface TeamFilters {
  departments: string[]
  availability: AvailabilityStatus[]
  performance: number | null
  onlyTopPerformers: boolean
}

/**
 * TeamFilters component
 * Provides search and filtering options for the team page
 */
export function TeamFilters({ 
  onSearch, 
  onFilterChange,
  className 
}: TeamFiltersProps) {
  // State for the search query
  const [searchQuery, setSearchQuery] = useState('')
  
  // State for the filters
  const [filters, setFilters] = useState<TeamFilters>({
    departments: [],
    availability: [],
    performance: null,
    onlyTopPerformers: false
  })
  
  // Count active filters
  const activeFilterCount = (
    filters.departments.length + 
    filters.availability.length + 
    (filters.performance !== null ? 1 : 0) +
    (filters.onlyTopPerformers ? 1 : 0)
  )
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch(value)
  }
  
  // Handle department filter change
  const handleDepartmentChange = (department: string) => {
    const newDepartments = filters.departments.includes(department)
      ? filters.departments.filter(d => d !== department)
      : [...filters.departments, department]
    
    const newFilters = { ...filters, departments: newDepartments }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }
  
  // Handle availability filter change
  const handleAvailabilityChange = (availability: AvailabilityStatus) => {
    const newAvailability = filters.availability.includes(availability)
      ? filters.availability.filter(a => a !== availability)
      : [...filters.availability, availability]
    
    const newFilters = { ...filters, availability: newAvailability }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }
  
  // Handle performance filter change
  const handlePerformanceChange = (performance: number | null) => {
    const newFilters = { ...filters, performance }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }
  
  // Handle top performers filter change
  const handleTopPerformersChange = (checked: boolean) => {
    const newFilters = { ...filters, onlyTopPerformers: checked }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }
  
  // Clear all filters
  const clearFilters = () => {
    const newFilters: TeamFilters = {
      departments: [],
      availability: [],
      performance: null,
      onlyTopPerformers: false
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }
  
  // Remove a specific department filter
  const removeDepartmentFilter = (department: string) => {
    const newDepartments = filters.departments.filter(d => d !== department)
    const newFilters = { ...filters, departments: newDepartments }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }
  
  // Remove a specific availability filter
  const removeAvailabilityFilter = (availability: AvailabilityStatus) => {
    const newAvailability = filters.availability.filter(a => a !== availability)
    const newFilters = { ...filters, availability: newAvailability }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }
  
  // Remove performance filter
  const removePerformanceFilter = () => {
    const newFilters = { ...filters, performance: null }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }
  
  // Remove top performers filter
  const removeTopPerformersFilter = () => {
    const newFilters = { ...filters, onlyTopPerformers: false }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }
  
  // Get label for performance filter
  const getPerformanceFilterLabel = (performance: number | null) => {
    if (performance === null) return null
    
    if (performance === 80) return '80% or higher'
    if (performance === 60) return '60% or higher'
    if (performance === 40) return '40% or higher'
    
    return `${performance}% or higher`
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Search team members..."
            className="pl-9 h-10 bg-white dark:bg-slate-800"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => {
                setSearchQuery('')
                onSearch('')
              }}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Department Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 flex-shrink-0 bg-white dark:bg-slate-800">
              Department
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 max-h-[300px] overflow-y-auto">
            <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {DEPARTMENTS.map((department) => (
              <DropdownMenuCheckboxItem
                key={department}
                checked={filters.departments.includes(department)}
                onCheckedChange={() => handleDepartmentChange(department)}
              >
                {department}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Availability Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 flex-shrink-0 bg-white dark:bg-slate-800">
              Availability
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Availability</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {AVAILABILITY_OPTIONS.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.availability.includes(option.value)}
                onCheckedChange={() => handleAvailabilityChange(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Performance Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-10 flex-shrink-0 bg-white dark:bg-slate-800">
              Performance
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Performance Rating</h4>
              <DropdownMenuSeparator />
              <div className="space-y-1">
                <Button
                  variant={filters.performance === 80 ? "default" : "ghost"}
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => handlePerformanceChange(filters.performance === 80 ? null : 80)}
                >
                  80% or higher
                </Button>
                <Button
                  variant={filters.performance === 60 ? "default" : "ghost"}
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => handlePerformanceChange(filters.performance === 60 ? null : 60)}
                >
                  60% or higher
                </Button>
                <Button
                  variant={filters.performance === 40 ? "default" : "ghost"}
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => handlePerformanceChange(filters.performance === 40 ? null : 40)}
                >
                  40% or higher
                </Button>
              </div>
              <DropdownMenuSeparator />
              <div className="flex items-center">
                <Button
                  variant={filters.onlyTopPerformers ? "default" : "ghost"}
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => handleTopPerformersChange(!filters.onlyTopPerformers)}
                >
                  Top Performers Only
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* More Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="h-10 flex-shrink-0 bg-white dark:bg-slate-800 relative"
            >
              <Filter className="mr-2 h-4 w-4" />
              More Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Active Filters</h4>
              {activeFilterCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters} 
                  className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            {activeFilterCount === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                No filters applied
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filters.departments.map(department => (
                  <Badge key={department} variant="secondary" className="pl-2 pr-1 py-1 h-7 gap-1">
                    {department}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ml-1"
                      onClick={() => removeDepartmentFilter(department)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {department} filter</span>
                    </Button>
                  </Badge>
                ))}
                
                {filters.availability.map(availability => (
                  <Badge key={availability} variant="secondary" className="pl-2 pr-1 py-1 h-7 gap-1">
                    {availability}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ml-1"
                      onClick={() => removeAvailabilityFilter(availability)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {availability} filter</span>
                    </Button>
                  </Badge>
                ))}
                
                {filters.performance !== null && (
                  <Badge variant="secondary" className="pl-2 pr-1 py-1 h-7 gap-1">
                    {getPerformanceFilterLabel(filters.performance)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ml-1"
                      onClick={removePerformanceFilter}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove performance filter</span>
                    </Button>
                  </Badge>
                )}
                
                {filters.onlyTopPerformers && (
                  <Badge variant="secondary" className="pl-2 pr-1 py-1 h-7 gap-1">
                    Top Performers
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ml-1"
                      onClick={removeTopPerformersFilter}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove top performers filter</span>
                    </Button>
                  </Badge>
                )}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Active filters display (visible on mobile and smaller screens) */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 sm:hidden mt-3">
          {filters.departments.map(department => (
            <Badge key={department} variant="secondary" className="pl-2 pr-1 py-1 h-7 gap-1">
              {department}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ml-1"
                onClick={() => removeDepartmentFilter(department)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {department} filter</span>
              </Button>
            </Badge>
          ))}
          
          {filters.availability.map(availability => (
            <Badge key={availability} variant="secondary" className="pl-2 pr-1 py-1 h-7 gap-1">
              {availability}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ml-1"
                onClick={() => removeAvailabilityFilter(availability)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {availability} filter</span>
              </Button>
            </Badge>
          ))}
          
          {filters.performance !== null && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 h-7 gap-1">
              {getPerformanceFilterLabel(filters.performance)}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ml-1"
                onClick={removePerformanceFilter}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove performance filter</span>
              </Button>
            </Badge>
          )}
          
          {filters.onlyTopPerformers && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 h-7 gap-1">
              Top Performers
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ml-1"
                onClick={removeTopPerformersFilter}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove top performers filter</span>
              </Button>
            </Badge>
          )}
          
          {activeFilterCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters} 
              className="h-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Clear All
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default TeamFilters 