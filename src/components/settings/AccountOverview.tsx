/**
 * AccountOverview component for settings sidebar
 * Displays account stats, subscription info, and project memberships
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Clock, Award, CheckCircle, Shield, Key, RefreshCw, Calendar } from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types/user';

interface AccountOverviewProps {
  profile: UserProfile | null;
  className?: string;
}

export function AccountOverview({ profile, className }: AccountOverviewProps) {
  const { refreshProfile } = useSupabaseAuth();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getRenewalDate = () => {
    const renewalDate = new Date();
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    
    return renewalDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    } as Intl.DateTimeFormatOptions);
  };

  const getMemberSince = () => {
    if (!profile?.createdAt) return 'N/A';
    const createdDate = new Date(profile.createdAt);
    return createdDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric'
    } as Intl.DateTimeFormatOptions);
  };

  const getProjectCount = () => profile?.projectMemberships?.length || 0;
  
  const getPermissionCount = () => 
    profile?.projectMemberships?.reduce((total: number, membership) => 
      total + (membership.permissions?.length || 0), 0) || 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProfile();
      toast({
        title: "Profile refreshed",
        description: "Your account information has been updated.",
      });
    } catch {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg h-full ${className}`}>
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-buildease-blue-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Account Overview
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                Summary of your account activity
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-buildease-blue-600 hover:text-buildease-blue-700 hover:bg-buildease-blue-50 dark:text-buildease-blue-400 dark:hover:bg-buildease-blue-900/20"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Enhanced Subscription Section */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-buildease-blue-50 via-blue-50 to-orange-50 dark:from-buildease-blue-900/20 dark:via-blue-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-buildease-blue-200/50 dark:border-buildease-blue-700/50 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-buildease-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Award className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-buildease-blue-800 dark:text-buildease-blue-300">
                  Subscription
                </h3>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-buildease-blue-700 dark:text-buildease-blue-400">
                  {profile?.tier ? profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1) : 'Basic'}
                </p>
                <p className="text-sm text-buildease-blue-600/70 dark:text-buildease-blue-400/70">
                  Current Plan
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-sm text-buildease-blue-600/70 dark:text-buildease-blue-400/70">
                  <Clock className="h-3 w-3" />
                  <span>Renews {getRenewalDate()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-buildease-blue-600/70 dark:text-buildease-blue-400/70 mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>Member since {getMemberSince()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-buildease-blue-300 dark:hover:border-buildease-blue-600 transition-all duration-300 hover:shadow-md group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-buildease-blue-100 dark:bg-buildease-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-buildease-blue-200 dark:group-hover:bg-buildease-blue-800/50 transition-colors">
                  <Briefcase className="h-3 w-3 text-buildease-blue-600 dark:text-buildease-blue-400" />
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Projects</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{getProjectCount()}</p>
            </div>
            
            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 hover:shadow-md group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50 transition-colors">
                  <Key className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Permissions</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{getPermissionCount()}</p>
            </div>
          </div>
        </div>

        {/* Enhanced Project Memberships */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-buildease-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="h-3 w-3 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Project Memberships
              </h3>
            </div>
            {profile?.projectMemberships && profile.projectMemberships.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {profile.projectMemberships.length} total
              </Badge>
            )}
          </div>
          
          <div className="space-y-3">
            {profile?.projectMemberships?.slice(0, 4).map((membership, index: number) => (
              <div 
                key={index} 
                className="bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700 hover:border-buildease-blue-300 dark:hover:border-buildease-blue-600 transition-all duration-300 hover:shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate group-hover:text-buildease-blue-600 dark:group-hover:text-buildease-blue-400 transition-colors">
                      {membership.projectName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {membership.permissions?.length || 0} permissions
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`ml-2 text-xs flex-shrink-0 ${
                      membership.role === 'owner' 
                        ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700'
                        : membership.role === 'admin'
                        ? 'bg-buildease-blue-50 text-buildease-blue-600 border-buildease-blue-200 dark:bg-buildease-blue-900/30 dark:text-buildease-blue-300 dark:border-buildease-blue-700'
                        : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {membership.role}
                  </Badge>
                </div>
              </div>
            ))}
            
            {profile?.projectMemberships && profile.projectMemberships.length > 4 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-sm py-3 text-buildease-blue-600 hover:text-buildease-blue-700 hover:bg-buildease-blue-50 dark:text-buildease-blue-400 dark:hover:text-buildease-blue-300 dark:hover:bg-buildease-blue-900/20 border border-dashed border-buildease-blue-200 dark:border-buildease-blue-700 rounded-lg"
              >
                View all {profile.projectMemberships.length} projects
              </Button>
            )}
            
            {(!profile?.projectMemberships || profile.projectMemberships.length === 0) && (
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-lg p-6 text-center border border-dashed border-slate-300 dark:border-slate-600">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  No projects yet
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Create your first project to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}