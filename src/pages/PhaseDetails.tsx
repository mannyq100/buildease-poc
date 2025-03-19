import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from "@/components/ui/tabs";
import {
  Calendar,
  Users,
  DollarSign,
  Package,
  Plus,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ClipboardList,
  FileText,
  Clock,
  Activity
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LazyMotion, domAnimation, m } from 'framer-motion';

// Import common shared components
import { 
  PageHeader, 
  StatCard, 
  DocumentItem,
  TaskCard,
  MaterialCard
} from '@/components/shared';

// Import phase-specific components
import {
  PhaseTabs,
  TaskItem,
  MaterialItem,
  InsightItem,
  CriticalItem,
  DependencyItem
} from '@/components/phases';

// Mock data for phases
const phaseData = {
  '1': {
    id: '1',
    name: 'Foundation Phase',
    description: 'Track and manage the foundation phase of Villa Construction project',
    progress: 65,
    projectName: 'Villa Construction',
    startDate: 'Feb 2',
    endDate: 'Mar 15, 2024',
    durationWeeks: 6,
    status: 'in-progress',
    budget: '$45,000',
    spent: '$28,500',
    teamSize: 8,
    teamComposition: '2 contractors, 6 workers'
  },
  '2': {
    id: '2',
    name: 'Framing Phase',
    description: 'Track and manage the framing phase of Villa Construction project',
    progress: 30,
    projectName: 'Villa Construction',
    startDate: 'Mar 16',
    endDate: 'Apr 20, 2024',
    durationWeeks: 5,
    status: 'upcoming',
    budget: '$60,000',
    spent: '$12,000',
    teamSize: 12,
    teamComposition: '3 contractors, 9 workers'
  },
  '3': {
    id: '3',
    name: 'Roofing Phase',
    description: 'Track and manage the roofing phase of Villa Construction project',
    progress: 0,
    projectName: 'Villa Construction',
    startDate: 'Apr 21',
    endDate: 'May 15, 2024',
    durationWeeks: 3.5,
    status: 'upcoming',
    budget: '$35,000',
    spent: '$0',
    teamSize: 6,
    teamComposition: '2 contractors, 4 workers'
  },
};

interface Phase {
  id: string;
  name: string;
  description: string;
  progress: number;
  projectName: string;
  startDate: string;
  endDate: string;
  durationWeeks: number;
  status: string;
  budget: string;
  spent: string;
  teamSize: number;
  teamComposition: string;
}

interface Assignee {
  id: number;
  name: string;
  avatar: string | null;
}

interface TaskCardProps {
  title: string;
  description: string;
  dueDate: string;
  status: string;
  priority: string;
  assignees: Assignee[];
  comments: number;
  attachments: number;
}

const PhaseDetails = () => {
  const navigate = useNavigate();
  const { phaseId } = useParams();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [phase, setPhase] = useState<Phase | null>(null);
  
  useEffect(() => {
    // Check for dark mode
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    
    // Fetch phase data based on ID
    if (phaseId && phaseData[phaseId]) {
      setPhase(phaseData[phaseId]);
    } else {
      // Handle phase not found
      navigate('/projects');
    }
  }, [phaseId, navigate]);
  
  if (!phase) {
    return <div>Loading...</div>;
  }
  
  // Calculate budget percentage
  const budgetPercentage = Math.round(
    (parseInt(phase.spent.replace('$', '').replace(',', '')) / 
    parseInt(phase.budget.replace('$', '').replace(',', ''))) * 100
  );
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20
      }
    }
  };
  
  const handleBackClick = () => {
    navigate('/projects');
  };
  
  // Render phase details
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <PageHeader
        title={phase.name}
        description={phase.description}
        actions={
          <Button
            size="sm"
            onClick={handleBackClick}
             variant="default" 
              className="bg-white hover:bg-gray-100 text-blue-700 border border-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        }
      />
      
      <div className="mb-8">
        <LazyMotion features={domAnimation}>
          <m.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <m.div variants={itemVariants}>
              <StatCard
                title="Timeline"
                value={`${phase.durationWeeks} weeks`}
                icon={<Calendar className="h-6 w-6" />}
                colorScheme="blue"
                subtitle={`${phase.startDate} - ${phase.endDate}`}
              />
            </m.div>
            
            <m.div variants={itemVariants}>
              <StatCard
                title="Team"
                value={phase.teamSize.toString()}
                icon={<Users className="h-6 w-6" />}
                colorScheme="purple"
                subtitle={phase.teamComposition}
              />
            </m.div>
            
            <m.div variants={itemVariants}>
              <StatCard
                title="Budget"
                value={phase.budget}
                icon={<DollarSign className="h-6 w-6" />}
                colorScheme="green"
                subtitle={`${phase.spent} spent (${budgetPercentage}%)`}
              />
            </m.div>
            
            <m.div variants={itemVariants}>
              <StatCard
                title="Progress"
                value={`${phase.progress}%`}
                icon={<Activity className="h-6 w-6" />}
                colorScheme="amber"
                subtitle={`${phase.status} status`}
              />
            </m.div>
          </m.div>
        </LazyMotion>

        {/* Enhanced Tabs with better styling */}
        <PhaseTabs defaultValue="overview" className="bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-6">
          <TabsContent value="overview" className="p-4 pt-6 space-y-6">
            <div className="grid gap-6">
              {/* Critical Items & Dependencies */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card className={cn(
                    "border shadow-sm",
                    isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                  )}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                          Tasks Overview
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 dark:text-blue-400"
                          onClick={() => {
                            const button = document.querySelector('button[data-value="tasks"]');
                            if (button instanceof HTMLElement) {
                              button.click();
                            }
                          }}
                        >
                          View All <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <TaskCard
                          title="Foundation Preparation"
                          description="Clear site and prepare for foundation pouring"
                          dueDate="Feb 15"
                          status="completed"
                          priority="high"
                          assignees={[{
                            id: 1,
                            name: "John Smith",
                            avatar: null
                          }]}
                        />
                        
                        <TaskCard
                          title="Excavation and Grading"
                          description="Prepare the ground surface to match engineering plans"
                          dueDate="Feb 20"
                          status="completed"
                          priority="medium"
                          assignees={[{
                            id: 2,
                            name: "Alex Jones",
                            avatar: null
                          }]}
                        />
                        
                        <TaskCard
                          title="Formwork Construction"
                          description="Build wooden forms to contain concrete pour"
                          dueDate="Feb 28"
                          status="in-progress"
                          priority="high"
                          assignees={[{
                            id: 3,
                            name: "Robert Chen",
                            avatar: null
                          }]}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card className={cn(
                    "border shadow-sm h-full",
                    isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                  )}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                        Critical Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <CriticalItem
                          title="Weather Delay Risk"
                          deadline="Mar 15"
                          status="pending"
                        />
                        
                        <CriticalItem
                          title="Material Shortage"
                          deadline="Mar 20"
                          status="not-started"
                        />
                        
                        <CriticalItem
                          title="Quality Assurance"
                          deadline="Mar 5"
                          status="overdue"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Materials & Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="md:col-span-2">
                  <Card className={cn(
                    "border shadow-sm",
                    isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                  )}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium flex items-center justify-between">
                        <div className="flex items-center">
                          <Package className="mr-2 h-5 w-5 text-purple-500" />
                          Materials
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 dark:text-blue-400"
                          onClick={() => {
                            const button = document.querySelector('button[data-value="materials"]');
                            if (button instanceof HTMLElement) {
                              button.click();
                            }
                          }}
                        >
                          View All <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <MaterialCard
                          name="Concrete Mix Type S"
                          quantity="75 cubic yards"
                          supplier="ABC Materials"
                          status="in-stock"
                        />
                        
                        <MaterialCard
                          name="Rebar #4"
                          quantity="2500 feet"
                          supplier="Steel Supply Co"
                          status="in-stock"
                        />
                        
                        <MaterialCard
                          name="Foundation Waterproofing"
                          quantity="12 buckets"
                          supplier="BuilderDepot"
                          status="ordered"
                        />
                        
                        <MaterialCard
                          name="Gravel 3/4-inch"
                          quantity="40 tons"
                          supplier="Rock Aggregates Inc"
                          status="in-stock"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card className={cn(
                    "border shadow-sm h-full",
                    isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                  )}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium flex items-center">
                        <Sparkles className="mr-2 h-5 w-5 text-amber-500" />
                        Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <InsightItem
                          title="Budget Savings"
                          description="Found $2,500 savings by adjusting material orders"
                        />
                        
                        <InsightItem
                          title="Schedule Optimization"
                          description="Can save 3 days by overlapping tasks"
                        />
                        
                        <InsightItem
                          title="Quality Improvement"
                          description="Additional curing time improved strength by 12%"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card className={cn(
                    "border shadow-sm h-full",
                    isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                  )}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium flex items-center">
                        <ClipboardList className="mr-2 h-5 w-5 text-blue-500" />
                        Dependencies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <DependencyItem
                          title="City Permit Approval"
                          status="completed"
                          type="approval"
                        />
                        
                        <DependencyItem
                          title="Final Foundation Inspection"
                          status="scheduled"
                          type="document"
                        />
                        
                        <DependencyItem
                          title="Plumbing Rough-In Layout"
                          status="in-progress"
                          type="document"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="p-4 pt-6 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Phase Tasks</h3>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add Task
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <TaskCard
                title="Foundation Preparation"
                description="Clear site and prepare for foundation pouring"
                dueDate="Feb 15"
                status="completed"
                priority="high"
                assignees={[{
                  id: 1,
                  name: "John Smith",
                  avatar: null
                }]}
                comments={3}
                attachments={2}
              />
              
              <TaskCard
                title="Excavation and Grading"
                description="Prepare the ground surface to match engineering plans"
                dueDate="Feb 20"
                status="completed"
                priority="medium"
                assignees={[{
                  id: 2,
                  name: "Alex Jones",
                  avatar: null
                }]}
                comments={5}
                attachments={1}
              />
              
              <TaskCard
                title="Formwork Construction"
                description="Build wooden forms to contain concrete pour"
                dueDate="Feb 28"
                status="in-progress"
                priority="high"
                assignees={[{
                  id: 3,
                  name: "Robert Chen",
                  avatar: null
                }]}
                comments={2}
                attachments={3}
              />
              
              <TaskCard
                title="Rebar Installation"
                description="Place and secure reinforcement steel as per design"
                dueDate="Mar 5"
                status="in-progress"
                priority="high"
                assignees={[{
                  id: 4,
                  name: "Emily Wong",
                  avatar: null
                }]}
                comments={1}
                attachments={2}
              />
              
              <TaskCard
                title="Utility Rough-Ins"
                description="Install plumbing and electrical conduits before concrete pour"
                dueDate="Mar 8"
                status="pending"
                priority="medium"
                assignees={[{
                  id: 5,
                  name: "Mike Stevens",
                  avatar: null
                }]}
                comments={0}
                attachments={1}
              />
              
              <TaskCard
                title="Concrete Pouring"
                description="Pour concrete for foundations and initial curing"
                dueDate="Mar 12"
                status="pending"
                priority="high"
                assignees={[{
                  id: 6,
                  name: "David Miller",
                  avatar: null
                }]}
                comments={0}
                attachments={0}
              />
              
              <TaskCard
                title="Concrete Curing"
                description="Regular watering and protection during curing period"
                dueDate="Mar 15"
                status="pending"
                priority="medium"
                assignees={[{
                  id: 7,
                  name: "Sarah Johnson",
                  avatar: null
                }]}
                comments={0}
                attachments={0}
              />
              
              <TaskCard
                title="Waterproofing Application"
                description="Apply foundation waterproofing and drainage systems"
                dueDate="Mar 15"
                status="pending"
                priority="medium"
                assignees={[{
                  id: 8,
                  name: "Tom Wilson",
                  avatar: null
                }]}
                comments={0}
                attachments={1}
              />
              
              <TaskCard
                title="Foundation Inspection"
                description="Final inspection before backfilling and moving to framing"
                dueDate="Mar 15"
                status="pending"
                priority="high"
                assignees={[{
                  id: 9,
                  name: "Karen Taylor",
                  avatar: null
                }]}
                comments={0}
                attachments={0}
              />
            </div>
          </TabsContent>
          
          {/* Additional tab contents would go here */}
          <TabsContent value="materials" className="p-4 pt-6 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Materials</h3>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add Material
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Materials list */}
              {/* Would repeat MaterialCard components here */}
            </div>
          </TabsContent>
          
          <TabsContent value="documents" className="p-4 pt-6 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Documents</h3>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add Document
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Document list */}
              {/* Would use DocumentItem components here */}
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="p-4 pt-6 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Schedule</h3>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add Event
              </Button>
            </div>
            
            {/* Would include a calendar or timeline component here */}
            <div className="h-96 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
              <p className="text-muted-foreground">Timeline chart would be displayed here</p>
            </div>
          </TabsContent>
        </PhaseTabs>
      </div>
    </div>
  );
};

export default PhaseDetails;
