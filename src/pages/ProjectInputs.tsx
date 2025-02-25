import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  ChevronRight,
  Mic,
  Lightbulb,
  Save,
  ArrowRight,
  Rocket,
  MessageSquare,
  Clock,
  DollarSign,
  Home,
  Hexagon
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InsightItemProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  type?: 'default' | 'warning' | 'success';
}

const ProjectInputs = () => {
  const [progress, setProgress] = React.useState(25);
  const [activeTab, setActiveTab] = useState("basic");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

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

  const handleGeneratePlan = () => {
    navigate('/generated-plan');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update progress based on active tab
    if (value === "basic") setProgress(25);
    if (value === "building") setProgress(50);
    if (value === "requirements") setProgress(75);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? "bg-gradient-to-b from-slate-900 to-slate-800" 
        : "bg-gradient-to-b from-blue-50/60 to-indigo-50/60"
    }`}>
      {/* Top Navigation */}
      <div className={`backdrop-blur-lg p-6 sticky top-0 z-50 transition-all duration-300 ${
        isDarkMode 
          ? "bg-slate-900/80 border-b border-slate-700" 
          : "bg-white/80 border-b border-blue-100/50 shadow-sm"
      }`}>
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-3xl font-bold ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text"
              }`}
            >
              Create New Project
            </motion.h1>
            
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button 
                variant="outline" 
                className={`transition-all duration-300 ${
                  isDarkMode
                    ? "text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700"
                    : "text-gray-700 hover:text-gray-900 hover:border-blue-300"
                }`}
              >
                <Hexagon className="w-4 h-4 mr-2" />
                Advanced Mode
              </Button>
            </motion.div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="relative">
              <Progress 
                value={progress} 
                className={`h-2.5 ${
                  isDarkMode ? "bg-slate-700" : "bg-gray-100"
                }`}
              />
              <div 
                className={`absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700 ease-in-out`} 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <motion.span 
                className={`font-medium px-2 py-1 rounded-full ${
                  activeTab === "basic" 
                    ? (isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700") 
                    : (isDarkMode ? "text-slate-400" : "text-gray-600")
                }`}
              >
                Details
              </motion.span>
              <motion.span 
                className={`font-medium px-2 py-1 rounded-full ${
                  activeTab === "building" 
                    ? (isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700") 
                    : (isDarkMode ? "text-slate-400" : "text-gray-600")
                }`}
              >
                Specifications
              </motion.span>
              <motion.span 
                className={`font-medium px-2 py-1 rounded-full ${
                  activeTab === "requirements" 
                    ? (isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700") 
                    : (isDarkMode ? "text-slate-400" : "text-gray-600")
                }`}
              >
                Requirements
              </motion.span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* AI Assistant Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={`overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 ${
            isDarkMode 
              ? "bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-800/30" 
              : "bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-100"
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full ${
                  isDarkMode ? "bg-blue-500/20" : "bg-blue-100"
                }`}>
                  <Rocket className={`w-6 h-6 ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`} />
                </div>
                <div>
                  <h3 className={`font-semibold text-lg ${
                    isDarkMode ? "text-blue-300" : "text-blue-900"
                  }`}>AI Project Assistant</h3>
                  <p className={`text-base mt-2 leading-relaxed ${
                    isDarkMode ? "text-slate-300" : "text-blue-800/90"
                  }`}>
                    I'll help create a detailed project plan. Start by providing basic information about your construction project.
                  </p>
                  <div className="mt-3 flex items-center">
                    <div className={`h-2 w-2 rounded-full animate-pulse ${
                      isDarkMode ? "bg-green-400" : "bg-green-500"
                    }`}></div>
                    <span className={`ml-2 text-sm ${
                      isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}>AI assistant is ready</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Project Details Tabs */}
        <Tabs 
          defaultValue="basic" 
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList className={`grid w-full grid-cols-3 p-1 rounded-lg ${
            isDarkMode ? "bg-slate-800" : "bg-gray-100/50"
          }`}>
            <TabsTrigger 
              value="basic" 
              className={`transition-all duration-300 ${
                isDarkMode 
                  ? "data-[state=active]:bg-slate-700 data-[state=active]:text-white" 
                  : "data-[state=active]:bg-white data-[state=active]:shadow-sm"
              }`}
            >
              <Home className="w-4 h-4 mr-2" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger 
              value="building" 
              className={`transition-all duration-300 ${
                isDarkMode 
                  ? "data-[state=active]:bg-slate-700 data-[state=active]:text-white" 
                  : "data-[state=active]:bg-white data-[state=active]:shadow-sm"
              }`}
            >
              <Hexagon className="w-4 h-4 mr-2" />
              Building Details
            </TabsTrigger>
            <TabsTrigger 
              value="requirements" 
              className={`transition-all duration-300 ${
                isDarkMode 
                  ? "data-[state=active]:bg-slate-700 data-[state=active]:text-white" 
                  : "data-[state=active]:bg-white data-[state=active]:shadow-sm"
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Requirements
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`overflow-hidden border ${
                  isDarkMode ? "bg-slate-800 border-slate-700" : "border-gray-200"
                }`}>
                  <CardHeader className={isDarkMode ? "bg-slate-800" : "bg-gray-50/50"}>
                    <CardTitle className={`text-xl ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* Voice Input Section */}
                    <div className="space-y-3">
                      <label className={`text-sm font-medium ${
                        isDarkMode ? "text-slate-300" : "text-gray-900"
                      }`}>
                        Project Description
                      </label>
                      <div className="flex space-x-3">
                        <Input 
                          className={`flex-1 transition-all duration-300 ${
                            isDarkMode 
                              ? "bg-slate-900 border-slate-700 focus:border-blue-500 text-white" 
                              : "border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                          }`} 
                          placeholder="Describe your project (e.g., 'Two-story residential house with 3 bedrooms')" 
                        />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className={`${
                                    isDarkMode 
                                      ? "bg-blue-900/20 border-blue-700/50 hover:bg-blue-800/30 text-blue-400" 
                                      : "hover:bg-blue-50 text-blue-600 border-blue-200"
                                  }`}
                                >
                                  <Mic className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Use voice input</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    {/* Core Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className={`text-sm font-medium ${
                          isDarkMode ? "text-slate-300" : "text-gray-900"
                        }`}>Project Type</label>
                        <Select>
                          <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                            <SelectItem value="residential">Residential House</SelectItem>
                            <SelectItem value="apartment">Apartment Building</SelectItem>
                            <SelectItem value="commercial">Commercial Building</SelectItem>
                            <SelectItem value="renovation">Renovation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <label className={`text-sm font-medium ${
                          isDarkMode ? "text-slate-300" : "text-gray-900"
                        }`}>Location</label>
                        <Input 
                          placeholder="Enter city/region" 
                          className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"} 
                        />
                      </div>

                      <div className="space-y-3">
                        <label className={`text-sm font-medium ${
                          isDarkMode ? "text-slate-300" : "text-gray-900"
                        }`}>Budget Range</label>
                        <Select>
                          <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                            <SelectItem value="50-100k">$50,000 - $100,000</SelectItem>
                            <SelectItem value="100-200k">$100,000 - $200,000</SelectItem>
                            <SelectItem value="200-500k">$200,000 - $500,000</SelectItem>
                            <SelectItem value="500k+">Above $500,000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <label className={`text-sm font-medium ${
                          isDarkMode ? "text-slate-300" : "text-gray-900"
                        }`}>Timeline</label>
                        <Select>
                          <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                            <SelectItem value="6-12">6-12 months</SelectItem>
                            <SelectItem value="12-18">12-18 months</SelectItem>
                            <SelectItem value="18-24">18-24 months</SelectItem>
                            <SelectItem value="24+">Over 24 months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Building Details Tab */}
            <TabsContent value="building" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`${
                  isDarkMode ? "bg-slate-800 border-slate-700" : "border-gray-200"
                }`}>
                  <CardHeader className={isDarkMode ? "bg-slate-800" : "bg-gray-50/50"}>
                    <CardTitle className={`text-xl ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>Building Specifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8 p-6">
                    {/* Building Type */}
                    <div className="space-y-3">
                      <label className={`text-sm font-medium ${
                        isDarkMode ? "text-slate-300" : "text-gray-900"
                      }`}>Building Structure</label>
                      <Select>
                        <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                          <SelectValue placeholder="Select structure type" />
                        </SelectTrigger>
                        <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                          <SelectItem value="single">Single Story</SelectItem>
                          <SelectItem value="double">Two Story</SelectItem>
                          <SelectItem value="multi">Multi Story</SelectItem>
                          <SelectItem value="split">Split Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Plot & Building Size */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className={`text-sm font-medium ${
                          isDarkMode ? "text-slate-300" : "text-gray-900"
                        }`}>Plot Size</label>
                        <div className="flex space-x-3">
                          <Input 
                            type="number" 
                            placeholder="Size" 
                            className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"} 
                          />
                          <Select defaultValue="sqm">
                            <SelectTrigger className={`w-28 ${
                              isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"
                            }`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                              <SelectItem value="sqm">sq.m</SelectItem>
                              <SelectItem value="sqft">sq.ft</SelectItem>
                              <SelectItem value="acres">acres</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className={`text-sm font-medium ${
                          isDarkMode ? "text-slate-300" : "text-gray-900"
                        }`}>Building Size</label>
                        <div className="flex space-x-3">
                          <Input 
                            type="number" 
                            placeholder="Size" 
                            className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"} 
                          />
                          <Select defaultValue="sqm">
                            <SelectTrigger className={`w-28 ${
                              isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"
                            }`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                              <SelectItem value="sqm">sq.m</SelectItem>
                              <SelectItem value="sqft">sq.ft</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Room Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className={`text-sm font-medium ${
                          isDarkMode ? "text-slate-300" : "text-gray-900"
                        }`}>Bedrooms</label>
                        <Input 
                          type="number" 
                          placeholder="Number of bedrooms" 
                          className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"} 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className={`text-sm font-medium ${
                          isDarkMode ? "text-slate-300" : "text-gray-900"
                        }`}>Bathrooms</label>
                        <Input 
                          type="number" 
                          placeholder="Number of bathrooms" 
                          className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"} 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className={`text-sm font-medium ${
                          isDarkMode ? "text-slate-300" : "text-gray-900"
                        }`}>Living Areas</label>
                        <Input 
                          type="number" 
                          placeholder="Number of living areas" 
                          className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"} 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className={`text-sm font-medium ${
                          isDarkMode ? "text-slate-300" : "text-gray-900"
                        }`}>Kitchens</label>
                        <Input 
                          type="number" 
                          placeholder="Number of kitchens" 
                          className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"} 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Requirements Tab */}
            <TabsContent value="requirements" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`${
                  isDarkMode ? "bg-slate-800 border-slate-700" : "border-gray-200"
                }`}>
                  <CardHeader className={isDarkMode ? "bg-slate-800" : "bg-gray-50/50"}>
                    <CardTitle className={`text-xl ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>Additional Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className={`text-sm font-medium ${
                          isDarkMode ? "text-slate-300" : "text-gray-900"
                        }`}>Garage</label>
                        <Select>
                          <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                            <SelectItem value="none">No Garage</SelectItem>
                            <SelectItem value="single">Single Car</SelectItem>
                            <SelectItem value="double">Double Car</SelectItem>
                            <SelectItem value="triple">Triple Car</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <label className={`text-sm font-medium ${
                          isDarkMode ? "text-slate-300" : "text-gray-900"
                        }`}>Outdoor Space</label>
                        <Select>
                          <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                            <SelectValue placeholder="Select options" />
                          </SelectTrigger>
                          <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                            <SelectItem value="garden">Garden</SelectItem>
                            <SelectItem value="patio">Patio</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <label className={`text-sm font-medium ${
                          isDarkMode ? "text-slate-300" : "text-gray-900"
                        }`}>Style</label>
                        <Select>
                          <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                            <SelectItem value="modern">Modern</SelectItem>
                            <SelectItem value="traditional">Traditional</SelectItem>
                            <SelectItem value="contemporary">Contemporary</SelectItem>
                            <SelectItem value="minimalist">Minimalist</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <label className={`text-sm font-medium ${
                          isDarkMode ? "text-slate-300" : "text-gray-900"
                        }`}>Special Features</label>
                        <Select>
                          <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                            <SelectValue placeholder="Select features" />
                          </SelectTrigger>
                          <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                            <SelectItem value="balcony">Balcony</SelectItem>
                            <SelectItem value="basement">Basement</SelectItem>
                            <SelectItem value="pool">Swimming Pool</SelectItem>
                            <SelectItem value="solar">Solar Panels</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        {/* New detailed information card to gather additional data for plan generation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className={`overflow-hidden border ${
            isDarkMode ? "bg-slate-800 border-blue-800/30" : "border-blue-100"
          }`}>
            <CardHeader className={isDarkMode ? "bg-slate-800" : "bg-blue-50/50"}>
              <CardTitle className={`flex items-center space-x-3 text-xl ${
                isDarkMode ? "text-blue-300" : "text-gray-900"
              }`}>
                <Sparkles className={`h-5 w-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                <span>Project Objectives & Constraints</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-3">
                <label className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-gray-900"}`}>Project Objectives</label>
                <textarea
                  placeholder="Enter key objectives for your project, such as design goals, target audience, or special features."
                  className={`w-full p-2 rounded border transition-all duration-300 ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}`}
                ></textarea>
              </div>
              <div className="space-y-3">
                <label className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-gray-900"}`}>Environmental & Local Constraints</label>
                <textarea
                  placeholder="Provide any local regulations, environmental constraints, or specific site conditions that may affect the project."
                  className={`w-full p-2 rounded border transition-all duration-300 ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}`}
                ></textarea>
              </div>
              <div className="space-y-3">
                <label className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-gray-900"}`}>Additional Instructions / Special Requests</label>
                <textarea
                  placeholder="Include any other instructions or requirements to help generate a more accurate project plan."
                  className={`w-full p-2 rounded border transition-all duration-300 ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}`}
                ></textarea>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="flex justify-end space-x-3 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              className={`transition-colors ${
                isDarkMode 
                  ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700" 
                  : "hover:bg-gray-50"
              }`}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <Button 
              className={`relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-xl text-white`}
              onClick={handleGeneratePlan}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Generate Plan</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

const InsightItem: React.FC<InsightItemProps> = ({ title, description, icon, type = 'default' }) => {
  const styles = {
    default: {
      container: 'bg-blue-50/50 border border-blue-100/50 hover:border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50 dark:hover:border-blue-700',
      icon: 'text-blue-500 dark:text-blue-400',
      heading: 'text-blue-900 dark:text-blue-300',
      text: 'text-blue-800 dark:text-blue-400',
    },
    warning: {
      container: 'bg-amber-50/50 border border-amber-100/50 hover:border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50 dark:hover:border-amber-700',
      icon: 'text-amber-500 dark:text-amber-400',
      heading: 'text-amber-900 dark:text-amber-300',
      text: 'text-amber-800 dark:text-amber-400',
    },
    success: {
      container: 'bg-green-50/50 border border-green-100/50 hover:border-green-200 dark:bg-green-900/20 dark:border-green-800/50 dark:hover:border-green-700',
      icon: 'text-green-500 dark:text-green-400',
      heading: 'text-green-900 dark:text-green-300',
      text: 'text-green-800 dark:text-green-400',
    }
  };

  const style = styles[type];

  return (
    <motion.div 
      whileHover={{ x: 5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md ${style.container}`}
    >
      <div className={`rounded-full p-2 bg-current bg-opacity-10 ${style.icon}`}>
        {icon || <Sparkles className={`w-5 h-5 ${style.icon}`} />}
      </div>
      <div>
        <h4 className={`font-medium ${style.heading}`}>{title}</h4>
        <p className={`text-sm mt-1 leading-relaxed ${style.text}`}>{description}</p>
      </div>
    </motion.div>
  );
};

export default ProjectInputs;
