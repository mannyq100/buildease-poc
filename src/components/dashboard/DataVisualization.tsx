import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, SlidersHorizontal, Calendar } from 'lucide-react';
import DashboardCard from './DashboardCard';
import { cn } from '@/lib/utils';

// Color palette for consistent visualization
export const CHART_COLORS = [
  '#1E40AF', // Deep blue (primary)
  '#047857', // Green
  '#B45309', // Amber
  '#6D28D9', // Purple
  '#DC2626', // Red
  '#374151', // Gray
  '#4F46E5', // Indigo
  '#0369A1', // Light blue
  '#15803D', // Light green
  '#A16207', // Gold
];

type ChartType = 'bar' | 'line' | 'pie';

interface DataVisualizationProps {
  data: any[];
  title: string;
  description?: string;
  xAxisKey?: string;
  yAxisKeys?: string[];
  pieKey?: string;
  pieValueKey?: string;
  showToggle?: boolean;
  defaultChartType?: ChartType;
  height?: number;
  className?: string;
  filters?: {
    type: 'select' | 'dateRange' | 'search';
    label: string;
    options?: {value: string, label: string}[];
    onChange: (value: string) => void;
  }[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    return (
      <div className={cn(
        "p-3 rounded-md shadow-lg border", 
        isDarkMode 
          ? "bg-slate-800 border-slate-700 text-white" 
          : "bg-white border-gray-200 text-gray-900"
      )}>
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
              {entry.name}: {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

const DataVisualization: React.FC<DataVisualizationProps> = ({
  data,
  title,
  description,
  xAxisKey = 'name',
  yAxisKeys = ['value'],
  pieKey = 'name',
  pieValueKey = 'value',
  showToggle = true,
  defaultChartType = 'bar',
  height = 300,
  className,
  filters = [],
}) => {
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  
  const renderFilters = () => {
    if (filters.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center">
          <SlidersHorizontal className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
        </div>
        
        {filters.map((filter, index) => (
          <div key={index} className="flex-1 min-w-[120px] max-w-[240px]">
            {filter.type === 'select' && (
              <Select onValueChange={filter.onChange}>
                <SelectTrigger className="h-8 text-xs bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options?.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {filter.type === 'search' && (
              <Input 
                placeholder={filter.label}
                onChange={(e) => filter.onChange(e.target.value)}
                className="h-8 text-xs bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
              />
            )}
            
            {filter.type === 'dateRange' && (
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input 
                  placeholder={filter.label}
                  type="date"
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="h-8 text-xs pl-8 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  const renderChartToggle = () => {
    if (!showToggle) return null;
    
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "rounded-full", 
            chartType === 'bar' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : ""
          )}
          onClick={() => setChartType('bar')}
        >
          <BarChart3 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "rounded-full", 
            chartType === 'line' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : ""
          )}
          onClick={() => setChartType('line')}
        >
          <LineChartIcon className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "rounded-full", 
            chartType === 'pie' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : ""
          )}
          onClick={() => setChartType('pie')}
        >
          <PieChartIcon className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  };
  
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey={xAxisKey}
                tick={{ fontSize: 12 }}
                className="text-gray-500 dark:text-gray-400 fill-current" 
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-gray-500 dark:text-gray-400 fill-current" 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {yAxisKeys.map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  radius={[4, 4, 0, 0]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey={xAxisKey}
                tick={{ fontSize: 12 }}
                className="text-gray-500 dark:text-gray-400 fill-current" 
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-gray-500 dark:text-gray-400 fill-current" 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {yAxisKeys.map((key, index) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  activeDot={{ r: 8 }}
                  strokeWidth={2} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey={pieValueKey}
                nameKey={pieKey}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                className="text-xs"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
    }
  };
  
  return (
    <DashboardCard
      variant="chart"
      title={title}
      subtitle={description}
      className={className}
      headerSlot={renderChartToggle()}
    >
      <div className="p-4 pt-0">
        {renderFilters()}
        {renderChart()}
      </div>
    </DashboardCard>
  );
};

export default DataVisualization; 