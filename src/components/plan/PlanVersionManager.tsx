/**
 * Plan Version Manager - Component for managing multiple AI-generated plan versions
 * 
 * Features:
 * - View all plan versions for a project
 * - Compare different plan versions
 * - Activate/deactivate plan versions
 * - Plan approval workflow
 * - Mobile-responsive design
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
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
  CheckCircle, 
  Clock, 
  MoreVertical, 
  Eye, 
  Trash2, 
  CheckSquare,
  XCircle,
  Star,
  RefreshCw,
  Calendar,
  User
} from 'lucide-react';
import { cn } from '@/utils/core/ui';
import { AIGeneratedPlan, AIPlanStatus } from '@/types/database';
import PlanStatusService from '@/services/planStatusService';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface PlanVersionManagerProps {
  projectId: string;
  onPlanSelect?: (plan: AIGeneratedPlan) => void;
  onPlanActivate?: (plan: AIGeneratedPlan) => void;
  className?: string;
}

/**
 * Plan Version Manager Component
 * Manages multiple AI-generated plan versions with approval workflow
 */
export function PlanVersionManager({
  projectId,
  onPlanSelect,
  onPlanActivate,
  className
}: PlanVersionManagerProps) {
  const { user } = useSupabaseAuth();
  const [plans, setPlans] = useState<AIGeneratedPlan[]>([]);
  const [activePlan, setActivePlan] = useState<AIGeneratedPlan | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await PlanStatusService.fetchPlans(projectId);
      setPlans(response.plans);
      setActivePlan(response.activePlan);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch plans';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time updates
  useEffect(() => {
    const unsubscribe = PlanStatusService.subscribeToStatusUpdates(
      projectId,
      (updatedPlan) => {
        setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
        if (updatedPlan.is_active) {
          setActivePlan(updatedPlan);
        }
      },
      () => {
        // Refresh on job updates
        fetchPlans();
      }
    );

    return unsubscribe;
  }, [projectId]);

  // Initial fetch
  useEffect(() => {
    fetchPlans();
  }, [projectId]);

  const handleActivatePlan = async (plan: AIGeneratedPlan) => {
    if (!user?.id) return;
    
    try {
      setActionLoading(`activate_${plan.id}`);
      
      const success = await PlanStatusService.activatePlan(
        projectId, 
        plan.version_number, 
        user.id
      );
      
      if (success) {
        await fetchPlans(); // Refresh to get updated state
        if (onPlanActivate) onPlanActivate(plan);
      }
    } catch (err) {
      console.error('Failed to activate plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to activate plan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (
    plan: AIGeneratedPlan, 
    status: AIPlanStatus, 
    notes?: string
  ) => {
    if (!user?.id) return;
    
    try {
      setActionLoading(`status_${plan.id}`);
      
      await PlanStatusService.updatePlanStatus(
        plan.id, 
        status, 
        notes, 
        user.id
      );
      
      await fetchPlans(); // Refresh to get updated state
    } catch (err) {
      console.error('Failed to update plan status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update plan status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePlan = async (plan: AIGeneratedPlan) => {
    try {
      setActionLoading(`delete_${plan.id}`);
      
      await PlanStatusService.deletePlan(plan.id);
      await fetchPlans(); // Refresh to get updated state
    } catch (err) {
      console.error('Failed to delete plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete plan');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeVariant = (status: AIPlanStatus) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'review':
        return 'secondary';
      case 'draft':
        return 'outline';
      case 'archived':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: AIPlanStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-3 w-3" />;
      case 'rejected':
        return <XCircle className="h-3 w-3" />;
      case 'review':
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Loading plans...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('w-full border-red-200', className)}>
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchPlans}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Plan Versions</CardTitle>
          <Badge variant="outline">
            {plans.length} version{plans.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {plans.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">No plans generated yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  'p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                  plan.is_active && 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Plan Header */}
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {plan.plan_name || `Plan v${plan.version_number}`}
                      </h3>
                      
                      {plan.is_active && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                      
                      <Badge 
                        variant={getStatusBadgeVariant(plan.status)}
                        className="text-xs"
                      >
                        {getStatusIcon(plan.status)}
                        {plan.status}
                      </Badge>
                    </div>

                    {/* Plan Description */}
                    {plan.plan_description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {plan.plan_description}
                      </p>
                    )}

                    {/* Plan Metadata */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Generated {formatDate(plan.generated_at)}</span>
                      </div>
                      
                      {plan.approved_by && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>Approved</span>
                        </div>
                      )}
                    </div>

                    {/* Approval Notes */}
                    {plan.approval_notes && (
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                        <p className="text-gray-700 dark:text-gray-300">{plan.approval_notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={!!actionLoading}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => onPlanSelect?.(plan)}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      
                      {!plan.is_active && (
                        <DropdownMenuItem 
                          onClick={() => handleActivatePlan(plan)}
                          className="cursor-pointer"
                          disabled={actionLoading === `activate_${plan.id}`}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Make Active
                        </DropdownMenuItem>
                      )}
                      
                      {plan.status === 'draft' && (
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus(plan, 'review')}
                          className="cursor-pointer"
                          disabled={actionLoading === `status_${plan.id}`}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Submit for Review
                        </DropdownMenuItem>
                      )}
                      
                      {plan.status === 'review' && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(plan, 'approved')}
                            className="cursor-pointer"
                            disabled={actionLoading === `status_${plan.id}`}
                          >
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(plan, 'rejected')}
                            className="cursor-pointer"
                            disabled={actionLoading === `status_${plan.id}`}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {!plan.is_active && plan.status !== 'approved' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()}
                              className="cursor-pointer text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Plan Version</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this plan version? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeletePlan(plan)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PlanVersionManager;