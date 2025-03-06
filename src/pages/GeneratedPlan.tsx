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
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
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
    setShowCollaborateModal(true);
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex-1 space-y-8 p-8 pt-6">
        <ProgressHeader />
        
        <div className="flex flex-col space-y-8">
          <ProjectOverview />
          
          <div className="grid gap-8 grid-cols-1 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <ProjectPhases />
            </div>
            <div className="xl:col-span-4">
              <AIRecommendations />
            </div>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
};

export default GeneratedPlan;
