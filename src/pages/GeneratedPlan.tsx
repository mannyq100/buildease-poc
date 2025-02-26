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
import ProgressHeader from "@/components/generated-plan/ProgressHeader";
import ProjectOverview from "@/components/generated-plan/ProjectOverview";
import ProjectPhases from "@/components/generated-plan/ProjectPhases";
import AIRecommendations from "@/components/generated-plan/AIRecommendations";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        delay: animationDelay,
        damping: 20 
      }}
      whileHover={{ 
        x: 5, 
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
        transition: { duration: 0.2 }
      }}
      className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 ${style.container}`}
    >
      <div className={`rounded-full p-2 bg-white dark:bg-slate-800 shadow-sm ${style.icon}`}>
        {icon || <Sparkles className={`w-5 h-5 ${style.icon}`} />}
      </div>
      <div>
        <h4 className={`font-medium ${style.heading}`}>{title}</h4>
        <p className={`text-sm mt-1 leading-relaxed ${style.text}`}>{description}</p>
      </div>
    </motion.div>
  );
};

const GeneratedPlan = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [showCollaborateModal, setShowCollaborateModal] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [projectTitle, setProjectTitle] = useState<string>("Two-Story Residential Villa");
  const [projectDescription, setProjectDescription] = useState<string>("A modern residential project with emphasis on sustainability and comfort.");
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);

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

  const handleRegenerate = () => {
    setIsRegenerating(true);
    // Simulate regeneration delay
    setTimeout(() => {
      setIsRegenerating(false);
    }, 3000);
  };

  const navigateToProjectInput = () => {
    navigate('/create-project');
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
    setIsEditingTitle(false);
    setHasUnsavedChanges(false);
  };

  const saveTitleEdit = () => {
    setIsEditingTitle(false);
    setHasUnsavedChanges(false);
  };

  const handleShare = () => {
    // Implement share functionality
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
      {/* Header - Enhanced */}
      <div className={`bg-gradient-to-b ${
        isDarkMode 
          ? "from-indigo-900/30 via-slate-900 to-slate-900" 
          : "from-blue-50/80 via-blue-50/20 to-transparent"
      } transition-colors duration-500`}>
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
        >
          <ProgressHeader 
            steps={[
              { name: 'Project Inputs', status: 'complete' },
              { name: 'Generated Plan', status: 'current' },
              { name: 'Detailed Specifications', status: 'upcoming' },
              { name: 'Final Documents', status: 'upcoming' },
            ]}
          />
        </motion.div>
            </div>

      {/* Main Content - Enhanced */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/5 dark:bg-blue-900/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10"></div>

        {/* Project title section - Enhanced */}
        <div className={`relative overflow-hidden ${
          isDarkMode 
            ? "bg-slate-800/50 border border-slate-700" 
            : "bg-white/70 backdrop-blur-sm border border-gray-100"
        } rounded-xl shadow-sm mb-10 transition-all duration-500`}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
            </div>

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
              <motion.div layout className="flex-1">
                <AnimatePresence mode="wait">
                  {isEditingTitle ? (
                    <motion.div 
                      key="edit-mode" 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <input
                        type="text"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        className={`text-2xl sm:text-3xl font-medium w-full ${
                          isDarkMode 
                            ? "bg-slate-800 text-white border-slate-700 focus:border-blue-500" 
                            : "bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500"
                        } rounded-lg p-2 border outline-none`}
                        autoFocus
                      />
                      <textarea
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        rows={2}
                        className={`w-full ${
                          isDarkMode 
                            ? "bg-slate-800 text-slate-300 border-slate-700" 
                            : "bg-white/50 backdrop-blur-sm text-gray-600 border-gray-200"
                        } rounded-lg p-2 border outline-none focus:border-blue-500`}
                      />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="view-mode" 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                    >
                      <motion.h1 
                        className={isDarkMode ? "text-white" : "text-gray-900"}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {projectTitle}
                      </motion.h1>
                      <motion.p 
                        className={`mt-2 text-base sm:text-lg ${
                          isDarkMode ? "text-slate-400" : "text-gray-600"
                        }`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {projectDescription}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="flex items-center gap-2">
                {isEditingTitle ? (
                  <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={cancelTitleEdit}
                        className={isDarkMode ? "border-slate-700 text-slate-400" : ""}
                      >
                        Cancel
                  </Button>
                </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="sm"
                        onClick={saveTitleEdit}
                        className={isDarkMode 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        }
                      >
                        Save Changes
                </Button>
              </motion.div>
                  </>
                ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingTitle(true)}
                      className={isDarkMode 
                        ? "border-slate-700 text-slate-300 hover:bg-slate-700" 
                        : "hover:bg-gray-50"
                      }
                    >
                      <PenLine className="w-4 h-4 mr-2" />
                      Edit Project
                </Button>
              </motion.div>
                )}
                {!isEditingTitle && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={handleShare}
                      className={`relative ${
                        isDarkMode 
                          ? "border-slate-700 text-slate-300 hover:bg-slate-700" 
                          : "hover:bg-gray-50"
                      } ${hasUnsavedChanges ? "animate-pulse" : ""}`}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                      {hasUnsavedChanges && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </Button>
                  </motion.div>
                )}
            </div>
          </div>

            {/* Quick stats with enhanced visuals */}
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mt-6"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate="show"
            >
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`flex items-center p-4 rounded-lg ${
                  isDarkMode 
                    ? "bg-slate-800/90 border border-slate-700/80" 
                    : "bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm"
                }`}
              >
                <div className={`rounded-full p-2 mr-3 ${
                  isDarkMode 
                    ? "bg-blue-900/30 text-blue-400" 
                    : "bg-blue-50 text-blue-500"
                }`}>
                  <Calendar className="w-5 h-5" />
              </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Duration</p>
                  <p className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>4 Months</p>
                </div>
              </motion.div>

              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`flex items-center p-4 rounded-lg ${
                  isDarkMode 
                    ? "bg-slate-800/90 border border-slate-700/80" 
                    : "bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm"
                }`}
              >
                <div className={`rounded-full p-2 mr-3 ${
                  isDarkMode 
                    ? "bg-green-900/30 text-green-400" 
                    : "bg-green-50 text-green-500"
                }`}>
                  <Users className="w-5 h-5" />
              </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Team Size</p>
                  <p className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>12 People</p>
              </div>
              </motion.div>

              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`flex items-center p-4 rounded-lg ${
                  isDarkMode 
                    ? "bg-slate-800/90 border border-slate-700/80" 
                    : "bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm"
                }`}
              >
                <div className={`rounded-full p-2 mr-3 ${
                  isDarkMode 
                    ? "bg-purple-900/30 text-purple-400" 
                    : "bg-purple-50 text-purple-500"
                }`}>
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Budget</p>
                  <p className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>₵148,000</p>
              </div>
              </motion.div>

              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`flex items-center p-4 rounded-lg ${
                  isDarkMode 
                    ? "bg-slate-800/90 border border-slate-700/80" 
                    : "bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm"
                }`}
              >
                <div className={`rounded-full p-2 mr-3 ${
                  isDarkMode 
                    ? "bg-amber-900/30 text-amber-400" 
                    : "bg-amber-50 text-amber-500"
                }`}>
                  <Package className="w-5 h-5" />
            </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Resources</p>
                  <p className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>32 Items</p>
              </div>
              </motion.div>
            </motion.div>
              </div>
            </div>

        {/* AI Insights Section - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <Card className={`mb-8 shadow-lg overflow-hidden ${
            isDarkMode 
              ? "bg-gradient-to-br from-slate-800 to-slate-800/90 border-blue-900/30" 
              : "bg-gradient-to-br from-white to-blue-50/30 border-blue-100"
          }`}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 blur-3xl -z-10"></div>
            
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <div className={`relative p-1.5 rounded-full ${isDarkMode ? "bg-blue-900/40" : "bg-blue-100"}`}>
                  <Lightbulb className={`w-5 h-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          </div>
                <span className={isDarkMode ? "text-white" : "text-gray-900"}>
                  AI-Generated Insights
                </span>
              </CardTitle>
              <CardDescription className="text-base">
                Smart analysis and recommendations for your construction plan
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InsightItem 
                  title="Local Building Regulations"
                  description="Your plan complies with Greater Accra building codes. Permit processing typically takes 4-6 weeks."
                  icon={<FileText className="w-5 h-5" />}
                  type="default"
                  animationDelay={0.1}
                />
                <InsightItem 
                  title="Cost Optimization"
                  description="Using local materials can reduce costs by 15-20%. Consider bulk purchasing for major materials."
                  icon={<DollarSign className="w-5 h-5" />}
                  type="success"
                  animationDelay={0.15}
                />
                <InsightItem 
                  title="Climate Considerations"
                  description="Plan includes proper drainage systems and humidity control for coastal climate conditions."
                  icon={<Sun className="w-5 h-5" />}
                  type="warning"
                  animationDelay={0.2}
                />
                <InsightItem 
                  title="Resource Planning"
                  description="Peak resource demand expected during foundation and structural phases. Early booking recommended."
                  icon={<Package className="w-5 h-5" />}
                  type="default"
                  animationDelay={0.25}
                />
      </div>

              <motion.div 
                className="mt-4 text-right"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div 
                  whileHover={{ scale: 1.02, x: -5 }}
                  className="inline-flex items-center text-sm font-medium cursor-pointer"
                >
                  <span className={isDarkMode ? "text-blue-400" : "text-blue-600"}>
                    View all insights
                  </span>
                  <ArrowUpRight className={`ml-1 w-4 h-4 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs defaultValue="plan" className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList className={isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-gray-100"}>
                  <TabsTrigger value="plan" className="relative">
                    <FileText className="w-4 h-4 mr-2" />
                    Plan Overview
                  </TabsTrigger>
                  <TabsTrigger value="timeline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="resources">
                    <Package className="w-4 h-4 mr-2" />
                    Resources
                  </TabsTrigger>
                  <TabsTrigger value="docs">
                    <FileText className="w-4 h-4 mr-2" />
                    Documents
                  </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRegenerate}
                      className={`relative ${
                        isDarkMode 
                          ? "border-slate-700 text-slate-300 hover:bg-slate-700" 
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-700" : ""}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Print
                  </Button>
                </motion.div>
        </div>
      </div>

              <div className={`border rounded-lg ${
                isDarkMode ? "border-slate-700 bg-slate-800/50" : "border-gray-100"
              }`}>
        <AnimatePresence mode="wait">
                  <TabsContent value="plan" className="mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="p-6"
                    >
                      <ProjectPhases />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className={isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white shadow"}>
                        <CardHeader>
                          <CardTitle className={isDarkMode ? "text-white" : "text-gray-900"}>Interactive Timeline</CardTitle>
                          <CardDescription className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Visualize your project timeline and dependencies
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className={`border rounded-md p-8 text-center ${
                            isDarkMode ? "bg-slate-900/50 border-slate-700" : "bg-gray-100"
                          }`}>
                            <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>Gantt chart visualization would appear here</p>
                            <div className="h-64 flex items-center justify-center">
                              <Calendar className={`w-16 h-16 ${isDarkMode ? "text-slate-600" : "text-gray-300"}`} />
                </div>
                          </div>
                          <div className="flex gap-2 justify-end mt-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button variant="outline" size="sm" className={isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-700" : ""}>
                                <Settings className="w-4 h-4 mr-2" />
                                Configure View
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button size="sm" className={isDarkMode 
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                              }>
                                <Download className="w-4 h-4 mr-2" />
                                Export Timeline
                    </Button>
                  </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="resources" className="mt-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className={isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white shadow"}>
                        <CardHeader>
                          <CardTitle className={isDarkMode ? "text-white" : "text-gray-900"}>Resource Allocation</CardTitle>
                          <CardDescription className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Manage and optimize your project resources
                          </CardDescription>
                    </CardHeader>
                        <CardContent className="p-6">
                          {/* Assume ResourceCard components are rendered here */}
                          <div className="h-64 flex items-center justify-center">
                            <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>Resource chart would appear here</p>
                      </div>
                    </CardContent>
                  </Card>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="docs" className="mt-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className={isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white shadow"}>
                        <CardHeader>
                          <CardTitle className={isDarkMode ? "text-white" : "text-gray-900"}>Project Documents</CardTitle>
                          <CardDescription className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                            Generated documents and specifications
                          </CardDescription>
                    </CardHeader>
                        <CardContent className="p-6">
                          {/* Assume DocumentCard components are rendered here */}
                          <div className="h-64 flex items-center justify-center">
                            <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>Document list would appear here</p>
                        </div>
                          <motion.div whileHover={{ y: -3 }} className="mt-4">
                            <Button className={`w-full ${
                              isDarkMode 
                                ? "border-slate-700 bg-slate-700 hover:bg-slate-600 text-slate-200" 
                                : "bg-white hover:bg-gray-50 border"
                            }`}>
                              <PlusCircle className="w-4 h-4 mr-2" />
                              Generate Additional Document
                            </Button>
                          </motion.div>
                    </CardContent>
                  </Card>
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
                </div>
            </Tabs>
          </motion.div>
                                  </div>
                                </div>

      {/* Action Buttons - Enhanced */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              className={`flex items-center gap-2 ${
                isDarkMode 
                  ? "border-slate-700 text-slate-300 hover:bg-slate-700" 
                  : "hover:bg-gray-50"
              }`}
              onClick={navigateToProjectInput}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Adjust Inputs</span>
                              </Button>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <Button className="relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md hover:shadow-xl text-white">
              <span>Continue to Details</span>
              <ChevronRight className="w-4 h-4" />
                        </Button>
          </motion.div>
        </motion.div>
                      </div>

      {/* Collaborate Modal */}
      <AnimatePresence>
        {showCollaborateModal && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={`rounded-lg p-6 max-w-md w-full ${
                isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white"
              }`}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : ""}`}>Share Project Plan</h2>
                <div 
                  className={`p-1 rounded-full cursor-pointer ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-100"}`}
                  onClick={() => setShowCollaborateModal(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                            </div>
                              </div>
              {/* Collaborate form content here */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : ""}`}>Add Collaborators</label>
                  <div className="flex gap-2">
                    <div className="relative w-full">
                      <input 
                        type="text" 
                        placeholder="Email address" 
                        className={`w-full p-2 border rounded-md ${
                          isDarkMode ? "bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" : "bg-white"
                        }`}
                      />
                      <User className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                        isDarkMode ? "text-slate-500" : "text-gray-400"
                      }`} />
                            </div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button className={isDarkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"}>
                        <PlusCircle className="w-4 h-4" />
                      </Button>
                    </motion.div>
                          </div>
                        </div>
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : ""}`}>Project Link</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value="https://buildese.com/projects/abc123" 
                      className={`w-full p-2 border rounded-md ${
                        isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50"
                      }`}
                      readOnly
                    />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" className={isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-700" : ""}>
                        Copy
                      </Button>
            </motion.div>
                </div>
                </div>
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : ""}`}>Add a Message</label>
                  <textarea 
                    className={`w-full p-2 border rounded-md h-20 ${
                      isDarkMode ? "bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" : "bg-white"
                    }`}
                    placeholder="Add a note to your collaborators..."
                  />
              </div>
                            </div>
              <div className="flex justify-end gap-2 mt-6">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCollaborateModal(false)}
                    className={isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-700" : ""}
                  >
                    Cancel
                      </Button>
                    </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <Button className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md hover:shadow-xl text-white">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Share
                      </Button>
                    </motion.div>
                  </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
};

export default GeneratedPlan;
