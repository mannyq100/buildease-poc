import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Sparkles,
  ChevronRight,
  Mic,
  Camera,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Upload,
  Lightbulb,
  PlusCircle,
  InfoIcon,
  HomeIcon,
  BuildingIcon,
  Factory,
  Tools,
  Check,
  AlertCircle,
  CloudSun,
  Wifi,
  Zap,
  BellRing,
  Target,
  Layers,
  ArrowRight,
  Clock8
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';

const ProjectInputMockup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    description: '',
    projectType: '',
    location: '',
    budget: '',
    timeline: '',
    size: '',
    bedrooms: 3,
    bathrooms: 2,
    floors: 2,
    sustainabilityLevel: 2,
    hasPlans: false,
    priority: 'quality'
  });
  
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isDescriptionAiEnhanced, setIsDescriptionAiEnhanced] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Simulate AI suggesting insights after user inputs some data
    if ((field === 'location' || field === 'projectType') && value) {
      setTimeout(() => {
        setAiSuggestions(true);
      }, 800);
    }
  };

  const enhanceWithAI = () => {
    setIsDescriptionAiEnhanced(true);
    const enhancedDescription = formData.description + 
      (formData.description ? 
        " The project will include energy-efficient design elements, passive cooling, and natural lighting optimization. The layout will prioritize open spaces with modern aesthetics while maintaining functional utility." 
        : "Two-story residential house with 3 bedrooms, 2 bathrooms in a contemporary design style. The project will include energy-efficient design elements, passive cooling, and natural lighting optimization.");
    
    setFormData({ ...formData, description: enhancedDescription });
  };

  const simulateVoiceInput = () => {
    setIsVoiceRecording(true);
    
    setTimeout(() => {
      setIsVoiceRecording(false);
      setFormData({ 
        ...formData, 
        description: "Two-story residential house with 3 bedrooms, 2 bathrooms in a contemporary design style." 
      });
    }, 2000);
  };

  const moveToNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Navigation would normally go to the AI generation page
      navigate('/generated-plan');
    }
  };

  const moveToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderDetailsStep();
      case 3:
        return renderPreferencesStep();
      default:
        return renderBasicInfoStep();
    }
  };

  const renderBasicInfoStep = () => {
    return (
      <>
        {/* Basic Input Card */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              Project Basics
            </CardTitle>
            <CardDescription>
              Provide essential information about your construction project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Voice Input Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description" className="text-sm font-medium">Project Description</Label>
                <div className="flex items-center gap-2">
                  {isDescriptionAiEnhanced && (
                    <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Enhanced
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 h-7 px-2"
                    onClick={enhanceWithAI}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Enhance
                  </Button>
                </div>
              </div>
              <div className="flex space-x-2">
                <Textarea 
                  id="description"
                  className="flex-1 min-h-[100px] resize-none" 
                  placeholder="Describe your project (e.g., 'Two-story residential house with 3 bedrooms')" 
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={isVoiceRecording ? "text-red-600 border-red-300" : ""}
                  onClick={simulateVoiceInput}
                >
                  {isVoiceRecording ? (
                    <>
                      <span className="animate-pulse mr-2">●</span>
                      Recording...
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-1" />
                      Voice Input
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Core Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectType" className="text-sm font-medium">Project Type</Label>
                <Select 
                  value={formData.projectType}
                  onValueChange={(value) => handleInputChange('projectType', value)}
                >
                  <SelectTrigger id="projectType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">
                      <div className="flex items-center">
                        <HomeIcon className="h-4 w-4 mr-2 text-blue-500" />
                        Residential House
                      </div>
                    </SelectItem>
                    <SelectItem value="apartment">
                      <div className="flex items-center">
                        <BuildingIcon className="h-4 w-4 mr-2 text-purple-500" />
                        Apartment Building
                      </div>
                    </SelectItem>
                    <SelectItem value="commercial">
                      <div className="flex items-center">
                        <Factory className="h-4 w-4 mr-2 text-green-500" />
                        Commercial Building
                      </div>
                    </SelectItem>
                    <SelectItem value="renovation">
                      <div className="flex items-center">
                        <Tools className="h-4 w-4 mr-2 text-orange-500" />
                        Renovation
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <div className="relative">
                  <Input 
                    id="location"
                    placeholder="Enter city/region" 
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="pl-9"
                  />
                  <MapPin className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm font-medium">Budget Range</Label>
                <Select 
                  value={formData.budget}
                  onValueChange={(value) => handleInputChange('budget', value)}
                >
                  <SelectTrigger id="budget">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50-100k">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100-200k">$100,000 - $200,000</SelectItem>
                    <SelectItem value="200-500k">$200,000 - $500,000</SelectItem>
                    <SelectItem value="500k+">Above $500,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline" className="text-sm font-medium">Timeline</Label>
                <Select 
                  value={formData.timeline}
                  onValueChange={(value) => handleInputChange('timeline', value)}
                >
                  <SelectTrigger id="timeline">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
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

        {/* Initial AI Insights */}
        {aiSuggestions && (
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Lightbulb className="h-5 w-5 text-blue-500" />
                <span>AI Insights</span>
                <Badge className="ml-2 bg-blue-100 text-blue-600">New</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.location && (
                <InsightItem 
                  icon={<CloudSun className="w-5 h-5 text-blue-600" />}
                  title="Weather Considerations"
                  description={`${formData.location} typically experiences a rainy season from April to June which could affect construction timelines.`}
                />
              )}
              
              {formData.projectType === 'residential' && (
                <InsightItem 
                  icon={<Zap className="w-5 h-5 text-blue-600" />}
                  title="Energy Efficiency"
                  description="Consider orientation for natural light and ventilation to reduce energy costs by up to 30%."
                />
              )}
              
              <InsightItem 
                icon={<AlertCircle className="w-5 h-5 text-blue-600" />}
                title="Regulatory Note"
                description="Building permits in this region typically take 4-6 weeks for approval."
              />
            </CardContent>
          </Card>
        )}
      </>
    );
  };

  const renderDetailsStep = () => {
    return (
      <>
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-500" />
              Project Details
            </CardTitle>
            <CardDescription>
              Specify additional details to improve your project plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label htmlFor="size" className="text-sm font-medium">Project Size (sq.ft)</Label>
                <Input 
                  id="size"
                  type="text"
                  placeholder="e.g., 2500" 
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="bedrooms" className="text-sm font-medium">Bedrooms</Label>
                  <span className="text-sm font-medium">{formData.bedrooms}</span>
                </div>
                <div className="pt-2">
                  <Slider
                    id="bedrooms"
                    min={1}
                    max={6}
                    step={1}
                    value={[formData.bedrooms]}
                    onValueChange={(value) => handleInputChange('bedrooms', value[0])}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1</span>
                  <span>6+</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="bathrooms" className="text-sm font-medium">Bathrooms</Label>
                  <span className="text-sm font-medium">{formData.bathrooms}</span>
                </div>
                <div className="pt-2">
                  <Slider
                    id="bathrooms"
                    min={1}
                    max={5}
                    step={1}
                    value={[formData.bathrooms]}
                    onValueChange={(value) => handleInputChange('bathrooms', value[0])}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1</span>
                  <span>5+</span>
                </div>
              </div>
            </div>
            
            <div className="pt-3 space-y-4">
              <h3 className="text-sm font-medium">Structural Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="basement" />
                  <Label htmlFor="basement">Include Basement</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="garage" defaultChecked />
                  <Label htmlFor="garage">Include Garage</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="openplan" defaultChecked />
                  <Label htmlFor="openplan">Open Plan Design</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="outdoor" />
                  <Label htmlFor="outdoor">Outdoor Living Space</Label>
                </div>
              </div>
            </div>
            
            <div className="pt-3 space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Sustainability Level</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Higher sustainability levels include more eco-friendly features but may increase initial costs. The AI planner will optimize for long-term savings.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[formData.sustainabilityLevel]}
                    onValueChange={(value) => handleInputChange('sustainabilityLevel', value[0])}
                    className="flex-grow"
                  />
                  <Badge className={
                    formData.sustainabilityLevel <= 2 ? "bg-blue-100 text-blue-600" :
                    formData.sustainabilityLevel <= 4 ? "bg-green-100 text-green-600" :
                    "bg-emerald-100 text-emerald-600"
                  }>
                    {formData.sustainabilityLevel <= 2 ? "Basic" :
                     formData.sustainabilityLevel <= 4 ? "Enhanced" :
                     "Premium"}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Standard</span>
                  <span>Net Zero</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Optional Uploads */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Reference Materials (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-1 border-dashed">
                <Upload className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Floor Plans</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-1 border-dashed">
                <Camera className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Reference Photos</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-1 border-dashed">
                <PlusCircle className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Other Documents</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  const renderPreferencesStep = () => {
    return (
      <>
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Project Priorities
            </CardTitle>
            <CardDescription>
              Let our AI optimize your project plan based on your priorities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">What matters most for your project?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button 
                  variant={formData.priority === 'speed' ? "default" : "outline"} 
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  onClick={() => handleInputChange('priority', 'speed')}
                >
                  <Clock8 className="h-5 w-5" />
                  <span>Time Efficiency</span>
                </Button>
                <Button 
                  variant={formData.priority === 'cost' ? "default" : "outline"} 
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  onClick={() => handleInputChange('priority', 'cost')}
                >
                  <DollarSign className="h-5 w-5" />
                  <span>Cost Optimization</span>
                </Button>
                <Button 
                  variant={formData.priority === 'quality' ? "default" : "outline"} 
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  onClick={() => handleInputChange('priority', 'quality')}
                >
                  <Check className="h-5 w-5" />
                  <span>Quality Focus</span>
                </Button>
              </div>
            </div>
            
            <div className="pt-3 space-y-4">
              <h3 className="text-sm font-medium">Additional Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="flex items-center">
                    <BellRing className="h-4 w-4 mr-2 text-gray-500" />
                    Receive project milestone notifications
                  </Label>
                  <Switch id="notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="smart" className="flex items-center">
                    <Wifi className="h-4 w-4 mr-2 text-gray-500" />
                    Include smart home infrastructure
                  </Label>
                  <Switch id="smart" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="plans" className="flex items-center">
                    <Layers className="h-4 w-4 mr-2 text-gray-500" />
                    I already have architectural plans
                  </Label>
                  <Switch 
                    id="plans" 
                    checked={formData.hasPlans}
                    onCheckedChange={(checked) => handleInputChange('hasPlans', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Alert className="bg-blue-50 border-blue-200 text-blue-800">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            Based on your inputs, our AI will generate an optimized construction plan with resource allocation, budget breakdown, and timeline estimates.
          </AlertDescription>
        </Alert>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-2">Your Project Summary</h3>
          <div className="space-y-1 text-sm">
            {formData.projectType && (
              <div className="flex">
                <span className="text-gray-500 w-32">Type:</span>
                <span className="font-medium text-gray-700">{formData.projectType === 'residential' ? 'Residential House' : 
                                      formData.projectType === 'apartment' ? 'Apartment Building' : 
                                      formData.projectType === 'commercial' ? 'Commercial Building' : 
                                      formData.projectType === 'renovation' ? 'Renovation' : 
                                      formData.projectType}</span>
              </div>
            )}
            {formData.location && (
              <div className="flex">
                <span className="text-gray-500 w-32">Location:</span>
                <span className="font-medium text-gray-700">{formData.location}</span>
              </div>
            )}
            {formData.budget && (
              <div className="flex">
                <span className="text-gray-500 w-32">Budget:</span>
                <span className="font-medium text-gray-700">{formData.budget}</span>
              </div>
            )}
            {formData.timeline && (
              <div className="flex">
                <span className="text-gray-500 w-32">Timeline:</span>
                <span className="font-medium text-gray-700">{formData.timeline} months</span>
              </div>
            )}
            {formData.size && (
              <div className="flex">
                <span className="text-gray-500 w-32">Size:</span>
                <span className="font-medium text-gray-700">{formData.size} sq.ft</span>
              </div>
            )}
            <div className="flex">
              <span className="text-gray-500 w-32">Bedrooms:</span>
              <span className="font-medium text-gray-700">{formData.bedrooms}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-32">Bathrooms:</span>
              <span className="font-medium text-gray-700">{formData.bathrooms}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-32">Priority:</span>
              <span className="font-medium text-gray-700 capitalize">{formData.priority || 'Quality'}</span>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Top Navigation */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Create New Project
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-blue-600">
                Save Draft
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                AI Mode
                <Badge className="ml-1 text-xs bg-blue-100 text-blue-600 hover:bg-blue-200">Active</Badge>
              </Button>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={step * 33.3} className="h-2" />
            <div className="flex justify-between mt-2 text-sm">
              <div className={`flex flex-col items-center ${step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${step >= 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  {step > 1 ? <Check className="w-3 h-3" /> : '1'}
                </div>
                <span>Basics</span>
              </div>
              <div className={`flex flex-col items-center ${step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${step >= 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  {step > 2 ? <Check className="w-3 h-3" /> : '2'}
                </div>
                <span>Details</span>
              </div>
              <div className={`flex flex-col items-center ${step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${step >= 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  {step > 3 ? <Check className="w-3 h-3" /> : '3'}
                </div>
                <span>Preferences</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="max-w-3xl mx-auto p-4 my-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800">AI Project Assistant</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {step === 1 && "I'll help create a detailed project plan. Start by providing basic information about your construction project."}
                  {step === 2 && "Great start! Now let's add some specific details to make your project plan more accurate."}
                  {step === 3 && "Almost there! Set your priorities so I can optimize your construction plan accordingly."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto p-4 space-y-4 pb-24">
        {renderStepContent()}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            className="space-x-2"
            onClick={moveToPreviousStep}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <Button 
            className="space-x-2"
            onClick={moveToNextStep}
          >
            <span>{step === 3 ? 'Generate Plan' : 'Continue'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const InsightItem = ({ icon, title, description }) => (
  <div className="flex items-start space-x-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100 hover:border-blue-200 transition-all duration-300">
    {icon || <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />}
    <div>
      <h4 className="font-medium text-blue-900">{title}</h4>
      <p className="text-sm text-blue-700 mt-1">{description}</p>
    </div>
  </div>
);

export default ProjectInputMockup;