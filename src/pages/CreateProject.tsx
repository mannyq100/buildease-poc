/**
 * CreateProject component
 * Simplified version of project creation focused on basic details
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { ChevronLeft, ChevronRight, Building, Loader2, DollarSign, MapPin, Home, Layers, Sparkles, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  PROJECT_TYPES,
  REGIONS,
  CURRENCIES
} from '@/data/mock/projectInputs/formOptions';
import { FormFieldValue } from '@/types/projectInputs';

// Import extracted components
import { ProjectDescriptionInput } from '@/components/create-project/ProjectDescriptionInput';
import { ProjectTypeSelector } from '@/components/create-project/ProjectTypeSelector';
import { ProjectLocationBudget } from '@/components/create-project/ProjectLocationBudget';
import { ProjectImageUpload } from '@/components/create-project/ProjectImageUpload';
import { BudgetTimelineForm } from '@/components/create-project/BudgetTimelineForm';
import { MaterialsConstructionForm } from '@/components/create-project/MaterialsConstructionForm';
import { ProjectFeaturesForm } from '@/components/create-project/ProjectFeaturesForm';

// Basic form data interface
interface FormData {
  // Basic Information
  name: string;
  description: string;
  type: string;
  owner: string;
  phoneNumber: string;
  email: string;
  
  // Location Information
  location: string;
  region: string;
  plotSize: string;
  plotSizeUnit: string;
  terrain: string;
  nearbyLandmarks: string;
  
  // Project Specifications
  buildingSize: string;
  buildingSizeUnit: string;
  storeys: string;
  bedrooms: string;
  bathrooms: string;
  kitchens: string;
  livingAreas: string;
  buildingStyle: string;
  
  // Budget and Timeline
  budget: string;
  currency: string;
  timeframe: string;
  expectedStartDate: string;
  
  // Materials and Construction
  structureType: string;
  foundationType: string;
  roofType: string;
  wallMaterial: string;
  floorMaterial: string;
  
  // Features and Sustainability
  specialFeatures: string[];
  sustainabilityFeatures: string[];
  accessibilityNeeds: string;
  traditionalElements: boolean;
  
  // Constraints and Requirements
  siteConstraints: string;
  localRegulations: string;
  additionalNotes: string;
  
  // References
  images: string[];
}

function CreateProject() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add step definitions for the step indicator
  const steps = [
    { id: 1, title: 'Project Details', icon: <Building className="h-4 w-4" /> },
    { id: 2, title: 'Location & Plot', icon: <MapPin className="h-4 w-4" /> },
    { id: 3, title: 'Building Specs', icon: <Home className="h-4 w-4" /> },
    { id: 4, title: 'Budget & Timeline', icon: <DollarSign className="h-4 w-4" /> },
    { id: 5, title: 'Materials', icon: <Layers className="h-4 w-4" /> },
    { id: 6, title: 'Features', icon: <Sparkles className="h-4 w-4" /> },
  ];
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type: '',
    owner: '',
    phoneNumber: '',
    email: '',
    location: '',
    region: 'greater-accra',
    plotSize: '',
    plotSizeUnit: '',
    terrain: '',
    nearbyLandmarks: '',
    buildingSize: '',
    buildingSizeUnit: '',
    storeys: '',
    bedrooms: '',
    bathrooms: '',
    kitchens: '',
    livingAreas: '',
    buildingStyle: '',
    budget: '',
    currency: 'cedi',
    timeframe: '',
    expectedStartDate: '',
    structureType: '',
    foundationType: '',
    roofType: '',
    wallMaterial: '',
    floorMaterial: '',
    specialFeatures: [],
    sustainabilityFeatures: [],
    accessibilityNeeds: '',
    traditionalElements: false,
    siteConstraints: '',
    localRegulations: '',
    additionalNotes: '',
    images: []
  });

  // Check dark mode on component mount and whenever it might change
  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  // Form field update handler
  const handleInputChange = (field: keyof FormData, value: FormFieldValue) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle array fields (specialFeatures, sustainabilityFeatures)
  const handleArrayFieldToggle = (field: 'specialFeatures' | 'sustainabilityFeatures', value: string) => {
    setFormData(prev => {
      const currentValues = prev[field] || [];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [field]: currentValues.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [field]: [...currentValues, value]
        };
      }
    });
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit form and send to LLM for processing
      handleGenerateProjectPlan();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Function to send form data to LLM and generate project plan
  const handleGenerateProjectPlan = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate form data
      if (!formData.name || !formData.description || !formData.type) {
        toast({
          title: "Missing information",
          description: "Please provide the basic project details before generating a plan.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Format specialFeatures and sustainabilityFeatures for display
      const specialFeaturesText = formData.specialFeatures && formData.specialFeatures.length > 0 
        ? formData.specialFeatures.join(', ') 
        : 'None specified';
        
      const sustainabilityFeaturesText = formData.sustainabilityFeatures && formData.sustainabilityFeatures.length > 0 
        ? formData.sustainabilityFeatures.join(', ') 
        : 'None specified';
        
      // Prepare the prompt for the LLM with all available information
      const prompt = `Generate a detailed construction project plan for:

PROJECT OVERVIEW
---------------
Project Name: ${formData.name}
Project Type: ${formData.type}
Description: ${formData.description}
Owner/Client: ${formData.owner || 'Not specified'}
Contact Information: ${formData.phoneNumber ? `Phone: ${formData.phoneNumber}` : ''} ${formData.email ? `Email: ${formData.email}` : ''}

LOCATION DETAILS
---------------
Location: ${formData.location || 'Not specified'}, ${REGIONS.find(r => r.value === formData.region)?.label || formData.region}
Plot Size: ${formData.plotSize ? `${formData.plotSize} ${formData.plotSizeUnit === 'sqm' ? 'square meters' : formData.plotSizeUnit === 'sqft' ? 'square feet' : formData.plotSizeUnit}` : 'Not specified'}
Terrain: ${formData.terrain || 'Not specified'}
Nearby Landmarks: ${formData.nearbyLandmarks || 'None specified'}

BUILDING SPECIFICATIONS
---------------
Building Size: ${formData.buildingSize ? `${formData.buildingSize} ${formData.buildingSizeUnit === 'sqm' ? 'square meters' : 'square feet'}` : 'Not specified'}
Number of Storeys: ${formData.storeys || 'Not specified'}
Bedrooms: ${formData.bedrooms || 'Not specified'}
Bathrooms: ${formData.bathrooms || 'Not specified'}
Kitchens: ${formData.kitchens || 'Not specified'}
Living Areas: ${formData.livingAreas || 'Not specified'}
Building Style: ${formData.buildingStyle || 'Not specified'}

BUDGET AND TIMELINE
---------------
Budget: ${formData.budget ? `${CURRENCIES.find(c => c.value === formData.currency)?.symbol || ''}${formData.budget} ${CURRENCIES.find(c => c.value === formData.currency)?.label || ''}` : 'Not specified'}
Timeframe: ${formData.timeframe ? `${formData.timeframe} months` : 'Not specified'}
Expected Start Date: ${formData.expectedStartDate || 'Not specified'}

MATERIALS AND CONSTRUCTION
---------------
Structure Type: ${formData.structureType || 'Not specified'}
Foundation Type: ${formData.foundationType || 'Not specified'}
Roof Type: ${formData.roofType || 'Not specified'}
Wall Material: ${formData.wallMaterial || 'Not specified'}
Floor Material: ${formData.floorMaterial || 'Not specified'}

FEATURES AND REQUIREMENTS
---------------
Special Features: ${specialFeaturesText}
Sustainability Features: ${sustainabilityFeaturesText}
Accessibility Needs: ${formData.accessibilityNeeds || 'None specified'}
Traditional Elements: ${formData.traditionalElements ? 'Yes, include traditional Ghanaian architectural elements' : 'Not required'}
Site Constraints: ${formData.siteConstraints || 'None specified'}
Local Regulations: ${formData.localRegulations || 'Standard regulations apply'}
Additional Notes: ${formData.additionalNotes || 'None'}

Please include:
1. Project phases and detailed timeline
2. Required materials with quantities and local sourcing recommendations
3. Complete budget breakdown with contingency planning
4. Risk assessment specific to the region and project type
5. Sustainability recommendations for Ghanaian climate
6. Labor requirements and specialized skills needed
7. Permit and compliance requirements
8. Quality control and inspection checkpoints
`;

      // In a real implementation, you would send this to an API endpoint
      // that interfaces with an LLM like OpenAI's GPT or similar
      console.log("Sending to LLM:", prompt);
      
      // Simulate API call with timeout
      setTimeout(() => {
        // Store the prompt in localStorage to simulate passing data between pages
        localStorage.setItem('projectPlanPrompt', prompt);
        localStorage.setItem('projectData', JSON.stringify(formData));
        
        // Navigate to the generated plan page
        setIsSubmitting(false);
        navigate('/generated-plan');
      }, 3000);
      
    } catch (error) {
      console.error("Error generating project plan:", error);
      toast({
        title: "Error",
        description: "There was a problem generating your project plan. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  // Get step title and subtitle based on current step
  const getStepInfo = () => {
    switch (currentStep) {
      case 1:
        return {
          title: 'Project Details',
          subtitle: 'Provide basic information about your construction project'
        };
      case 2:
        return {
          title: 'Location & Plot',
          subtitle: 'Tell us about where the project will be built'
        };
      case 3:
        return {
          title: 'Building Specifications',
          subtitle: 'Define the size and layout of your building'
        };
      case 4:
        return {
          title: 'Budget & Timeline',
          subtitle: 'Set your financial parameters and expected timeframe'
        };
      case 5:
        return {
          title: 'Materials & Construction',
          subtitle: 'Select preferred materials and construction methods'
        };
      case 6:
        return {
          title: 'Features & References',
          subtitle: 'Add special features and reference images'
        };
      default:
        return {
          title: 'Project Details',
          subtitle: 'Provide basic information about your construction project'
        };
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="flex items-center text-blue-700 dark:text-blue-400">
                <Building className="h-5 w-5 mr-2" />
                {getStepInfo().title}
              </CardTitle>
              <CardDescription>{getStepInfo().subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6">
              <div className="space-y-2">
                <Label htmlFor="name" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
                  Project Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`transition-all duration-300 ${
                    isDarkMode 
                      ? "bg-slate-900 border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-white" 
                      : "border-gray-200 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-300"
                  }`}
                />
              </div>

              <ProjectDescriptionInput
                description={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                isDarkMode={isDarkMode}
              />

              <ProjectTypeSelector
                selectedType={formData.type}
                projectTypes={PROJECT_TYPES}
                onChange={(value) => handleInputChange('type', value)}
                isDarkMode={isDarkMode}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="owner" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
                    Project Owner/Client Name
                  </Label>
                  <Input
                    id="owner"
                    placeholder="Enter owner/client name"
                    value={formData.owner}
                    onChange={(e) => handleInputChange('owner', e.target.value)}
                    className={`transition-all duration-300 ${
                      isDarkMode 
                        ? "bg-slate-900 border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-white" 
                        : "border-gray-200 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-300"
                    }`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
                    Contact Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`transition-all duration-300 ${
                      isDarkMode 
                        ? "bg-slate-900 border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-white" 
                        : "border-gray-200 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-300"
                    }`}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
                  Contact Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`transition-all duration-300 ${
                    isDarkMode 
                      ? "bg-slate-900 border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-white" 
                      : "border-gray-200 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-300"
                  }`}
                />
              </div>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="flex items-center text-blue-700 dark:text-blue-400">
                <MapPin className="h-5 w-5 mr-2" />
                {getStepInfo().title}
              </CardTitle>
              <CardDescription>{getStepInfo().subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6">
              <ProjectLocationBudget
                location={formData.location}
                region={formData.region}
                budget={formData.budget}
                currency={formData.currency}
                regions={REGIONS}
                currencies={CURRENCIES}
                onInputChange={handleInputChange}
                isDarkMode={isDarkMode}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="plotSize" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
                    Plot Size
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="plotSize"
                      placeholder="Enter size"
                      value={formData.plotSize}
                      onChange={(e) => handleInputChange('plotSize', e.target.value)}
                      className={`transition-all duration-300 ${
                        isDarkMode 
                          ? "bg-slate-900 border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-white" 
                          : "border-gray-200 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-300"
                      }`}
                    />
                    <Select
                      value={formData.plotSizeUnit}
                      onValueChange={(value) => handleInputChange('plotSizeUnit', value)}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sqm">Square Meters (m²)</SelectItem>
                        <SelectItem value="sqft">Square Feet (ft²)</SelectItem>
                        <SelectItem value="acres">Acres</SelectItem>
                        <SelectItem value="hectares">Hectares</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="terrain" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
                    Terrain Type
                  </Label>
                  <Select
                    value={formData.terrain}
                    onValueChange={(value) => handleInputChange('terrain', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select terrain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat Land</SelectItem>
                      <SelectItem value="sloped">Sloped/Hilly</SelectItem>
                      <SelectItem value="rocky">Rocky</SelectItem>
                      <SelectItem value="waterfront">Waterfront</SelectItem>
                      <SelectItem value="beachfront">Beachfront</SelectItem>
                      <SelectItem value="forested">Forested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="nearbyLandmarks" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
                  Nearby Landmarks
                </Label>
                <Textarea
                  id="nearbyLandmarks"
                  placeholder="Describe any nearby landmarks, streets, or points of interest"
                  value={formData.nearbyLandmarks}
                  onChange={(e) => handleInputChange('nearbyLandmarks', e.target.value)}
                  className={`min-h-[80px] transition-all duration-300 ${
                    isDarkMode 
                      ? "bg-slate-900 border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-white" 
                      : "border-gray-200 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-300"
                  }`}
                />
              </div>
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="flex items-center text-blue-700 dark:text-blue-400">
                <Home className="h-5 w-5 mr-2" />
                {getStepInfo().title}
              </CardTitle>
              <CardDescription>{getStepInfo().subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="buildingSize" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
                    Building Size
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="buildingSize"
                      placeholder="Enter building size"
                      value={formData.buildingSize}
                      onChange={(e) => handleInputChange('buildingSize', e.target.value)}
                      className={`transition-all duration-300 ${
                        isDarkMode 
                          ? "bg-slate-900 border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-white" 
                          : "border-gray-200 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-300"
                      }`}
                    />
                    <Select
                      value={formData.buildingSizeUnit}
                      onValueChange={(value) => handleInputChange('buildingSizeUnit', value)}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sqm">Square Meters (m²)</SelectItem>
                        <SelectItem value="sqft">Square Feet (ft²)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storeys" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
                    Number of Storeys
                  </Label>
                  <Select
                    value={formData.storeys}
                    onValueChange={(value) => handleInputChange('storeys', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of storeys" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Storey (Single-level)</SelectItem>
                      <SelectItem value="2">2 Storeys</SelectItem>
                      <SelectItem value="3">3 Storeys</SelectItem>
                      <SelectItem value="4">4 Storeys</SelectItem>
                      <SelectItem value="5+">5+ Storeys</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
                    Bedrooms
                  </Label>
                  <Select
                    value={formData.bedrooms}
                    onValueChange={(value) => handleInputChange('bedrooms', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, '9+'].map(num => (
                        <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bathrooms" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
                    Bathrooms
                  </Label>
                  <Select
                    value={formData.bathrooms}
                    onValueChange={(value) => handleInputChange('bathrooms', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, '7+'].map(num => (
                        <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="kitchens" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
                    Kitchens
                  </Label>
                  <Select
                    value={formData.kitchens}
                    onValueChange={(value) => handleInputChange('kitchens', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, '4+'].map(num => (
                        <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="livingAreas" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
                    Living Areas
                  </Label>
                  <Select
                    value={formData.livingAreas}
                    onValueChange={(value) => handleInputChange('livingAreas', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, '4+'].map(num => (
                        <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="buildingStyle" className={isDarkMode ? "text-slate-300" : "text-gray-900"}>
                  Building Style
                </Label>
                <Select
                  value={formData.buildingStyle}
                  onValueChange={(value) => handleInputChange('buildingStyle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select building style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="traditional">Traditional Ghanaian</SelectItem>
                    <SelectItem value="colonial">Colonial</SelectItem>
                    <SelectItem value="contemporary">Contemporary</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="tropical">Tropical</SelectItem>
                    <SelectItem value="mediterranean">Mediterranean</SelectItem>
                    <SelectItem value="fusion">African Fusion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );
      case 4:
        return (
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="flex items-center text-blue-700 dark:text-blue-400">
                <DollarSign className="h-5 w-5 mr-2" />
                {getStepInfo().title}
              </CardTitle>
              <CardDescription>{getStepInfo().subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6">
              <BudgetTimelineForm
                budget={formData.budget}
                currency={formData.currency}
                timeframe={formData.timeframe}
                expectedStartDate={formData.expectedStartDate}
                currencies={CURRENCIES}
                onInputChange={handleInputChange}
                isDarkMode={isDarkMode}
              />
            </CardContent>
          </Card>
        );
      case 5:
        return (
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="flex items-center text-blue-700 dark:text-blue-400">
                <Layers className="h-5 w-5 mr-2" />
                {getStepInfo().title}
              </CardTitle>
              <CardDescription>{getStepInfo().subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6">
              <MaterialsConstructionForm
                structureType={formData.structureType}
                foundationType={formData.foundationType}
                roofType={formData.roofType}
                wallMaterial={formData.wallMaterial}
                floorMaterial={formData.floorMaterial}
                onInputChange={handleInputChange}
                isDarkMode={isDarkMode}
                structureTypes={[
                  { value: "concrete-frame", label: "Concrete Frame", description: "Durable structure with reinforced concrete columns and beams" },
                  { value: "load-bearing", label: "Load-Bearing Walls", description: "Walls that directly support structural loads" },
                  { value: "steel-frame", label: "Steel Frame", description: "Strong, lightweight structure using steel beams and columns" },
                  { value: "timber-frame", label: "Timber Frame", description: "Traditional wooden frame construction" },
                  { value: "hybrid", label: "Hybrid Structure", description: "Combination of different structural systems" }
                ]}
                foundationTypes={[
                  { value: "strip", label: "Strip Foundation", description: "Continuous strips of concrete under load-bearing walls" },
                  { value: "raft", label: "Raft Foundation", description: "Single slab of concrete supporting the entire building" },
                  { value: "pad", label: "Pad Foundation", description: "Isolated concrete pads supporting columns" },
                  { value: "pile", label: "Pile Foundation", description: "Deep foundations transferring loads to lower soil layers" },
                  { value: "raised-pile", label: "Raised Pile Foundation", description: "Elevated foundation for flood-prone areas" }
                ]}
                roofTypes={[
                  { value: "gable", label: "Gable Roof", description: "Classic triangular roof with two sloping sides" },
                  { value: "hip", label: "Hip Roof", description: "Sloping on all sides with no vertical ends" },
                  { value: "flat", label: "Flat Roof", description: "Nearly level roof with minimal slope for drainage" },
                  { value: "shed", label: "Shed Roof", description: "Single slope roof design" },
                  { value: "metal-sheet", label: "Metal Sheet Roof", description: "Lightweight metal panels for roofing" },
                  { value: "clay-tiles", label: "Clay Tiles", description: "Traditional terracotta tile roofing" },
                  { value: "concrete-tiles", label: "Concrete Tiles", description: "Durable concrete tile roofing solution" },
                  { value: "thatch", label: "Traditional Thatch", description: "Natural roofing material using dried plant stalks" }
                ]}
                wallMaterials={[
                  { value: "concrete-blocks", label: "Concrete Blocks", description: "Precast concrete masonry units" },
                  { value: "clay-bricks", label: "Clay Bricks", description: "Traditional fired clay masonry units" },
                  { value: "compressed-earth", label: "Compressed Earth Blocks", description: "Eco-friendly blocks made from compressed soil" },
                  { value: "stone", label: "Stone", description: "Natural stone masonry construction" },
                  { value: "wood", label: "Wood", description: "Timber wall construction" },
                  { value: "glass", label: "Glass", description: "Large glass panel walls for modern designs" }
                ]}
                floorMaterials={[
                  { value: "concrete", label: "Concrete", description: "Durable concrete flooring solution" },
                  { value: "ceramic-tiles", label: "Ceramic Tiles", description: "Common fired clay tile flooring" },
                  { value: "porcelain-tiles", label: "Porcelain Tiles", description: "Dense, durable tile with low porosity" },
                  { value: "terrazzo", label: "Terrazzo", description: "Composite material with marble, quartz, or glass chips" },
                  { value: "wood", label: "Wood", description: "Natural timber flooring" },
                  { value: "vinyl", label: "Vinyl", description: "Synthetic flooring material, water-resistant" },
                  { value: "stone", label: "Stone", description: "Natural stone tile or slab flooring" }
                ]}
              />
            </CardContent>
          </Card>
        );
      case 6:
        return (
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="flex items-center text-blue-700 dark:text-blue-400">
                <Sparkles className="h-5 w-5 mr-2" />
                {getStepInfo().title}
              </CardTitle>
              <CardDescription>{getStepInfo().subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6">
              <ProjectFeaturesForm
                specialFeatures={formData.specialFeatures}
                sustainabilityFeatures={formData.sustainabilityFeatures}
                accessibilityNeeds={formData.accessibilityNeeds}
                traditionalElements={formData.traditionalElements}
                siteConstraints={formData.siteConstraints}
                additionalNotes={formData.additionalNotes}
                onInputChange={handleInputChange}
                onArrayToggle={handleArrayFieldToggle}
                isDarkMode={isDarkMode}
              />
              
              <ProjectImageUpload
                images={formData.images}
                onImagesChange={(images) => handleInputChange('images', images)}
                isDarkMode={isDarkMode}
              />
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Create New Construction Project
        </h1>
        <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          Tell us about your project to generate a comprehensive construction plan
        </p>
      </div>
    
      {/* Enhanced Step Indicator */}
      <div className="mb-8 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm bg-white dark:bg-slate-950 p-5">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-0">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center text-center">
                <button
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                  disabled={currentStep <= step.id}
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 mb-2
                  ${isActive 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : isCompleted 
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-400'
                  } ${currentStep > step.id ? 'cursor-pointer hover:opacity-90' : ''}`}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : step.icon}
                </button>
                <p className={`text-sm font-medium 
                  ${isActive 
                    ? 'text-blue-500 dark:text-blue-400' 
                    : isCompleted 
                      ? 'text-green-500 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                  {step.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <Progress value={progress} className="h-2 bg-gray-100 dark:bg-gray-800" />
      </div>
    
      <LazyMotion features={domAnimation}>
        <m.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`transition-all duration-300 ${
                isDarkMode ? 'hover:bg-slate-800' : ''
              }`}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              className={`transition-all duration-300 ${
                currentStep === totalSteps
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                currentStep === totalSteps ? (
                  <>
                    Generate Project Plan
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )
              )}
            </Button>
          </div>
        </m.div>
      </LazyMotion>
    </div>
  );
}

export default CreateProject; 