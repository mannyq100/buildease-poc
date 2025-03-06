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
  MoreHorizontal
} from 'lucide-react';
import { HorizontalNav, type NavItem } from '@/components/navigation/HorizontalNav';
import { cn } from '@/lib/utils';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/shared';
import { usePageActions } from '@/hooks/usePageActions';

// Sample project data
const projectsData = [
  {
    id: 1,
    name: 'Residential Renovation',
    client: 'Johnson Family',
    location: 'Austin, TX',
    type: 'Residential',
    budget: 120000,
    spent: 42500,
    status: 'active',
    progress: 75,
    startDate: '2023-12-15',
    endDate: '2024-08-30',
    team: ['JD', 'MB', 'TS'],
    description: 'Complete renovation of a 2-story family home including kitchen, bathrooms, and outdoor deck.',
    tasks: { total: 42, completed: 28 },
    imageUrl: 'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    name: 'Commercial Office Space',
    client: 'TechStart Inc.',
    location: 'Dallas, TX',
    type: 'Commercial',
    budget: 450000,
    spent: 112000,
    status: 'planning',
    progress: 25,
    startDate: '2024-02-01',
    endDate: '2024-12-10',
    team: ['AW', 'RL'],
    description: 'Development of a new 5-floor office building with modern amenities and eco-friendly design.',
    tasks: { total: 64, completed: 12 },
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 3,
    name: 'Lakeside Apartment Complex',
    client: 'Urban Dwellings LLC',
    location: 'Houston, TX',
    type: 'Residential',
    budget: 3500000,
    spent: 420000,
    status: 'active',
    progress: 12,
    startDate: '2024-03-01',
    endDate: '2025-06-30',
    team: ['JD', 'KL', 'MB', 'TS'],
    description: 'Construction of a luxury apartment complex with 24 units, swimming pool, and fitness center.',
    tasks: { total: 108, completed: 14 },
    imageUrl: 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 4,
    name: 'Historic Building Restoration',
    client: 'City of San Antonio',
    location: 'San Antonio, TX',
    type: 'Restoration',
    budget: 750000,
    spent: 215000,
    status: 'active',
    progress: 28,
    startDate: '2024-01-20',
    endDate: '2025-01-15',
    team: ['AW', 'KL', 'RL'],
    description: 'Careful restoration of a 19th century building while preserving its historical architecture and features.',
    tasks: { total: 86, completed: 24 },
    imageUrl: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 5,
    name: 'Shopping Mall Extension',
    client: 'Retail Properties Group',
    location: 'Fort Worth, TX',
    type: 'Commercial',
    budget: 2800000,
    spent: 0,
    status: 'upcoming',
    progress: 0,
    startDate: '2024-08-01',
    endDate: '2025-12-15',
    team: [],
    description: 'Addition of a new wing to an existing shopping mall, including 15 retail spaces and a food court.',
    tasks: { total: 94, completed: 0 },
    imageUrl: 'https://images.unsplash.com/photo-1581281658135-64230e4909f1?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 6,
    name: 'Public Library Remodel',
    client: 'Austin Public Library',
    location: 'Austin, TX',
    type: 'Public',
    budget: 1200000,
    spent: 1190000,
    status: 'completed',
    progress: 100,
    startDate: '2023-05-10',
    endDate: '2024-01-20',
    team: ['JD', 'TS'],
    description: 'Complete remodeling of the central public library with modern technologies and accessibility features.',
    tasks: { total: 72, completed: 72 },
    imageUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=60'
  }
];

const Projects = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(projectsData);
  const [view, setView] = useState('grid');
  
  // Check dark mode on component mount and whenever it might change
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
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
  
  // Navigation items
  const navItems: NavItem[] = [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" /> 
    },
    { 
      label: 'Projects', 
      path: '/projects', 
      icon: <Briefcase className="w-5 h-5" />,
      badge: {
        text: '4',
        color: 'blue'
      }
    },
    { 
      label: 'Schedule', 
      path: '/schedule', 
      icon: <Calendar className="w-5 h-5" /> 
    },
    { 
      label: 'Materials', 
      path: '/materials', 
      icon: <Package className="w-5 h-5" /> 
    },
    { 
      label: 'Expenses', 
      path: '/expenses', 
      icon: <DollarSign className="w-5 h-5" /> 
    }
  ];

  // Get status badge based on project status
  const getStatusBadge = (status) => {
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
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' } as Intl.DateTimeFormatOptions;
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate total budget and spent amounts
  const totalBudget = projectsData.reduce((acc, project) => acc + project.budget, 0);
  const totalSpent = projectsData.reduce((acc, project) => acc + project.spent, 0);
  const spentPercentage = (totalSpent / totalBudget) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-0">
        <PageHeader
          title="Projects"
          subtitle="Manage and monitor all your construction projects"
          icon={<Briefcase className="h-6 w-6" />}
          gradient={true}
          animated={true}
          actions={[
            {
              label: "Create Project",
              icon: <Plus />,
              variant: "construction",
              onClick: () => navigate('/create-project')
            }
          ]}
        />

        <LazyMotion features={domAnimation}>
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Summary Stats - Moved to top */}
            <m.div 
              className="mt-8"
              initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <m.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="col-span-1"
                >
                  <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900/30 shadow-inner">
                          <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Projects</p>
                          <div className="flex items-end gap-1">
                            <p className="text-3xl font-bold text-blue-900 dark:text-white">{projectsData.length}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-blue-100 dark:border-blue-900/30">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-blue-600 dark:text-blue-400">View all projects</span>
                          <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </m.div>

                <m.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="col-span-1"
                >
                  <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full p-3 bg-green-100 dark:bg-green-900/30 shadow-inner">
                          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">Completed Projects</p>
                          <div className="flex items-end gap-1">
                            <p className="text-3xl font-bold text-green-900 dark:text-white">
                              {projectsData.filter(p => p.status === 'completed').length}
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400 pb-1">
                              /{projectsData.length}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-green-100 dark:border-green-900/30">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">Completion rate</span>
                          <span className="text-xs font-bold text-green-600 dark:text-green-400">
                            {Math.round((projectsData.filter(p => p.status === 'completed').length / projectsData.length) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={(projectsData.filter(p => p.status === 'completed').length / projectsData.length) * 100} 
                          className="h-1.5 mt-2 bg-green-100 dark:bg-green-900/30"
                        >
                          <div className="h-full bg-green-500 dark:bg-green-400" />
                        </Progress>
                      </div>
                    </CardContent>
                  </Card>
                </m.div>

                <m.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="col-span-1"
                >
                  <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full p-3 bg-amber-100 dark:bg-amber-900/30 shadow-inner">
                          <Activity className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">In Progress</p>
                          <div className="flex items-end gap-1">
                            <p className="text-3xl font-bold text-amber-900 dark:text-white">
                              {projectsData.filter(p => p.status === 'active' || p.status === 'planning').length}
                            </p>
                            <p className="text-sm text-amber-600 dark:text-amber-400 pb-1">
                              projects
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-amber-100 dark:border-amber-900/30">
                        <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {projectsData.filter(p => p.status === 'active').length} active,&nbsp;
                            {projectsData.filter(p => p.status === 'planning').length} planning
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </m.div>

                <m.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="col-span-1"
                >
                  <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900/30 shadow-inner">
                          <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Budget Utilization</p>
                          <div className="flex items-end gap-1">
                            <p className="text-3xl font-bold text-purple-900 dark:text-white">
                              {Math.round(spentPercentage)}%
                            </p>
                            <p className="text-sm text-purple-600 dark:text-purple-400 pb-1">
                              used
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-900/30">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                            {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)}
                          </span>
          </div>
                        <Progress 
                          value={spentPercentage} 
                          className="h-1.5 mt-2 bg-purple-100 dark:bg-purple-900/30"
                        >
                          <div className="h-full bg-purple-500 dark:bg-purple-400" />
                        </Progress>
        </div>
                    </CardContent>
                  </Card>
                </m.div>
        </div>
            </m.div>

            {/* Filters and Controls */}
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

            {/* Projects Grid */}
            <m.div 
              className="mt-8 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
      >
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
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

              {filteredProjects.length === 0 ? (
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
              ) : (
                view === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
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
                                <MoreHorizontal className="h-4 w-4" />
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
                    ))}
                  </div>
                ) : (
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
                          {filteredProjects.map((project) => (
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
                                      e.stopPropagation();
                                      navigate(`/project/${project.id}`);
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
                                        <MoreHorizontal className="h-4 w-4" />
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
              )}
            </m.div>
          </m.div>
        </LazyMotion>
      </div>
    </div>
  );
};

export default Projects; 