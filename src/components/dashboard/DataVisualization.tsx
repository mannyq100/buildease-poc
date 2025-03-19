import React, { useState, useMemo, useCallback } from 'react';
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
  TooltipProps,
  Sector,
  Area,
  AreaChart,
  LabelList
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, SlidersHorizontal, Calendar, PanelTop } from 'lucide-react';
import DashboardCard from './DashboardCard';
import { cn } from '@/lib/utils';
import { 
  CHART_COLOR_ARRAY, 
  CHART_COLORS,
  ChartType, 
  ColorScheme,
  getChartColors, 
  isDarkMode, 
  getCurrentTheme,
  formatNumber
} from '@/lib/chartUtils';

// Chart theme configurations for light and dark mode
const chartTheme = {
  light: {
    backgroundColor: 'white',
    textColor: '#374151',
    gridColor: '#E5E7EB',
    tooltipBg: 'white',
    tooltipBorder: '#E5E7EB',
    tooltipText: '#1F2937',
  },
  dark: {
    backgroundColor: '#1F2937',
    textColor: '#E5E7EB',
    gridColor: '#374151',
    tooltipBg: '#1F2937',
    tooltipBorder: '#374151',
    tooltipText: '#F9FAFB',
  }
};

interface DataVisualizationProps {
  data: Record<string, unknown>[];
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
  colorScheme?: ColorScheme;
  filters?: {
    type: 'select' | 'dateRange' | 'search';
    label: string;
    options?: {value: string, label: string}[];
    onChange: (value: string) => void;
  }[];
}

type ChartDataItem = Record<string, string | number>;

const formatData = (data: ChartDataItem[], keys: string[]) => {
  // ... existing implementation
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
    color: string;
    payload: Record<string, number | string>;
  }>;
  label?: string;
}

// Enhanced custom tooltip with better styling and formatting
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const theme = getCurrentTheme();
    const darkMode = isDarkMode();
    
    return (
      <div className={cn(
        "p-4 rounded-lg shadow-lg border backdrop-blur-sm", 
        darkMode 
          ? "bg-slate-800/95 border-slate-700 text-white" 
          : "bg-white/95 border-gray-200 text-gray-900"
      )}
        role="tooltip"
        aria-live="polite"
      >
        <p className="font-medium mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mt-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span className={cn(
              "text-sm font-medium",
              darkMode ? "text-gray-300" : "text-gray-700"
            )}>
              {entry.name}: {typeof entry.value === 'number' 
                ? formatNumber(entry.value) 
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

// Add a proper interface for the pie chart props
interface RenderActiveShapeProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: {
    name: string;
    value: number;
  };
  percent: number;
  value: number;
}

// Update the function signature
const renderActiveShape = (props: RenderActiveShapeProps) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';
  const darkMode = isDarkMode();

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.8}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 12} 
        y={ey} 
        textAnchor={textAnchor} 
        fill={darkMode ? "#E5E7EB" : "#374151"} 
        fontSize={12}
        aria-hidden="true"
      >
        {`${payload.name}`}
      </text>
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 12} 
        y={ey} 
        dy={18} 
        textAnchor={textAnchor} 
        fill={darkMode ? "#E5E7EB" : "#374151"} 
        fontSize={12}
        aria-hidden="true"
      >
        {`${(percent * 100).toFixed(0)}% (${value})`}
      </text>
    </g>
  );
};

export function DataVisualization({
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
  colorScheme = 'primary',
  filters = [],
}: DataVisualizationProps) {
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const darkMode = isDarkMode();
  const theme = getCurrentTheme();
  const colors = useMemo(() => getChartColors(colorScheme), [colorScheme]);
  
  // Memoize the chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => data, [data]);
  
  // Move the onPieEnter callback inside the component
  const onPieEnter = useCallback((_: MouseEvent, index: number) => {
    setActiveIndex(index);
  }, []);
  
  // Memoize filter UI to prevent unnecessary re-renders
  const filtersUI = useMemo(() => {
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
  }, [filters]);
  
  // Memoize chart toggle UI
  const chartToggleUI = useMemo(() => {
    if (!showToggle) return null;
    
    return (
      <div className="flex items-center gap-1" role="tablist" aria-label="Chart type selection">
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "rounded-full", 
            chartType === 'bar' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : ""
          )}
          onClick={() => setChartType('bar')}
          title="Bar Chart"
          role="tab"
          aria-selected={chartType === 'bar'}
          aria-controls="chart-view"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span className="sr-only">Bar Chart</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "rounded-full", 
            chartType === 'line' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : ""
          )}
          onClick={() => setChartType('line')}
          title="Line Chart"
          role="tab"
          aria-selected={chartType === 'line'}
          aria-controls="chart-view"
        >
          <LineChartIcon className="h-3.5 w-3.5" />
          <span className="sr-only">Line Chart</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "rounded-full", 
            chartType === 'area' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : ""
          )}
          onClick={() => setChartType('area')}
          title="Area Chart"
          role="tab"
          aria-selected={chartType === 'area'}
          aria-controls="chart-view"
        >
          <PanelTop className="h-3.5 w-3.5" />
          <span className="sr-only">Area Chart</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "rounded-full", 
            chartType === 'pie' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : ""
          )}
          onClick={() => setChartType('pie')}
          title="Pie Chart"
          role="tab"
          aria-selected={chartType === 'pie'}
          aria-controls="chart-view"
        >
          <PieChartIcon className="h-3.5 w-3.5" />
          <span className="sr-only">Pie Chart</span>
        </Button>
      </div>
    );
  }, [showToggle, chartType]);
  
  // Memoize the chart content to prevent unnecessary re-renders
  const chartContent = useMemo(() => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart 
              data={chartData} 
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              barGap={8}
              barCategoryGap={16}
              className="animate-in fade-in duration-700"
            >
              <defs>
                {yAxisKeys.map((key, index) => (
                  <linearGradient key={`gradient-${key}`} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.4}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700 opacity-50" />
              <XAxis 
                dataKey={xAxisKey}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: theme.gridColor }}
                axisLine={{ stroke: theme.gridColor }}
                className="text-gray-500 dark:text-gray-400 fill-current"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: theme.gridColor }}
                axisLine={{ stroke: theme.gridColor }}
                className="text-gray-500 dark:text-gray-400 fill-current"
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                iconType="circle" 
                iconSize={8}
              />
              {yAxisKeys.map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={`url(#gradient-${key})`}
                  stroke={colors[index % colors.length]}
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  aria-label={`${key} data`}
                  role="img"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart 
              data={chartData} 
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              className="animate-in fade-in duration-700"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700 opacity-50" />
              <XAxis 
                dataKey={xAxisKey}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: theme.gridColor }}
                axisLine={{ stroke: theme.gridColor }}
                className="text-gray-500 dark:text-gray-400 fill-current"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: theme.gridColor }}
                axisLine={{ stroke: theme.gridColor }}
                className="text-gray-500 dark:text-gray-400 fill-current"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                iconType="circle" 
                iconSize={8}
              />
              {yAxisKeys.map((key, index) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={colors[index % colors.length]}
                  strokeWidth={2.5}
                  dot={{ r: 5, strokeWidth: 1, fill: theme.backgroundColor, stroke: colors[index % colors.length] }}
                  activeDot={{ r: 7, strokeWidth: 0, fill: colors[index % colors.length] }}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  aria-label={`${key} trend line`}
                  role="img"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart 
              data={chartData} 
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              className="animate-in fade-in duration-700"
            >
              <defs>
                {yAxisKeys.map((key, index) => (
                  <linearGradient key={`area-gradient-${key}`} id={`area-gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700 opacity-50" />
              <XAxis 
                dataKey={xAxisKey}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: theme.gridColor }}
                axisLine={{ stroke: theme.gridColor }}
                className="text-gray-500 dark:text-gray-400 fill-current"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: theme.gridColor }}
                axisLine={{ stroke: theme.gridColor }}
                className="text-gray-500 dark:text-gray-400 fill-current"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                iconType="circle" 
                iconSize={8}
              />
              {yAxisKeys.map((key, index) => (
                <Area 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  fill={`url(#area-gradient-${key})`}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  aria-label={`${key} area chart`}
                  role="img"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart 
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              className="animate-in fade-in duration-700"
            >
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                fill="#8884d8"
                dataKey={pieValueKey}
                nameKey={pieKey}
                onMouseEnter={onPieEnter}
                animationDuration={1500}
                animationEasing="ease-out"
                aria-label="Pie chart segments"
                role="img"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]} 
                    strokeWidth={1}
                    stroke={darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)'}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                iconType="circle" 
                iconSize={8}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        );
    }
  }, [chartType, chartData, height, xAxisKey, yAxisKeys, colors, theme, darkMode, pieKey, pieValueKey, activeIndex, onPieEnter]);
  
  return (
    <DashboardCard
      variant="chart"
      title={title}
      subtitle={description}
      className={cn("overflow-hidden", className)}
      headerSlot={chartToggleUI}
    >
      <div 
        className="p-4 pt-0" 
        id="chart-view" 
        role="tabpanel" 
        aria-label={`${title} ${chartType} chart`}
      >
        {filtersUI}
        {chartContent}
      </div>
    </DashboardCard>
  );
} 