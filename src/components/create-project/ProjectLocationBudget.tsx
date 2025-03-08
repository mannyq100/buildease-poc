/**
 * Project location and budget input component
 * Handles location, region, budget, and currency inputs
 */
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { MapPin, DollarSign } from 'lucide-react';

// Import types for option objects
interface SelectOption {
  value: string;
  label: string;
  symbol?: string;
}

interface ProjectLocationBudgetProps {
  location: string;
  region: string;
  budget: string;
  currency: string;
  regions: SelectOption[];
  currencies: SelectOption[];
  onInputChange: (field: string, value: string) => void;
  isDarkMode: boolean;
}

export function ProjectLocationBudget({
  location,
  region,
  budget,
  currency,
  regions,
  currencies,
  onInputChange,
  isDarkMode
}: ProjectLocationBudgetProps) {
  // Input style based on dark mode
  const inputClass = `transition-all duration-300 ${
    isDarkMode 
      ? "bg-slate-900 border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-white" 
      : "border-gray-200 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-300"
  }`;

  // Select style based on dark mode
  const selectClass = `transition-all duration-300 ${
    isDarkMode 
      ? "bg-slate-900 border-slate-700 text-white"
      : "bg-white border-gray-200"
  }`;
  
  // Label style based on dark mode
  const labelClass = `font-medium ${
    isDarkMode ? "text-slate-300" : "text-gray-900"
  }`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Location Inputs */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location" className={labelClass}>
            Project Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              id="location"
              placeholder="Enter city/town name" 
              value={location}
              onChange={(e) => onInputChange('location', e.target.value)}
              className={`pl-9 ${inputClass}`}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="region" className={labelClass}>
            Region
          </Label>
          <Select
            value={region}
            onValueChange={(value) => onInputChange('region', value)}
          >
            <SelectTrigger id="region" className={selectClass}>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map(region => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Budget Inputs */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="budget" className={labelClass}>
            Estimated Budget
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              id="budget"
              type="number" 
              placeholder="Enter budget amount" 
              value={budget}
              onChange={(e) => onInputChange('budget', e.target.value)}
              className={`pl-9 ${inputClass}`}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="currency" className={labelClass}>
            Currency
          </Label>
          <Select
            value={currency}
            onValueChange={(value) => onInputChange('currency', value)}
          >
            <SelectTrigger id="currency" className={selectClass}>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(currency => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.symbol} {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
} 