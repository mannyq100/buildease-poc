import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus, Filter } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { 
  ProjectMetrics, 
  ProjectFilters, 
  ProjectsList 
} from '@/components/projects';
import type { Project, ProjectStatus, ViewMode } from '@/types/project';
import { projectsData } from '@/data/projectsData';

/**
 * Projects - Main Projects page component
 */
export function Projects() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTab, setCurrentTab] = useState<'all' | ProjectStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(projectsData);
  const [view, setView] = useState<ViewMode>('grid');
  
  // Check dark mode on component mount and whenever it might change
  useEffect(() => {
    function checkDarkMode() {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
    
    // Check on mount
    checkDarkMode();
    
    // Set up a mutation observer to watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Clean up observer on unmount
    return () => observer.disconnect();
  }, []);

  // Filter projects when tab or search changes
  useEffect(() => {
    let filtered = projectsData;
    
    // Filter by status
    if (currentTab !== 'all') {
      filtered = filtered.filter(project => project.status === currentTab);
    }
    
    // Filter by search
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(term) ||
        project.client.toLowerCase().includes(term) ||
        project.location.toLowerCase().includes(term) ||
        project.type.toLowerCase().includes(term)
      );
    }
    
    setFilteredProjects(filtered);
  }, [currentTab, searchTerm]);
  
  // Calculate total budget and spent amounts
  const totalBudget = projectsData.reduce((acc, project) => acc + project.budget, 0);
  const totalSpent = projectsData.reduce((acc, project) => acc + project.spent, 0);
  const spentPercentage = (totalSpent / totalBudget) * 100;

  // Handler functions
  function resetFilters() {
    setCurrentTab('all');
    setSearchTerm('');
  }
  
  function handleCreateProject() {
    navigate('/create-project');
  }
  
  function handleViewDetails(id: string | number) {
    navigate(`/project/${id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-0">
        {/* Quick Actions */}
        <div className="flex justify-end gap-2 mb-6">
          <Button 
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300"
          >
            <Filter className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
        
        <PageHeader
          title="Projects"
          description="Manage and monitor all your construction projects"
          icon={<Briefcase className="h-8 w-8" />}
          actions={
            <Button 
              variant="default" 
              className="bg-white hover:bg-gray-100 text-blue-700 border border-white/20"
              onClick={handleCreateProject}
            >
              <Plus className="mr-2 h-4 w-4" /> Create Project
            </Button>
          }
        />

        {/* Project Metrics */}
        <ProjectMetrics
          totalProjects={projectsData.length}
          completedProjects={projectsData.filter(p => p.status === 'completed').length}
          totalBudget={totalBudget}
          totalSpent={totalSpent}
          spentPercentage={spentPercentage}
          activeProjects={projectsData.filter(p => p.status === 'active').length}
          className="mb-8"
        />

        {/* Project Filters */}
        <ProjectFilters
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          resetFilters={resetFilters}
          className="mb-6"
        />

        {/* Projects List */}
        <ProjectsList
          projects={filteredProjects}
          view={view}
          onViewDetails={handleViewDetails}
          emptyStateAction={handleCreateProject}
          className="mb-8"
        />
      </div>
    </div>
  );
} 