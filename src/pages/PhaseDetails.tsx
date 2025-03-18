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
  ProjectStatCard,
  StatCard, 
  DocumentItem 
} from '@/components/shared';

// Import phase-specific components
import {
  PhaseTabs,
  TaskItem,
  TaskCard,
  MaterialItem,
  MaterialCard,
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

const PhaseDetails = () => {
  const navigate = useNavigate();
  const { phaseId } = useParams();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [phase, setPhase] = useState(null);
  
  useEffect(() => {
    // In a real application, this would be a fetch call to an API
    // For this example, we're using the mock data
    if (phaseId && phaseData[phaseId]) {
      setPhase(phaseData[phaseId]);
    } else if (phaseId) {
      // If the phase doesn't exist, use a default phase
      setPhase(phaseData['1']);
    } else {
      // If no phaseId is provided, use the first phase
      setPhase(phaseData['1']);
    }
  }, [phaseId]);
  
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

  // If phase data is not loaded yet, show a loading state
  if (!phase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading phase details...</div>
      </div>
    );
  }

  // Calculate percentages for budget and progress
  const budgetSpent = parseInt(phase.spent.replace(/[^0-9]/g, ''));
  const totalBudget = parseInt(phase.budget.replace(/[^0-9]/g, ''));
  const budgetPercentage = Math.round((budgetSpent / totalBudget) * 100);

  // Animation variants for metric cards
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900/95">
      {/* Enhanced PageHeader with better styling */}
      <PageHeader
        title={phase.name}
        description={`${phase.description} · ${phase.projectName}`}
        icon={<Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="bg-white/20 backdrop-blur-sm border-white/10 hover:bg-white/30 text-white flex items-center gap-1"
              onClick={() => navigate(`/project/1`)}
            >
              <ArrowLeft className="h-4 w-4" /> Back to Project
            </Button>
            <Button
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/10 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add Task
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Phase Stats using StatCard for consistency with other pages */}
        <LazyMotion features={domAnimation}>
          <m.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <m.div variants={itemVariants}>
              <StatCard
                title="Duration"
                value={`${phase.durationWeeks} Weeks`}
                icon={<Clock className="h-6 w-6" />}
                colorScheme="blue"
                subtitle={`${phase.startDate} - ${phase.endDate}`}
              />
            </m.div>
            
            <m.div variants={itemVariants}>
              <StatCard
                title="Team Size"
                value={`${phase.teamSize}`}
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
                colorScheme="emerald"
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
                          onClick={() => document.querySelector('button[data-value="tasks"]')?.click()}
                        >
                          View All <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <TaskItem
                          title="Foundation Preparation"
                          description="Clear site and prepare for foundation pouring"
                          dueDate="Feb 15"
                          status="completed"
                          priority="high"
                          assignee={{
                            name: "John Smith",
                            avatar: null
                          }}
                        />
                        
                        <TaskItem
                          title="Concrete Pouring"
                          description="Pour and cure concrete foundation"
                          dueDate="Feb 25"
                          status="completed"
                          priority="high"
                          assignee={{
                            name: "Michael Johnson",
                            avatar: null
                          }}
                        />
                        
                        <TaskItem
                          title="Foundation Inspection"
                          description="City inspector to verify foundation"
                          dueDate="Mar 2"
                          status="in-progress"
                          priority="medium"
                          assignee={{
                            name: "Robert Williams",
                            avatar: null
                          }}
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
                        <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                        Critical Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <CriticalItem
                          title="Concrete Quality Issue"
                          description="Batch #103 failed quality test, need replacement"
                          impactLevel="high"
                          status="pending"
                        />
                        
                        <CriticalItem
                          title="Soil Stability Concern"
                          description="Northeast corner showing signs of instability"
                          impactLevel="medium"
                          status="monitoring"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <Card className={cn(
                "border shadow-sm",
                isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
              )}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center justify-between">
                    <span className="flex items-center">
                      <Package className="mr-2 h-5 w-5 text-amber-500" />
                      Key Materials
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 dark:text-blue-400"
                      onClick={() => document.querySelector('button[data-value="materials"]')?.click()}
                    >
                      View All <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MaterialCard
                      name="Concrete Mix Type A"
                      quantity={120}
                      unit="cubic yards"
                      status="in-stock"
                      allocated={95}
                      remaining={25}
                      used={80}
                    />
                    
                    <MaterialCard
                      name="Rebar #5"
                      quantity={3000}
                      unit="feet"
                      status="low-stock"
                      allocated={2800}
                      remaining={200}
                      used={2500}
                    />
                    
                    <MaterialCard
                      name="Wire Mesh"
                      quantity={40}
                      unit="sheets"
                      status="in-stock"
                      allocated={35}
                      remaining={5}
                      used={30}
                    />
                    
                    <MaterialCard
                      name="Drainage Pipe"
                      quantity={500}
                      unit="feet"
                      status="ordered"
                      allocated={500}
                      remaining={0}
                      used={0}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card className={cn(
                    "border shadow-sm",
                    isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                  )}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium flex items-center">
                        <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
                        Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <InsightItem
                          title="On Track for Early Completion"
                          description="Current progress indicates phase may finish 3-5 days ahead of schedule"
                          type="success"
                        />
                        
                        <InsightItem
                          title="Material Consumption Efficiency"
                          description="Concrete usage 5% below estimated quantity, potential for cost savings"
                          type="default"
                        />
                        
                        <InsightItem
                          title="Weather Impact Alert"
                          description="Forecasted rain may delay final foundation inspection by 1-2 days"
                          type="warning"
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
                          status="complete"
                          description="Required before framing can begin"
                        />
                        
                        <DependencyItem
                          title="Final Foundation Inspection"
                          status="pending"
                          description="Required before framing can begin"
                        />
                        
                        <DependencyItem
                          title="Plumbing Rough-In Layout"
                          status="in-progress"
                          description="Required for foundation plan completion"
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
              <h3 className="text-lg font-medium">All Tasks</h3>
              <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white">
                <Plus className="mr-1 h-4 w-4" />
                Add Task
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <TaskCard
                title="Foundation Preparation"
                description="Clear site and prepare for foundation pouring. This includes removing debris, leveling the ground, and marking the foundation outline."
                status="completed"
                dueDate="Feb 15, 2024"
                assignees={[
                  { id: 1, name: "John Smith", avatar: null },
                  { id: 2, name: "Emily Johnson", avatar: null }
                ]}
                priority="high"
                comments={5}
                attachments={2}
              />
              
              <TaskCard
                title="Concrete Pouring"
                description="Pour and cure concrete foundation according to engineering specifications. Use Type A mix with reinforcing mesh as specified."
                status="completed"
                dueDate="Feb 25, 2024"
                assignees={[
                  { id: 3, name: "Michael Johnson", avatar: null },
                  { id: 4, name: "Sarah Williams", avatar: null }
                ]}
                priority="high"
                comments={8}
                attachments={3}
              />
              
              <TaskCard
                title="Foundation Inspection"
                description="Schedule and complete city inspection for foundation. Ensure all documentation is prepared and on-site for the inspector."
                status="in-progress"
                dueDate="Mar 2, 2024"
                assignees={[
                  { id: 5, name: "Robert Williams", avatar: null }
                ]}
                priority="medium"
                comments={2}
                attachments={1}
              />
              
              <TaskCard
                title="Waterproofing Application"
                description="Apply waterproofing membrane to foundation walls. Ensure complete coverage and proper application according to manufacturer specs."
                status="in-progress"
                dueDate="Mar 5, 2024"
                assignees={[
                  { id: 6, name: "James Brown", avatar: null },
                  { id: 7, name: "Patricia Davis", avatar: null }
                ]}
                priority="medium"
                comments={1}
                attachments={0}
              />
              
              <TaskCard
                title="Drainage Installation"
                description="Install perimeter drainage system including gravel, pipe, and filter fabric. Ensure proper slope for water flow."
                status="pending"
                dueDate="Mar 10, 2024"
                assignees={[
                  { id: 8, name: "David Miller", avatar: null }
                ]}
                priority="medium"
                comments={0}
                attachments={1}
              />
              
              <TaskCard
                title="Backfill and Compaction"
                description="Backfill around foundation walls and compact soil in layers. Use approved fill material only."
                status="pending"
                dueDate="Mar 15, 2024"
                assignees={[
                  { id: 9, name: "Linda Wilson", avatar: null },
                  { id: 10, name: "Richard Moore", avatar: null }
                ]}
                priority="low"
                comments={0}
                attachments={0}
              />
            </div>
          </TabsContent>

          <TabsContent value="materials" className="p-4 pt-6 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">All Materials</h3>
              <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white">
                <Plus className="mr-1 h-4 w-4" />
                Add Material
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <MaterialCard
                name="Concrete Mix Type A"
                quantity={120}
                unit="cubic yards"
                status="in-stock"
                allocated={95}
                remaining={25}
                used={80}
              />
              
              <MaterialCard
                name="Rebar #5"
                quantity={3000}
                unit="feet"
                status="low-stock"
                allocated={2800}
                remaining={200}
                used={2500}
              />
              
              <MaterialCard
                name="Wire Mesh"
                quantity={40}
                unit="sheets"
                status="in-stock"
                allocated={35}
                remaining={5}
                used={30}
              />
              
              <MaterialCard
                name="Drainage Pipe"
                quantity={500}
                unit="feet"
                status="ordered"
                allocated={500}
                remaining={0}
                used={0}
              />
              
              <MaterialCard
                name="Waterproofing Membrane"
                quantity={80}
                unit="rolls"
                status="in-stock"
                allocated={60}
                remaining={20}
                used={40}
              />
              
              <MaterialCard
                name="Gravel"
                quantity={75}
                unit="tons"
                status="in-stock"
                allocated={50}
                remaining={25}
                used={45}
              />
              
              <MaterialCard
                name="Filter Fabric"
                quantity={20}
                unit="rolls"
                status="low-stock"
                allocated={18}
                remaining={2}
                used={15}
              />
              
              <MaterialCard
                name="Anchor Bolts"
                quantity={200}
                unit="pieces"
                status="in-stock"
                allocated={150}
                remaining={50}
                used={100}
              />
              
              <MaterialCard
                name="Sill Sealer"
                quantity={15}
                unit="rolls"
                status="ordered"
                allocated={15}
                remaining={0}
                used={0}
              />
            </div>
          </TabsContent>

          <TabsContent value="documents" className="p-4 pt-6 space-y-6">
            <div className="grid gap-6">
              <Card className={cn(
                "border shadow-sm",
                isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
              )}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-red-500" />
                    Phase Documents
                  </CardTitle>
                  <Button size="sm" className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white">
                    <Plus className="mr-1 h-4 w-4" />
                    Upload Document
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <DocumentItem 
                      name="Foundation Blueprint"
                      type="PDF"
                      date="Jan 28, 2024"
                      size="4.2 MB"
                      status="current"
                    />
                    
                    <DocumentItem 
                      name="Soil Analysis Report"
                      type="PDF"
                      date="Jan 30, 2024"
                      size="2.8 MB"
                      status="current"
                    />
                    
                    <DocumentItem 
                      name="Material Specifications"
                      type="XLSX"
                      date="Feb 05, 2024"
                      size="1.1 MB"
                      status="current"
                    />
                    
                    <DocumentItem 
                      name="Foundation Checklist"
                      type="PDF"
                      date="Feb 10, 2024"
                      size="0.9 MB"
                      status="current"
                    />
                    
                    <DocumentItem 
                      name="City Permit Application"
                      type="PDF"
                      date="Jan 15, 2024"
                      size="3.4 MB"
                      status="approved"
                    />
                    
                    <DocumentItem 
                      name="Structural Engineer Report"
                      type="PDF"
                      date="Jan 22, 2024"
                      size="5.7 MB"
                      status="current"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </PhaseTabs>
      </div>
    </div>
  );
};

export default PhaseDetails;
