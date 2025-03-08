import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronRight,
  ChevronLeft,
  Download,
  Building,
  FileText,
  Calendar,
  BarChart4,
  Clock,
  DollarSign,
  Settings,
  Sparkles,
  Share2,
  Printer,
  User,
  MessageSquare,
  PlusCircle,
  RotateCw,
  ArrowRight,
  Check,
  AlertTriangle,
  Lightbulb,
  Zap,
  Edit,
  Save,
  Users,
  Briefcase,
  ArrowUpDown,
  Trash2,
  Plus,
  FileEdit,
  Pencil,
  CheckCircle,
  XCircle,
  AlertCircle,
  InfoIcon,
  Loader2,
  Undo2,
  Wrench,
  Package,
  Sun,
  Trees,
  Landmark,
  PenLine,
  ArrowUpRight,
} from 'lucide-react';
import ProgressHeader from "@/components/ProjectPlan/ProgressHeader";
import ProjectOverview from "@/components/ProjectPlan/ProjectOverview";
import ProjectPhases from "@/components/ProjectPlan/ProjectPhases";
import AIRecommendations from "@/components/ProjectPlan/AIRecommendations";
import { useNavigate } from 'react-router-dom';
import { motion, LazyMotion, domAnimation } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from '@/components/ui/use-toast';

interface InsightItemProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  type?: 'default' | 'warning' | 'success';
  animationDelay?: number;
}

const InsightItem: React.FC<InsightItemProps> = ({ title, description, icon, type = 'default', animationDelay = 0 }) => {
  const styles = {
    default: {
      container: 'bg-blue-50/80 border border-blue-100/50 hover:border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50 dark:hover:border-blue-700',
      icon: 'text-blue-500 dark:text-blue-400',
      heading: 'text-blue-900 dark:text-blue-300',
      text: 'text-blue-800 dark:text-blue-400',
    },
    warning: {
      container: 'bg-amber-50/80 border border-amber-100/50 hover:border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50 dark:hover:border-amber-700',
      icon: 'text-amber-500 dark:text-amber-400',
      heading: 'text-amber-900 dark:text-amber-300',
      text: 'text-amber-800 dark:text-amber-400',
    },
    success: {
      container: 'bg-green-50/80 border border-green-100/50 hover:border-green-200 dark:bg-green-900/20 dark:border-green-800/50 dark:hover:border-green-700',
      icon: 'text-green-500 dark:text-green-400',
      heading: 'text-green-900 dark:text-green-300',
      text: 'text-green-800 dark:text-green-400',
    }
  };

  const style = styles[type];

  return (
    <div 
      className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 hover:translate-x-1 ${style.container}`}
    >
      <div className={`rounded-full p-2 bg-white dark:bg-slate-800 shadow-sm ${style.icon}`}>
        {icon || <Sparkles className={`w-5 h-5 ${style.icon}`} />}
      </div>
      <div>
        <h4 className={`font-medium ${style.heading}`}>{title}</h4>
        <p className={`text-sm mt-1 leading-relaxed ${style.text}`}>{description}</p>
      </div>
    </div>
  );
};

const GeneratedPlan = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [projectData, setProjectData] = useState<any>(null);
  const [generatedPlan, setGeneratedPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCollaborateModal, setShowCollaborateModal] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    // Check if dark mode is enabled
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    // Observe changes to the document class for dark mode toggling
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const updatedDark = document.documentElement.classList.contains('dark');
          setIsDarkMode(updatedDark);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Retrieve stored data from localStorage
    try {
      const storedProjectData = localStorage.getItem('projectData');
      const storedPrompt = localStorage.getItem('projectPlanPrompt');
      
      if (storedProjectData) {
        try {
          const parsedData = JSON.parse(storedProjectData);
          setProjectData(parsedData);
          setTitleValue(parsedData.name || 'My Construction Project');
        } catch (error) {
          console.error('Error parsing project data:', error);
          setTitleValue('My Construction Project');
        }
      } else {
        setTitleValue('My Construction Project');
      }
      
      // Simulate loading LLM-generated content
      setIsLoading(true);
      setTimeout(() => {
        // In a real app, this would be the response from the LLM API
        let sampleContent = '';
        
        try {
          if (storedProjectData) {
            const parsedData = JSON.parse(storedProjectData);
            sampleContent = generateSampleProjectPlan(parsedData);
          } else {
            sampleContent = generateSampleProjectPlan(null);
          }
        } catch (error) {
          console.error('Error generating sample plan:', error);
          sampleContent = generateSampleProjectPlan(null);
        }
        
        setGeneratedPlan(sampleContent);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
      setTitleValue('My Construction Project');
      setGeneratedPlan(generateSampleProjectPlan(null));
    }
  }, []);

  // Function that generates a sample project plan based on the input data
  const generateSampleProjectPlan = (data: any) => {
    if (!data) {
      return `# Construction Project Plan

## Overview
This is a sample construction project plan. No project data was provided.

## Timeline
- Phase 1: Planning (2 weeks)
- Phase 2: Foundation (4 weeks)
- Phase 3: Structure (8 weeks)
- Phase 4: Finishing (6 weeks)

## Budget Estimate
Total Budget: GHS 500,000

## Materials
- Cement
- Steel
- Timber
- Roofing materials

## Recommendations
Consider engaging a professional contractor for this project.`;
    }

    // Create a more detailed plan based on the provided data
    const projectType = data.type || 'construction';
    const locationInfo = data.location ? `${data.location}, ${data.region || 'Ghana'}` : 'Ghana';
    const budgetInfo = data.budget ? `${data.currency === 'cedi' ? 'GHS' : '$'}${data.budget}` : 'Not specified';
    
    return `# ${data.name || 'Construction Project'} Plan

## Project Overview
${data.description || 'A construction project in Ghana'}

**Location:** ${locationInfo}
**Type:** ${projectType}
**Budget:** ${budgetInfo}

## Project Phases and Timeline

### Phase 1: Planning and Design (4-6 weeks)
- Architectural drawings and approvals
- Engineering assessments
- Material sourcing plan
- Contractor selection
- Permit acquisition

### Phase 2: Site Preparation and Foundation (6-8 weeks)
- Land clearing and excavation
- Foundation construction
- Underground utilities
- Initial inspections

### Phase 3: Main Structure (12-16 weeks)
- Frame construction
- Roofing installation
- External walls
- Windows and doors installation
- Rough electrical and plumbing

### Phase 4: Interior Works (8-10 weeks)
- Internal walls and ceilings
- Electrical and plumbing finalization
- Flooring installation
- Kitchen and bathroom fixtures
- Painting and finishing

### Phase 5: Final Touches and Handover (4-6 weeks)
- Final inspections
- Landscaping
- Cleanup
- Handover documentation

## Budget Breakdown

| Category | Percentage | Amount |
|----------|------------|--------|
| Materials | 60% | ${data.budget ? `${data.currency === 'cedi' ? 'GHS' : '$'}${Number(data.budget) * 0.6}` : 'TBD'} |
| Labor | 25% | ${data.budget ? `${data.currency === 'cedi' ? 'GHS' : '$'}${Number(data.budget) * 0.25}` : 'TBD'} |
| Equipment | 8% | ${data.budget ? `${data.currency === 'cedi' ? 'GHS' : '$'}${Number(data.budget) * 0.08}` : 'TBD'} |
| Permits & Fees | 5% | ${data.budget ? `${data.currency === 'cedi' ? 'GHS' : '$'}${Number(data.budget) * 0.05}` : 'TBD'} |
| Contingency | 10% | ${data.budget ? `${data.currency === 'cedi' ? 'GHS' : '$'}${Number(data.budget) * 0.1}` : 'TBD'} |

## Required Materials and Resources

### Key Materials:
- Cement (Portland Type I/II)
- Reinforcement steel
- Aggregates (sand, gravel)
- Timber for formwork
- Roofing materials
- Plumbing fixtures
- Electrical components
- Finishing materials

### Equipment:
- Excavation equipment
- Concrete mixers
- Scaffolding
- Power tools
- Transportation vehicles

### Labor:
- Site supervisor
- Skilled masons
- Carpenters
- Electricians
- Plumbers
- General laborers

## Risk Assessment

### Potential Risks:
1. **Weather delays** - Heavy rain during wet season may impact construction schedule
2. **Material price fluctuations** - Currency volatility affecting imported materials
3. **Labor shortages** - Skilled worker availability in ${locationInfo}
4. **Permit delays** - Local regulatory approval timelines
5. **Budget overruns** - Unexpected costs and scope changes

### Mitigation Strategies:
- Schedule critical outdoor work during dry season
- Purchase key materials early to lock in prices
- Establish relationships with multiple labor contractors
- Begin permit process early with proper documentation
- Include 10% contingency in budget and clear change order process

## Sustainable Building Recommendations for Ghana

1. **Passive Cooling Strategies**
   - Orient building to maximize natural ventilation
   - Use high ceilings to assist air circulation
   - Implement shading devices on east and west facades
   - Consider courtyard designs for air movement

2. **Water Conservation**
   - Rainwater harvesting systems
   - Low-flow plumbing fixtures
   - Greywater recycling for irrigation

3. **Energy Efficiency**
   - Solar panel installation for electricity
   - LED lighting throughout
   - Energy-efficient appliances
   - Solar water heating

4. **Local and Sustainable Materials**
   - Locally sourced timber from certified suppliers
   - Compressed earth blocks where appropriate
   - Bamboo for non-structural elements
   - Recycled materials where possible

5. **Climate Adaptations**
   - Elevated foundations in flood-prone areas
   - Proper drainage systems
   - Heat-resistant materials
   - Robust roofing for heavy rainfall

This plan can be refined based on further information and specific requirements.`;
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    
    // Simulate regeneration delay
    setTimeout(() => {
      try {
        // Generate a new plan with the same data
        if (projectData) {
          const newPlan = generateSampleProjectPlan(projectData);
          setGeneratedPlan(newPlan);
        } else {
          const defaultPlan = generateSampleProjectPlan(null);
          setGeneratedPlan(defaultPlan);
        }
        toast({
          title: "Plan regenerated",
          description: "Your project plan has been refreshed with new insights.",
          variant: "default"
        });
      } catch (error) {
        console.error("Error regenerating plan:", error);
        toast({
          title: "Regeneration failed",
          description: "There was an error refreshing your plan. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsGenerating(false);
      }
    }, 2000);
  };

  const navigateToProjectInput = () => {
    navigate('/create-project-new');
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
      setHasUnsavedChanges(false);
    setSaving(false);
    setEditMode(false);
  };

  const cancelTitleEdit = () => {
    // Reset to the original title if user cancels
    if (projectData && projectData.name) {
      setTitleValue(projectData.name);
    }
    setIsEditingTitle(false);
  };

  const saveTitleEdit = () => {
    // Save the new title and update projectData
    if (projectData) {
      const updatedData = { ...projectData, name: titleValue };
      setProjectData(updatedData);
      // In a real app, you might save this back to localStorage or API
      localStorage.setItem('projectData', JSON.stringify(updatedData));
    }
    setIsEditingTitle(false);
  };

  const handleShare = () => {
    setShowCollaborateModal(true);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-slate-900" : "bg-gradient-to-b from-blue-50 to-white"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header with Title */}
        <div className="flex items-center space-x-2 mb-8">
          <Building className={`h-8 w-8 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none w-full"
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={cancelTitleEdit} className="ml-2">
                  <XCircle className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={saveTitleEdit} className="ml-1">
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center">
                <h1 className="text-2xl font-bold">{titleValue}</h1>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingTitle(true)} className="ml-2 opacity-50 hover:opacity-100">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
            {projectData?.description && (
              <p className="text-gray-500 dark:text-gray-400 mt-1">{projectData.description}</p>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleRegenerate}>
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
            Regenerate
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={navigateToProjectInput}>
            <PenLine className="h-4 w-4" />
            Edit Inputs
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => {}}>
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowCollaborateModal(true)}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="budget" className="gap-2">
              <BarChart4 className="h-4 w-4" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Loading your project plan...</p>
              </div>
            ) : (
              <>
                <div className="prose prose-blue dark:prose-invert max-w-none">
                  {generatedPlan && generatedPlan.split('\n').map((line, index) => {
                    try {
                      // Handle markdown headings
                      if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-2xl font-bold mt-6 mb-4">{line.substring(2)}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{line.substring(3)}</h2>;
                      } else if (line.startsWith('### ')) {
                        return <h3 key={index} className="text-lg font-bold mt-5 mb-2">{line.substring(4)}</h3>;
                      } else if (line.startsWith('- ')) {
                        return <li key={index} className="ml-6 my-1">{line.substring(2)}</li>;
                      } else if (line.startsWith('**') && line.endsWith('**')) {
                        const content = line.replace(/\*\*/g, '');
                        return <p key={index} className="font-bold my-2">{content}</p>;
                      } else if (line.startsWith('|')) {
                        // This is a table row, we'll handle it simply for demo purposes
                        const cells = line.split('|').filter(cell => cell.trim() !== '');
                        if (cells.length === 0) return null;
                        
                        if (index > 0 && generatedPlan.split('\n')[index-1] && generatedPlan.split('\n')[index-1].startsWith('|---')) {
                          // This is a header row
                          return (
                            <div key={index} className="flex border-b">
                              {cells.map((cell, cellIndex) => (
                                <div key={cellIndex} className="px-4 py-2 font-medium flex-1">{cell.trim()}</div>
                              ))}
                            </div>
                          );
                        } else if (line.includes('---')) {
                          // This is a separator row, skip it
                          return null;
                        } else {
                          return (
                            <div key={index} className="flex border-b border-gray-200 dark:border-gray-800">
                              {cells.map((cell, cellIndex) => (
                                <div key={cellIndex} className="px-4 py-2 flex-1">{cell.trim()}</div>
                              ))}
                            </div>
                          );
                        }
                      } else if (line.trim() === '') {
                        return <div key={index} className="h-4"></div>;
                      } else {
                        return <p key={index} className="my-2">{line}</p>;
                      }
                    } catch (error) {
                      console.error('Error rendering markdown line:', error);
                      return <p key={index} className="text-red-500">{line}</p>;
                    }
                  })}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <InsightItem
                    title="Local Materials"
                    description="Using locally sourced materials can reduce costs by 15-20% and support the local economy."
                    icon={<Package className="h-5 w-5" />}
                    type="success"
                    animationDelay={0.1}
                  />
                  <InsightItem
                    title="Climate Considerations"
                    description="Ghana's rainy season (April-July) may impact outdoor construction. Plan accordingly."
                    icon={<Sun className="h-5 w-5" />}
                    type="warning"
                    animationDelay={0.2}
                  />
                  <InsightItem
                    title="Sustainable Practices"
                    description="Incorporating passive cooling can reduce energy costs by up to 30% annually."
                    icon={<Trees className="h-5 w-5" />}
                    type="default"
                    animationDelay={0.3}
                  />
                </div>
              </>
            )}
          </TabsContent>
          
          {/* Placeholder for other tabs - would expand in a real app */}
          <TabsContent value="timeline" className="p-6 bg-white dark:bg-slate-800 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="flex justify-center items-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Timeline view would show the project schedule and milestones
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="budget" className="p-6 bg-white dark:bg-slate-800 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="flex justify-center items-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Budget view would display detailed financial breakdowns and cost projections
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="p-6 bg-white dark:bg-slate-800 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="flex justify-center items-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Tasks view would show actionable items and responsibilities
              </p>
          </div>
          </TabsContent>
          
          <TabsContent value="team" className="p-6 bg-white dark:bg-slate-800 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="flex justify-center items-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Team view would display project roles and team member assignments
              </p>
        </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GeneratedPlan;
