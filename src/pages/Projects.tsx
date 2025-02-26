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
  AlertTriangle
} from 'lucide-react';
import { HorizontalNav, type NavItem } from '@/components/navigation/HorizontalNav';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-slate-900">
      {/* Fixed Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo and mobile menu button */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <HardHat className="h-6 w-6 text-[#1E3A8A]" />
              <span className="font-bold text-lg text-[#1E3A8A] hidden sm:inline-block">BuildEase</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-2",
                  item.path === '/projects' && "bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-[#1E3A8A]/20 dark:text-blue-400"
                )}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <Badge className="ml-1 bg-[#1E3A8A] text-white">{item.badge.text}</Badge>
                )}
              </Button>
            ))}
          </nav>

          {/* User Menu & Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar.png" alt="User" />
                    <AvatarFallback className="bg-[#1E3A8A] text-white">JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-slate-800"
            >
              <div className="flex flex-col space-y-1 p-2">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start",
                      item.path === '/projects' && "bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-[#1E3A8A]/20 dark:text-blue-400"
                    )}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                    {item.badge && (
                      <Badge className="ml-auto bg-[#1E3A8A] text-white">{item.badge.text}</Badge>
                    )}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] rounded-lg shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="mt-1 text-blue-100">Manage and monitor all your construction projects</p>
            </div>
            <Button onClick={() => navigate('/create-project')} className="bg-white text-[#1E3A8A] hover:bg-blue-50">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full lg:w-auto">
              <TabsList className="grid grid-cols-5 w-full lg:w-auto">
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
                  className="pl-9 w-full bg-white dark:bg-slate-800"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
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
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <Card 
                key={project.id} 
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                {/* Project Image with Status Badge Overlay */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={project.imageUrl} 
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="glass" className="backdrop-blur-md text-white border-none">
                      {project.type}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-[#1E1E1E] dark:text-white">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
                        {project.client} • {project.location}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 flex-1">
                  <div className="grid grid-cols-2 gap-4 mb-4 mt-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Budget</span>
                      <span className="font-semibold text-[#1E1E1E] dark:text-white">{formatCurrency(project.budget)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Spent</span>
                      <span className="font-semibold text-[#1E1E1E] dark:text-white">{formatCurrency(project.spent)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Start Date</span>
                      <span className="font-semibold text-[#1E1E1E] dark:text-white">{formatDate(project.startDate)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">End Date</span>
                      <span className="font-semibold text-[#1E1E1E] dark:text-white">{formatDate(project.endDate)}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-[#1E1E1E] dark:text-white">{project.progress}%</span>
                    </div>
                    <Progress 
                      value={project.progress} 
                      className="h-2"
                      style={{
                        background: isDarkMode ? 'rgba(30, 58, 138, 0.2)' : 'rgba(30, 58, 138, 0.1)'
                      }}
                    >
                      <div 
                        className="h-full" 
                        style={{
                          background: project.status === 'active' ? '#1E3A8A' : 
                                     project.status === 'planning' ? '#D97706' :
                                     project.status === 'completed' ? '#16A34A' :
                                     '#9333EA'
                        }}
                      />
                    </Progress>
                  </div>
                  
                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex -space-x-2">
                      {project.team.slice(0, 3).map((initials, i) => (
                        <Avatar key={i} className="border-2 border-white dark:border-slate-800 h-8 w-8">
                          <AvatarFallback className={cn(
                            project.status === 'active' ? 'bg-[#1E3A8A]' : 
                            project.status === 'planning' ? 'bg-[#D97706]' :
                            project.status === 'completed' ? 'bg-green-600' :
                            'bg-purple-600',
                            'text-white'
                          )}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.team.length > 3 && (
                        <Avatar className="border-2 border-white dark:border-slate-800 h-8 w-8">
                          <AvatarFallback className="bg-gray-500 text-white">
                            +{project.team.length - 3}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-[#1E3A8A] border-[#1E3A8A]"
                        onClick={() => navigate(`/project/${project.id}`)}
                      >
                        Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/project/${project.id}`)}>
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Project</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Duplicate</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 dark:text-red-400">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Project</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mb-4">
                <Briefcase className="h-6 w-6 text-[#1E3A8A]" />
              </div>
              <h3 className="text-lg font-medium text-[#1E1E1E] dark:text-white mb-2">No projects found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                We couldn't find any projects matching your current filters. Try adjusting your search or create a new project.
              </p>
              <Button onClick={() => navigate('/create-project')} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                <Plus className="mr-2 h-4 w-4" />
                Create New Project
              </Button>
            </div>
          )}
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/30">
                <Briefcase className="h-5 w-5 text-[#1E3A8A]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Projects</p>
                <p className="text-2xl font-bold text-[#1E1E1E] dark:text-white">{projectsData.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-full p-2 bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-[#1E1E1E] dark:text-white">
                  {projectsData.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-full p-2 bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-5 w-5 text-[#D97706]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-[#1E1E1E] dark:text-white">
                  {projectsData.filter(p => p.status === 'active' || p.status === 'planning').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-full p-2 bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">At Risk</p>
                <p className="text-2xl font-bold text-[#1E1E1E] dark:text-white">
                  {projectsData.filter(p => p.status === 'on-hold').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Projects; 