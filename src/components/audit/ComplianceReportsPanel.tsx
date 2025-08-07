/**
 * ComplianceReportsPanel Component
 * Comprehensive compliance reporting with regulatory export capabilities
 * Designed for construction project compliance monitoring and audit reporting
 */

import { useState, useEffect, useMemo } from 'react';
import { auditService, type AuditFilters, type AuditSummary } from '@/services/auditService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';




import { 
  Shield,
  FileText,
  Download,
  AlertTriangle,
  TrendingUp,
  Activity,
  RefreshCw
} from 'lucide-react';
import { subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';
import { COMPLIANCE_TEMPLATES, TIME_PERIODS, RISK_THRESHOLDS } from '@/constants/auditConstants';
import { formatAuditDate } from '@/utils/auditUtils';

interface ComplianceReportsPanelProps {
  projectId?: string;
  className?: string;
  showProjectFilter?: boolean;
  defaultPeriod?: 'last7days' | 'last30days' | 'last90days' | 'thisMonth' | 'lastMonth';
}

interface ComplianceMetrics {
  complianceRate: number;
  totalAuditEntries: number;
  complianceEntries: number;
  nonComplianceEntries: number;
  riskScore: number;
  criticalIssues: number;
  highRiskActions: number;
  mostActiveUsers: Array<{ name: string; count: number }>;
  riskCategories: Array<{ category: string; count: number; severity: string }>;
  trends: {
    complianceRateChange: number;
    riskScoreChange: number;
    activityChange: number;
  };
}

// ReportTemplate interface removed - using COMPLIANCE_TEMPLATES from constants

// Using TIME_PERIODS and COMPLIANCE_TEMPLATES from constants

export function ComplianceReportsPanel({
  projectId,
  className = '',
  showProjectFilter = true,
  defaultPeriod = 'last30days'
}: ComplianceReportsPanelProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod);
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetrics | null>(null);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof COMPLIANCE_TEMPLATES[0]>(COMPLIANCE_TEMPLATES[0]);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'json' | 'xml'>('csv');

  // Calculate date range based on selected period
  const dateRange = useMemo(() => {
    const now = new Date();
    const period = TIME_PERIODS.find(p => p.key === selectedPeriod);
    
    if (!period) return { start: subDays(now, 30), end: now };
    
    if (period.isCurrentMonth) {
      return { start: startOfMonth(now), end: endOfMonth(now) };
    }
    
    if (period.isLastMonth) {
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }
    
    return { start: subDays(now, period.days), end: now };
  }, [selectedPeriod]);

  // Load compliance data
  const loadComplianceData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters: AuditFilters = {
        projectId,
        dateFrom: dateRange.start.toISOString(),
        dateTo: dateRange.end.toISOString(),
        limit: 10000
      };

      // Load audit summary
      const summary = await auditService.getAuditSummary(filters);
      setAuditSummary(summary);

      // Calculate compliance metrics
      const metrics = calculateComplianceMetrics(summary);
      setComplianceMetrics(metrics);

    } catch (err) {
      console.error('Failed to load compliance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load compliance data');
      toast.error('Failed to load compliance data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate compliance metrics from audit summary
  const calculateComplianceMetrics = (summary: AuditSummary): ComplianceMetrics => {
    const totalEntries = summary.totalEntries;
    const complianceEntries = summary.complianceEntries;
    const nonComplianceEntries = totalEntries - complianceEntries;
    const complianceRate = totalEntries > 0 ? (complianceEntries / totalEntries) * 100 : 0;

    const criticalIssues = summary.entriesBySeverity['critical'] || 0;
    const highRiskActions = summary.entriesBySeverity['high'] || 0;

    const mostActiveUsers = Object.entries(summary.entriesByUser)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const riskCategories = Object.entries(summary.entriesByCategory)
      .map(([category, count]) => ({
        category,
        count,
        severity: category.includes('delete') || category.includes('system') ? 'high' : 
                 category.includes('auth') ? 'medium' : 'low'
      }))
      .sort((a, b) => b.count - a.count);

    return {
      complianceRate,
      totalAuditEntries: totalEntries,
      complianceEntries,
      nonComplianceEntries,
      riskScore: summary.riskMetrics.averageRiskScore,
      criticalIssues,
      highRiskActions,
      mostActiveUsers,
      riskCategories,
      trends: {
        complianceRateChange: 0, // Would need historical data
        riskScoreChange: 0,
        activityChange: 0
      }
    };
  };

  // Export compliance report
  const exportComplianceReport = async (template: typeof COMPLIANCE_TEMPLATES[0], format: string) => {
    try {
      setIsLoading(true);
      
      const filters: AuditFilters = {
        projectId,
        dateFrom: dateRange.start.toISOString(),
        dateTo: dateRange.end.toISOString(),
        complianceRelevant: true,
        limit: 100000
      };

      const exportData = await auditService.exportAuditLogs(filters, format as 'json' | 'csv');
      
      // Create enhanced compliance report
      const complianceReport = {
        reportMetadata: {
          template: template.name,
          regulatoryStandard: template.regulatoryStandard,
          generatedAt: new Date().toISOString(),
          reportPeriod: {
            start: dateRange.start.toISOString(),
            end: dateRange.end.toISOString()
          },
          projectId
        },
        complianceMetrics,
        auditSummary,
        rawData: format === 'json' ? JSON.parse(exportData) : exportData
      };

      // Create download
      const finalData = format === 'json' 
        ? JSON.stringify(complianceReport, null, 2)
        : exportData; // For CSV, use raw audit data

      const blob = new Blob([finalData], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance-report-${template.id}-${formatAuditDate(new Date(), 'yyyy-MM-dd')}.${format}`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`Compliance report exported as ${format.toUpperCase()}`);

    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export compliance report');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when dependencies change
  useEffect(() => {
    loadComplianceData();
  }, [projectId, selectedPeriod, dateRange]);

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadComplianceData} variant="outline">
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
          <h2 className="text-2xl font-bold tracking-tight">Compliance Reports</h2>
          <p className="text-muted-foreground">
            Regulatory compliance monitoring and audit reporting
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_PERIODS.map((period) => (
                <SelectItem key={period.key} value={period.key}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={loadComplianceData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Compliance Overview Cards */}
      {complianceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Compliance Rate</p>
                  <p className="text-2xl font-bold">{complianceMetrics.complianceRate.toFixed(1)}%</p>
                </div>
              </div>
              <div className="mt-2">
                <Progress value={complianceMetrics.complianceRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <p className="text-2xl font-bold">{complianceMetrics.riskScore.toFixed(0)}/100</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="relative">
                  <Progress value={complianceMetrics.riskScore} className="h-2" />
                  <div 
                    className={`absolute top-0 left-0 h-2 rounded-full transition-all ${
                      complianceMetrics.riskScore > RISK_THRESHOLDS.HIGH ? 'bg-red-500' : 
                      complianceMetrics.riskScore > RISK_THRESHOLDS.MEDIUM ? 'bg-orange-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(complianceMetrics.riskScore, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Critical Issues</p>
                  <p className="text-2xl font-bold">{complianceMetrics.criticalIssues}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Activities</p>
                  <p className="text-2xl font-bold">{complianceMetrics.totalAuditEntries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Generation and Analytics */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Report Generation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generate Compliance Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Report Template</label>
                  <Select 
                    value={selectedTemplate.id} 
                    onValueChange={(value) => {
                      const template = COMPLIANCE_TEMPLATES.find(t => t.id === value);
                      if (template) setSelectedTemplate(template);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPLIANCE_TEMPLATES.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Export Format</label>
                  <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="pdf">PDF (Coming Soon)</SelectItem>
                      <SelectItem value="xml">XML (Coming Soon)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Template Details */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">{selectedTemplate.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{selectedTemplate.description}</p>
                {selectedTemplate.regulatoryStandard && (
                  <Badge variant="outline" className="mb-2">
                    {selectedTemplate.regulatoryStandard}
                  </Badge>
                )}
                {selectedTemplate.requiredFields.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Required Fields:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.requiredFields.map((field) => (
                        <Badge key={field} variant="secondary" className="text-xs">
                          {field.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button
                onClick={() => exportComplianceReport(selectedTemplate, exportFormat)}
                disabled={isLoading}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {isLoading ? 'Generating...' : `Generate ${selectedTemplate.name}`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {complianceMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Most Active Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Most Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {complianceMetrics.mostActiveUsers.map((user, index) => (
                      <div key={user.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          <span className="text-sm">{user.name}</span>
                        </div>
                        <span className="text-sm font-medium">{user.count} activities</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Activity Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {complianceMetrics.riskCategories.slice(0, 5).map((category) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={category.severity === 'high' ? 'destructive' : category.severity === 'medium' ? 'default' : 'secondary'}
                            className="capitalize text-xs"
                          >
                            {category.category}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium">{category.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Trend Analysis</h3>
              <p className="text-muted-foreground mb-4">
                Historical trend analysis will be available with more data over time.
              </p>
              <Badge variant="outline">Coming Soon</Badge>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}