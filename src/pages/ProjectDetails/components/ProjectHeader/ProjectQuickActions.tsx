/**
 * ProjectQuickActions Component
 * 
 * Displays quick action buttons for common project operations.
 * Extracted from ProjectDetailsContent.tsx to maintain the 400-line limit.
 * 
 * Features:
 * - Mobile-first responsive design with proper touch targets (44px minimum)
 * - BuildEase color scheme with proper button styling
 * - Navigation actions for materials, tasks, documents, and team contact
 * - Grid layout that adapts to screen size
 * - Strong TypeScript typing
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, CalendarCheck, Upload, Phone } from 'lucide-react';

interface ProjectQuickActionsProps {
  navigate: (path: string) => void;
}

export function ProjectQuickActions({ navigate }: ProjectQuickActionsProps) {
  return (
    <Card className="border-slate-200/40 shadow-xl bg-gradient-to-br from-white via-slate-50/30 to-buildease-orange-50/20 backdrop-blur-md rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {/* Manage Materials */}
          <Button 
            size="lg" 
            className="h-14 bg-buildease-blue-600 hover:bg-buildease-blue-700 flex-col gap-1"
            onClick={() => navigate('/materials')}
          >
            <Package className="h-5 w-5" />
            <span className="text-xs">Manage Materials</span>
          </Button>
          
          {/* Manage Tasks */}
          <Button 
            size="lg" 
            variant="outline" 
            className="h-14 flex-col gap-1 border-buildease-orange-200 text-buildease-orange-700 hover:bg-buildease-orange-50"
            onClick={() => navigate('/schedule')}
          >
            <CalendarCheck className="h-5 w-5" />
            <span className="text-xs">Manage Tasks</span>
          </Button>
          
          {/* Upload Document */}
          <Button 
            size="lg" 
            variant="outline" 
            className="h-14 flex-col gap-1"
          >
            <Upload className="h-5 w-5" />
            <span className="text-xs">Upload Doc</span>
          </Button>
          
          {/* Contact Team */}
          <Button 
            size="lg" 
            variant="outline" 
            className="h-14 flex-col gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <Phone className="h-5 w-5" />
            <span className="text-xs">Contact Team</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}