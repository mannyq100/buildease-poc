import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle,
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
  Hexagon,
  Upload,
  AlertTriangle,
  Image as ImageIcon,
  Phone, 
  HelpCircle,
  MapPin,
  Trees,
  Building,
  ParkingCircle,
  Ruler,
  Sun,
  Landmark,
  Loader2,
  Zap,
  Languages,
  Pen,
  Users,
  BookOpen,
  Camera,
  FileDown,
  FileUp,
  Settings,
  User,
  Paintbrush,
  Check,
  Heart,
  X,
  FileText
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';

interface InsightItemProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  type?: 'default' | 'warning' | 'success';
}

const ProjectInputs = () => {
  // State management
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("intro");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    language: "english",
    projectName: "",
    projectType: "",
    location: "",
    region: "greater-accra",
    budget: "",
    currency: "cedi",
    timeline: "",
    plotSize: "",
    plotSizeUnit: "sqm",
    buildingSize: "",
    buildingSizeUnit: "sqm",
    bedrooms: "",
    bathrooms: "",
    livingAreas: "",
    kitchens: "",
    buildingStructure: "",
    roofType: "",
    foundationType: "",
    wallMaterial: "",
    floorMaterial: "",
    ceilingMaterial: "",
    garage: "",
    outdoorSpace: "",
    style: "",
    specialFeatures: [],
    objectives: "",
    constraints: "",
    additionalRequests: "",
    energyEfficiency: false,
    waterConservation: false,
    localMaterials: true,
    accessibilityFeatures: false,
    traditionalElements: false,
    modernAmenities: [],
    description: "",
    windowType: "",
    images: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [costEstimate, setCostEstimate] = useState({
    min: 0,
    max: 0
  });
  const navigate = useNavigate();

  // Options for the form
  const regions = [
    { value: "greater-accra", label: "Greater Accra" },
    { value: "ashanti", label: "Ashanti" },
    { value: "eastern", label: "Eastern" },
    { value: "western", label: "Western" },
    { value: "central", label: "Central" },
    { value: "volta", label: "Volta" },
    { value: "northern", label: "Northern" },
    { value: "upper-east", label: "Upper East" },
    { value: "upper-west", label: "Upper West" },
    { value: "bono", label: "Bono" },
    { value: "bono-east", label: "Bono East" },
    { value: "ahafo", label: "Ahafo" },
    { value: "savannah", label: "Savannah" },
    { value: "north-east", label: "North East" },
    { value: "oti", label: "Oti" },
    { value: "western-north", label: "Western North" }
  ];

  const projectTypes = [
    { value: "residential-single", label: "Residential (Single Family)" },
    { value: "residential-multi", label: "Residential (Multi-Family)" },
    { value: "commercial-small", label: "Commercial (Small)" },
    { value: "commercial-large", label: "Commercial (Large)" },
    { value: "mixed-use", label: "Mixed-Use Building" },
    { value: "renovation", label: "Renovation Project" },
    { value: "community", label: "Community Building" },
    { value: "religious", label: "Religious Building" },
    { value: "educational", label: "Educational Facility" }
  ];

  const roofTypes = [
    { value: "gable", label: "Gable Roof" },
    { value: "hip", label: "Hip Roof" },
    { value: "flat", label: "Flat Roof" },
    { value: "shed", label: "Shed Roof" },
    { value: "metal-sheet", label: "Metal Sheet Roof" },
    { value: "aluminum", label: "Aluminum Roof" },
    { value: "clay-tiles", label: "Clay Tiles" },
    { value: "concrete-tiles", label: "Concrete Tiles" },
    { value: "thatch", label: "Traditional Thatch" }
  ];

  const foundationTypes = [
    { value: "strip", label: "Strip Foundation" },
    { value: "raft", label: "Raft Foundation" },
    { value: "pad", label: "Pad Foundation" },
    { value: "pile", label: "Pile Foundation" },
    { value: "raised-pile", label: "Raised Pile Foundation" }
  ];

  const wallMaterials = [
    { value: "concrete-blocks", label: "Concrete Blocks" },
    { value: "brick", label: "Brick" },
    { value: "wood", label: "Wood" },
    { value: "stone", label: "Stone" },
    { value: "clay", label: "Clay/Earth Blocks" },
    { value: "compressed-earth", label: "Compressed Earth Blocks" },
    { value: "glass", label: "Glass Walls" },
    { value: "bamboo", label: "Bamboo" },
    { value: "rammed-earth", label: "Rammed Earth" }
  ];

  const floorMaterials = [
    { value: "concrete", label: "Concrete" },
    { value: "ceramic-tiles", label: "Ceramic Tiles" },
    { value: "porcelain-tiles", label: "Porcelain Tiles" },
    { value: "terrazzo", label: "Terrazzo" },
    { value: "wood", label: "Wood" },
    { value: "vinyl", label: "Vinyl" },
    { value: "stone", label: "Stone" },
    { value: "earth", label: "Polished Earth" },
    { value: "granite", label: "Granite" },
    { value: "marble", label: "Marble" }
  ];

  const modernAmenities = [
    { value: "air-conditioning", label: "Air Conditioning" },
    { value: "ceiling-fans", label: "Ceiling Fans" },
    { value: "solar-power", label: "Solar Power System" },
    { value: "water-storage", label: "Water Storage System" },
    { value: "internet", label: "High-Speed Internet" },
    { value: "smart-home", label: "Smart Home Features" },
    { value: "backup-generator", label: "Backup Generator" },
    { value: "security-system", label: "Security System" },
    { value: "borehole", label: "Borehole Water System" },
    { value: "water-heating", label: "Water Heating System" }
  ];

  const specialFeatures = [
    { value: "balcony", label: "Balcony" },
    { value: "porch", label: "Porch" },
    { value: "courtyard", label: "Inner Courtyard" },
    { value: "rooftop-terrace", label: "Rooftop Terrace" },
    { value: "swimming-pool", label: "Swimming Pool" },
    { value: "outdoor-kitchen", label: "Outdoor Kitchen" },
    { value: "gazebo", label: "Gazebo" },
    { value: "fence-wall", label: "Fence/Security Wall" },
    { value: "landscaping", label: "Landscaped Garden" },
    { value: "boys-quarters", label: "Boys Quarters/Staff Housing" },
    { value: "accessibility", label: "Accessibility Features" },
    { value: "rainwater-harvesting", label: "Rainwater Harvesting" }
  ];

  // Check for dark mode
  useEffect(() => {
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

  // Calculate cost estimate
  useEffect(() => {
    // Very simplified cost estimation - in a real app this would be more sophisticated
    if (formData.buildingSize && formData.buildingStructure) {
      let baseRate = 0;
      
      // Base rates in Ghana Cedis per square meter (approximate 2023 values)
      switch (formData.buildingStructure) {
        case 'single':
          baseRate = 3000; // Low-end single story
          break;
        case 'double':
          baseRate = 3500; // Low-end two story
          break;
        case 'multi':
          baseRate = 4000; // Low-end multi story
          break;
        default:
          baseRate = 3000;
      }
      
      // Calculate min and max estimates
      const size = parseFloat(formData.buildingSize);
      if (!isNaN(size)) {
        setCostEstimate({
          min: Math.round(size * baseRate * 0.8),
          max: Math.round(size * baseRate * 1.2)
        });
      }
    }
  }, [formData.buildingSize, formData.buildingStructure]);

  // Handle tab changes and update progress
  const handleTabChange = (value) => {
    setActiveTab(value);
    
    // Update progress based on active tab
    switch(value) {
      case "intro":
        setProgress(0);
        break;
      case "basic":
        setProgress(20);
        break;
      case "building":
        setProgress(40);
        break;
      case "materials":
        setProgress(60);
        break;
      case "features":
        setProgress(80);
        break;
      case "final":
        setProgress(95);
        break;
      default:
        setProgress(0);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Toggle modern amenities
  const toggleModernAmenity = (value) => {
    setFormData(prev => {
      const amenities = [...prev.modernAmenities];
      if (amenities.includes(value)) {
        return {
          ...prev,
          modernAmenities: amenities.filter(a => a !== value)
        };
      } else {
        return {
          ...prev,
          modernAmenities: [...amenities, value]
        };
      }
    });
  };

  // Toggle special features
  const toggleSpecialFeature = (value) => {
    setFormData(prev => {
      const features = [...prev.specialFeatures];
      if (features.includes(value)) {
        return {
          ...prev,
          specialFeatures: features.filter(f => f !== value)
        };
      } else {
        return {
          ...prev,
          specialFeatures: [...features, value]
        };
      }
    });
  };

  // Generate the plan
  const handleGeneratePlan = () => {
    setIsLoading(true);
    
    // Simulate API call to generate plan
    setTimeout(() => {
      setIsLoading(false);
      navigate('/generated-plan');
    }, 2500);
  };

  // Check if the form is complete enough to generate a plan
  const isFormComplete = () => {
    return formData.projectName && 
           formData.projectType && 
           formData.location && 
           formData.budget &&
           formData.buildingSize;
  };

  // Continue to next tab
  const handleContinue = () => {
    const tabs = ["intro", "basic", "building", "materials", "features", "final"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      handleTabChange(tabs[currentIndex + 1]);
    }
  };

  // Go back to previous tab
  const handleBack = () => {
    const tabs = ["intro", "basic", "building", "materials", "features", "final"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      handleTabChange(tabs[currentIndex - 1]);
    }
  };

  return (
    <>
      <div className={`min-h-screen transition-all duration-500 ${
        isDarkMode 
          ? "bg-gradient-to-b from-slate-900 via-indigo-950/20 to-slate-900" 
          : "bg-gradient-to-b from-blue-50 via-indigo-100/30 to-blue-50"
      }`}>
      {/* Language Selector at the very top */}
      <div className={`py-2 px-6 backdrop-blur-md transition-all duration-500 ${
        isDarkMode 
          ? "bg-slate-900/80 border-b border-slate-800" 
          : "bg-white/80 border-b border-blue-100"
      }`}>
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Languages className="w-4 h-4 mr-2 text-gray-500" />
            <Select 
              value={formData.language} 
              onValueChange={(value) => handleInputChange('language', value)}
            >
              <SelectTrigger className={`w-[140px] h-8 text-sm transition-all duration-300 ${
                isDarkMode 
                  ? "bg-slate-800 border-slate-700 hover:border-blue-500 focus:border-blue-500" 
                  : "hover:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
              }`}>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="twi">Twi</SelectItem>
                <SelectItem value="ga">Ga</SelectItem>
                <SelectItem value="ewe">Ewe</SelectItem>
                <SelectItem value="hausa">Hausa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Switch 
                id="showTips" 
                checked={showTips}
                onCheckedChange={setShowTips}
                className="mr-2"
              />
              <Label 
                htmlFor="showTips"
                className="text-sm cursor-pointer"
              >
                Show Tips
              </Label>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <User className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your account</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Top Navigation */}
      <div className={`backdrop-blur-xl p-6 sticky top-0 z-50 transition-all duration-300 border-b ${
        isDarkMode 
          ? "bg-slate-900/90 shadow-lg shadow-indigo-900/10 border-slate-700/50" 
          : "bg-white/90 shadow-lg shadow-blue-200/30 border-blue-100/50"
      }`}>
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center">
            <m.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-3xl font-bold tracking-tight ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text" 
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text"
              }`}
            >
              {formData.projectName ? formData.projectName : "Create New Project"}
            </m.h1>
            
            <div className="flex gap-3">
              {/* Mobile/Phone support button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`transition-all duration-300 ${
                        isDarkMode
                          ? "text-yellow-300 hover:text-yellow-200 border-yellow-800/50"
                          : "text-yellow-600 hover:text-yellow-700 border-yellow-300"
                      }`}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Get Help
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Call us for assistance: +233 20 000 0000</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            
              <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  className={`transition-all duration-300 shadow-sm ${
                    isDarkMode
                      ? "text-slate-300 hover:text-white hover:bg-slate-800 hover:shadow-indigo-900/20 border-slate-700" 
                      : "text-gray-700 hover:text-gray-900 hover:border-blue-300 hover:shadow-blue-200/50"
                  }`}
                >
                  <Pen className="w-4 h-4 mr-2" />
                  Simple Mode
                </Button>
              </m.div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="relative overflow-hidden rounded-full">
              <Progress 
                value={progress} 
                className={`h-3 ${
                  isDarkMode ? "bg-slate-800" : "bg-gray-100"
                }`}
              />
              <m.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full`} 
              />
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <m.span 
                className={`font-medium px-2 py-1 rounded-full ${
                  activeTab === "intro" || activeTab === "basic"
                    ? (isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700") 
                    : (isDarkMode ? "text-slate-400" : "text-gray-600")
                }`}
              >
                Basics
              </m.span>
              <m.span 
                className={`font-medium px-2 py-1 rounded-full ${
                  activeTab === "building" || activeTab === "materials"
                    ? (isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700") 
                    : (isDarkMode ? "text-slate-400" : "text-gray-600")
                }`}
              >
                Structure
              </m.span>
              <m.span 
                className={`font-medium px-2 py-1 rounded-full ${
                  activeTab === "features" || activeTab === "final"
                    ? (isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700") 
                    : (isDarkMode ? "text-slate-400" : "text-gray-600")
                }`}
              >
                Details
              </m.span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* AI Assistant Card */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -5 }}
        >
          <Card className={`overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 ${
            isDarkMode 
              ? "bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-purple-900/40 border-blue-800/30" 
              : "bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-purple-50/90 border border-blue-200/50"
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full transition-all duration-300 ${
                  isDarkMode 
                    ? "bg-gradient-to-br from-blue-600/30 to-indigo-600/30 shadow-inner" 
                    : "bg-gradient-to-br from-blue-100 to-indigo-100 shadow-sm"
                }`}>
                  <Rocket className={`w-6 h-6 ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`} />
                </div>
                <div>
                  <h3 className={`font-semibold text-lg ${
                    isDarkMode ? "text-blue-300" : "text-blue-900"
                  }`}>BuildAssist AI</h3>
                  <p className={`text-base mt-2 leading-relaxed ${
                    isDarkMode ? "text-slate-300" : "text-blue-800/90"
                  }`}>
                    Hello! I'll help you create a detailed construction plan for your project in Ghana. 
                    Start by providing information about your building project. The more details you 
                    provide, the better plan I can generate.
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
        </m.div>

        {/* Project Details Tabs */}
        <div className="mb-8">
          <Tabs 
            defaultValue="intro" 
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-8"
          >
            <LazyMotion features={domAnimation} strict>
              <AnimatePresence mode="sync">
                {/* Introduction Tab */}
                <TabsContent key="intro" value="intro" className="space-y-6">
                  <m.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`overflow-hidden border transition-all duration-300 ${
                      isDarkMode 
                        ? "bg-slate-800/80 border-slate-700 hover:border-indigo-800/50 shadow-lg shadow-indigo-900/5" 
                        : "hover:shadow-lg hover:shadow-blue-100 border-gray-200 hover:border-blue-200"
                    }`}>
                      <CardHeader className={`transition-colors duration-300 ${isDarkMode ? "bg-slate-800/90" : "bg-gradient-to-r from-blue-50/50 to-indigo-50/50"}`}>
                        <CardTitle className={`text-xl ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}>Welcome! Let's Start Your Project</CardTitle>
                        <CardDescription className={
                          isDarkMode ? "text-slate-400" : "text-gray-600"
                        }>
                          This tool will help you create a detailed construction plan tailored to Ghana's local conditions.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6 p-6">
                        <div className="space-y-3">
                          <Label className={`font-medium ${
                            isDarkMode ? "text-slate-300" : "text-gray-900"
                          }`}>
                            Project Name
                          </Label>
                          <Input 
                            className={`transition-all duration-300 ${
                              isDarkMode 
                                ? "bg-slate-900 border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-white" 
                                : "border-gray-200 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-300"
                            }`} 
                            placeholder="Give your project a name (e.g., 'My Family Home', 'Accra Office Building')" 
                            value={formData.projectName}
                            onChange={(e) => handleInputChange('projectName', e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          {/* Project Type */}
                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>
                              What type of project are you building?
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {projectTypes.slice(0, 6).map((type) => (
                                <div key={type.value} className="flex items-start space-x-2">
                                  <RadioGroup 
                                    value={formData.projectType} 
                                    onValueChange={(value) => handleInputChange('projectType', value)}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem 
                                        value={type.value} 
                                        id={`project-type-${type.value}`} 
                                        className={isDarkMode ? "border-slate-600" : ""}
                                      />
                                      <Label 
                                        htmlFor={`project-type-${type.value}`}
                                        className={isDarkMode ? "text-slate-300" : "text-gray-700"}
                                      >
                                        {type.label}
                                      </Label>
                                    </div>
                                  </RadioGroup>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Common Building Types with Visual References */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                          <m.div
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className={`rounded-lg overflow-hidden border ${
                              formData.projectType === "residential-single" 
                                ? (isDarkMode ? "border-blue-600" : "border-blue-500") 
                                : (isDarkMode ? "border-slate-700" : "border-gray-200")
                            }`}
                            onClick={() => handleInputChange('projectType', 'residential-single')}
                          >
                            <div className="aspect-video bg-gray-200 relative overflow-hidden">
                              <img 
                                src="/api/placeholder/320/180" 
                                alt="Single Family Home"
                                className="w-full h-full object-cover"
                              />
                              {formData.projectType === "residential-single" && (
                                <div className="absolute top-2 right-2">
                                  <Badge key="residential-single-badge" className="bg-blue-500">Selected</Badge>
                                </div>
                              )}
                            </div>
                            <div className={`p-3 ${
                              isDarkMode ? "bg-slate-800" : "bg-white"
                            }`}>
                              <h4 className={`font-medium ${
                                isDarkMode ? "text-slate-200" : "text-gray-900"
                              }`}>Single Family Home</h4>
                              <p className={`text-xs mt-1 ${
                                isDarkMode ? "text-slate-400" : "text-gray-500"
                              }`}>
                                The most common residential building in Ghana
                              </p>
                            </div>
                          </m.div>

                          <m.div
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className={`rounded-lg overflow-hidden border ${
                              formData.projectType === "residential-multi" 
                                ? (isDarkMode ? "border-blue-600" : "border-blue-500") 
                                : (isDarkMode ? "border-slate-700" : "border-gray-200")
                            }`}
                            onClick={() => handleInputChange('projectType', 'residential-multi')}
                          >
                            <div className="aspect-video bg-gray-200 relative overflow-hidden">
                              <img 
                                src="/api/placeholder/320/180" 
                                alt="Apartment Building"
                                className="w-full h-full object-cover"
                              />
                              {formData.projectType === "residential-multi" && (
                                <div className="absolute top-2 right-2">
                                  <Badge key="residential-multi-badge" className="bg-blue-500">Selected</Badge>
                                </div>
                              )}
                            </div>
                            <div className={`p-3 ${
                              isDarkMode ? "bg-slate-800" : "bg-white"
                            }`}>
                              <h4 className={`font-medium ${
                                isDarkMode ? "text-slate-200" : "text-gray-900"
                              }`}>Apartment Building</h4>
                              <p className={`text-xs mt-1 ${
                                isDarkMode ? "text-slate-400" : "text-gray-500"
                              }`}>
                                Multi-family residential building with separate units
                              </p>
                            </div>
                          </m.div>

                          <m.div
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className={`rounded-lg overflow-hidden border ${
                              formData.projectType === "commercial-small" 
                                ? (isDarkMode ? "border-blue-600" : "border-blue-500") 
                                : (isDarkMode ? "border-slate-700" : "border-gray-200")
                            }`}
                            onClick={() => handleInputChange('projectType', 'commercial-small')}
                          >
                            <div className="aspect-video bg-gray-200 relative overflow-hidden">
                              <img 
                                src="/api/placeholder/320/180" 
                                alt="Commercial Building"
                                className="w-full h-full object-cover"
                              />
                              {formData.projectType === "commercial-small" && (
                                <div className="absolute top-2 right-2">
                                  <Badge key="commercial-small-badge" className="bg-blue-500">Selected</Badge>
                                </div>
                              )}
                            </div>
                            <div className={`p-3 ${
                              isDarkMode ? "bg-slate-800" : "bg-white"
                            }`}>
                              <h4 className={`font-medium ${
                                isDarkMode ? "text-slate-200" : "text-gray-900"
                              }`}>Commercial Building</h4>
                              <p className={`text-xs mt-1 ${
                                isDarkMode ? "text-slate-400" : "text-gray-500"
                              }`}>
                                Shop, office, or small business space
                              </p>
                            </div>
                          </m.div>
                        </div>
                      </CardContent>
                      <CardFooter className={`flex justify-between border-t ${
                        isDarkMode ? "border-slate-700" : "border-gray-100"
                      }`}>
                        <div className={`text-sm ${
                          isDarkMode ? "text-slate-400" : "text-gray-500"
                        }`}>
                          Start by giving your project a name and selecting the type.
                        </div>
                        <div className="flex justify-between mt-8">
                          <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              variant="outline" 
                              onClick={handleBack}
                              className={`transition-all duration-300 ${
                                isDarkMode 
                                  ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300" 
                                  : "hover:bg-gray-50 border-gray-200 text-gray-700"
                              }`}
                            >
                              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                              Back
                            </Button>
                          </m.div>
                          
                          <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              onClick={handleContinue}
                              className={`transition-all duration-300 shadow-md hover:shadow-lg ${
                                isDarkMode 
                                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white" 
                                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                              }`}
                            >
                              Continue
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </m.div>
                        </div>
                      </CardFooter>
                    </Card>
                  </m.div>
                  
                  {/* Quick Tips Card */}
                  {showTips && (
                    <m.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Card className={`overflow-hidden border ${
                        isDarkMode 
                          ? "bg-amber-900/10 border-amber-800/30" 
                          : "bg-amber-50 border-amber-100"
                      }`}>
                        <CardHeader className="py-4">
                          <CardTitle className={`flex items-center text-base ${
                            isDarkMode ? "text-amber-300" : "text-amber-800"
                          }`}>
                            <Lightbulb className={`h-5 w-5 mr-2 ${
                              isDarkMode ? "text-amber-400" : "text-amber-500"
                            }`} />
                            Quick Tips
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-0 px-6 space-y-3">
                          <div className={`text-sm ${
                            isDarkMode ? "text-amber-200" : "text-amber-800"
                          }`}>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Be as specific as possible when describing your project</li>
                              <li>You can save your project at any time and continue later</li>
                              <li>Need help? Use the "Get Help" button to talk to our team</li>
                              <li>Switching to "Simple Mode" reduces the number of questions</li>
                            </ul>
                          </div>
                        </CardContent>
                        <CardFooter className="py-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={isDarkMode ? "text-amber-300 hover:text-amber-200" : "text-amber-700"}
                            onClick={() => setShowTips(false)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Hide Tips
                          </Button>
                        </CardFooter>
                      </Card>
                    </m.div>
                  )}
                </TabsContent>

                {/* Basic Info Tab */}
                <TabsContent key="basic" value="basic" className="space-y-6">
                  <m.div
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
                          <Label className={`font-medium ${
                            isDarkMode ? "text-slate-300" : "text-gray-900"
                          }`}>
                            Project Description
                          </Label>
                          <div className="flex space-x-3">
                            <Textarea 
                              className={`transition-all duration-300 min-h-[100px] ${
                                isDarkMode 
                                  ? "bg-slate-900 border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-white" 
                                  : "border-gray-200 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-300"
                              }`} 
                              placeholder="Describe your project in your own words (e.g., 'A two-story family house with 3 bedrooms, a garage, and a garden. Traditional style with modern amenities.')" 
                              value={formData.description}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                            />
                          </div>
                          <div className="flex justify-end">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <m.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className={`${
                                        isDarkMode 
                                          ? "bg-blue-900/20 border-blue-700/50 hover:bg-blue-800/30 text-blue-400" 
                                          : "hover:bg-blue-50 text-blue-600 border-blue-200"
                                      }`}
                                    >
                                      <Mic className="h-4 w-4 mr-2" />
                                      Use Voice
                                    </Button>
                                  </m.div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Speak to describe your project</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>

                        {/* Core Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Location</Label>
                            <div className="flex space-x-3">
                              <div className="relative flex-1">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input 
                                  className={`pl-9 transition-all duration-300 ${
                                    isDarkMode 
                                      ? "bg-slate-900 border-slate-700 text-white" 
                                      : "border-gray-200"
                                  }`}
                                  placeholder="City or Town (e.g., Accra, Kumasi, Tamale)" 
                                  value={formData.location}
                                  onChange={(e) => handleInputChange('location', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Region</Label>
                            <Select 
                              value={formData.region} 
                              onValueChange={(value) => handleInputChange('region', value)}
                            >
                              <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                                <SelectValue placeholder="Select region" />
                              </SelectTrigger>
                              <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                                {regions.map(region => (
                                  <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Budget</Label>
                            <div className="flex space-x-3">
                              <div className="relative flex-1">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input 
                                  type="number"
                                  className={`pl-9 transition-all duration-300 ${
                                    isDarkMode 
                                      ? "bg-slate-900 border-slate-700 text-white" 
                                      : "border-gray-200"
                                  }`}
                                  placeholder="Your estimated budget" 
                                  value={formData.budget}
                                  onChange={(e) => handleInputChange('budget', e.target.value)}
                                />
                              </div>
                              <Select 
                                value={formData.currency}
                                onValueChange={(value) => handleInputChange('currency', value)}
                              >
                                <SelectTrigger className={`w-32 ${
                                  isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"
                                }`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                                  <SelectItem value="cedi">Ghana Cedi</SelectItem>
                                  <SelectItem value="usd">US Dollar</SelectItem>
                                  <SelectItem value="euro">Euro</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Timeline</Label>
                            <Select
                              value={formData.timeline}
                              onValueChange={(value) => handleInputChange('timeline', value)}
                            >
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

                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Plot Size</Label>
                            <div className="flex space-x-3">
                              <Input
                                type="number"
                                className={`transition-all duration-300 ${
                                  isDarkMode 
                                    ? "bg-slate-900 border-slate-700 text-white" 
                                    : "border-gray-200"
                                }`}
                                placeholder="Size" 
                                value={formData.plotSize}
                                onChange={(e) => handleInputChange('plotSize', e.target.value)}
                              />
                              <Select 
                                value={formData.plotSizeUnit}
                                onValueChange={(value) => handleInputChange('plotSizeUnit', value)}
                              >
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
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Building Size</Label>
                            <div className="flex space-x-3">
                              <Input
                                type="number"
                                className={`transition-all duration-300 ${
                                  isDarkMode 
                                    ? "bg-slate-900 border-slate-700 text-white" 
                                    : "border-gray-200"
                                }`}
                                placeholder="Size" 
                                value={formData.buildingSize}
                                onChange={(e) => handleInputChange('buildingSize', e.target.value)}
                              />
                              <Select 
                                value={formData.buildingSizeUnit}
                                onValueChange={(value) => handleInputChange('buildingSizeUnit', value)}
                              >
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
                      </CardContent>
                      <CardFooter className={`flex justify-between border-t ${
                        isDarkMode ? "border-slate-700" : "border-gray-100"
                      }`}>
                        <Button 
                          variant="outline" 
                          onClick={handleBack}
                          className={isDarkMode ? "border-slate-700 text-slate-300" : ""}
                        >
                          Back
                        </Button>
                        <Button 
                          onClick={handleContinue}
                          disabled={!formData.location || !formData.budget}
                        >
                          Continue
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </m.div>

                  {/* Cost Estimate Card - Shows up when a budget and building size are provided */}
                  {formData.budget && formData.buildingSize && (
                    <m.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Card className={`overflow-hidden border ${
                        isDarkMode 
                          ? "bg-green-900/10 border-green-800/30" 
                          : "bg-green-50 border-green-100"
                      }`}>
                        <CardHeader className="py-4">
                          <CardTitle className={`flex items-center text-lg ${
                            isDarkMode ? "text-green-300" : "text-green-800"
                          }`}>
                            <DollarSign className={`h-5 w-5 mr-2 ${
                              isDarkMode ? "text-green-400" : "text-green-600"
                            }`} />
                            Cost Estimate
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-0 px-6">
                          <div className={`text-sm ${
                            isDarkMode ? "text-green-300" : "text-green-800"
                          }`}>
                            <p className="mb-2">Based on your building size and specifications, estimated cost range:</p>
                            <p className="text-2xl font-bold">
                              {formData.currency === 'cedi' ? '₵' : formData.currency === 'usd' ? '$' : '€'}
                              {costEstimate.min.toLocaleString()} - {costEstimate.max.toLocaleString()}
                            </p>
                            <p className="mt-2 text-xs">
                              This is a rough estimate based on average construction costs in {formData.region === 'greater-accra' ? 'Greater Accra' : 'your region'}.
                              Actual costs may vary based on materials, labor, and specific requirements.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </m.div>
                  )}
                </TabsContent>

                {/* Building Details Tab */}
                <TabsContent key="building" value="building" className="space-y-6">
                  <m.div
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
                        {/* Building Structure */}
                        <div className="space-y-3">
                          <Label className={`font-medium ${
                            isDarkMode ? "text-slate-300" : "text-gray-900"
                          }`}>Building Structure</Label>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div 
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                formData.buildingStructure === 'single'
                                  ? (isDarkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200')
                                  : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white hover:border-blue-200')
                              }`}
                              onClick={() => handleInputChange('buildingStructure', 'single')}
                            >
                              <div className="flex justify-center mb-3">
                                <Home className={`h-8 w-8 ${
                                  formData.buildingStructure === 'single'
                                    ? (isDarkMode ? 'text-blue-400' : 'text-blue-500')
                                    : (isDarkMode ? 'text-slate-400' : 'text-gray-400')
                                }`} />
                              </div>
                              <p className={`text-center font-medium ${
                                formData.buildingStructure === 'single'
                                  ? (isDarkMode ? 'text-blue-300' : 'text-blue-700')
                                  : (isDarkMode ? 'text-slate-300' : 'text-gray-700')
                              }`}>
                                Single Story
                              </p>
                            </div>
                            <div 
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                formData.buildingStructure === 'double'
                                  ? (isDarkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200')
                                  : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white hover:border-blue-200')
                              }`}
                              onClick={() => handleInputChange('buildingStructure', 'double')}
                            >
                              <div className="flex justify-center mb-3">
                                <Building className={`h-8 w-8 ${
                                  formData.buildingStructure === 'double'
                                    ? (isDarkMode ? 'text-blue-400' : 'text-blue-500')
                                    : (isDarkMode ? 'text-slate-400' : 'text-gray-400')
                                }`} />
                              </div>
                              <p className={`text-center font-medium ${
                                formData.buildingStructure === 'double'
                                  ? (isDarkMode ? 'text-blue-300' : 'text-blue-700')
                                  : (isDarkMode ? 'text-slate-300' : 'text-gray-700')
                              }`}>
                                Two Story
                              </p>
                            </div>
                            <div 
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                formData.buildingStructure === 'multi'
                                  ? (isDarkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200')
                                  : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white hover:border-blue-200')
                              }`}
                              onClick={() => handleInputChange('buildingStructure', 'multi')}
                            >
                              <div className="flex justify-center mb-3">
                                <Landmark className={`h-8 w-8 ${
                                  formData.buildingStructure === 'multi'
                                    ? (isDarkMode ? 'text-blue-400' : 'text-blue-500')
                                    : (isDarkMode ? 'text-slate-400' : 'text-gray-400')
                                }`} />
                              </div>
                              <p className={`text-center font-medium ${
                                formData.buildingStructure === 'multi'
                                  ? (isDarkMode ? 'text-blue-300' : 'text-blue-700')
                                  : (isDarkMode ? 'text-slate-300' : 'text-gray-700')
                              }`}>
                                Multi Story
                              </p>
                            </div>
                            <div 
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                formData.buildingStructure === 'split'
                                  ? (isDarkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200')
                                  : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white hover:border-blue-200')
                              }`}
                              onClick={() => handleInputChange('buildingStructure', 'split')}
                            >
                              <div className="flex justify-center mb-3">
                                <Ruler className={`h-8 w-8 ${
                                  formData.buildingStructure === 'split'
                                    ? (isDarkMode ? 'text-blue-400' : 'text-blue-500')
                                    : (isDarkMode ? 'text-slate-400' : 'text-gray-400')
                                }`} />
                              </div>
                              <p className={`text-center font-medium ${
                                formData.buildingStructure === 'split'
                                  ? (isDarkMode ? 'text-blue-300' : 'text-blue-700')
                                  : (isDarkMode ? 'text-slate-300' : 'text-gray-700')
                              }`}>
                                Split Level
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Roof Type */}
                        <div className="space-y-3">
                          <Label className={`font-medium ${
                            isDarkMode ? "text-slate-300" : "text-gray-900"
                          }`}>Roof Type</Label>
                          <Select
                            value={formData.roofType}
                            onValueChange={(value) => handleInputChange('roofType', value)}
                          >
                            <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                              <SelectValue placeholder="Select roof type" />
                            </SelectTrigger>
                            <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                              {roofTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Foundation Type */}
                        <div className="space-y-3">
                          <Label className={`font-medium ${
                            isDarkMode ? "text-slate-300" : "text-gray-900"
                          }`}>Foundation Type</Label>
                          <Select
                            value={formData.foundationType}
                            onValueChange={(value) => handleInputChange('foundationType', value)}
                          >
                            <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                              <SelectValue placeholder="Select foundation type" />
                            </SelectTrigger>
                            <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                              {foundationTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Room Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Bedrooms</Label>
                            <Input 
                              type="number" 
                              placeholder="Number of bedrooms" 
                              className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}
                              value={formData.bedrooms}
                              onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                            />
                          </div>
                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Bathrooms</Label>
                            <Input 
                              type="number" 
                              placeholder="Number of bathrooms" 
                              className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}
                              value={formData.bathrooms}
                              onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                            />
                          </div>
                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Living Areas</Label>
                            <Input 
                              type="number" 
                              placeholder="Number of living areas" 
                              className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}
                              value={formData.livingAreas}
                              onChange={(e) => handleInputChange('livingAreas', e.target.value)}
                            />
                          </div>
                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Kitchens</Label>
                            <Input 
                              type="number" 
                              placeholder="Number of kitchens" 
                              className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}
                              value={formData.kitchens}
                              onChange={(e) => handleInputChange('kitchens', e.target.value)}
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className={`flex justify-between border-t ${
                        isDarkMode ? "border-slate-700" : "border-gray-100"
                      }`}>
                        <Button 
                          variant="outline" 
                          onClick={handleBack}
                          className={isDarkMode ? "border-slate-700 text-slate-300" : ""}
                        >
                          Back
                        </Button>
                        <Button onClick={handleContinue}>
                          Continue
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </m.div>
                </TabsContent>

                {/* Materials Tab */}
                <TabsContent key="materials" value="materials" className="space-y-6">
                  <m.div
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
                        }`}>Building Materials</CardTitle>
                        <CardDescription className={
                          isDarkMode ? "text-slate-400" : "text-gray-600"
                        }>
                          Select the materials you want to use for your building project
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Wall Material */}
                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Wall Material</Label>
                            <Select
                              value={formData.wallMaterial}
                              onValueChange={(value) => handleInputChange('wallMaterial', value)}
                            >
                              <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                                <SelectValue placeholder="Select wall material" />
                              </SelectTrigger>
                              <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                                {wallMaterials.map(material => (
                                  <SelectItem key={material.value} value={material.value}>{material.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Floor Material */}
                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Floor Material</Label>
                            <Select
                              value={formData.floorMaterial}
                              onValueChange={(value) => handleInputChange('floorMaterial', value)}
                            >
                              <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                                <SelectValue placeholder="Select floor material" />
                              </SelectTrigger>
                              <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                                {floorMaterials.map(material => (
                                  <SelectItem key={material.value} value={material.value}>{material.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Ceiling Material */}
                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Ceiling Material</Label>
                            <Select
                              value={formData.ceilingMaterial}
                              onValueChange={(value) => handleInputChange('ceilingMaterial', value)}
                            >
                              <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                                <SelectValue placeholder="Select ceiling material" />
                              </SelectTrigger>
                              <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                                <SelectItem value="plasterboard">Plasterboard</SelectItem>
                                <SelectItem value="pvc">PVC Panels</SelectItem>
                                <SelectItem value="wooden">Wooden Panels</SelectItem>
                                <SelectItem value="acoustic">Acoustic Panels</SelectItem>
                                <SelectItem value="concrete">Exposed Concrete</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Window Type */}
                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Window Type</Label>
                            <Select
                              value={formData.windowType}
                              onValueChange={(value) => handleInputChange('windowType', value)}
                            >
                              <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                                <SelectValue placeholder="Select window type" />
                              </SelectTrigger>
                              <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                                <SelectItem value="aluminum">Aluminum Frame</SelectItem>
                                <SelectItem value="wood">Wooden Frame</SelectItem>
                                <SelectItem value="upvc">UPVC Frame</SelectItem>
                                <SelectItem value="steel">Steel Frame</SelectItem>
                                <SelectItem value="louvre">Glass Louvre</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Sustainability Options */}
                        <div className="space-y-3 pt-4">
                          <Label className={`font-medium ${
                            isDarkMode ? "text-slate-300" : "text-gray-900"
                          }`}>Sustainability Features</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="energy-efficiency" 
                                checked={formData.energyEfficiency}
                                onCheckedChange={(checked) => handleInputChange('energyEfficiency', checked)}
                              />
                              <label 
                                htmlFor="energy-efficiency" 
                                className={`text-sm ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
                              >
                                Energy Efficiency Features
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="water-conservation" 
                                checked={formData.waterConservation}
                                onCheckedChange={(checked) => handleInputChange('waterConservation', checked)}
                              />
                              <label 
                                htmlFor="water-conservation" 
                                className={`text-sm ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
                              >
                                Water Conservation Systems
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="local-materials" 
                                checked={formData.localMaterials}
                                onCheckedChange={(checked) => handleInputChange('localMaterials', checked)}
                              />
                              <label 
                                htmlFor="local-materials" 
                                className={`text-sm ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
                              >
                                Prioritize Local Materials
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="traditional-elements" 
                                checked={formData.traditionalElements}
                                onCheckedChange={(checked) => handleInputChange('traditionalElements', checked)}
                              />
                              <label 
                                htmlFor="traditional-elements" 
                                className={`text-sm ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
                              >
                                Include Traditional Elements
                              </label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className={`flex justify-between border-t ${
                        isDarkMode ? "border-slate-700" : "border-gray-100"
                      }`}>
                        <Button 
                          variant="outline" 
                          onClick={handleBack}
                          className={isDarkMode ? "border-slate-700 text-slate-300" : ""}
                        >
                          Back
                        </Button>
                        <Button onClick={handleContinue}>
                          Continue
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </m.div>

                  {/* Materials Tip Card */}
                  {showTips && (
                    <m.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Card className={`overflow-hidden border ${
                        isDarkMode 
                          ? "bg-amber-900/10 border-amber-800/30" 
                          : "bg-amber-50 border-amber-100"
                      }`}>
                        <CardHeader className="py-4">
                          <CardTitle className={`flex items-center text-base ${
                            isDarkMode ? "text-amber-300" : "text-amber-800"
                          }`}>
                            <Lightbulb className={`h-5 w-5 mr-2 ${
                              isDarkMode ? "text-amber-400" : "text-amber-500"
                            }`} />
                            Material Tips for Ghana
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-0 px-6 space-y-3">
                          <div className={`text-sm ${
                            isDarkMode ? "text-amber-200" : "text-amber-800"
                          }`}>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Concrete blocks are widely available and cost-effective in Ghana</li>
                              <li>Consider clay or compressed earth blocks for better thermal insulation</li>
                              <li>Metal roofing is popular due to its durability during rainy seasons</li>
                              <li>Local wood types like Odum and Mahogany are excellent for doors and windows</li>
                              <li>Ceramic tiles work well in Ghana's climate and are easy to maintain</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </m.div>
                  )}
                </TabsContent>

                {/* Features Tab */}
                <TabsContent key="features" value="features" className="space-y-6">
                  <m.div
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
                        }`}>Additional Features & Amenities</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Garage</Label>
                            <Select
                              value={formData.garage}
                              onValueChange={(value) => handleInputChange('garage', value)}
                            >
                              <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                                <SelectItem value="none">No Garage</SelectItem>
                                <SelectItem value="single">Single Car</SelectItem>
                                <SelectItem value="double">Double Car</SelectItem>
                                <SelectItem value="triple">Triple Car</SelectItem>
                                <SelectItem value="carport">Carport Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Outdoor Space</Label>
                            <Select
                              value={formData.outdoorSpace}
                              onValueChange={(value) => handleInputChange('outdoorSpace', value)}
                            >
                              <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                                <SelectValue placeholder="Select options" />
                              </SelectTrigger>
                              <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                                <SelectItem value="garden">Garden</SelectItem>
                                <SelectItem value="patio">Patio</SelectItem>
                                <SelectItem value="courtyard">Courtyard</SelectItem>
                                <SelectItem value="balcony">Balcony</SelectItem>
                                <SelectItem value="rooftop">Rooftop Terrace</SelectItem>
                                <SelectItem value="multiple">Multiple Outdoor Spaces</SelectItem>
                                <SelectItem value="none">None</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Architectural Style</Label>
                            <Select
                              value={formData.style}
                              onValueChange={(value) => handleInputChange('style', value)}
                            >
                              <SelectTrigger className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-gray-200"}>
                                <SelectValue placeholder="Select style" />
                              </SelectTrigger>
                              <SelectContent className={isDarkMode ? "bg-slate-800 border-slate-700" : ""}>
                                <SelectItem value="modern">Modern</SelectItem>
                                <SelectItem value="traditional">Traditional</SelectItem>
                                <SelectItem value="contemporary">Contemporary</SelectItem>
                                <SelectItem value="minimalist">Minimalist</SelectItem>
                                <SelectItem value="colonial">Colonial</SelectItem>
                                <SelectItem value="african-contemporary">African Contemporary</SelectItem>
                                <SelectItem value="tropical">Tropical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>Accessibility</Label>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="accessibility-features" 
                                checked={formData.accessibilityFeatures}
                                onCheckedChange={(checked) => handleInputChange('accessibilityFeatures', checked)}
                              />
                              <label 
                                htmlFor="accessibility-features" 
                                className={`text-sm ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
                              >
                                Include Accessibility Features
                              </label>
                            </div>
                            {formData.accessibilityFeatures && (
                              <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                                Includes wider doorways, ramps where needed, and accessible bathroom fixtures
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Modern Amenities */}
                        <div className="space-y-3 pt-4">
                          <Label className={`font-medium ${
                            isDarkMode ? "text-slate-300" : "text-gray-900"
                          }`}>Modern Amenities</Label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {modernAmenities.map(amenity => (
                              <div key={amenity.value} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`amenity-${amenity.value}`} 
                                  checked={formData.modernAmenities.includes(amenity.value)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      toggleModernAmenity(amenity.value);
                                    } else {
                                      toggleModernAmenity(amenity.value);
                                    }
                                  }}
                                />
                                <label 
                                  htmlFor={`amenity-${amenity.value}`} 
                                  className={`text-sm ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
                                >
                                  {amenity.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Special Features */}
                        <div className="space-y-3 pt-4">
                          <Label className={`font-medium ${
                            isDarkMode ? "text-slate-300" : "text-gray-900"
                          }`}>Special Features</Label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {specialFeatures.map(feature => (
                              <div key={feature.value} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`feature-${feature.value}`} 
                                  checked={formData.specialFeatures.includes(feature.value)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      toggleSpecialFeature(feature.value);
                                    } else {
                                      toggleSpecialFeature(feature.value);
                                    }
                                  }}
                                />
                                <label 
                                  htmlFor={`feature-${feature.value}`} 
                                  className={`text-sm ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
                                >
                                  {feature.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className={`flex justify-between border-t ${
                        isDarkMode ? "border-slate-700" : "border-gray-100"
                      }`}>
                        <Button 
                          variant="outline" 
                          onClick={handleBack}
                          className={isDarkMode ? "border-slate-700 text-slate-300" : ""}
                        >
                          Back
                        </Button>
                        <Button onClick={handleContinue}>
                          Continue
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </m.div>
                </TabsContent>

                {/* Final Tab */}
                <TabsContent key="final" value="final" className="space-y-6">
                  <m.div
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
                        }`}>Additional Information & Notes</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 p-6">
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>
                              Project Objectives
                            </Label>
                            <Textarea 
                              className={`min-h-[100px] transition-all duration-300 ${
                                isDarkMode 
                                  ? "bg-slate-900 border-slate-700 focus:border-blue-500 text-white" 
                                  : "border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                              }`} 
                              placeholder="What are your main objectives for this project? (e.g., 'Creating a modern family home with traditional elements', 'Building a low-maintenance rental property')" 
                              value={formData.objectives}
                              onChange={(e) => handleInputChange('objectives', e.target.value)}
                            />
                          </div>

                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>
                              Site Constraints & Local Considerations
                            </Label>
                            <Textarea 
                              className={`min-h-[100px] transition-all duration-300 ${
                                isDarkMode 
                                  ? "bg-slate-900 border-slate-700 focus:border-blue-500 text-white" 
                                  : "border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                              }`} 
                              placeholder="Any specific site conditions, local regulations, or environmental factors? (e.g., 'Sloped terrain', 'Flood-prone area', 'Heavy rainfall region')" 
                              value={formData.constraints}
                              onChange={(e) => handleInputChange('constraints', e.target.value)}
                            />
                          </div>

                          <div className="space-y-3">
                            <Label className={`font-medium ${
                              isDarkMode ? "text-slate-300" : "text-gray-900"
                            }`}>
                              Additional Requests or Special Instructions
                            </Label>
                            <Textarea 
                              className={`min-h-[100px] transition-all duration-300 ${
                                isDarkMode 
                                  ? "bg-slate-900 border-slate-700 focus:border-blue-500 text-white" 
                                  : "border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                              }`} 
                              placeholder="Any other specific requests or information you'd like to include? (e.g., 'Need home office space', 'Space for future expansion', 'Specific design inspiration')" 
                              value={formData.additionalRequests}
                              onChange={(e) => handleInputChange('additionalRequests', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Image Upload Section */}
                        <div className="space-y-3 pt-4">
                          <Label className={`font-medium ${
                            isDarkMode ? "text-slate-300" : "text-gray-900"
                          }`}>
                            Upload Site Images or Reference Photos (Optional)
                          </Label>
                          <div 
                            className={`border-2 border-dashed rounded-lg p-6 text-center ${
                              isDarkMode 
                                ? "border-slate-700 hover:border-slate-600" 
                                : "border-gray-200 hover:border-blue-300"
                            } transition-colors duration-200`}
                          >
                            <div className="flex flex-col items-center">
                              <Camera className={`h-10 w-10 mb-3 ${
                                isDarkMode ? "text-slate-500" : "text-gray-400"
                              }`} />
                              <p className={`text-sm font-medium mb-1 ${
                                isDarkMode ? "text-slate-300" : "text-gray-700"
                              }`}>
                                Drag & drop files here, or click to browse
                              </p>
                              <p className={`text-xs ${
                                isDarkMode ? "text-slate-400" : "text-gray-500"
                              }`}>
                                Upload images of your site or design inspirations (Maximum 5 images)
                              </p>
                              <Button 
                                variant="outline" 
                                className="mt-4"
                                size="sm"
                              >
                                <FileUp className="h-4 w-4 mr-2" />
                                Browse Files
                              </Button>
                            </div>
                          </div>
                          <p className={`text-xs ${
                            isDarkMode ? "text-slate-400" : "text-gray-500"
                          }`}>
                            Supports: JPEG, PNG, WebP. Max file size: 10MB each
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className={`flex justify-between border-t ${
                        isDarkMode ? "border-slate-700" : "border-gray-100"
                      }`}>
                        <Button 
                          variant="outline" 
                          onClick={handleBack}
                          className={isDarkMode ? "border-slate-700 text-slate-300" : ""}
                        >
                          Back
                        </Button>
                        <div className="flex space-x-3">
                        <div className="flex space-x-3">
                            <Button 
                              variant="outline" 
                              className={`${
                                isDarkMode 
                                  ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700" 
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save Draft
                            </Button>
                            
                            <Button 
                              onClick={handleGeneratePlan}
                              disabled={isLoading}
                              className={`relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-xl text-white ${
                                isLoading ? 'opacity-80' : ''
                              }`}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  <span>Generating...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  <span>Generate Construction Plan</span>
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </m.div>

                  {/* Project Summary Card */}
                  <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Card className={`overflow-hidden border ${
                      isDarkMode 
                        ? "bg-indigo-900/10 border-indigo-800/30" 
                        : "bg-indigo-50 border-indigo-100"
                    }`}>
                      <CardHeader className="py-4">
                        <CardTitle className={`flex items-center text-lg ${
                          isDarkMode ? "text-indigo-300" : "text-indigo-800"
                        }`}>
                          <Check className={`h-5 w-5 mr-2 ${
                            isDarkMode ? "text-indigo-400" : "text-indigo-600"
                          }`} />
                          Project Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-6">
                        <div className={`${
                          isDarkMode ? "text-indigo-300" : "text-indigo-800"
                        }`}>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className={`text-sm font-semibold ${
                                  isDarkMode ? "text-indigo-200" : "text-indigo-900"
                                }`}>Project Type</h4>
                                <p className="text-sm mt-1">
                                  {formData.projectType === 'residential-single' ? 'Single Family Home' : 
                                   formData.projectType === 'residential-multi' ? 'Multi-Family Building' :
                                   formData.projectType === 'commercial-small' ? 'Small Commercial Building' :
                                   formData.projectType === 'commercial-large' ? 'Large Commercial Building' :
                                   formData.projectType === 'mixed-use' ? 'Mixed-Use Building' :
                                   formData.projectType === 'renovation' ? 'Renovation Project' :
                                   formData.projectType || 'Not specified'}
                                </p>
                              </div>
                              
                              <div>
                                <h4 className={`text-sm font-semibold ${
                                  isDarkMode ? "text-indigo-200" : "text-indigo-900"
                                }`}>Location</h4>
                                <p className="text-sm mt-1">
                                  {formData.location}, {regions.find(r => r.value === formData.region)?.label || 'Ghana'}
                                </p>
                              </div>

                              <div>
                                <h4 className={`text-sm font-semibold ${
                                  isDarkMode ? "text-indigo-200" : "text-indigo-900"
                                }`}>Building Size</h4>
                                <p className="text-sm mt-1">
                                  {formData.buildingSize} {formData.buildingSizeUnit === 'sqm' ? 'sq. meters' : 'sq. feet'}
                                </p>
                              </div>

                              <div>
                                <h4 className={`text-sm font-semibold ${
                                  isDarkMode ? "text-indigo-200" : "text-indigo-900"
                                }`}>Budget Range</h4>
                                <p className="text-sm mt-1">
                                  {formData.currency === 'cedi' ? '₵' : formData.currency === 'usd' ? '$' : '€'}
                                  {formData.budget ? Number(formData.budget).toLocaleString() : '---'}
                                </p>
                              </div>

                              <div>
                                <h4 className={`text-sm font-semibold ${
                                  isDarkMode ? "text-indigo-200" : "text-indigo-900"
                                }`}>Building Structure</h4>
                                <p className="text-sm mt-1">
                                  {formData.buildingStructure === 'single' ? 'Single Story' : 
                                   formData.buildingStructure === 'double' ? 'Two Story' :
                                   formData.buildingStructure === 'multi' ? 'Multi Story' :
                                   formData.buildingStructure === 'split' ? 'Split Level' :
                                   'Not specified'}
                                </p>
                              </div>

                              <div>
                                <h4 className={`text-sm font-semibold ${
                                  isDarkMode ? "text-indigo-200" : "text-indigo-900"
                                }`}>Room Configuration</h4>
                                <p className="text-sm mt-1">
                                  {formData.bedrooms ? `${formData.bedrooms} bedrooms, ` : ''}
                                  {formData.bathrooms ? `${formData.bathrooms} bathrooms, ` : ''}
                                  {formData.livingAreas ? `${formData.livingAreas} living areas` : ''}
                                  {!formData.bedrooms && !formData.bathrooms && !formData.livingAreas && 'Not specified'}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className={`text-sm font-semibold ${
                                isDarkMode ? "text-indigo-200" : "text-indigo-900"
                              }`}>Key Features</h4>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {formData.specialFeatures.map((feature) => (
                                  <Badge key={`feature-${feature}`} className="bg-indigo-100 text-indigo-800 border border-indigo-200">
                                    {specialFeatures.find(f => f.value === feature)?.label || feature}
                                  </Badge>
                                ))}
                                {formData.modernAmenities.map((amenity) => (
                                  <Badge key={`amenity-${amenity}`} className="bg-green-100 text-green-800 border border-green-200">
                                    {modernAmenities.find(a => a.value === amenity)?.label || amenity}
                                  </Badge>
                                ))}
                                {formData.accessibilityFeatures && (
                                  <Badge key="accessibility-features" className="bg-purple-100 text-purple-800 border border-purple-200">
                                    Accessibility Features
                                  </Badge>
                                )}
                                {formData.energyEfficiency && (
                                  <Badge key="energy-efficiency" className="bg-blue-100 text-blue-800 border border-blue-200">
                                    Energy Efficient
                                  </Badge>
                                )}
                                {formData.waterConservation && (
                                  <Badge key="water-conservation" className="bg-blue-100 text-blue-800 border border-blue-200">
                                    Water Conservation
                                  </Badge>
                                )}
                                {formData.specialFeatures.length === 0 && formData.modernAmenities.length === 0 && 
                                 !formData.accessibilityFeatures && !formData.energyEfficiency && !formData.waterConservation && (
                                  <span key="no-features" className="text-sm italic">No features specified</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </m.div>

                  {/* AI Insights */}
                  <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Card className={`overflow-hidden border ${
                      isDarkMode 
                        ? "bg-slate-800 border-amber-800/30" 
                        : "border-yellow-100"
                    }`}>
                      <CardHeader className={isDarkMode ? "bg-amber-900/20" : "bg-yellow-50/50"}>
                        <CardTitle className={`flex items-center space-x-3 text-xl ${
                          isDarkMode ? "text-amber-300" : "text-gray-900"
                        }`}>
                          <Lightbulb className={`h-5 w-5 ${
                            isDarkMode ? "text-amber-400" : "text-yellow-500"
                          }`} />
                          <span>AI Insights</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 p-6">
                        <InsightItem 
                          title="Local Building Regulations"
                          description={`In ${formData.region === 'greater-accra' ? 'Greater Accra' : 'your region'}, permits typically take 4-6 weeks to process. Your plan will include the necessary documentation requirements.`}
                          icon={<FileText className="w-5 h-5" />}
                          type={isDarkMode ? "warning" : "warning"}
                        />

                        {formData.buildingSize && (
                          <InsightItem 
                            title="Cost Optimization"
                            description={`Based on local market prices, expect to spend about ${formData.currency === 'cedi' ? '₵' : formData.currency === 'usd' ? '$' : '€'}3,000-3,500 per square meter for standard construction in Ghana.`}
                            icon={<DollarSign className="w-5 h-5" />}
                            type={isDarkMode ? "default" : "default"}
                          />
                        )}

                        {formData.region === 'greater-accra' && (
                          <InsightItem 
                            title="Climate Considerations"
                            description="Greater Accra's coastal climate means your plan should account for high humidity and occasional heavy rainfall with proper drainage systems."
                            icon={<Sun className="w-5 h-5" />}
                            type={isDarkMode ? "success" : "success"}
                          />
                        )}

                        {formData.localMaterials && (
                          <InsightItem 
                            title="Local Material Sourcing"
                            description="Using local materials can reduce costs by 15-20%. Your plan will prioritize locally available building materials."
                            icon={<Trees className="w-5 h-5" />}
                            type={isDarkMode ? "success" : "success"}
                          />
                        )}

                        {formData.energyEfficiency && (
                          <InsightItem 
                            title="Energy Considerations"
                            description="With Ghana's frequent power fluctuations, your energy-efficient design should include backup power systems and potential for solar integration."
                            icon={<Zap className="w-5 h-5" />}
                            type={isDarkMode ? "default" : "default"}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </m.div>

                      {/* Ghana-specific construction tips */}
                      {showTips && (
                        <m.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        >
                          <Accordion type="single" collapsible className={`border rounded-lg ${
                            isDarkMode 
                              ? "bg-slate-800 border-slate-700" 
                              : "bg-white border-gray-200"
                          }`}>
                            <AccordionItem value="tips" className="border-0">
                              <AccordionTrigger className={`px-4 py-3 ${
                                isDarkMode ? "text-blue-300 hover:text-blue-200" : "text-blue-700 hover:text-blue-800"
                              }`}>
                                <div className="flex items-center">
                                  <BookOpen className="h-5 w-5 mr-2" />
                                  <span>Ghana Construction Tips & Resources</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className={`rounded-lg p-4 ${
                                    isDarkMode ? "bg-slate-700" : "bg-gray-50"
                                  }`}>
                                    <h4 className={`font-medium mb-2 ${
                                      isDarkMode ? "text-white" : "text-gray-900"
                                    }`}>Local Construction Standards</h4>
                                    <ul className={`list-disc list-inside space-y-1 text-sm ${
                                      isDarkMode ? "text-slate-300" : "text-gray-700"
                                    }`}>
                                      <li>Ghana Building Code requires minimum 230mm thick external walls</li>
                                      <li>Minimum ceiling height of 2.7 meters for residential buildings</li>
                                      <li>Annual building maintenance is crucial due to tropical climate</li>
                                      <li>Consider termite treatment for wooden elements</li>
                                      <li>Plan for water storage, especially in urban areas</li>
                                    </ul>
                                  </div>
                                  
                                  <div className={`rounded-lg p-4 ${
                                    isDarkMode ? "bg-slate-700" : "bg-gray-50"
                                  }`}>
                                    <h4 className={`font-medium mb-2 ${
                                      isDarkMode ? "text-white" : "text-gray-900"
                                    }`}>Common Challenges & Solutions</h4>
                                    <ul className={`list-disc list-inside space-y-1 text-sm ${
                                      isDarkMode ? "text-slate-300" : "text-gray-700"
                                    }`}>
                                      <li>Inconsistent material quality - work with reputable suppliers</li>
                                      <li>Land ownership disputes - verify documentation thoroughly</li>
                                      <li>Labor skill variations - establish clear quality standards</li>
                                      <li>Seasonal rain delays - plan construction timeline accordingly</li>
                                      <li>Rising materials costs - secure major materials early</li>
                                    </ul>
                                  </div>
                                </div>
                                  
                                <div className={`flex flex-col md:flex-row gap-4 mt-6 text-sm ${
                                  isDarkMode ? "text-slate-300" : "text-gray-700"
                                }`}>
                                  <div className="flex-1">
                                    <h4 className={`font-medium mb-2 ${
                                      isDarkMode ? "text-white" : "text-gray-900"
                                    }`}>Useful Resources</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                      <li>Ghana Institution of Engineering</li>
                                      <li>Architectural and Engineering Services Limited (AESL)</li>
                                      <li>Ghana Real Estate Developers Association</li>
                                      <li>Local municipal building permit offices</li>
                                    </ul>
                                  </div>
                                  
                                  <div className="flex-1">
                                    <h4 className={`font-medium mb-2 ${
                                      isDarkMode ? "text-white" : "text-gray-900"
                                    }`}>Cost-Saving Tips</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                      <li>Buy materials in bulk during off-peak seasons</li>
                                      <li>Consider locally-sourced alternatives to imported materials</li>
                                      <li>Phase construction if working with budget constraints</li>
                                      <li>Invest in quality foundation and roofing over decorative elements</li>
                                      <li>Reuse excavated soil for landscaping to reduce disposal costs</li>
                                    </ul>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </m.div>
                      )}
                    </TabsContent>
                  </AnimatePresence>
                </LazyMotion>

            {/* Main Generate Button (only shows when not on the final tab) */}
            {activeTab !== "final" && (
              <LazyMotion features={domAnimation} strict>
                <m.div 
                  className="flex justify-between pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="flex items-center">
                    <Heart className={`h-5 w-5 mr-2 ${
                      isDarkMode ? "text-slate-500" : "text-gray-400"
                    }`} />
                    <span className={`text-sm ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}>
                      Made with ❤️ in Ghana
                    </span>
                  </div>
                  
                  <LazyMotion features={domAnimation} strict>
                    <m.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      className="relative group"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                      <Button 
                        className={`relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-xl text-white `}
                        onClick={() => handleTabChange("final")}
                        // Remove the disabled condition
                        // disabled={!isFormComplete()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        <span>Finalize & Generate Plan</span>
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </m.div>
                  </LazyMotion>
                </m.div>
              </LazyMotion>
            )}

            {/* Need assistance floating button */}
            <LazyMotion features={domAnimation} strict>
              <m.div 
                className="fixed bottom-6 right-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.3 }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="lg" 
                        className={`rounded-full shadow-xl ${
                          isDarkMode 
                            ? "bg-blue-600 hover:bg-blue-700 text-white" 
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        <Phone className="h-5 w-5 mr-2" />
                        <span>Need Help?</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <div className="space-y-1">
                        <p className="font-medium">Talk to a real person</p>
                        <p className="text-xs">Call +233 20 000 0000</p>
                        <p className="text-xs">WhatsApp available</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </m.div>
            </LazyMotion>
          </Tabs>
        </div>
      </div>
    </div>
    </>
  );
};

const InsightItem = ({ title, description, icon, type = 'default' }) => {
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
    <LazyMotion features={domAnimation} strict>
      <m.div 
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
      </m.div>
    </LazyMotion>
  );
};

export default ProjectInputs;