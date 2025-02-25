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
  Zap
} from 'lucide-react';
import ProgressHeader from "@/components/generated-plan/ProgressHeader";
import ProjectOverview from "@/components/generated-plan/ProjectOverview";
import ProjectPhases from "@/components/generated-plan/ProjectPhases";
import AIRecommendations from "@/components/generated-plan/AIRecommendations";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const GeneratedPlan = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [showCollaborateModal, setShowCollaborateModal] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    // Set up a mutation observer to detect changes to the class list
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setIsDarkMode(isDark);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleRegenerate = () => {
    setIsRegenerating(true);
    // Simulate regeneration
    setTimeout(() => {
      setIsRegenerating(false);
    }, 3000);
  };

  const navigateToProjectInput = () => {
    navigate('/create-project');
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? "bg-gradient-to-b from-slate-900 to-slate-800" 
        : "bg-gradient-to-b from-blue-50/60 to-indigo-50/60"
    }`}>
      <ProgressHeader />

      {/* Tabs Navigation */}
      <div className={`${isDarkMode ? "bg-slate-800/90 border-b border-slate-700" : "bg-white/90 backdrop-blur-sm border-b shadow-sm"}`}>
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center px-6 py-2">
              <TabsList className={`grid grid-cols-4 h-10 ${isDarkMode ? "bg-slate-700" : "bg-gray-100"}`}>
                <TabsTrigger 
                  value="overview" 
                  className={`flex items-center gap-1 transition-all duration-300 ${
                    isDarkMode 
                      ? "data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-300" 
                      : "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-indigo-50 data-[state=active]:text-blue-700"
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="timeline" 
                  className={`flex items-center gap-1 transition-all duration-300 ${
                    isDarkMode 
                      ? "data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-300" 
                      : "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-indigo-50 data-[state=active]:text-blue-700"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Timeline</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="resources" 
                  className={`flex items-center gap-1 transition-all duration-300 ${
                    isDarkMode 
                      ? "data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-300" 
                      : "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-indigo-50 data-[state=active]:text-blue-700"
                  }`}
                >
                  <BarChart4 className="w-4 h-4" />
                  <span className="hidden sm:inline">Resources</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="docs" 
                  className={`flex items-center gap-1 transition-all duration-300 ${
                    isDarkMode 
                      ? "data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-300" 
                      : "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-indigo-50 data-[state=active]:text-blue-700"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Documents</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowCollaborateModal(true)}
                          className={isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-700" : ""}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Share</span>
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share with team members</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-700" : ""}
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Print</span>
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Print project plan</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Content Sections */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <TabsContent value="overview" className="space-y-6 mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h1 className={`text-2xl font-bold ${
                          isDarkMode
                            ? "bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text"
                        }`}>Project Plan Overview</h1>
                        <p className={isDarkMode ? "text-slate-400 mt-1" : "text-gray-500 mt-1"}>AI generated based on your specifications</p>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`flex items-center gap-2 ${
                            isDarkMode 
                              ? "border-slate-700 text-slate-300 hover:bg-slate-700" 
                              : "hover:border-blue-300 hover:text-blue-700"
                          }`} 
                          onClick={handleRegenerate}
                          disabled={isRegenerating}
                        >
                          <RotateCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                          {isRegenerating ? 'Regenerating...' : 'Regenerate Plan'}
                        </Button>
                      </motion.div>
                    </div>
                    
                    <ProjectOverview />
                    <ProjectPhases />
                    <AIRecommendations />
                  </motion.div>
                </TabsContent>

                <TabsContent value="timeline" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                      <CardHeader>
                        <CardTitle className={isDarkMode ? "text-white" : ""}>Interactive Timeline</CardTitle>
                        <CardDescription className={isDarkMode ? "text-slate-400" : ""}>
                          Visualize your project timeline and dependencies
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className={`border rounded-md p-8 text-center ${
                          isDarkMode ? "bg-slate-900/50 border-slate-700" : "bg-gray-100"
                        }`}>
                          <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>Gantt chart visualization would appear here</p>
                          <div className="h-64 flex items-center justify-center">
                            <Calendar className={`w-16 h-16 ${isDarkMode ? "text-slate-600" : "text-gray-300"}`} />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-700" : ""}
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Configure View
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              size="sm"
                              className={isDarkMode 
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                              }
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export Timeline
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="resources" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                      <CardHeader>
                        <CardTitle className={isDarkMode ? "text-white" : ""}>Resource Allocation</CardTitle>
                        <CardDescription className={isDarkMode ? "text-slate-400" : ""}>
                          Manage and optimize your project resources
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <ResourceCard 
                            title="Labor" 
                            allocated="$78,500" 
                            percentage={35}
                            status="optimized"
                            isDarkMode={isDarkMode}
                          />
                          <ResourceCard 
                            title="Materials" 
                            allocated="$105,300" 
                            percentage={47}
                            status="warning"
                            isDarkMode={isDarkMode}
                          />
                          <ResourceCard 
                            title="Equipment" 
                            allocated="$40,200" 
                            percentage={18}
                            status="optimized"
                            isDarkMode={isDarkMode}
                          />
                        </div>
                        <div className={`border rounded-md p-8 text-center ${
                          isDarkMode ? "bg-slate-900/50 border-slate-700" : "bg-gray-100"
                        }`}>
                          <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>Resource distribution chart would appear here</p>
                          <div className="h-48 flex items-center justify-center">
                            <BarChart4 className={`w-16 h-16 ${isDarkMode ? "text-slate-600" : "text-gray-300"}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="docs" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                      <CardHeader>
                        <CardTitle className={isDarkMode ? "text-white" : ""}>Project Documents</CardTitle>
                        <CardDescription className={isDarkMode ? "text-slate-400" : ""}>
                          Generated documents and specifications
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DocumentCard 
                            title="Project Specification"
                            type="PDF"
                            modified="Today"
                            status="generated"
                            isDarkMode={isDarkMode}
                          />
                          <DocumentCard 
                            title="Budget Breakdown"
                            type="XLSX"
                            modified="Today"
                            status="generated"
                            isDarkMode={isDarkMode}
                          />
                          <DocumentCard 
                            title="Team Allocation"
                            type="PDF"
                            modified="Today"
                            status="generated"
                            isDarkMode={isDarkMode}
                          />
                          <DocumentCard 
                            title="Material Specifications"
                            type="PDF"
                            modified="Pending"
                            status="pending"
                            isDarkMode={isDarkMode}
                          />
                        </div>
                        <motion.div 
                          whileHover={{ y: -3 }}
                          className="mt-4"
                        >
                          <Button 
                            className={`w-full ${
                              isDarkMode 
                                ? "border-slate-700 bg-slate-700 hover:bg-slate-600 text-slate-200" 
                                : "bg-white hover:bg-gray-50 border"
                            }`}
                          >
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
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-4xl mx-auto p-6">
        <motion.div 
          className="flex justify-between pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              className={`space-x-2 transition-colors ${
                isDarkMode 
                  ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700" 
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
            <Button className="relative space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md hover:shadow-xl text-white">
              <span>Continue to Details</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Collaborate Modal (simplified for mockup) */}
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
                  className={`p-1 rounded-full cursor-pointer ${
                    isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setShowCollaborateModal(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : ""}`}>Add Collaborators</label>
                  <div className="flex gap-2">
                    <div className="flex-grow relative">
                      <input 
                        type="text" 
                        placeholder="Email address" 
                        className={`w-full p-2 border rounded-md ${
                          isDarkMode ? "bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" : ""
                        }`}
                      />
                      <User className={`w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? "text-slate-500" : "text-gray-400"
                      }`} />
                    </div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button className={isDarkMode 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : "bg-blue-600 hover:bg-blue-700"
                      }>
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
                      <Button 
                        variant="outline"
                        className={isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-700" : ""}
                      >
                        Copy
                      </Button>
                    </motion.div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : ""}`}>Add a Message</label>
                  <textarea 
                    className={`w-full p-2 border rounded-md h-20 ${
                      isDarkMode ? "bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" : ""
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
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <Button className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-colors">
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

// Helper components
const ResourceCard = ({ title, allocated, percentage, status, isDarkMode }) => {
  const getStatusConfig = () => {
    if (status === 'optimized') {
      return {
        badge: isDarkMode ? 'bg-green-900/30 text-green-400 hover:bg-green-800/50' : 'bg-green-100 text-green-600 hover:bg-green-200',
        label: 'Optimized',
        icon: <Check className="h-3 w-3 mr-1" />,
        barColor: isDarkMode ? 'bg-green-600' : 'bg-green-500'
      };
    } else {
      return {
        badge: isDarkMode ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-800/50' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
        label: 'Review',
        icon: <AlertTriangle className="h-3 w-3 mr-1" />,
        barColor: isDarkMode ? 'bg-amber-600' : 'bg-yellow-500'
      };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`border rounded-lg p-4 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' 
          : 'hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <Badge className={`flex items-center ${statusConfig.badge}`}>
          {statusConfig.icon}
          {statusConfig.label}
        </Badge>
      </div>
      <div className="mt-2">
        <div className="flex justify-between items-center text-sm mb-1">
          <span className={`font-medium text-lg ${isDarkMode ? 'text-white' : ''}`}>{allocated}</span>
          <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>{percentage}% of budget</span>
        </div>
        <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
          <div 
            className={`h-2 rounded-full ${statusConfig.barColor}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </motion.div>
  );
};

const DocumentCard = ({ title, type, modified, status, isDarkMode }) => {
  // Get the appropriate badge and icon color based on the document type
  const getTypeConfig = () => {
    if (type === 'PDF') {
      return isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600';
    } else if (type === 'XLSX') {
      return isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600';
    } else {
      return isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600';
    }
  };

  const getStatusConfig = () => {
    if (status === 'generated') {
      return {
        badge: isDarkMode ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50' : 'bg-blue-100 text-blue-600 hover:bg-blue-200',
        icon: <Sparkles className="h-3 w-3 mr-1" />,
        label: 'Generated'
      };
    } else {
      return {
        badge: isDarkMode ? 'bg-slate-800/80 text-slate-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        icon: <Clock className="h-3 w-3 mr-1" />,
        label: 'Pending'
      };
    }
  };

  const typeConfig = getTypeConfig();
  const statusConfig = getStatusConfig();

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={`border rounded-lg p-4 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' 
          : 'hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className={`h-10 w-10 rounded flex items-center justify-center ${typeConfig}`}>
            <FileText className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Modified: {modified}</p>
          </div>
        </div>
        <Badge className={`flex items-center ${statusConfig.badge}`}>
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </Badge>
      </div>
      <div className="flex justify-end mt-3">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="outline" 
            size="sm"
            className={isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : ''}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GeneratedPlan;
