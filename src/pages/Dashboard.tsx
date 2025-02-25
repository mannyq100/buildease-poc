import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Home, 
  Plus, 
  Package, 
  TrendingUp, 
  Users, 
  FileText, 
  ChevronRight,
  LayoutDashboard,
  Clock,
  AlertTriangle,
  BarChart3,
  Building,
  Construction,
  Stars,
  Search,
  Sparkles,
  ArrowRight,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardSection } from '@/components/layout/DashboardSection';
import { PageHeader } from '@/components/shared/PageHeader';
import { 
  MetricCard, 
  ActivityItem, 
  PhaseCard, 
  InsightItem 
} from '@/components/shared';
import { motion } from 'framer-motion';
import { HorizontalNav, type NavItem } from '@/components/navigation/HorizontalNav';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
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

  // Nav items for projects filter
  const projectNavItems: NavItem[] = [
    {
      label: "All Projects",
      path: "/projects?filter=all",
      icon: <LayoutDashboard className="h-4 w-4" />,
      badge: {
        text: "12",
        color: "blue"
      }
    },
    {
      label: "In Progress",
      path: "/projects?filter=in-progress",
      icon: <Construction className="h-4 w-4" />,
      badge: {
        text: "8",
        color: "yellow"
      }
    },
    {
      label: "Completed",
      path: "/projects?filter=completed",
      icon: <CheckCircle className="h-4 w-4" />,
      badge: {
        text: "3",
        color: "green"
      }
    },
    {
      label: "On Hold",
      path: "/projects?filter=on-hold",
      icon: <AlertTriangle className="h-4 w-4" />,
      badge: {
        text: "1",
        color: "red"
      }
    }
  ];

  // Breadcrumb items for the page header
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' }
  ];

  return (
    <DashboardLayout withGradient>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative mb-8"
      >
        <div 
          className={cn(
            "absolute inset-0 -mx-8 -mt-4 h-[280px] bg-gradient-to-br opacity-20 rounded-b-3xl", 
            isDarkMode 
              ? "from-indigo-900 via-blue-900 to-indigo-950" 
              : "from-blue-100 via-indigo-100 to-purple-100"
          )}
        />
        
        <PageHeader
          className="mb-3 relative z-10"
          title={
            <span className="flex items-center gap-2">
              Projects Dashboard
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                <Sparkles className="h-5 w-5 inline" />
              </span>
            </span>
          }
          subtitle="Manage and monitor your construction projects"
          // breadcrumbs={breadcrumbItems}
          action={
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={() => navigate("/create-project")} 
                size="sm"
                className="group space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-xl border-0"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                <span>New Project</span>
              </Button>
            </motion.div>
          }
          backgroundVariant="transparent"
          animated
          size="lg"
        />
      </motion.div>
      
      {/* Project Overview Section */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <MetricCard
          icon={<LayoutDashboard className="h-5 w-5 text-blue-500" />}
          label="Active Projects"
          value="12"
          subtext="+3 from last month"
          trend="positive"
        />
        <MetricCard
          icon={<Users className="h-5 w-5 text-indigo-500" />}
          label="Team Members"
          value="24"
          subtext="+2 new this month"
          trend="positive"
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          label="Completion Rate"
          value="86%"
          subtext="+12% from last month"
          trend="positive"
        />
      </motion.div>

      {/* Filter and Search Section */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 sticky top-0 z-20 backdrop-blur-sm px-4 py-3 -mx-4 rounded-lg"
        style={{
          backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.8)'
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <HorizontalNav 
          items={projectNavItems} 
          showIcons={true} 
          size="md" 
          variant="glass" 
          animated={true}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative w-full md:w-auto min-w-[250px] group">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 group-hover:text-blue-500 transition-colors duration-200" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  className={cn(
                    "pl-10 transition-all duration-200 border-2",
                    isDarkMode 
                      ? "bg-slate-800/50 border-slate-700 focus:border-blue-500 text-white" 
                      : "bg-white/90 border-gray-200 focus:border-blue-500 text-black"
                  )}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Search for projects by name or client</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>

      {/* Projects Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <DashboardSection
          title={
            <span className="flex items-center">
              Current Projects
              <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                8 active
              </Badge>
            </span>
          }
          icon={<Building className="h-5 w-5" />}
          subtitle="Your active construction projects"
          variant="glass"
          className="mb-6"
          collapsible
          animate
        >
          <div className="space-y-5">
            <PhaseCard
              name="Villa Construction"
              progress={65}
              startDate="Jan 15, 2024"
              endDate="Aug 2024"
              status="in-progress"
              budget="$120,000"
              spent="$52,450"
              onClick={() => navigate("/project/1")}
            />
            <PhaseCard
              name="Office Renovation"
              progress={30}
              startDate="Feb 1, 2024"
              endDate="Oct 2024"
              status="in-progress"
              budget="$45,000"
              spent="$12,500"
              onClick={() => navigate("/project/2")}
            />
            <PhaseCard
              name="Apartment Complex"
              progress={12}
              startDate="Mar 1, 2024"
              endDate="Dec 2024"
              status="in-progress"
              budget="$350,000"
              spent="$42,000"
              onClick={() => navigate("/project/3")}
            />
          </div>
          <motion.div 
            className="mt-4 flex justify-center"
            whileHover={{ scale: 1.05 }}
          >
            <Button 
              variant="outline" 
              onClick={() => navigate("/projects")}
              className="group flex items-center gap-2 text-blue-600 border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30"
            >
              View All Projects 
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </DashboardSection>
      </motion.div>

      {/* Recent Activity & Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="h-full"
        >
          <DashboardSection
            title="Recent Activity"
            icon={<Clock className="h-5 w-5" />}
            subtitle="Latest actions across your projects"
            variant="outlined"
            collapsible
            animate
            className="h-full"
          >
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              <ActivityItem
                icon={<Package className="w-5 h-5" />}
                title="Material Delivered"
                description="20 bags of cement delivered"
                time="2 hours ago"
                project="Villa Construction"
                iconColor="blue"
              />
              <ActivityItem
                icon={<FileText className="w-5 h-5" />}
                title="Progress Photo Added"
                description="Foundation work progress"
                time="5 hours ago"
                project="Villa Construction"
                iconColor="indigo"
              />
              <ActivityItem
                icon={<FileText className="w-5 h-5" />}
                title="Document Updated"
                description="Updated construction timeline"
                time="Yesterday"
                project="Office Renovation"
                iconColor="purple"
              />
              <ActivityItem
                icon={<Users className="w-5 h-5" />}
                title="Team Updated"
                description="2 new team members added"
                time="2 days ago"
                project="Villa Construction"
                iconColor="green"
              />
              <ActivityItem
                icon={<TrendingUp className="w-5 h-5" />}
                title="Budget Updated"
                description="Approved additional $5,000"
                time="3 days ago"
                project="Office Renovation"
                iconColor="amber"
              />
            </div>
          </DashboardSection>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="h-full"
        >
          <DashboardSection
            title="Upcoming Deadlines"
            icon={<Calendar className="h-5 w-5" />}
            subtitle="Tasks that need attention soon"
            variant="highlight"
            collapsible
            animate
            className="h-full"
          >
            <div className="space-y-3">
              <DeadlineItem
                title="Foundation Inspection"
                project="Villa Construction"
                dueDate="Mar 15, 2024"
                daysLeft={5}
              />
              <DeadlineItem
                title="Material Order Deadline"
                project="Office Renovation"
                dueDate="Mar 20, 2024"
                daysLeft={10}
              />
              <DeadlineItem
                title="Team Allocation Update"
                project="Villa Construction"
                dueDate="Mar 25, 2024"
                daysLeft={15}
              />
            </div>
          </DashboardSection>
        </motion.div>
      </div>

      {/* Project Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mb-4"
      >
        <DashboardSection
          title="Project Insights"
          icon={<Sparkles className="h-5 w-5" />}
          subtitle="Key metrics and analytics from your projects"
          variant="gradient"
          collapsible
          animate
        >
          <div className="space-y-3">
            <InsightItem
              title="Resource Optimization"
              description="Schedule material deliveries 2 weeks before each phase to optimize inventory management"
              type="default"
            />
            <InsightItem
              title="Weather Alert"
              description="Forecasted rain next week may impact foundation work - consider rescheduling"
              type="alert"
            />
            <InsightItem
              title="Cost Savings"
              description="Bulk purchase of materials could save 12% on total cost"
              type="success"
            />
            <InsightItem
              title="Performance Improvement"
              description="Team productivity has increased by 8% this month after new scheduling system"
              type="performance"
            />
          </div>
        </DashboardSection>
      </motion.div>
    </DashboardLayout>
  );
};

// Deadline item component
interface DeadlineItemProps {
  title: string;
  project: string;
  dueDate: string;
  daysLeft: number;
}

const DeadlineItem: React.FC<DeadlineItemProps> = ({ title, project, dueDate, daysLeft }) => {
  // Calculate status based on days left
  const getStatus = () => {
    if (daysLeft <= 3) return 'critical';
    if (daysLeft <= 7) return 'warning';
    return 'normal';
  };
  
  const status = getStatus();
  
  const statusClasses = {
    critical: "bg-red-100/80 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-300",
    warning: "bg-yellow-100/80 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700/50 dark:text-yellow-300",
    normal: "bg-blue-100/80 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700/50 dark:text-blue-300"
  };

  const statusIcons = {
    critical: <AlertTriangle className="w-4 h-4 text-red-500" />,
    warning: <Clock className="w-4 h-4 text-yellow-500" />,
    normal: <Calendar className="w-4 h-4 text-blue-500" />
  };
  
  return (
    <motion.div 
      className={`p-3.5 rounded-lg border flex items-center justify-between transition-all duration-300 ${statusClasses[status]}`}
      whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {statusIcons[status]}
        </div>
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm mt-1 opacity-80">{project} • Due {dueDate}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2 font-medium text-sm">
        <span className={cn(
          "rounded-full px-2.5 py-0.5",
          status === 'critical' ? "bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300" :
          status === 'warning' ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" :
          "bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
        )}>
          {daysLeft} days left
        </span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </motion.div>
  );
};

export default Dashboard; 