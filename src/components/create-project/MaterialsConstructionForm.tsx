/**
 * Materials and construction input component for project creation
 */
import React from 'react';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Layers, Home, Package, Warehouse, Brush } from 'lucide-react';

// Define material option interfaces
interface MaterialOption {
  value: string;
  label: string;
  description?: string;
}

interface MaterialsConstructionFormProps {
  structureType: string;
  foundationType: string;
  roofType: string;
  wallMaterial: string;
  floorMaterial: string;
  structureTypes: MaterialOption[];
  foundationTypes: MaterialOption[];
  roofTypes: MaterialOption[];
  wallMaterials: MaterialOption[];
  floorMaterials: MaterialOption[];
  onInputChange: (field: string, value: string) => void;
  isDarkMode: boolean;
}

// Icons for each material type
const materialTypeIcons = {
  structure: <Layers className="h-4 w-4" />,
  foundation: <Warehouse className="h-4 w-4" />,
  roof: <Home className="h-4 w-4" />,
  wall: <Package className="h-4 w-4" />,
  floor: <Brush className="h-4 w-4" />
};

export function MaterialsConstructionForm({
  structureType,
  foundationType,
  roofType,
  wallMaterial,
  floorMaterial,
  structureTypes = [
    { value: "concrete-frame", label: "Concrete Frame", description: "Durable structure with reinforced concrete columns and beams" },
    { value: "load-bearing", label: "Load-Bearing Walls", description: "Walls that directly support structural loads" },
    { value: "steel-frame", label: "Steel Frame", description: "Strong, lightweight structure using steel beams and columns" },
    { value: "timber-frame", label: "Timber Frame", description: "Traditional wooden frame construction" },
    { value: "hybrid", label: "Hybrid Structure", description: "Combination of different structural systems" }
  ],
  foundationTypes = [
    { value: "strip", label: "Strip Foundation", description: "Continuous strips of concrete under load-bearing walls" },
    { value: "raft", label: "Raft Foundation", description: "Single slab of concrete supporting the entire building" },
    { value: "pad", label: "Pad Foundation", description: "Isolated concrete pads supporting columns" },
    { value: "pile", label: "Pile Foundation", description: "Deep foundations transferring loads to lower soil layers" },
    { value: "raised-pile", label: "Raised Pile Foundation", description: "Elevated foundation for flood-prone areas" }
  ],
  roofTypes = [
    { value: "gable", label: "Gable Roof", description: "Classic triangular roof with two sloping sides" },
    { value: "hip", label: "Hip Roof", description: "Sloping on all sides with no vertical ends" },
    { value: "flat", label: "Flat Roof", description: "Nearly level roof with minimal slope for drainage" },
    { value: "shed", label: "Shed Roof", description: "Single slope roof design" },
    { value: "metal-sheet", label: "Metal Sheet Roof", description: "Lightweight metal panels for roofing" },
    { value: "clay-tiles", label: "Clay Tiles", description: "Traditional terracotta tile roofing" },
    { value: "concrete-tiles", label: "Concrete Tiles", description: "Durable concrete tile roofing solution" },
    { value: "thatch", label: "Traditional Thatch", description: "Natural roofing material using dried plant stalks" }
  ],
  wallMaterials = [
    { value: "concrete-blocks", label: "Concrete Blocks", description: "Precast concrete masonry units" },
    { value: "clay-bricks", label: "Clay Bricks", description: "Traditional fired clay masonry units" },
    { value: "compressed-earth", label: "Compressed Earth Blocks", description: "Eco-friendly blocks made from compressed soil" },
    { value: "stone", label: "Stone", description: "Natural stone masonry construction" },
    { value: "wood", label: "Wood", description: "Timber wall construction" },
    { value: "glass", label: "Glass", description: "Large glass panel walls for modern designs" }
  ],
  floorMaterials = [
    { value: "concrete", label: "Concrete", description: "Durable concrete flooring solution" },
    { value: "ceramic-tiles", label: "Ceramic Tiles", description: "Common fired clay tile flooring" },
    { value: "porcelain-tiles", label: "Porcelain Tiles", description: "Dense, durable tile with low porosity" },
    { value: "terrazzo", label: "Terrazzo", description: "Composite material with marble, quartz, or glass chips" },
    { value: "wood", label: "Wood", description: "Natural timber flooring" },
    { value: "vinyl", label: "Vinyl", description: "Synthetic flooring material, water-resistant" },
    { value: "stone", label: "Stone", description: "Natural stone tile or slab flooring" }
  ],
  onInputChange,
  isDarkMode
}: MaterialsConstructionFormProps) {
  // Enhanced selection item styling
  const renderSelectItem = (option: MaterialOption, colorClass: string) => (
    <SelectItem key={option.value} value={option.value} className="py-3 px-2 cursor-pointer">
      <div className="flex items-start gap-3">
        <div className={`mt-1 w-3 h-3 rounded-full ${colorClass} flex-shrink-0`} />
        <div>
          <div className="font-medium text-sm">{option.label}</div>
          {option.description && (
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              {option.description}
            </div>
          )}
        </div>
      </div>
    </SelectItem>
  );

  // Enhanced select trigger styling
  const getSelectTriggerClass = (value: string) => `
    flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background 
    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
    ${value ? 'border-blue-300 dark:border-blue-600' : ''}
    ${isDarkMode 
      ? 'bg-slate-900 border-slate-700 focus:ring-blue-500 focus:border-blue-500 text-white' 
      : 'bg-white border-gray-200 focus:ring-blue-400 hover:border-blue-300'}
  `;
  
  // Styled label with optional tooltip
  const StyledLabel = ({ htmlFor, label, tooltip }: { htmlFor: string, label: string, tooltip?: string }) => (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor} className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-900'}`}>
        {label}
      </Label>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className={`h-3.5 w-3.5 cursor-help ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center mb-4 gap-2">
            {materialTypeIcons.structure}
            <StyledLabel 
              htmlFor="structureType" 
              label="Structure Type" 
              tooltip="The main load-bearing system of your building"
            />
          </div>
          <Select
            value={structureType}
            onValueChange={(value) => onInputChange('structureType', value)}
          >
            <SelectTrigger id="structureType" className={getSelectTriggerClass(structureType)}>
              <SelectValue placeholder="Select structure type" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {structureTypes.map(type => renderSelectItem(type, 'bg-blue-500/20 border border-blue-500/50'))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center mb-4 gap-2">
            {materialTypeIcons.foundation}
            <StyledLabel 
              htmlFor="foundationType" 
              label="Foundation Type" 
              tooltip="The subsurface structure that supports your building"
            />
          </div>
          <Select
            value={foundationType}
            onValueChange={(value) => onInputChange('foundationType', value)}
          >
            <SelectTrigger id="foundationType" className={getSelectTriggerClass(foundationType)}>
              <SelectValue placeholder="Select foundation type" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {foundationTypes.map(type => renderSelectItem(type, 'bg-amber-500/20 border border-amber-500/50'))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center mb-4 gap-2">
            {materialTypeIcons.roof}
            <StyledLabel 
              htmlFor="roofType" 
              label="Roof Type" 
              tooltip="The style and material of your roof structure"
            />
          </div>
          <Select
            value={roofType}
            onValueChange={(value) => onInputChange('roofType', value)}
          >
            <SelectTrigger id="roofType" className={getSelectTriggerClass(roofType)}>
              <SelectValue placeholder="Select roof type" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {roofTypes.map(type => renderSelectItem(type, 'bg-red-500/20 border border-red-500/50'))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center mb-4 gap-2">
            {materialTypeIcons.wall}
            <StyledLabel 
              htmlFor="wallMaterial" 
              label="Wall Material" 
              tooltip="Primary material used for external and internal walls"
            />
          </div>
          <Select
            value={wallMaterial}
            onValueChange={(value) => onInputChange('wallMaterial', value)}
          >
            <SelectTrigger id="wallMaterial" className={getSelectTriggerClass(wallMaterial)}>
              <SelectValue placeholder="Select wall material" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {wallMaterials.map(material => renderSelectItem(material, 'bg-green-500/20 border border-green-500/50'))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center mb-4 gap-2">
            {materialTypeIcons.floor}
            <StyledLabel 
              htmlFor="floorMaterial" 
              label="Floor Material" 
              tooltip="Primary flooring material for your project"
            />
          </div>
          <Select
            value={floorMaterial}
            onValueChange={(value) => onInputChange('floorMaterial', value)}
          >
            <SelectTrigger id="floorMaterial" className={getSelectTriggerClass(floorMaterial)}>
              <SelectValue placeholder="Select floor material" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {floorMaterials.map(material => renderSelectItem(material, 'bg-purple-500/20 border border-purple-500/50'))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="p-5 mt-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-300">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Local Materials Recommendation
        </h4>
        <p className="text-sm">
          Using locally sourced materials can reduce costs by 15-20% and support the local economy.
          Consider compressed earth blocks, locally quarried stone, and locally produced clay bricks or
          tiles where appropriate.
        </p>
      </div>
    </div>
  );
} 