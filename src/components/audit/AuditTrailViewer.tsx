/**
 * AuditTrailViewer Component
 * Comprehensive audit log viewing interface with advanced filtering and search
 * Designed for compliance monitoring and project activity tracking
 */

import { useState, useEffect, useMemo } from 'react';
import { auditService, type AuditFilters, type AuditLogEntry } from '@/services/auditService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  Download,
  RefreshCw,
  Eye,
  AlertTriangle,
  Shield,
  Activity,
  Clock,
  FileText,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { SEVERITY_COLORS, CATEGORY_ICONS } from '@/constants/auditConstants';
import { getUserInitials } from '@/utils/auditUtils';

interface AuditTrailViewerProps {
  projectId?: string;
  className?: string;
  showFilters?: boolean;
  defaultView?: 'list' | 'timeline';
  enableExport?: boolean;
}

interface ViewState {
  logs: AuditLogEntry[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  selectedEntry: AuditLogEntry | null;
}

// Using SEVERITY_COLORS and CATEGORY_ICONS from constants

export function AuditTrailViewer({
  projectId,
  className = '',
  showFilters = true,
  defaultView = 'list',
  enableExport = true
}: AuditTrailViewerProps) {
  const [viewState, setViewState] = useState<ViewState>({
    logs: [],
    totalCount: 0,
    isLoading: false,
    error: null,
    selectedEntry: null
  });

  const [filters, setFilters] = useState<AuditFilters>({
    projectId,
    limit: 50,
    offset: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState(defaultView);
  const [showDetails, setShowDetails] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

  // Load audit logs
  const loadAuditLogs = async (newFilters: AuditFilters = filters) => {
    setViewState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await auditService.getAuditLogs(newFilters);
      setViewState(prev => ({
        ...prev,
        logs: result.data,
        totalCount: result.totalCount,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      setViewState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load audit logs'
      }));
      toast.error('Failed to load audit logs');
    }
  };

  // Load logs on filter changes
  useEffect(() => {
    loadAuditLogs();
  }, [filters]);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters(prev => ({
      ...prev,
      searchTerm: term || undefined,
      offset: 0
    }));
  };

  // Handle filter changes
  const updateFilter = (key: keyof AuditFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0
    }));
  };

  // Handle date range changes
  const handleDateRangeChange = (field: 'from' | 'to', date?: Date) => {
    const newDateRange = { ...dateRange, [field]: date };
    setDateRange(newDateRange);
    
    setFilters(prev => ({
      ...prev,
      dateFrom: newDateRange.from?.toISOString(),
      dateTo: newDateRange.to?.toISOString(),
      offset: 0
    }));
  };

  // Handle pagination
  const handleLoadMore = () => {
    const newFilters = {
      ...filters,
      offset: (filters.offset || 0) + (filters.limit || 50)
    };
    
    setFilters(newFilters);
  };

  // Export audit logs
  const handleExport = async (format: 'json' | 'csv' = 'csv') => {
    try {
      setViewState(prev => ({ ...prev, isLoading: true }));
      const exportData = await auditService.exportAuditLogs(filters, format);
      
      // Create download link
      const blob = new Blob([exportData], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success(`Audit logs exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export audit logs');
    } finally {
      setViewState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Format metadata for display
  const formatMetadata = (metadata: Record<string, unknown>) => {
    return Object.entries(metadata)
      .filter(([key]) => !['timestamp', 'user_agent', 'ip_address'].includes(key))
      .map(([key, value]) => ({
        key: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
      }));
  };

  // Using getUserInitials from utils

  // Group logs by date for timeline view
  const groupedLogs = useMemo(() => {
    const groups: Record<string, AuditLogEntry[]> = {};
    
    viewState.logs.forEach(log => {
      const date = format(new Date(log.created_at), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(log);
    });
    
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [viewState.logs]);

  // Filter statistics
  const stats = useMemo(() => {
    const logs = viewState.logs;
    return {
      totalEntries: viewState.totalCount,
      severityCounts: {
        low: logs.filter(l => l.severity === 'low').length,
        medium: logs.filter(l => l.severity === 'medium').length,
        high: logs.filter(l => l.severity === 'high').length,
        critical: logs.filter(l => l.severity === 'critical').length
      },
      complianceEntries: logs.filter(l => l.compliance_relevant).length,
      categoryCounts: logs.reduce((acc, log) => {
        acc[log.action_category] = (acc[log.action_category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [viewState.logs, viewState.totalCount]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit Trail</h2>
          <p className="text-muted-foreground">
            Complete activity log and compliance monitoring
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {enableExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem onClick={() => handleExport('csv')}>
                  CSV Format
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem onClick={() => handleExport('json')}>
                  JSON Format
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadAuditLogs()}
            disabled={viewState.isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${viewState.isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{stats.totalEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High/Critical</p>
                <p className="text-2xl font-bold">
                  {stats.severityCounts.high + stats.severityCounts.critical}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compliance</p>
                <p className="text-2xl font-bold">{stats.complianceEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last 24h</p>
                <p className="text-2xl font-bold">
                  {viewState.logs.filter(l => 
                    new Date(l.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Severity Filter */}
              <Select
                value={filters.severity}
                onValueChange={(value) => updateFilter('severity', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select
                value={filters.actionCategory}
                onValueChange={(value) => updateFilter('actionCategory', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="collaboration">Collaboration</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>

              {/* Date From */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, 'MMM dd, yyyy') : 'From date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => handleDateRangeChange('from', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Date To */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, 'MMM dd, yyyy') : 'To date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => handleDateRangeChange('to', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.complianceRelevant === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('complianceRelevant', 
                  filters.complianceRelevant === true ? undefined : true
                )}
              >
                Compliance Only
              </Button>
              <Button
                variant={filters.severity === 'high' || filters.severity === 'critical' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('severity', 
                  filters.severity === 'high' || filters.severity === 'critical' ? undefined : 'high'
                )}
              >
                High Risk
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Toggle */}
      <Tabs value={currentView} onValueChange={setCurrentView} className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* List View */}
          <Card>
            <CardContent className="p-0">
              {viewState.isLoading && viewState.logs.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading audit logs...</span>
                </div>
              ) : viewState.error ? (
                <div className="text-center py-8 text-destructive">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p>{viewState.error}</p>
                </div>
              ) : viewState.logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No audit logs found</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="divide-y">
                    {viewState.logs.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setViewState(prev => ({ ...prev, selectedEntry: entry }));
                          setShowDetails(true);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getUserInitials(entry.user_name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">{entry.user_name}</p>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${SEVERITY_COLORS[entry.severity]}`}
                              >
                                {entry.severity}
                              </Badge>
                              <span className="text-xs">
                                {CATEGORY_ICONS[entry.action_category]} {entry.action_category}
                              </span>
                              {entry.compliance_relevant && (
                                <Badge variant="outline" className="text-xs">
                                  <Shield className="h-2 w-2 mr-1" />
                                  Compliance
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-1">
                              {entry.description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{entry.action}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</span>
                              {entry.entity_type && (
                                <>
                                  <span>•</span>
                                  <span>{entry.entity_type}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Load More */}
          {viewState.logs.length < viewState.totalCount && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={viewState.isLoading}
                className="flex items-center gap-2"
              >
                {viewState.isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                Load More ({viewState.logs.length} of {viewState.totalCount})
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          {/* Timeline View */}
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="p-4">
                  {groupedLogs.map(([date, logs]) => (
                    <div key={date} className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-medium">
                          {format(new Date(date), 'EEEE, MMMM do, yyyy')}
                        </h3>
                        <Badge variant="secondary">{logs.length} events</Badge>
                      </div>
                      
                      <div className="relative pl-6 border-l-2 border-muted">
                        {logs.map((entry, index) => (
                          <div key={entry.id} className="relative mb-4 last:mb-0">
                            <div className={`absolute -left-7 w-3 h-3 rounded-full border-2 border-background ${
                              entry.severity === 'critical' ? 'bg-red-500' :
                              entry.severity === 'high' ? 'bg-orange-500' :
                              entry.severity === 'medium' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`} />
                            
                            <div 
                              className="bg-card border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                              onClick={() => {
                                setViewState(prev => ({ ...prev, selectedEntry: entry }));
                                setShowDetails(true);
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{entry.user_name}</span>
                                    <Badge
                                      variant="secondary"
                                      className={`text-xs ${SEVERITY_COLORS[entry.severity]}`}
                                    >
                                      {entry.severity}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-1">
                                    {entry.description}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(entry.created_at), 'HH:mm:ss')} • {entry.action}
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {groupedLogs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No timeline data available</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Entry Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Audit Entry Details</DialogTitle>
          </DialogHeader>
          
          {viewState.selectedEntry && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User</p>
                    <p className="text-sm">{viewState.selectedEntry.user_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Action</p>
                    <p className="text-sm">{viewState.selectedEntry.action}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Severity</p>
                    <Badge className={`text-xs ${SEVERITY_COLORS[viewState.selectedEntry.severity]}`}>
                      {viewState.selectedEntry.severity}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="text-sm capitalize">{viewState.selectedEntry.action_category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                    <p className="text-sm">
                      {format(new Date(viewState.selectedEntry.created_at), 'PPpp')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compliance</p>
                    <Badge variant={viewState.selectedEntry.compliance_relevant ? 'default' : 'secondary'}>
                      {viewState.selectedEntry.compliance_relevant ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                  <p className="text-sm">{viewState.selectedEntry.description}</p>
                </div>

                {/* Metadata */}
                {Object.keys(viewState.selectedEntry.metadata).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Metadata</p>
                      <div className="space-y-2">
                        {formatMetadata(viewState.selectedEntry.metadata).map(({ key, value }) => (
                          <div key={key} className="grid grid-cols-3 gap-2">
                            <p className="text-xs font-medium text-muted-foreground">{key}:</p>
                            <p className="text-xs col-span-2 break-all">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Technical Details */}
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Technical Details</p>
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium text-muted-foreground">Entry ID:</span>
                      <span className="col-span-2 font-mono">{viewState.selectedEntry.id}</span>
                    </div>
                    {viewState.selectedEntry.entity_type && (
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-muted-foreground">Entity Type:</span>
                        <span className="col-span-2">{viewState.selectedEntry.entity_type}</span>
                      </div>
                    )}
                    {viewState.selectedEntry.entity_id && (
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-muted-foreground">Entity ID:</span>
                        <span className="col-span-2 font-mono">{viewState.selectedEntry.entity_id}</span>
                      </div>
                    )}
                    {viewState.selectedEntry.risk_score && (
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-muted-foreground">Risk Score:</span>
                        <span className="col-span-2">{viewState.selectedEntry.risk_score}/100</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}