import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  Clock, 
  AlertTriangle, 
  Filter, 
  SlidersHorizontal, 
  ArrowUpDown,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Sample project data
const projectsData = [
  {
    id: 1,
    name: 'Residential Renovation',
    client: 'Johnson Family',
    location: 'Portland, OR',
    budget: '$175,000',
    spent: '$85,750',
    startDate: '2023-08-15',
    endDate: '2023-12-20',
    status: 'in-progress',
    progress: 65,
    team: 8,
    phases: 5,
    tasksCompleted: 28,
    totalTasks: 42,
    priority: 'high',
    lastUpdated: '2 hours ago',
    hasWarnings: true,
    image: 'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=3270&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Commercial Office Building',
    client: 'TechSpace Inc.',
    location: 'Seattle, WA',
    budget: '$2,500,000',
    spent: '$950,000',
    startDate: '2023-06-10',
    endDate: '2024-05-30',
    status: 'in-progress',
    progress: 38,
    team: 24,
    phases: 8,
    tasksCompleted: 56,
    totalTasks: 147,
    priority: 'medium',
    lastUpdated: '1 day ago',
    hasWarnings: false,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=3270&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Urban Apartment Complex',
    client: 'City Development Corp.',
    location: 'Chicago, IL',
    budget: '$8,750,000',
    spent: '$5,600,000',
    startDate: '2023-03-20',
    endDate: '2024-11-15',
    status: 'in-progress',
    progress: 52,
    team: 35,
    phases: 12,
    tasksCompleted: 103,
    totalTasks: 217,
    priority: 'high',
    lastUpdated: '3 days ago',
    hasWarnings: true,
    image: 'https://images.unsplash.com/photo-1545324418-9eda50022eb4?q=80&w=3270&auto=format&fit=crop'
  },
  {
    id: 4,
    name: 'Historic Building Restoration',
    client: 'Heritage Foundation',
    location: 'Boston, MA',
    budget: '$1,200,000',
    spent: '$450,000',
    startDate: '2023-09-05',
    endDate: '2024-06-30',
    status: 'in-progress',
    progress: 25,
    team: 12,
    phases: 6,
    tasksCompleted: 22,
    totalTasks: 98,
    priority: 'medium',
    lastUpdated: '5 hours ago',
    hasWarnings: false,
    image: 'https://images.unsplash.com/photo-1531972111897-7fea57a2523e?q=80&w=3271&auto=format&fit=crop'
  },
  {
    id: 5,
    name: 'School Gymnasium Addition',
    client: 'Westlake School District',
    location: 'Denver, CO',
    budget: '$950,000',
    spent: '$925,000',
    startDate: '2023-05-15',
    endDate: '2023-11-30',
    status: 'completed',
    progress: 100,
    team: 14,
    phases: 4,
    tasksCompleted: 87,
    totalTasks: 87,
    priority: 'low',
    lastUpdated: '1 week ago',
    hasWarnings: false,
    image: 'https://images.unsplash.com/photo-1505318855053-02442b3fb5a7?q=80&w=3270&auto=format&fit=crop'
  },
  {
    id: 6,
    name: 'Hospital Wing Expansion',
    client: 'Central Medical Center',
    location: 'Minneapolis, MN',
    budget: '$5,300,000',
    spent: '$125,000',
    startDate: '2023-12-01',
    endDate: '2025-03-15',
    status: 'upcoming',
    progress: 5,
    team: 28,
    phases: 10,
    tasksCompleted: 8,
    totalTasks: 175,
    priority: 'high',
    lastUpdated: '12 hours ago',
    hasWarnings: false,
    image: 'https://images.unsplash.com/photo-1626315869436-d6781ba69d6e?q=80&w=3270&auto=format&fit=crop'
  }
];

const Projects = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('grid');

  // Filter projects based on search query and active filter
  const filteredProjects = projectsData.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'in-progress') return matchesSearch && project.status === 'in-progress';
    if (activeFilter === 'completed') return matchesSearch && project.status === 'completed';
    if (activeFilter === 'upcoming') return matchesSearch && project.status === 'upcoming';
    if (activeFilter === 'warnings') return matchesSearch && project.hasWarnings;
    return matchesSearch;
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'in-progress':
        return {
          label: 'In Progress',
          color: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400'
        };
      case 'upcoming':
        return {
          label: 'Upcoming',
          color: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400'
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400'
        };
    }
  };

  const handleViewProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Projects</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage and monitor your construction projects</p>
      </div>

      {/* Actions Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search projects..." 
            className="pl-10 w-full md:w-80" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter size={16} />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActiveFilter('all')} className={activeFilter === 'all' ? 'bg-gray-100 dark:bg-gray-800' : ''}>
                All Projects
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter('in-progress')} className={activeFilter === 'in-progress' ? 'bg-gray-100 dark:bg-gray-800' : ''}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter('completed')} className={activeFilter === 'completed' ? 'bg-gray-100 dark:bg-gray-800' : ''}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter('upcoming')} className={activeFilter === 'upcoming' ? 'bg-gray-100 dark:bg-gray-800' : ''}>
                Upcoming
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveFilter('warnings')} className={activeFilter === 'warnings' ? 'bg-gray-100 dark:bg-gray-800' : ''}>
                <AlertTriangle size={16} className="mr-2 text-yellow-500" />
                With Warnings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" className="gap-2">
            <SlidersHorizontal size={16} />
            <span>Sort</span>
          </Button>

          <Tabs defaultValue="grid" value={activeTab} onValueChange={setActiveTab} className="hidden md:block">
            <TabsList>
              <TabsTrigger value="grid" className="px-3">
                <div className="grid grid-cols-3 gap-0.5 h-3 w-8">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </TabsTrigger>
              <TabsTrigger value="list" className="px-3">
                <div className="flex flex-col gap-0.5 h-3 w-8">
                  <div className="bg-current rounded-sm h-0.5"></div>
                  <div className="bg-current rounded-sm h-0.5"></div>
                  <div className="bg-current rounded-sm h-0.5"></div>
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button className="gap-2 ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
            <Plus size={16} />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setActiveFilter('all')}
          className={activeFilter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          All Projects
        </Button>
        <Button
          variant={activeFilter === 'in-progress' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setActiveFilter('in-progress')}
          className={activeFilter === 'in-progress' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          In Progress
        </Button>
        <Button
          variant={activeFilter === 'completed' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setActiveFilter('completed')}
          className={activeFilter === 'completed' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          Completed
        </Button>
        <Button
          variant={activeFilter === 'upcoming' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setActiveFilter('upcoming')}
          className={activeFilter === 'upcoming' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          Upcoming
        </Button>
        <Button
          variant={activeFilter === 'warnings' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setActiveFilter('warnings')}
          className={activeFilter === 'warnings' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
        >
          <AlertTriangle size={14} className="mr-1" />
          With Warnings
        </Button>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="grid" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id}
                project={project}
                onClick={() => handleViewProject(project.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="m-0">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Project</th>
                      <th className="text-left p-4 font-medium">Client</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Progress</th>
                      <th className="text-left p-4 font-medium">Budget</th>
                      <th className="text-left p-4 font-medium">Team</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => {
                      const status = getStatusConfig(project.status);
                      return (
                        <tr key={project.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="p-4">
                            <div className="font-medium">{project.name}</div>
                            <div className="text-sm text-gray-500">{project.location}</div>
                          </td>
                          <td className="p-4">
                            <div>{project.client}</div>
                          </td>
                          <td className="p-4">
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Progress value={project.progress} className="h-2 w-24" />
                              <span className="text-sm">{project.progress}%</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{project.budget}</div>
                            <div className="text-sm text-gray-500">
                              Spent: {project.spent}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Users size={14} />
                              <span>{project.team}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewProject(project.id)}
                              >
                                View
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">Archive</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Empty state when no projects match filters */}
      {filteredProjects.length === 0 && (
        <Card className="bg-gray-50 border-dashed dark:bg-gray-800/50">
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <Building size={48} className="text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No projects found</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              We couldn't find any projects matching your current filters. Try adjusting your search or filters.
            </p>
            <Button onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}>
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ProjectCard Component
const ProjectCard = ({ project, onClick }) => {
  const status = getStatusConfig(project.status);
  
  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (progress >= 75) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (progress >= 50) return 'bg-gradient-to-r from-indigo-500 to-blue-500';
    if (progress >= 25) return 'bg-gradient-to-r from-purple-500 to-indigo-500';
    return 'bg-gradient-to-r from-slate-500 to-gray-500';
  };

  function getStatusConfig(status) {
    switch (status) {
      case 'in-progress':
        return {
          label: 'In Progress',
          color: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
          icon: <Clock className="w-3.5 h-3.5" />
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />
        };
      case 'upcoming':
        return {
          label: 'Upcoming',
          color: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400',
          icon: <Calendar className="w-3.5 h-3.5" />
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400',
          icon: null
        };
    }
  }
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden h-full cursor-pointer hover:shadow-lg transition-shadow duration-300 flex flex-col" onClick={onClick}>
        <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
          <img 
            src={project.image} 
            alt={project.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute left-4 bottom-4 right-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-white font-semibold text-xl truncate mb-1">{project.name}</h3>
                <div className="flex items-center text-white/80 text-sm">
                  <Building className="w-3 h-3 mr-1" />
                  <span>{project.location}</span>
                </div>
              </div>
              <Badge className={cn("flex items-center gap-1", status.color)}>
                {status.icon}
                <span>{status.label}</span>
              </Badge>
            </div>
          </div>
          {project.hasWarnings && (
            <div className="absolute top-4 right-4">
              <div className="bg-yellow-100 text-yellow-700 p-1.5 rounded-full">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
        
        <CardContent className="py-4 flex-grow">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
              <span className="text-sm font-medium">{project.progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full", getProgressColor(project.progress))} 
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Budget</div>
              <div className="font-medium">{project.budget}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Spent</div>
              <div className="font-medium">{project.spent}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Team</div>
              <div className="font-medium flex items-center">
                <Users className="w-4 h-4 mr-1.5" />
                {project.team}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tasks</div>
              <div className="font-medium">{project.tasksCompleted}/{project.totalTasks}</div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-0 pb-4 border-t">
          <div className="flex items-center justify-between w-full text-sm">
            <span className="text-gray-500">Client: {project.client}</span>
            <span className="text-gray-500">Updated {project.lastUpdated}</span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default Projects; 