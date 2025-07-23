import { useState } from 'react';
import { cn } from '@/utils/core/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  FileBarChart,
  Download,
  Target,
  Shield,
  Users
} from 'lucide-react';

// Mock analytics data
const progressData = [
  { week: 'Week 1', planned: 10, actual: 8, efficiency: 80 },
  { week: 'Week 2', planned: 20, actual: 18, efficiency: 90 },
  { week: 'Week 3', planned: 30, actual: 35, efficiency: 116 },
  { week: 'Week 4', planned: 40, actual: 42, efficiency: 105 },
  { week: 'Week 5', planned: 50, actual: 48, efficiency: 96 },
  { week: 'Week 6', planned: 60, actual: 55, efficiency: 92 },
];



const categoryBreakdown = [
  { name: 'Foundation', value: 25, color: '#0088FE' },
  { name: 'Structural', value: 30, color: '#00C49F' },
  { name: 'Electrical', value: 15, color: '#FFBB28' },
  { name: 'Plumbing', value: 12, color: '#FF8042' },
  { name: 'Finishing', value: 18, color: '#8884d8' }
];

const riskFactors = [
  {
    id: 1,
    type: 'Weather',
    description: 'Heavy rain forecast for next week may delay outdoor work',
    severity: 'medium',
    impact: 'schedule',
    probability: 70,
    mitigation: 'Prepare indoor tasks and cover materials'
  },
  {
    id: 2,
    type: 'Budget',
    description: 'Material costs trending 8% above budget due to supply chain issues',
    severity: 'high',
    impact: 'cost',
    probability: 85,
    mitigation: 'Negotiate better rates with alternative suppliers'
  },
  {
    id: 3,
    type: 'Resource',
    description: 'Key team member scheduled vacation during critical phase',
    severity: 'low',
    impact: 'schedule',
    probability: 100,
    mitigation: 'Cross-train team members and adjust timeline'
  },
  {
    id: 4,
    type: 'Quality',
    description: 'Recent inspection revealed minor foundation settling',
    severity: 'medium',
    impact: 'quality',
    probability: 90,
    mitigation: 'Schedule structural engineer review'
  }
];

const keyMetrics = {
  overallProgress: 65,
  teamEfficiency: 92,
  scheduleVariance: -3, // negative means ahead of schedule
  qualityScore: 94,
  safetyScore: 98,
  riskLevel: 'medium'
};

interface ProjectAnalyticsProps {
  projectId: string;
  className?: string;
}

export function ProjectAnalytics({ projectId: _projectId, className }: ProjectAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [showRiskDetails, setShowRiskDetails] = useState(false);
  const [selectedReport, setSelectedReport] = useState('overview');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'progress': return <Activity className="h-5 w-5 text-buildease-blue-600" />;
      case 'budget': return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'schedule': return <Clock className="h-5 w-5 text-orange-600" />;
      case 'quality': return <Target className="h-5 w-5 text-blue-600" />;
      case 'safety': return <Shield className="h-5 w-5 text-green-600" />;
      default: return <BarChart3 className="h-5 w-5 text-gray-600" />;
    }
  };

  const getMetricTrend = (value: number, isPositive: boolean) => {
    const isGood = (value > 0 && isPositive) || (value < 0 && !isPositive);
    return isGood ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const generateReport = (type: string) => {
    // Simulate report generation
    setTimeout(() => {
      alert(`${type} report generated and ready for download!`);
    }, 1000);
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-slate-50/80 to-buildease-blue-50/40 dark:from-slate-800/80 dark:to-buildease-blue-950/40 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-buildease-blue-500 to-buildease-blue-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                Reports & Analytics
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Track project performance, insights, and key metrics</p>
            </div>
            <Button 
              onClick={() => generateReport(selectedReport)}
              className="bg-gradient-to-r from-buildease-blue-600 to-buildease-blue-700 hover:from-buildease-blue-700 hover:to-buildease-blue-800 text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] rounded-xl font-semibold"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-full sm:w-40 h-12 bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 rounded-xl">
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger className="w-full sm:w-48 h-12 bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 rounded-xl">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">📊 Overview</SelectItem>
                  <SelectItem value="progress">📈 Progress</SelectItem>
                  <SelectItem value="financial">💰 Financial</SelectItem>
                  <SelectItem value="team">👥 Team Performance</SelectItem>
                  <SelectItem value="quality">🎯 Quality & Safety</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <Card className="group border-slate-200/60 dark:border-slate-700/60 shadow-lg bg-gradient-to-br from-white via-slate-50/30 to-buildease-blue-50/10 dark:from-slate-900 dark:via-slate-800/30 dark:to-buildease-blue-950/10 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-buildease-blue-500 to-buildease-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {getMetricIcon('progress')}
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Progress</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{keyMetrics.overallProgress}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs">
                {getMetricTrend(5, true)}
                <span className="ml-1 font-medium text-emerald-600 dark:text-emerald-400">+5% this week</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-slate-200/60 dark:border-slate-700/60 shadow-lg bg-gradient-to-br from-white via-slate-50/30 to-amber-50/10 dark:from-slate-900 dark:via-slate-800/30 dark:to-amber-950/10 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Efficiency</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{keyMetrics.teamEfficiency}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs">
                {getMetricTrend(2, true)}
                <span className="ml-1 font-medium text-emerald-600 dark:text-emerald-400">+2% this week</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-slate-200/60 dark:border-slate-700/60 shadow-lg bg-gradient-to-br from-white via-slate-50/30 to-emerald-50/10 dark:from-slate-900 dark:via-slate-800/30 dark:to-emerald-950/10 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {getMetricIcon('schedule')}
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Schedule</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{Math.abs(keyMetrics.scheduleVariance)} days</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs">
                {getMetricTrend(keyMetrics.scheduleVariance, false)}
                <span className="ml-1 font-medium text-emerald-600 dark:text-emerald-400">Ahead of schedule</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-slate-200/60 dark:border-slate-700/60 shadow-lg bg-gradient-to-br from-white via-slate-50/30 to-purple-50/10 dark:from-slate-900 dark:via-slate-800/30 dark:to-purple-950/10 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {getMetricIcon('quality')}
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Quality</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{keyMetrics.qualityScore}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs">
                {getMetricTrend(1, true)}
                <span className="ml-1 font-medium text-emerald-600 dark:text-emerald-400">+1% this week</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-slate-200/60 dark:border-slate-700/60 shadow-lg bg-gradient-to-br from-white via-slate-50/30 to-green-50/10 dark:from-slate-900 dark:via-slate-800/30 dark:to-green-950/10 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {getMetricIcon('safety')}
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Safety</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{keyMetrics.safetyScore}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="ml-1 font-medium text-green-600 dark:text-green-400">Excellent</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Progress Chart */}
        <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-buildease-blue-50/10 dark:from-slate-900 dark:via-slate-800/30 dark:to-buildease-blue-950/10 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/80 to-buildease-blue-50/40 dark:from-slate-800/80 dark:to-buildease-blue-950/40 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-buildease-blue-500 to-buildease-blue-600 rounded-xl flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Progress vs Plan</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Track planned vs actual progress over time
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="planned" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fill="url(#plannedGradient)" 
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stackId="2"
                    stroke="#10b981" 
                    fill="url(#actualGradient)" 
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-purple-50/10 dark:from-slate-900 dark:via-slate-800/30 dark:to-purple-950/10 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/80 to-purple-50/40 dark:from-slate-800/80 dark:to-purple-950/40 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Team Performance</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Weekly team productivity and task completion
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'efficiency' ? `${value}%` : value,
                      name === 'planned' ? 'Planned Tasks' : 
                      name === 'actual' ? 'Completed Tasks' : 'Efficiency'
                    ]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#8b5cf6" 
                    fill="url(#efficiencyGradient)" 
                    fillOpacity={0.6}
                    strokeWidth={3}
                  />
                  <defs>
                    <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Category Breakdown - Full Width */}
      <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-purple-50/10 dark:from-slate-900 dark:via-slate-800/30 dark:to-purple-950/10 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/80 to-purple-50/40 dark:from-slate-800/80 dark:to-purple-950/40 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <PieChart className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Work Category Distribution</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Progress breakdown by construction phase
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, name]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {categoryBreakdown.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium text-slate-900 dark:text-white">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-white">{category.value}%</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Complete</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card className="border-slate-200/60 dark:border-slate-700/60 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-amber-50/10 dark:from-slate-900 dark:via-slate-800/30 dark:to-amber-950/10 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/80 to-amber-50/40 dark:from-slate-800/80 dark:to-amber-950/40 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Risk Analysis</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Identified risks and mitigation strategies
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border-amber-200 dark:from-amber-950 dark:to-amber-900 dark:text-amber-200 dark:border-amber-800 px-3 py-1 font-semibold"
            >
              {keyMetrics.riskLevel.toUpperCase()} RISK
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4">
            {riskFactors.map((risk) => (
              <div key={risk.id} className="group bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-5 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-lg">{risk.type}</h4>
                      <Badge className={`${getSeverityColor(risk.severity)} font-medium`}>
                        {risk.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                        {risk.probability}% probability
                      </Badge>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                      {risk.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/50 rounded-lg p-3">
                        <div className="font-semibold text-red-800 dark:text-red-200 mb-1">Impact</div>
                        <div className="text-red-700 dark:text-red-300">{risk.impact}</div>
                      </div>
                      <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/50 rounded-lg p-3">
                        <div className="font-semibold text-green-800 dark:text-green-200 mb-1">Mitigation</div>
                        <div className="text-green-700 dark:text-green-300">{risk.mitigation}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
            <Button 
              variant="outline" 
              onClick={() => setShowRiskDetails(true)}
              className="w-full bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-slate-300 dark:border-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all duration-300"
            >
              <FileBarChart className="h-4 w-4 mr-2" />
              View Detailed Risk Assessment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Risk Details Modal */}
      <Dialog open={showRiskDetails} onOpenChange={setShowRiskDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Detailed Risk Assessment
            </DialogTitle>
            <DialogDescription>
              Comprehensive risk analysis and recommended actions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-auto">
            {riskFactors.map((risk) => (
              <Card key={risk.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{risk.type} Risk</h4>
                    <div className="flex gap-2">
                      <Badge className={getSeverityColor(risk.severity)}>
                        {risk.severity}
                      </Badge>
                      <Badge variant="outline">
                        {risk.probability}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Description:</strong> {risk.description}
                    </div>
                    <div>
                      <strong>Impact Area:</strong> {risk.impact}
                    </div>
                    <div>
                      <strong>Mitigation Strategy:</strong> {risk.mitigation}
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Risk Level</span>
                        <span>{risk.probability}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                        <div 
                          className={cn(
                            'h-2 rounded-full',
                            risk.severity === 'high' ? 'bg-red-500' :
                            risk.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          )}
                          style={{ width: `${risk.probability}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}