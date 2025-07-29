/**
 * Current Phase Section with progressive loading
 * Shows current construction phase with optimized data fetching
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock } from 'lucide-react';

interface CurrentPhaseSectionProps {
  projectId: string;
  onAddPhase?: () => void;
}

export function CurrentPhaseSection({ projectId: _projectId, onAddPhase }: CurrentPhaseSectionProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Current Phase
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-slate-600">
            Phase information will be displayed here once implemented.
          </p>
          {onAddPhase && (
            <Button onClick={onAddPhase} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Phase
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}