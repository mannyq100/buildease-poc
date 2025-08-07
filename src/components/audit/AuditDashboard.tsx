/**
 * AuditDashboard Component
 * Comprehensive audit analytics dashboard with real-time monitoring
 * Central hub for audit trail management and compliance oversight
 */

import { useState, useEffect } from 'react';
import { auditService, type AuditSummary, type AuditFilters } from '@/services/auditService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Activity,
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  BarChart3,
  RefreshCw,
  Eye,
  Zap
} from 'lucide-react';
import { format, subDays, subHours } from 'date-fns';
import { toast } from 'sonner';

// Import our audit components
import { AuditTrailViewer } from './AuditTrailViewer';
import { ActivityTimeline } from './ActivityTimeline';
import { ComplianceReportsPanel } from './ComplianceReportsPanel';
import { DataRetentionManager } from './DataRetentionManager';

interface AuditDashboardProps {
  projectId?: string;
  className?: string;
  defaultTab?: 'overview' | 'timeline' | 'logs' | 'compliance' | 'retention';
  showProjectFilter?: boolean;
  refreshInterval?: number; // in seconds
}

interface DashboardMetrics {
  totalActivities: number;
  recentActivities: number;
  complianceRate: number;
  riskScore: number;
  activeUsers: number;
  criticalAlerts: number;
  trends: {
    activitiesChange: number;
    complianceChange: number;
    riskChange: number;
    usersChange: number;
  };
}

interface RecentActivity {
  id: string;
  user_name: string;
  action: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  compliance_relevant: boolean;
}

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  actionRequired: boolean;
}

export function AuditDashboard({
  projectId,
  className = '',
  defaultTab = 'overview',
  showProjectFilter = true,
  refreshInterval = 30
}: AuditDashboardProps) {
  const [currentTab, setCurrentTab] = useState(defaultTab);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();
      const last24Hours = subHours(now, 24);
      const last7Days = subDays(now, 7);

      // Load audit summary for the last 7 days
      const summaryFilters: AuditFilters = {
        projectId,
        dateFrom: last7Days.toISOString(),
        dateTo: now.toISOString()
      };

      const [summary, recentLogs] = await Promise.all([
        auditService.getAuditSummary(summaryFilters),
        auditService.getAuditLogs({
          ...summaryFilters,
          limit: 20
        })
      ]);

      setAuditSummary(summary);
      setRecentActivities(recentLogs.data.slice(0, 10) as RecentActivity[]);

      // Calculate dashboard metrics
      const metrics = calculateDashboardMetrics(summary, last24Hours);
      setDashboardMetrics(metrics);

      // Generate alerts based on data
      const generatedAlerts = generateAlerts(summary, recentLogs.data);
      setAlerts(generatedAlerts);

      setLastRefresh(new Date());

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate dashboard metrics
  const calculateDashboardMetrics = (summary: AuditSummary, since24h: Date): DashboardMetrics => {
    const totalActivities = summary.totalEntries;
    const complianceRate = totalActivities > 0 ? (summary.complianceEntries / totalActivities) * 100 : 0;
    const riskScore = summary.riskMetrics.averageRiskScore;
    const activeUsers = Object.keys(summary.entriesByUser).length;
    const criticalAlerts = summary.riskMetrics.criticalEntries;

    // For trends, we would need historical data - using placeholder values
    const trends = {
      activitiesChange: 12, // +12% from previous period
      complianceChange: -2, // -2% from previous period
      riskChange: 5, // +5 points from previous period
      usersChange: 3 // +3 users from previous period
    };

    return {
      totalActivities,
      recentActivities: summary.entriesBySeverity['high'] + summary.entriesBySeverity['critical'],
      complianceRate,
      riskScore,
      activeUsers,
      criticalAlerts,
      trends
    };
  };

  // Generate alerts based on audit data
  const generateAlerts = (summary: AuditSummary, recentLogs: any[]): AlertItem[] => {
    const alerts: AlertItem[] = [];

    // Critical severity alerts
    if (summary.riskMetrics.criticalEntries > 0) {
      alerts.push({
        id: 'critical-entries',
        type: 'critical',
        title: 'Critical Security Events Detected',
        description: `${summary.riskMetrics.criticalEntries} critical severity events require immediate attention`,
        timestamp: new Date().toISOString(),
        actionRequired: true
      });
    }

    // High risk score alert
    if (summary.riskMetrics.averageRiskScore > 70) {
      alerts.push({
        id: 'high-risk-score',
        type: 'warning',
        title: 'Elevated Risk Score',
        description: `Current risk score of ${summary.riskMetrics.averageRiskScore.toFixed(0)}/100 is above recommended threshold`,
        timestamp: new Date().toISOString(),
        actionRequired: true
      });
    }

    // Low compliance rate
    const complianceRate = summary.totalEntries > 0 ? (summary.complianceEntries / summary.totalEntries) * 100 : 0;
    if (complianceRate < 80) {
      alerts.push({
        id: 'low-compliance',
        type: 'warning',
        title: 'Low Compliance Rate',
        description: `Compliance rate of ${complianceRate.toFixed(1)}% is below target of 80%`,
        timestamp: new Date().toISOString(),
        actionRequired: false
      });
    }

    // Multiple failed actions
    const failedActions = recentLogs.filter(log => 
      log.action.includes('failed') || log.severity === 'high'
    ).length;
    
    if (failedActions > 5) {
      alerts.push({
        id: 'multiple-failures',
        type: 'warning',
        title: 'Multiple Failed Actions',
        description: `${failedActions} failed or high-severity actions detected in recent activity`,
        timestamp: new Date().toISOString(),
        actionRequired: true
      });
    }

    return alerts.slice(0, 5); // Limit to 5 most important alerts
  };

  // Auto-refresh functionality
  useEffect(() => {
    loadDashboardData();

    if (refreshInterval > 0) {
      const interval = setInterval(loadDashboardData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [projectId, refreshInterval]);

  // Render trend indicator
  const renderTrendIndicator = (value: number, isPercentage: boolean = true) => {
    const isPositive = value > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-1 text-xs ${colorClass}`}>
        <Icon className="h-3 w-3" />
        {Math.abs(value)}{isPercentage ? '%' : ''}
      </div>
    );
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive audit trail monitoring and compliance oversight
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            Last updated: {format(lastRefresh, 'HH:mm:ss')}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {dashboardMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Activities</p>
                    <p className="text-2xl font-bold">{dashboardMetrics.totalActivities.toLocaleString()}</p>
                  </div>
                </div>
                {renderTrendIndicator(dashboardMetrics.trends.activitiesChange)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Compliance Rate</p>
                    <p className="text-2xl font-bold">{dashboardMetrics.complianceRate.toFixed(1)}%</p>
                  </div>
                </div>
                {renderTrendIndicator(dashboardMetrics.trends.complianceChange)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Score</p>
                    <p className="text-2xl font-bold">{dashboardMetrics.riskScore.toFixed(0)}/100</p>
                  </div>
                </div>
                {renderTrendIndicator(dashboardMetrics.trends.riskChange, false)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{dashboardMetrics.activeUsers}</p>
                  </div>
                </div>
                {renderTrendIndicator(dashboardMetrics.trends.usersChange, false)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'critical' ? 'border-red-500 bg-red-50' :
                    alert.type === 'warning' ? 'border-orange-500 bg-orange-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={alert.type === 'critical' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {alert.type}
                      </Badge>
                      {alert.actionRequired && (
                        <Button variant="outline" size="sm">
                          Action Required
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="retention">Data Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activities
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentTab('logs')}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.severity === 'critical' ? 'bg-red-500' :
                          activity.severity === 'high' ? 'bg-orange-500' :
                          activity.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{activity.user_name}</span>
                            <Badge 
                              variant="secondary"
                              className={`text-xs ${
                                activity.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                activity.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {activity.severity}
                            </Badge>
                            {activity.compliance_relevant && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-2 w-2 mr-1" />
                                Compliance
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(activity.created_at), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditSummary && (
                  <div className="space-y-4">
                    {/* By Category */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">By Category</h4>
                      <div className="space-y-2">
                        {Object.entries(auditSummary.entriesByCategory)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 5)
                          .map(([category, count]) => (
                            <div key={category} className="flex items-center justify-between">
                              <span className="text-sm capitalize">{category}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <Separator />

                    {/* By Severity */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">By Severity</h4>
                      <div className="space-y-2">
                        {Object.entries(auditSummary.entriesBySeverity)
                          .sort(([,a], [,b]) => b - a)
                          .map(([severity, count]) => (
                            <div key={severity} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  severity === 'critical' ? 'bg-red-500' :
                                  severity === 'high' ? 'bg-orange-500' :
                                  severity === 'medium' ? 'bg-yellow-500' :
                                  'bg-blue-500'
                                }`} />
                                <span className="text-sm capitalize">{severity}</span>
                              </div>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <ActivityTimeline projectId={projectId} />
        </TabsContent>

        <TabsContent value="logs">
          <AuditTrailViewer projectId={projectId} />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceReportsPanel projectId={projectId} showProjectFilter={showProjectFilter} />
        </TabsContent>

        <TabsContent value="retention">
          <DataRetentionManager projectId={projectId} showGlobalSettings={!projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}