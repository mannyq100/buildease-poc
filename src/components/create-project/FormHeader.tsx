/**
 * Form header component for project creation
 * Includes language selector, progress indicator, and user controls
 */
import { useState, useEffect } from 'react';
import { Languages, User, Settings } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { LANGUAGES } from '@/data/mock/projectInputs/formOptions';

interface FormHeaderProps {
  progress: number;
  language: string;
  showTips: boolean;
  isDarkMode: boolean;
  onLanguageChange: (value: string) => void;
  onToggleTips: (value: boolean) => void;
  title: string;
  subtitle: string;
}

export function FormHeader({
  progress,
  language,
  showTips,
  isDarkMode,
  onLanguageChange,
  onToggleTips,
  title,
  subtitle
}: FormHeaderProps) {
  // Options for the language selector
  const languages = LANGUAGES;

  return (
    <>
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
              value={language} 
              onValueChange={onLanguageChange}
            >
              <SelectTrigger className={`w-[140px] h-8 text-sm transition-all duration-300 ${
                isDarkMode 
                  ? "bg-slate-800 border-slate-700 hover:border-blue-500 focus:border-blue-500" 
                  : "hover:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
              }`}>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Switch 
                id="showTips" 
                checked={showTips}
                onCheckedChange={onToggleTips}
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
      
      {/* Progress and title */}
      <div className="max-w-5xl mx-auto pt-8 pb-4 px-6">
        <div className="mb-2">
          <Progress value={progress} className="h-2" />
        </div>
        <h1 className={`text-2xl font-bold mt-6 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
          {title}
        </h1>
        <p className={`mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          {subtitle}
        </p>
      </div>
    </>
  );
} 