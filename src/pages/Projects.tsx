import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  HardHat,
  Plus, 
  CalendarDays, 
  Users, 
  Building,
  DollarSign, 
  Clock, 
  Filter, 
  Search, 
  ChevronRight, 
  MoreVertical,
  Briefcase,
  ArrowUpRight,
  Edit,
  Trash2,
  Copy,
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Calendar,
  Package,
  CheckCircle,
  AlertTriangle,
  PieChart,
  BarChart,
  Activity,
  LayoutGrid,
  List,
  CheckSquare
} from 'lucide-react';
import { HorizontalNav, type NavItem } from '@/components/navigation/HorizontalNav';
import { cn } from '@/lib/utils';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/shared';
import { usePageActions } from '@/hooks/usePageActions';
import { Project, ProjectStatus, ViewMode } from '@/types/project';
import { projectsData } from '@/data/projectsData';
import { StatCard } from '@/components/shared/StatCard'

// Animation variants for metrics cards
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0, 
    opacity: 1
  }
}

// Main component
export function Projects() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-0">
        {/* Quick Actions */}
        <div className="flex justify-end gap-2 mb-6">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setSearchTerm('')}
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
              onClick={() => navigate('/create-project')}
            >
              <Plus className="mr-2 h-4 w-4" /> Create Project
            </Button>
          }
        />

        {/* Project Statistics */}
        <m.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <m.div variants={itemVariants} className="h-full">
            <StatCard
              title="Total Projects"
              value={projectsData.length}
              icon={<Briefcase className="h-6 w-6" />}
              color="blue"
              subtitle="projects"
            />
          </m.div>
          
          <m.div variants={itemVariants} className="h-full">
            <StatCard
              title="Completed Projects"
              value={projectsData.filter(p => p.status === 'completed').length}
              icon={<CheckSquare className="h-6 w-6" />}
              color="green"
              subtitle="100% complete"
            />
          </m.div>
          
          <m.div variants={itemVariants} className="h-full">
            <StatCard
              title="Budget"
              value={formatNumberWithCommas(`$${Math.round(totalBudget / 1000)}K`)}
              icon={<DollarSign className="h-6 w-6" />}
              color="amber"
              subtitle={`$${formatNumberWithCommas(Math.round(totalSpent / 1000))}K spent`}
            />
          </m.div>
          
          <m.div variants={itemVariants} className="h-full">
            <StatCard
              title="Progress"
              value={`${Math.round(spentPercentage)}%`}
              icon={<PieChart className="h-6 w-6" />}
              color="purple"
              subtitle={`${projectsData.filter(p => p.status === 'active').length} active projects`}
            />
          </m.div>
        </m.div>

        {/* Filters and Controls */}
        <Card className="mb-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search projects..." 
                  className="pl-10 bg-white/80 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="md:col-span-2">
                <Tabs value={currentTab} onValueChange={(value: string) => setCurrentTab(value as 'all' | ProjectStatus)} className="w-full">
                  <TabsList className="grid grid-cols-5 w-full bg-gray-100/70 dark:bg-slate-700/50 p-1">
                    <TabsTrigger value="all" className="text-sm">All Projects</TabsTrigger>
                    <TabsTrigger value="active" className="text-sm">Active</TabsTrigger>
                    <TabsTrigger value="planning" className="text-sm">Planning</TabsTrigger>
                    <TabsTrigger value="completed" className="text-sm">Completed</TabsTrigger>
                    <TabsTrigger value="upcoming" className="text-sm">Upcoming</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant={view === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('grid')}
                  className="flex items-center"
                >
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  Grid
                </Button>
                <Button
                  variant={view === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('list')}
                  className="flex items-center"
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <ProjectsList
          filteredProjects={filteredProjects}
          view={view}
          setView={setView}
          navigate={navigate}
        />
      </div>
    </div>
  );
}

// Helper functions
function getStatusBadge(status: ProjectStatus) {
    switch(status) {
      case 'active':
        return <Badge className="bg-[#1E3A8A] text-white">Active</Badge>;
      case 'planning':
        return <Badge className="bg-[#D97706] text-white">Planning</Badge>;
      case 'completed':
        return <Badge className="bg-green-600 text-white">Completed</Badge>;
      case 'upcoming':
        return <Badge className="bg-purple-600 text-white">Upcoming</Badge>;
      case 'on-hold':
        return <Badge className="bg-red-600 text-white">On Hold</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString: string) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' } as Intl.DateTimeFormatOptions;
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Helper function to format numbers with commas
function formatNumberWithCommas(number: string | number): string {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Component interfaces
interface ProjectSummaryStatsProps {
  projectsCount: number
  completedCount: number
  inProgressCount: number
  totalBudget: number
  totalSpent: number
  spentPercentage: number
  isDarkMode: boolean
}

interface SummaryCardProps {
  title: string
  value: number
  valueLabel?: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'amber' | 'purple' | 'red'
  isDarkMode: boolean
  footer: React.ReactNode
}

interface ProjectFiltersProps {
  currentTab: 'all' | ProjectStatus
  setCurrentTab: (tab: 'all' | ProjectStatus) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
}

interface ProjectsListProps {
  filteredProjects: Project[]
  view: ViewMode
  setView: (view: ViewMode) => void
  navigate: ReturnType<typeof useNavigate>
}

// Subcomponents
function ProjectFilters({
  currentTab,
  setCurrentTab,
  searchTerm,
  setSearchTerm
}: ProjectFiltersProps) {
  return (
            <m.div 
              className="mt-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-white/80 dark:bg-slate-800/80 shadow-xl backdrop-blur-sm border-0 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full lg:w-auto">
                      <TabsList className="grid grid-cols-5 w-full lg:w-auto bg-gray-100/70 dark:bg-slate-700/50 p-1">
                        <TabsTrigger value="all" className="text-sm">All Projects</TabsTrigger>
                        <TabsTrigger value="active" className="text-sm">Active</TabsTrigger>
                        <TabsTrigger value="planning" className="text-sm">Planning</TabsTrigger>
                        <TabsTrigger value="completed" className="text-sm">Completed</TabsTrigger>
                        <TabsTrigger value="upcoming" className="text-sm">Upcoming</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    
                    <div className="flex w-full lg:w-auto items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search projects..." 
                          className="pl-9 w-full bg-white/80 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600 rounded-full"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="rounded-full bg-white/80 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600">
                            <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Filter by Client</DropdownMenuItem>
                          <DropdownMenuItem>Filter by Location</DropdownMenuItem>
                          <DropdownMenuItem>Filter by Type</DropdownMenuItem>
              <DropdownMenuSeparator />
                          <DropdownMenuItem>Clear Filters</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
                </div>
                </div>
                </CardContent>
              </Card>
            </m.div>
  )
}

function ProjectsList({
  filteredProjects,
  view,
  setView,
  navigate
}: ProjectsListProps) {
  return (
            <m.div 
              className="mt-8 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
      >
              {filteredProjects.length === 0 ? (
        <EmptyProjectsState navigate={navigate} />
      ) : (
        view === 'grid' ? (
          <ProjectsGridView projects={filteredProjects} navigate={navigate} />
        ) : (
          <ProjectsListView projects={filteredProjects} navigate={navigate} />
        )
      )}
    </m.div>
  )
}

function EmptyProjectsState({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                      We couldn't find any projects matching your search criteria. Try adjusting your filters or create a new project.
                    </p>
                    <Button onClick={() => navigate('/create-project')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Project
        </Button>
                  </div>
                </div>
  )
}

function ProjectsGridView({ 
  projects, 
  navigate 
}: { 
  projects: Project[]
  navigate: ReturnType<typeof useNavigate>
}) {
  return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          navigate={navigate} 
        />
      ))}
    </div>
  )
}

function ProjectCard({ 
  project, 
  navigate 
}: {
  project: Project
  navigate: ReturnType<typeof useNavigate>
}) {
  return (
                      <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div 
                          className="h-40 bg-cover bg-center" 
                          style={{ backgroundImage: `url(${project.imageUrl})` }}
                        >
                          <div className="h-full w-full bg-gradient-to-b from-transparent to-black/60 p-4 flex flex-col justify-end">
                            <div className="flex justify-between items-center">
                              <Badge variant="outline" className="bg-white/20 backdrop-blur-sm text-white border-white/10">
                                {project.type}
                              </Badge>
                              {getStatusBadge(project.status)}
                            </div>
                          </div>
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{project.name}</CardTitle>
                              <CardDescription>{project.client}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="grid grid-cols-2 gap-y-2 text-sm mb-2">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Budget:</span>
                              <div className="font-medium">{formatCurrency(project.budget)}</div>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Timeline:</span>
                              <div className="font-medium">{formatDate(project.startDate)} - {formatDate(project.endDate)}</div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-500 dark:text-gray-400">Progress</span>
                              <span>{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2 flex justify-between border-t">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/project/${project.id}`)}>
                            View Details
        </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
        </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuItem>Archive</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardFooter>
                      </Card>
  )
}

function ProjectsListView({ 
  projects, 
  navigate 
}: { 
  projects: Project[]
  navigate: ReturnType<typeof useNavigate>
}) {
  return (
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Project
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Budget
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Timeline
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Progress
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Actions
                            </th>
                      </tr>
                    </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
            {projects.map((project) => (
                            <tr 
                            key={project.id} 
                              className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer"
                              onClick={() => navigate(`/project/${project.id}`)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0 mr-3">
                                    <img 
                                      className="h-10 w-10 rounded-md object-cover" 
                                      src={project.imageUrl} 
                                      alt={project.name} 
                                    />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {project.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {project.client}
                                    </div>
                                  </div>
                              </div>
                            </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(project.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(project.budget)}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatCurrency(project.spent)} spent
                              </div>
                            </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(project.startDate)} - {formatDate(project.endDate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="mr-2 text-sm font-medium text-gray-900 dark:text-white">
                                    {project.progress}%
                                  </div>
                                  <div className="w-24">
                                    <Progress value={project.progress} className="h-2" />
                                  </div>
                              </div>
                            </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                    onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/project/${project.id}`)
                                    }}
                                  >
                                    Details
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                          <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                      <DropdownMenuItem>Archive</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
                  </div>
                )
} 