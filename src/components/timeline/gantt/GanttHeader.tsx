/**
 * GanttHeader Component
 * Header section of the Gantt chart with controls and title
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  ZoomIn, 
  ZoomOut,
  Maximize2,
  Plus
} from 'lucide-react';

interface GanttHeaderProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomToFit: () => void;
  onScrollToToday: () => void;
  onAddPhase?: () => void;
}

export function GanttHeader({
  onZoomIn,
  onZoomOut,
  onZoomToFit,
  onScrollToToday,
  onAddPhase
}: GanttHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/60 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-buildease-blue-500/10 text-buildease-blue-600">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Timeline View</h3>
            <p className="text-sm text-slate-500">Visual project schedule</p>
          </div>
        </div>
        
        {/* Enhanced Timeline Controls */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <Button
              size="sm"
              variant="ghost"
              onClick={onZoomOut}
              className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100"
              title="Zoom Out (Ctrl + -)"
            >
              <ZoomOut className="h-3.5 w-3.5 text-slate-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onZoomToFit}
              className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100"
              title="Fit to View (Ctrl + F)"
            >
              <Maximize2 className="h-3.5 w-3.5 text-slate-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onZoomIn}
              className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100"
              title="Zoom In (Ctrl + +)"
            >
              <ZoomIn className="h-3.5 w-3.5 text-slate-600" />
            </Button>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onScrollToToday}
            className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm"
          >
            <span className="hidden sm:inline">Today</span>
            <span className="sm:hidden">📅</span>
          </Button>
          
          {onAddPhase && (
            <Button
              size="sm"
              onClick={onAddPhase}
              className="bg-gradient-to-r from-buildease-blue-600 to-buildease-blue-700 hover:from-buildease-blue-700 hover:to-buildease-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Add Phase</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}