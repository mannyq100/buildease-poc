/**
 * ProjectAnalytics - Cross-project analytics component with real Supabase data
 * Migrated from DataVisualization with enhanced functionality for project portfolio analysis
 */

import { useState, useMemo, useCallback } from 'react';
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
  Sector,
  Area,
  AreaChart
} from 'recharts';
import { Button } from '@/components/ui/button';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, PanelTop, TrendingUp, Loader2 } from 'lucide-react';
import { useProjectAnalytics } from '../../hooks/useProjectAnalytics';

import { 
  CHART_COLOR_ARRAY,
  ChartType, 
  ColorScheme,
  getChartColors, 
  isDarkMode, 
  getCurrentTheme,
  formatNumber
} from '@/utils/core/charts';
import { cn } from '@/utils/core/ui';

// Chart theme configurations for light and dark mode
const _chartTheme = {
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

interface ProjectAnalyticsProps {
  className?: string;
  height?: number;
  colorScheme?: ColorScheme;
  defaultTab?: string;
}

type ChartDataItem = Record<string, string | number>;

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
    const _theme = getCurrentTheme();
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

export function ProjectAnalytics({
  className,
  height = 300,
  colorScheme = 'primary',
  defaultTab = 'progress'
}: ProjectAnalyticsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [activeIndex, setActiveIndex] = useState(0);
  
  const darkMode = isDarkMode();
  const theme = getCurrentTheme();
  const colors = useMemo(() => getChartColors(colorScheme), [colorScheme]);
  
  // Fetch real project analytics data
  const { chartData, isLoading, error, refreshData } = useProjectAnalytics();
  
  // Move the onPieEnter callback inside the component
  const onPieEnter = useCallback((_: MouseEvent, index: number) => {
    setActiveIndex(index);
  }, []);
  
  // Get current chart data based on active tab
  const currentChartData = useMemo(() => {
    switch (activeTab) {
      case 'progress':
        return chartData.projectProgress;
      case 'budget':
        return chartData.budgetTrend;
      case 'tasks':
        return chartData.taskStatus;
      case 'materials':
        return chartData.materialUsage;
      default:
        return chartData.projectProgress;
    }
  }, [activeTab, chartData]);

  // Get chart configuration based on active tab
  const chartConfig = useMemo(() => {
    switch (activeTab) {
      case 'progress':
        return {
          title: 'Project Progress',
          description: 'Progress percentage across all projects',
          xAxisKey: 'name',
          yAxisKeys: ['value'],
          defaultChartType: 'bar' as ChartType
        };
      case 'budget':
        return {
          title: 'Budget Trend',
          description: 'Planned vs actual spending over time',
          xAxisKey: 'name',
          yAxisKeys: ['Planned', 'Actual'],
          defaultChartType: 'area' as ChartType
        };
      case 'tasks':
        return {
          title: 'Task Status Distribution',
          description: 'Status breakdown of all project tasks',
          pieKey: 'name',
          pieValueKey: 'value',
          defaultChartType: 'pie' as ChartType
        };
      case 'materials':
        return {
          title: 'Project Type Distribution',
          description: 'Distribution of projects by type',
          pieKey: 'name',
          pieValueKey: 'value',
          defaultChartType: 'pie' as ChartType
        };
      default:
        return {
          title: 'Project Progress',
          description: 'Progress percentage across all projects',
          xAxisKey: 'name',
          yAxisKeys: ['value'],
          defaultChartType: 'bar' as ChartType
        };
    }
  }, [activeTab]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  // Memoize chart toggle UI
  const chartToggleUI = useMemo(() => {
    // For pie charts, don't show chart type toggles
    if (chartConfig.defaultChartType === 'pie') {
      return null;
    }
    
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
      </div>
    );
  }, [chartType, chartConfig.defaultChartType]);
  
  // Compute active chart type based on chart config and current chart type
  const activeChartType = useMemo(() => {
    return chartConfig.defaultChartType === 'pie' ? 'pie' : chartType;
  }, [chartConfig.defaultChartType, chartType]);
  
  // Memoize the chart content to prevent unnecessary re-renders
  const chartContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading analytics...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p className="mb-2">Failed to load analytics data</p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      );
    }

    if (!currentChartData || currentChartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No data available for this chart</p>
        </div>
      );
    }

    switch (activeChartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart 
              data={currentChartData} 
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              barGap={8}
              barCategoryGap={16}
              className="animate-in fade-in duration-700"
            >
              <defs>
                {chartConfig.yAxisKeys?.map((key, index) => (
                  <linearGradient key={`gradient-${key}`} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.4}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700 opacity-50" />
              <XAxis 
                dataKey={chartConfig.xAxisKey}
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
              {chartConfig.yAxisKeys?.map((key, index) => (
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
              data={currentChartData} 
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              className="animate-in fade-in duration-700"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700 opacity-50" />
              <XAxis 
                dataKey={chartConfig.xAxisKey}
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
              {chartConfig.yAxisKeys?.map((key, index) => (
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
              data={currentChartData} 
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              className="animate-in fade-in duration-700"
            >
              <defs>
                {chartConfig.yAxisKeys?.map((key, index) => (
                  <linearGradient key={`area-gradient-${key}`} id={`area-gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700 opacity-50" />
              <XAxis 
                dataKey={chartConfig.xAxisKey}
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
              {chartConfig.yAxisKeys?.map((key, index) => (
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
                data={currentChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                fill="#8884d8"
                dataKey={chartConfig.pieValueKey}
                nameKey={chartConfig.pieKey}
                onMouseEnter={onPieEnter}
                animationDuration={1500}
                animationEasing="ease-out"
                aria-label="Pie chart segments"
                role="img"
              >
                {currentChartData.map((entry, index) => (
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
  }, [activeChartType, currentChartData, height, chartConfig, colors, theme, darkMode, activeIndex, onPieEnter, isLoading, error, handleRefresh]);
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Controls Bar */}
      <div className="flex items-center justify-between bg-slate-50/50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          {chartToggleUI}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="bg-white"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <TrendingUp className="h-4 w-4" />
          )}
          <span className="ml-1 hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-50/50 rounded-lg p-3">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'progress', label: 'Progress', icon: BarChart3 },
            { id: 'budget', label: 'Budget', icon: TrendingUp },
            { id: 'tasks', label: 'Tasks', icon: PieChartIcon },
            { id: 'materials', label: 'Types', icon: PieChartIcon }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-shrink-0 min-h-[44px]",
                activeTab === tab.id && "bg-blue-600 text-white shadow-md"
              )}
            >
              <tab.icon className="h-4 w-4 mr-1.5" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart Content */}
      <div className="bg-white rounded-lg border border-slate-200/60 p-6">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-slate-900">{chartConfig.title}</h4>
          <p className="text-sm text-slate-600">{chartConfig.description}</p>
        </div>
        
        <div 
          className="w-full" 
          id="chart-view" 
          role="tabpanel" 
          aria-label={`${chartConfig.title} chart`}
        >
          {chartContent}
        </div>
      </div>
    </div>
  );
}

export default ProjectAnalytics;