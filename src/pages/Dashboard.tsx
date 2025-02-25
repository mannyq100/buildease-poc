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
  Search
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
      icon: <Stars className="h-4 w-4" />,
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
      <PageHeader
      className="mb-3"
        title="Projects Dashboard"
        subtitle="Manage and monitor your construction projects"
        breadcrumbs={breadcrumbItems}
        action={
          <Button 
            onClick={() => navigate("/create-project")} 
            size="sm"
            className="group space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>New Project</span>
          </Button>
        }
        backgroundVariant="gradient"
        animated
        size="lg"
      />
      
      {/* Project Overview Section */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <MetricCard
          icon={<LayoutDashboard className="h-5 w-5 text-blue-500" />}
          label="Active Projects"
          value="12"
          subtext="+3 from last month"
        />
        <MetricCard
          icon={<Users className="h-5 w-5 text-indigo-500" />}
          label="Team Members"
          value="24"
          subtext="+2 new this month"
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          label="Completion Rate"
          value="86%"
          subtext="+12% from last month"
        />
      </motion.div>

      {/* Filter and Search Section */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
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
        <div className="relative w-full md:w-auto min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search projects..."
            className={`pl-9 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/90'} rounded-md`}
          />
        </div>
      </motion.div>

      {/* Projects Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <DashboardSection
          title="Current Projects"
          icon={<Building className="h-5 w-5" />}
          subtitle="Your active construction projects"
          variant="glass"
          className="mb-6"
          collapsible
          animate
        >
          <div className="space-y-4">
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
        </DashboardSection>
      </motion.div>

      {/* Recent Activity & Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <DashboardSection
            title="Recent Activity"
            icon={<Clock className="h-5 w-5" />}
            subtitle="Latest actions across your projects"
            variant="outlined"
            collapsible
            animate
          >
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              <ActivityItem
                icon={<Package className="w-5 h-5" />}
                title="Material Delivered"
                description="20 bags of cement delivered"
                time="2 hours ago"
                project="Villa Construction"
              />
              <ActivityItem
                icon={<FileText className="w-5 h-5" />}
                title="Progress Photo Added"
                description="Foundation work progress"
                time="5 hours ago"
                project="Villa Construction"
              />
              <ActivityItem
                icon={<FileText className="w-5 h-5" />}
                title="Document Updated"
                description="Updated construction timeline"
                time="Yesterday"
                project="Office Renovation"
              />
              <ActivityItem
                icon={<Users className="w-5 h-5" />}
                title="Team Updated"
                description="2 new team members added"
                time="2 days ago"
                project="Villa Construction"
              />
              <ActivityItem
                icon={<TrendingUp className="w-5 h-5" />}
                title="Budget Updated"
                description="Approved additional $5,000"
                time="3 days ago"
                project="Office Renovation"
              />
            </div>
          </DashboardSection>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <DashboardSection
            title="Upcoming Deadlines"
            icon={<AlertTriangle className="h-5 w-5" />}
            subtitle="Tasks that need attention soon"
            variant="highlight"
            collapsible
            animate
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
      >
        <DashboardSection
          title="Project Insights"
          icon={<BarChart3 className="h-5 w-5" />}
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
  
  return (
    <motion.div 
      className={`p-3 rounded-lg border flex items-center justify-between transition-all duration-300 ${statusClasses[status]}`}
      whileHover={{ scale: 1.02, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
    >
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm mt-1">{project} • Due {dueDate}</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">{daysLeft} days left</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </motion.div>
  );
};

export default Dashboard; 