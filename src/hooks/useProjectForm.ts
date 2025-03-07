/**
 * Custom hook for managing project form state and logic
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ProjectFormData, 
  DEFAULT_PROJECT_FORM_DATA, 
  CostEstimate,
  ProjectInputTab
} from '@/types/projectInputs';
import { calculateCostEstimate, getTabProgress, isFormComplete } from '@/utils/projectUtils';

/**
 * Hook for managing project form state and related functionality
 * 
 * @returns Form state and handler functions
 */
export function useProjectForm() {
  const navigate = useNavigate();
  
  // Primary state
  const [formData, setFormData] = useState<ProjectFormData>(DEFAULT_PROJECT_FORM_DATA);
  const [activeTab, setActiveTab] = useState<ProjectInputTab>('intro');
  const [progress, setProgress] = useState(0);
  const [costEstimate, setCostEstimate] = useState<CostEstimate>({ min: 0, max: 0 });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Update cost estimate when relevant form fields change
  useEffect(() => {
    if (formData.buildingSize && formData.projectType) {
      setCostEstimate(calculateCostEstimate(formData));
    }
  }, [formData.buildingSize, formData.projectType, formData.buildingStructure, 
      formData.specialFeatures, formData.modernAmenities, 
      formData.energyEfficiency, formData.waterConservation]);
  
  // Update progress when tab changes
  useEffect(() => {
    setProgress(getTabProgress(activeTab));
  }, [activeTab]);
  
  // Check dark mode on component mount and when it changes
  useEffect(() => {
    function checkDarkMode() {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);
  
  /**
   * Handle tab changes
   * 
   * @param value New tab value
   */
  const handleTabChange = (value: ProjectInputTab) => {
    setActiveTab(value);
  };
  
  /**
   * Handle form input changes
   * 
   * @param field The field name to update
   * @param value The new value
   */
  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  /**
   * Toggle modern amenities selection
   * 
   * @param value The amenity value to toggle
   */
  const toggleModernAmenity = (value: string) => {
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
  
  /**
   * Toggle special features selection
   * 
   * @param value The feature value to toggle
   */
  const toggleSpecialFeature = (value: string) => {
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
  
  /**
   * Generate the project plan
   */
  const handleGeneratePlan = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate('/generated-plan');
    }, 2500);
  };
  
  /**
   * Check if form has minimum required data
   * 
   * @returns True if the form is complete enough to generate a plan
   */
  const checkFormComplete = () => {
    return isFormComplete(formData);
  };
  
  /**
   * Navigate to the next tab
   */
  const handleContinue = () => {
    const tabs: ProjectInputTab[] = ['intro', 'basic', 'building', 'materials', 'features', 'final'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      handleTabChange(tabs[currentIndex + 1]);
    }
  };
  
  /**
   * Navigate to the previous tab
   */
  const handleBack = () => {
    const tabs: ProjectInputTab[] = ['intro', 'basic', 'building', 'materials', 'features', 'final'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      handleTabChange(tabs[currentIndex - 1]);
    }
  };
  
  /**
   * Toggle showing tips
   */
  const toggleShowTips = () => {
    setShowTips(prev => !prev);
  };
  
  return {
    // State
    formData,
    activeTab,
    progress,
    costEstimate,
    isLoading,
    showTips,
    isDarkMode,
    
    // Handlers
    handleTabChange,
    handleInputChange,
    toggleModernAmenity,
    toggleSpecialFeature,
    handleGeneratePlan,
    checkFormComplete,
    handleContinue,
    handleBack,
    toggleShowTips
  };
} 