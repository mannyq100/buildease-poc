/**
 * AccountOverview component for settings sidebar
 * Displays account stats, subscription info, and project memberships
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Clock, Award, CheckCircle, Shield, Key } from 'lucide-react';
import type { UserProfile } from '@/types/user';

interface AccountOverviewProps {
  profile: UserProfile | null;
  className?: string;
}

export function AccountOverview({ profile, className }: AccountOverviewProps) {
  const getRenewalDate = () => {
    const renewalDate = new Date();
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    
    return renewalDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    } as Intl.DateTimeFormatOptions);
  };

  const getProjectCount = () => profile?.projectMemberships?.length || 0;
  
  const getPermissionCount = () => 
    profile?.projectMemberships?.reduce((total: number, membership) => 
      total + (membership.permissions?.length || 0), 0) || 0;

  return (
    <Card className={`border-0 shadow-md dark:shadow-slate-900/30 h-full ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
          <span>Account Overview</span>
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Summary of your account activity
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 sm:space-y-8">
        {/* Subscription Section */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-lg p-4 sm:p-6 border border-blue-100 dark:border-blue-900/30">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-4">
              <h3 className="text-sm sm:text-base font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Subscription</span>
              </h3>
              <Badge variant="outline" className="text-xs sm:text-sm bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 w-fit">
                <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                <span>Active</span>
              </Badge>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-400">
              {profile?.tier ? profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1) : 'N/A'}
            </p>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-blue-600/70 dark:text-blue-400/70 mt-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Renews on {getRenewalDate()}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              <h3 className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Projects</span>
              </h3>
              <p className="text-xl sm:text-2xl font-semibold">{getProjectCount()}</p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              <h3 className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Key className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Permissions</span>
              </h3>
              <p className="text-xl sm:text-2xl font-semibold">{getPermissionCount()}</p>
            </div>
          </div>
        </div>

        {/* Project Memberships */}
        <div className="pt-4">
          <h3 className="text-sm sm:text-base font-medium mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            <span>Project Memberships</span>
          </h3>
          
          <div className="space-y-0 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {profile?.projectMemberships?.slice(0, 3).map((membership, index: number) => (
              <div 
                key={index} 
                className="flex items-center justify-between text-xs sm:text-sm py-3 px-4 border-b last:border-b-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span className="text-slate-600 dark:text-slate-300 truncate flex-1 mr-2">
                  {membership.projectName}
                </span>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 flex-shrink-0">
                  {membership.role}
                </Badge>
              </div>
            ))}
            
            {profile?.projectMemberships && profile.projectMemberships.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs sm:text-sm py-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
              >
                View all {profile.projectMemberships.length} projects
              </Button>
            )}
            
            {(!profile?.projectMemberships || profile.projectMemberships.length === 0) && (
              <div className="py-6 px-4 text-center text-sm text-slate-500 dark:text-slate-400">
                No project memberships yet
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}