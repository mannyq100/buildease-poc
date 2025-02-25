import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/shared';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Building, 
  Clock, 
  FileText, 
  Package, 
  Settings, 
  Plus,
  ChevronRight,
  BarChart3,
  Home,
  MessageSquare,
  Image,
  Briefcase
} from 'lucide-react';
import { 
  PageHeader, 
  MetricCard, 
  PhaseCard, 
  ActivityItem, 
  InsightItem 
} from '@/components/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardSection } from '@/components/layout/DashboardSection';
import { HorizontalNav, type NavItem } from '@/components/navigation/HorizontalNav';
import { motion } from 'framer-motion';

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
  
  // Project navigation tabs
  const projectNavItems: NavItem[] = [
    {
      label: "Overview",
      path: `/project/${id}?tab=overview`,
      icon: <Home className="h-4 w-4" />
    },
    {
      label: "Schedule",
      path: `/project/${id}?tab=schedule`,
      icon: <Calendar className="h-4 w-4" />
    },
    {
      label: "Budget",
      path: `/project/${id}?tab=budget`,
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      label: "Team",
      path: `/project/${id}?tab=team`,
      icon: <Users className="h-4 w-4" />
    },
    {
      label: "Materials",
      path: `/project/${id}?tab=materials`,
      icon: <Package className="h-4 w-4" />
    },
    {
      label: "Documents",
      path: `/project/${id}?tab=documents`,
      icon: <FileText className="h-4 w-4" />,
      badge: {
        text: "3",
        color: "blue"
      }
    },
    {
      label: "Photos",
      path: `/project/${id}?tab=photos`,
      icon: <Image className="h-4 w-4" />
    }
  ];
  
  // Breadcrumb items for the page header
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: `Project #${id}`, href: `/project/${id}` }
  ];

  return (
    <DashboardLayout withGradient>
      {/* Header */}
      <PageHeader
        title={`Villa Construction (Project #${id})`}
        subtitle="Started: Jan 15, 2024"
        breadcrumbs={breadcrumbItems}
        action={<StatusBadge status="in-progress" />}
        showProgress={true}
        progressValue={65}
        progressLabels={["Est. completion: Aug 2024", "$52,450 / $120,000"]}
        backgroundVariant="gradient"
        animated
        size="lg"
      />

      {/* Project Navigation */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <HorizontalNav 
          items={projectNavItems} 
          variant="glass" 
          showIcons={true} 
          size="md" 
        />
      </motion.div>

      {/* Project Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <MetricCard
          icon={<Calendar className="h-5 w-5 text-blue-500" />}
          label="Timeline"
          value="7 months"
          subtext="Jan - Aug 2024"
        />
        <MetricCard
          icon={<DollarSign className="h-5 w-5 text-green-500" />}
          label="Budget"
          value="$120,000"
          subtext="$52,450 spent"
        />
        <MetricCard
          icon={<Users className="h-5 w-5 text-indigo-500" />}
          label="Team Size"
          value="12"
          subtext="3 contractors"
        />
        <MetricCard
          icon={<Package className="h-5 w-5 text-purple-500" />}
          label="Materials"
          value="24"
          subtext="8 pending delivery"
        />
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Phases */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <DashboardSection
            title="Project Phases"
            icon={<Briefcase className="h-5 w-5" />}
            subtitle="Construction timeline breakdown"
            variant="glass"
            collapsible
            animate
            className="mb-6"
          >
            <div className="space-y-4">
              <PhaseCard
                name="Foundation Work"
                progress={100}
                startDate="Jan 15, 2024"
                endDate="Feb 28, 2024"
                status="completed"
                budget="$25,000"
                spent="$23,450"
                onClick={() => navigate(`/phase/1`)}
              />
              <PhaseCard
                name="Framing"
                progress={80}
                startDate="Mar 1, 2024"
                endDate="Apr 15, 2024"
                status="in-progress"
                budget="$35,000"
                spent="$28,000"
                onClick={() => navigate(`/phase/2`)}
              />
              <PhaseCard
                name="Electrical & Plumbing"
                progress={0}
                startDate="Apr 16, 2024"
                endDate="May 30, 2024"
                status="upcoming"
                budget="$40,000"
                spent="$0"
                onClick={() => navigate(`/phase/3`)}
              />
              <PhaseCard
                name="Interior & Finishing"
                progress={0}
                startDate="Jun 1, 2024"
                endDate="Aug 15, 2024"
                status="upcoming"
                budget="$20,000"
                spent="$1,000"
                onClick={() => navigate(`/phase/4`)}
              />
            </div>
          </DashboardSection>
          
          {/* Recent Documents */}
          <DashboardSection
            title="Recent Documents"
            icon={<FileText className="h-5 w-5" />}
            subtitle="Project documentation"
            variant="default"
            collapsible
            animate
          >
            <div className="space-y-3">
              <DocumentItem
                title="Construction Permit"
                type="PDF"
                date="Feb 15, 2024"
                size="1.2 MB"
              />
              <DocumentItem
                title="Site Survey"
                type="PDF"
                date="Jan 20, 2024"
                size="3.5 MB"
              />
              <DocumentItem
                title="Architectural Plans"
                type="ZIP"
                date="Jan 15, 2024"
                size="8.7 MB"
              />
              <DocumentItem
                title="Contract Agreement"
                type="DOCX"
                date="Jan 10, 2024"
                size="650 KB"
              />
            </div>
          </DashboardSection>
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <DashboardSection
              title="Recent Activity"
              icon={<Clock className="h-5 w-5" />}
              subtitle="Latest project updates"
              variant="outlined"
              collapsible
              animate
            >
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                <ActivityItem
                  icon={<Package className="w-5 h-5" />}
                  title="Material Delivered"
                  description="20 bags of cement delivered"
                  time="2 hours ago"
                  project="Villa Construction"
                />
                <ActivityItem
                  icon={<FileText className="w-5 h-5" />}
                  title="Progress Photos Added"
                  description="Foundation work progress"
                  time="5 hours ago"
                  project="Villa Construction"
                />
                <ActivityItem
                  icon={<Users className="w-5 h-5" />}
                  title="Team Updated"
                  description="2 new team members added"
                  time="2 days ago"
                  project="Villa Construction"
                />
                <ActivityItem
                  icon={<MessageSquare className="w-5 h-5" />}
                  title="New Comment"
                  description="Supervisor: Framing looks good"
                  time="3 days ago"
                  project="Villa Construction"
                />
              </div>
            </DashboardSection>
          </motion.div>
          
          {/* Project Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <DashboardSection
              title="Project Insights"
              icon={<BarChart3 className="h-5 w-5" />}
              subtitle="Analytics and recommendations"
              variant="gradient"
              collapsible
              animate
            >
              <div className="space-y-3">
                <InsightItem
                  title="Schedule Optimization"
                  description="Framing work is ahead of schedule by 2 days"
                  type="success"
                />
                <InsightItem
                  title="Budget Alert"
                  description="Electrical materials cost up 5% - consider alternative suppliers"
                  type="alert"
                />
                <InsightItem
                  title="Weather Advisory"
                  description="Rain forecasted next week - secure open areas"
                  type="default"
                />
              </div>
            </DashboardSection>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Document Item Component
interface DocumentItemProps {
  title: string;
  type: string;
  date: string;
  size: string;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ title, type, date, size }) => {
  // Get file icon based on type
  const getIcon = () => {
    switch(type) {
      case 'PDF':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'DOCX':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'XLS':
        return <FileText className="w-8 h-8 text-green-500" />;
      case 'ZIP':
        return <Package className="w-8 h-8 text-yellow-500" />;
      default:
        return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };
  
  return (
    <motion.div 
      className="flex items-center p-3 rounded-lg border bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-200"
      whileHover={{ scale: 1.02, boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}
    >
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="flex-grow">
        <h4 className="font-medium">{title}</h4>
        <p className="text-xs text-muted-foreground">{date} • {size}</p>
      </div>
      <div className="flex items-center">
        <button className="text-blue-500 hover:text-blue-700 transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default ProjectDetails; 