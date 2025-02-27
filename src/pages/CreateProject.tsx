import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building,
  HomeIcon,
  Factory,
  Tools,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
  FileText,
  Mic,
  Camera,
  Upload,
  AlertCircle,
  CloudSun,
  Wifi,
  Zap,
  BellRing,
  Target,
  Layers,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import MainNavigation from '@/components/layout/MainNavigation';

interface FormData {
  name: string;
  description: string;
  type: string;
  location: string;
  budget: string;
  timeline: string;
  teamSize: string;
  startDate: string;
  sustainabilityLevel: number;
  hasPlans: boolean;
  priority: 'quality' | 'speed' | 'cost';
  images: string[];
  aiEnhanced: boolean;
}

const CreateProject = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type: '',
    location: '',
    budget: '',
    timeline: '',
    teamSize: '',
    startDate: '',
    sustainabilityLevel: 2,
    hasPlans: false,
    priority: 'quality',
    images: [],
    aiEnhanced: false
  });

  // Sample project images
  const projectImages = [
    '/images/projects/residential-1.jpg',
    '/images/projects/commercial-1.jpg',
    '/images/projects/renovation-1.jpg'
  ];

  // Check dark mode on component mount and whenever it might change
  useEffect(() => {
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

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit form and navigate to project details
      navigate('/project/1');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const simulateVoiceInput = () => {
    setIsVoiceRecording(true);
    setTimeout(() => {
      setIsVoiceRecording(false);
      setFormData(prev => ({
        ...prev,
        description: "Two-story residential house with modern design, featuring 3 bedrooms and 2 bathrooms. The project emphasizes open-concept living spaces and natural lighting."
      }));
    }, 2000);
  };

  const enhanceWithAI = async () => {
    setIsLoading(true);
    // Simulate AI enhancement
    setTimeout(() => {
      const enhancedDescription = formData.description + 
        "\n\nThe project will incorporate energy-efficient design elements including passive solar heating, natural ventilation, and high-performance insulation. The layout optimizes space utilization while maintaining aesthetic appeal. Construction will utilize sustainable materials where possible, and the design includes provisions for future smart home technology integration.";
      
      setFormData(prev => ({
        ...prev,
        description: enhancedDescription,
        aiEnhanced: true
      }));
      setIsLoading(false);
    }, 1500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-slate-900">
      <MainNavigation />

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Step Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1E1E1E] dark:text-white">
              {currentStep === 1 ? 'Project Details' :
               currentStep === 2 ? 'Timeline & Resources' :
               'Additional Information'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {currentStep === 1 ? 'Provide basic information about your construction project' :
               currentStep === 2 ? 'Define project timeline and resource requirements' :
               'Add any additional details and preferences'}
            </p>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Enter the core details of your project</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter project name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="description">Project Description</Label>
                        <div className="flex items-center gap-2">
                          {formData.aiEnhanced && (
                            <Badge className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI Enhanced
                            </Badge>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 h-7 px-2"
                            onClick={enhanceWithAI}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <span className="animate-pulse mr-2">●</span>
                                Enhancing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-1" />
                                Enhance with AI
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Textarea
                          id="description"
                          placeholder="Describe your project in detail"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className="min-h-[100px]"
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

                    {/* Project Images */}
                    <div className="space-y-2">
                      <Label>Project Images</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                            <img 
                              src={image} 
                              alt={`Project image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== index)
                                }));
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <label className="relative aspect-video rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 cursor-pointer flex items-center justify-center">
                          <div className="text-center">
                            <Upload className="h-6 w-6 mx-auto text-gray-400" />
                            <span className="mt-2 block text-sm text-gray-500">Upload Image</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Project Type</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => handleInputChange('type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="residential">
                              <div className="flex items-center">
                                <HomeIcon className="h-4 w-4 mr-2 text-[#1E3A8A]" />
                                Residential
                              </div>
                            </SelectItem>
                            <SelectItem value="commercial">
                              <div className="flex items-center">
                                <Factory className="h-4 w-4 mr-2 text-[#D97706]" />
                                Commercial
                              </div>
                            </SelectItem>
                            <SelectItem value="renovation">
                              <div className="flex items-center">
                                <Tools className="h-4 w-4 mr-2 text-green-600" />
                                Renovation
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="location"
                            className="pl-9"
                            placeholder="Project location"
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Type Examples */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Examples</CardTitle>
                    <CardDescription>View examples of similar projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {projectImages.map((image, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
                          <img 
                            src={image} 
                            alt={`Example project ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-2 left-2 right-2 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Example Project {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline & Budget</CardTitle>
                    <CardDescription>Define your project's timeline and budget requirements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="budget">Budget</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="budget"
                            className="pl-9"
                            placeholder="Project budget"
                            value={formData.budget}
                            onChange={(e) => handleInputChange('budget', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timeline">Timeline</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="timeline"
                            className="pl-9"
                            placeholder="Expected duration"
                            value={formData.timeline}
                            onChange={(e) => handleInputChange('timeline', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teamSize">Team Size</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="teamSize"
                            className="pl-9"
                            placeholder="Number of team members"
                            value={formData.teamSize}
                            onChange={(e) => handleInputChange('teamSize', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="startDate"
                            className="pl-9"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Project Preferences</CardTitle>
                    <CardDescription>Specify additional preferences and requirements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <Label>Project Priority</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                          variant={formData.priority === 'quality' ? 'default' : 'outline'}
                          className={formData.priority === 'quality' ? 'bg-[#1E3A8A]' : ''}
                          onClick={() => handleInputChange('priority', 'quality')}
                        >
                          <Target className="h-4 w-4 mr-2" />
                          Quality
                        </Button>
                        <Button
                          variant={formData.priority === 'speed' ? 'default' : 'outline'}
                          className={formData.priority === 'speed' ? 'bg-[#D97706]' : ''}
                          onClick={() => handleInputChange('priority', 'speed')}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Speed
                        </Button>
                        <Button
                          variant={formData.priority === 'cost' ? 'default' : 'outline'}
                          className={formData.priority === 'cost' ? 'bg-green-600' : ''}
                          onClick={() => handleInputChange('priority', 'cost')}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Cost
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Sustainability Features</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="justify-start">
                          <CloudSun className="h-4 w-4 mr-2 text-[#D97706]" />
                          Solar Power
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Wifi className="h-4 w-4 mr-2 text-[#1E3A8A]" />
                          Smart Systems
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Layers className="h-4 w-4 mr-2 text-green-600" />
                          Green Materials
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <BellRing className="h-4 w-4 mr-2 text-purple-600" />
                          Energy Monitoring
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Navigation Buttons (Mobile) */}
          <div className="mt-8 flex justify-between md:hidden">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="bg-[#1E3A8A]"
            >
              {currentStep === totalSteps ? 'Create Project' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateProject; 