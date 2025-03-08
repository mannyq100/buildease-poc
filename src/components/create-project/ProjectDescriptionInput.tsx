/**
 * Project description input component
 * Handles input, AI enhancement, and voice recording for project descriptions
 */
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from "@/components/ui/label";
import { Mic, Sparkles } from 'lucide-react';

interface ProjectDescriptionInputProps {
  description: string;
  onChange: (value: string) => void;
  isDarkMode: boolean;
}

export function ProjectDescriptionInput({
  description,
  onChange,
  isDarkMode
}: ProjectDescriptionInputProps) {
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isAiEnhanced, setIsAiEnhanced] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Simulate voice input recording
  const simulateVoiceInput = () => {
    setIsVoiceRecording(true);
    setTimeout(() => {
      setIsVoiceRecording(false);
      onChange("Two-story residential house with 3 bedrooms, 2 bathrooms in a contemporary design style.");
    }, 2000);
  };

  // Enhance with AI
  const enhanceWithAI = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      const enhancedDescription = description + 
        (description ? 
          " The project will include energy-efficient design elements, passive cooling, and natural lighting optimization. The layout will prioritize open spaces with modern aesthetics while maintaining functional utility." 
          : "Two-story residential house with 3 bedrooms, 2 bathrooms in a contemporary design style. The project will include energy-efficient design elements, passive cooling, and natural lighting optimization.");
      
      onChange(enhancedDescription);
      setIsAiEnhanced(true);
      setIsEnhancing(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label htmlFor="description" className={`font-medium ${
          isDarkMode ? "text-slate-300" : "text-gray-900"
        }`}>
          Project Description
        </Label>
        <div className="flex items-center gap-2">
          {isAiEnhanced && (
            <Badge className={`flex items-center ${isDarkMode 
              ? "bg-blue-900/40 text-blue-300 border border-blue-700"
              : "bg-blue-100 text-blue-700 border border-blue-200"}`
            }>
              <Sparkles className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
          )}
          <Button 
            variant={isEnhancing ? "default" : "outline"}
            size="sm" 
            className={`transition-all duration-300 border ${
              isEnhancing
                ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400"
                : "text-blue-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50/50 dark:text-blue-400 dark:hover:bg-blue-900/30"
            }`}
            onClick={enhanceWithAI}
            disabled={isEnhancing}
          >
            {isEnhancing ? (
              <>
                <span className="h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                <span className="text-sm">Enhancing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                <span className="text-sm">Enhance with AI</span>
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="relative">
        <Textarea 
          id="description"
          className={`resize-none min-h-[120px] transition-all duration-300 pr-12 ${
            isDarkMode 
              ? "bg-slate-900 border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-white" 
              : "border-gray-200 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-300"
          }`}
          placeholder="Describe your project (e.g., 'Two-story residential house with 3 bedrooms')" 
          value={description}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button 
          variant="ghost" 
          size="sm" 
          className={`absolute bottom-2 right-2 p-1 h-8 w-8 rounded-full ${
            isVoiceRecording
              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
          }`}
          onClick={simulateVoiceInput}
        >
          {isVoiceRecording ? (
            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {isVoiceRecording && (
        <div className="flex items-center space-x-2 text-xs text-red-600 dark:text-red-400 animate-pulse">
          <span className="inline-block h-1.5 w-1.5 bg-red-600 dark:bg-red-400 rounded-full"></span>
          <span>Recording voice input...</span>
        </div>
      )}
    </div>
  );
} 