import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Building,
  Camera,
  Check,
  ChevronRight,
  DollarSign,
  FileText,
  FileUp,
  Heart,
  Home,
  Landmark,
  Languages,
  Lightbulb,
  Loader2,
  MapPin,
  Mic,
  Pen,
  Phone,
  Rocket,
  Ruler,
  Save,
  Settings,
  Sparkles,
  Sun,
  Trees,
  User,
  X,
  Zap
} from 'lucide-react';
import { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';

// Import the InsightItem component
import { InsightItem } from '@/components/project/InsightItem';

// Import hooks
import { useProjectForm } from '@/hooks/useProjectForm';

// Import types
import { ProjectFormData, ProjectInputTab, FormFieldValue } from '@/types/projectInputs';

// Import form options
import {
  REGIONS,
  PROJECT_TYPES,
  ROOF_TYPES,
  FOUNDATION_TYPES,
  BUILDING_STRUCTURES,
  WALL_MATERIALS,
  FLOOR_MATERIALS,
  CEILING_MATERIALS,
  MODERN_AMENITIES,
  SPECIAL_FEATURES,
  WINDOW_TYPES,
  CURRENCIES,
  SIZE_UNITS,
  LANGUAGES,
  BUILDING_STYLES
} from '@/data/mock/projectInputs/formOptions';

// Import example images
import { 
  getRandomImage, 
  PROJECT_TYPE_IMAGES,
  BUILDING_STYLE_IMAGES,
  CONSTRUCTION_PHASE_IMAGES,
  FEATURE_IMAGES,
  MATERIAL_IMAGES
} from '@/data/mock/projectInputs/exampleImages';

// Import utility functions
import { formatCurrency } from '@/utils/projectUtils';

/**
 * ProjectInputs component - Multi-step form for creating a new construction project
 */
const ProjectInputs = () => {
  // Use the custom hook for form state and handlers
  const {
    formData,
    activeTab,
    progress,
    costEstimate,
    isLoading,
    showTips,
    isDarkMode,
    
    handleTabChange,
    handleInputChange,
    toggleModernAmenity,
    toggleSpecialFeature,
    handleGeneratePlan,
    checkFormComplete,
    handleContinue,
    handleBack,
    toggleShowTips
  } = useProjectForm();

  // Additional local state not handled by the hook
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [exampleImages, setExampleImages] = useState<string[]>([
    getRandomImage('construction', 'foundation'),
    getRandomImage('feature', 'kitchen'),
    getRandomImage('building', 'modern')
  ]);

  // Options for the form
  const regions = REGIONS;
  const projectTypes = PROJECT_TYPES;
  const roofTypes = ROOF_TYPES;
  const foundationTypes = FOUNDATION_TYPES;
  const buildingStructures = BUILDING_STRUCTURES;
  const wallMaterials = WALL_MATERIALS;
  const floorMaterials = FLOOR_MATERIALS;
  const ceilingMaterials = CEILING_MATERIALS;
  const windowTypes = WINDOW_TYPES;
  const modernAmenities = MODERN_AMENITIES;
  const specialFeatures = SPECIAL_FEATURES;

  // Handle selecting an image
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      simulateUpload();
    }
  };

  // Simulate a voice input recording
  const simulateVoiceInput = () => {
    setIsVoiceRecording(true);
    setTimeout(() => {
      setIsVoiceRecording(false);
      handleInputChange('description', "Two-story residential house with 3 bedrooms, 2 bathrooms in a contemporary design style.");
    }, 2000);
  };

  // Simulate file upload progress
  const simulateUpload = () => {
    setShowProgress(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowProgress(false);
            // Update form with new image
            const imageUrl = getRandomImage('building', 'modern');
            handleInputChange('images', [...formData.images, imageUrl]);
          }, 500);
          return 100;
        }
        return next;
      });
    }, 200);
  };

  // Enhance form description with AI suggestions
  const enhanceWithAI = () => {
    const enhancedDescription = formData.description + 
      (formData.description ? 
        " The project will include energy-efficient design elements, passive cooling, and natural lighting optimization. The layout will prioritize open spaces with modern aesthetics while maintaining functional utility." 
        : "Two-story residential house with 3 bedrooms, 2 bathrooms in a contemporary design style. The project will include energy-efficient design elements, passive cooling, and natural lighting optimization.");
    
    handleInputChange('description', enhancedDescription);
  };
  
  // ... existing code for components ...
  
  // The rest of the component remains the same
// ... existing code ...
}

export default ProjectInputs;