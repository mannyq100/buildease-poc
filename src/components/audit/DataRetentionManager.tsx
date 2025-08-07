/**
 * DataRetentionManager Component
 * Manages audit log data retention policies and archival
 * Provides automated cleanup and compliance with data retention regulations
 */

import { useState, useEffect } from 'react';
import { auditService } from '@/services/auditService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Database,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Settings,
  RefreshCw,
  FileX
} from 'lucide-react';
import { subDays, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import { DEFAULT_RETENTION_POLICIES } from '@/constants/auditConstants';
import { formatBytes, estimateDataSize } from '@/utils/auditUtils';

interface DataRetentionManagerProps {
  projectId?: string;
  className?: string;
  showGlobalSettings?: boolean;
}

interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  retentionDays: number;
  autoCleanup: boolean;
  complianceStandard?: string;
  applyToCategories: string[];
  preserveCompliance: boolean;
  lastCleanup?: string;
  nextCleanup?: string;
  enabled: boolean;
}

interface StorageStats {
  totalEntries: number;
  totalSizeBytes: number;
  entriesByAge: {
    last7Days: number;
    last30Days: number;
    last90Days: number;
    last365Days: number;
    older: number;
  };
  entriesByCategory: Record<string, number>;
  complianceEntries: number;
  estimatedCleanupImpact: {
    entriesAffected: number;
    sizeFreedBytes: number;
  };
}

interface CleanupTask {
  id: string;
  type: 'cleanup' | 'archive' | 'export';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  entriesProcessed: number;
  totalEntries: number;
  errorMessage?: string;
}

// Using DEFAULT_RETENTION_POLICIES from constants

export function DataRetentionManager({
  projectId,
  className = '',
  showGlobalSettings = true
}: DataRetentionManagerProps) {
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>(DEFAULT_RETENTION_POLICIES);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [cleanupTasks, setCleanupTasks] = useState<CleanupTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<RetentionPolicy | null>(null);

  // Load storage statistics
  const loadStorageStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get audit logs to calculate storage stats
      const { data: allLogs, totalCount } = await auditService.getAuditLogs({
        projectId,
        limit: 10000
      });

      const now = new Date();
      const stats: StorageStats = {
        totalEntries: totalCount,
        totalSizeBytes: estimateDataSize(allLogs),
        entriesByAge: {
          last7Days: 0,
          last30Days: 0,
          last90Days: 0,
          last365Days: 0,
          older: 0
        },
        entriesByCategory: {},
        complianceEntries: 0,
        estimatedCleanupImpact: {
          entriesAffected: 0,
          sizeFreedBytes: 0
        }
      };

      // Analyze logs by age and category
      allLogs.forEach(log => {
        const logDate = new Date(log.created_at);
        const daysOld = differenceInDays(now, logDate);

        // Age categorization
        if (daysOld <= 7) stats.entriesByAge.last7Days++;
        else if (daysOld <= 30) stats.entriesByAge.last30Days++;
        else if (daysOld <= 90) stats.entriesByAge.last90Days++;
        else if (daysOld <= 365) stats.entriesByAge.last365Days++;
        else stats.entriesByAge.older++;

        // Category counting
        stats.entriesByCategory[log.action_category] = 
          (stats.entriesByCategory[log.action_category] || 0) + 1;

        // Compliance entries
        if (log.compliance_relevant) {
          stats.complianceEntries++;
        }
      });

      // Calculate cleanup impact for oldest retention policy
      const oldestPolicy = retentionPolicies
        .filter(p => p.enabled)
        .reduce((oldest, current) => 
          current.retentionDays < oldest.retentionDays ? current : oldest
        );

      if (oldestPolicy) {
        const cutoffDate = subDays(now, oldestPolicy.retentionDays);
        const affectedLogs = allLogs.filter(log => 
          new Date(log.created_at) < cutoffDate &&
          oldestPolicy.applyToCategories.includes(log.action_category) &&
          (!oldestPolicy.preserveCompliance || !log.compliance_relevant)
        );

        stats.estimatedCleanupImpact = {
          entriesAffected: affectedLogs.length,
          sizeFreedBytes: estimateDataSize(affectedLogs)
        };
      }

      setStorageStats(stats);

    } catch (err) {
      console.error('Failed to load storage stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load storage stats');
      toast.error('Failed to load storage statistics');
    } finally {
      setIsLoading(false);
    }
  };

  // Using estimateDataSize from utils

  // Using formatBytes from utils

  // Execute cleanup based on retention policy
  const executeCleanup = async (policy: RetentionPolicy) => {
    const taskId = `cleanup-${Date.now()}`;
    const newTask: CleanupTask = {
      id: taskId,
      type: 'cleanup',
      status: 'running',
      startedAt: new Date().toISOString(),
      entriesProcessed: 0,
      totalEntries: storageStats?.estimatedCleanupImpact.entriesAffected || 0
    };

    setCleanupTasks(prev => [newTask, ...prev]);

    try {
      // Execute cleanup through audit service
      const deletedCount = await auditService.cleanupOldLogs(policy.retentionDays);

      // Update task status
      setCleanupTasks(prev => prev.map(task => 
        task.id === taskId
          ? {
              ...task,
              status: 'completed',
              completedAt: new Date().toISOString(),
              entriesProcessed: deletedCount,
              totalEntries: deletedCount
            }
          : task
      ));

      // Update retention policy
      setRetentionPolicies(prev => prev.map(p => 
        p.id === policy.id
          ? { ...p, lastCleanup: new Date().toISOString() }
          : p
      ));

      toast.success(`Cleanup completed: ${deletedCount} entries removed`);
      loadStorageStats(); // Refresh stats

    } catch (error) {
      console.error('Cleanup failed:', error);
      
      setCleanupTasks(prev => prev.map(task => 
        task.id === taskId
          ? {
              ...task,
              status: 'failed',
              completedAt: new Date().toISOString(),
              errorMessage: error instanceof Error ? error.message : 'Unknown error'
            }
          : task
      ));

      toast.error('Cleanup failed');
    }
  };

  // Update retention policy
  const updateRetentionPolicy = (policyId: string, updates: Partial<RetentionPolicy>) => {
    setRetentionPolicies(prev => prev.map(policy => 
      policy.id === policyId ? { ...policy, ...updates } : policy
    ));
  };

  // Load data on mount
  useEffect(() => {
    loadStorageStats();
  }, [projectId]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Retention Manager</h2>
          <p className="text-muted-foreground">
            Manage audit log retention policies and data cleanup
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadStorageStats}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Storage Overview */}
      {storageStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Database className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold">{storageStats.totalEntries.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <HardDrive className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                  <p className="text-2xl font-bold">{formatBytes(storageStats.totalSizeBytes)}</p>
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
                  <p className="text-sm text-muted-foreground">Compliance Records</p>
                  <p className="text-2xl font-bold">{storageStats.complianceEntries.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Trash2 className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cleanup Impact</p>
                  <p className="text-2xl font-bold">{storageStats.estimatedCleanupImpact.entriesAffected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="policies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="policies">Retention Policies</TabsTrigger>
          <TabsTrigger value="cleanup">Cleanup Tasks</TabsTrigger>
          <TabsTrigger value="analytics">Storage Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          {/* Retention Policies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Retention Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retentionPolicies.map((policy) => (
                  <div key={policy.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={policy.enabled}
                          onCheckedChange={(enabled) => updateRetentionPolicy(policy.id, { enabled })}
                        />
                        <div>
                          <h4 className="font-medium">{policy.name}</h4>
                          <p className="text-sm text-muted-foreground">{policy.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {policy.complianceStandard && (
                          <Badge variant="outline">{policy.complianceStandard}</Badge>
                        )}
                        {policy.autoCleanup && (
                          <Badge variant="secondary">Auto Cleanup</Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Retention Period</Label>
                        <p className="font-medium">{policy.retentionDays} days</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Categories</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {policy.applyToCategories.map((category) => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Last Cleanup</Label>
                        <p className="font-medium">
                          {policy.lastCleanup ? format(new Date(policy.lastCleanup), 'MMM dd, yyyy') : 'Never'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPolicy(policy)}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={!policy.enabled}>
                              <Trash2 className="h-3 w-3 mr-1" />
                              Cleanup
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Execute Cleanup</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete audit logs older than {policy.retentionDays} days 
                                according to the "{policy.name}" policy. 
                                {storageStats && (
                                  <>
                                    <br /><br />
                                    Estimated impact: {storageStats.estimatedCleanupImpact.entriesAffected} entries 
                                    ({formatBytes(storageStats.estimatedCleanupImpact.sizeFreedBytes)}) will be removed.
                                  </>
                                )}
                                <br /><br />
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => executeCleanup(policy)}>
                                Execute Cleanup
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cleanup" className="space-y-4">
          {/* Cleanup Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Cleanup Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cleanupTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileX className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No cleanup tasks yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cleanupTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium capitalize">{task.type}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              task.status === 'completed' ? 'default' :
                              task.status === 'failed' ? 'destructive' :
                              task.status === 'running' ? 'secondary' : 'outline'
                            }
                          >
                            {task.status === 'running' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                            {task.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {task.status === 'failed' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="w-full">
                            <Progress 
                              value={task.totalEntries > 0 ? (task.entriesProcessed / task.totalEntries) * 100 : 0} 
                              className="h-2"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {task.entriesProcessed.toLocaleString()} / {task.totalEntries.toLocaleString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {task.startedAt ? format(new Date(task.startedAt), 'MMM dd, HH:mm') : '-'}
                        </TableCell>
                        <TableCell>
                          {task.startedAt && task.completedAt ? (
                            `${Math.round(
                              (new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()) / 1000
                            )}s`
                          ) : task.startedAt ? (
                            'Running...'
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Storage Analytics */}
          {storageStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Data by Age</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(storageStats.entriesByAge).map(([period, count]) => (
                      <div key={period} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{period.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                        <span className="font-medium">{count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Data by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(storageStats.entriesByCategory)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 6)
                      .map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{category}</span>
                          <span className="font-medium">{count.toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}