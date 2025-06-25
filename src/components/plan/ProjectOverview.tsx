
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ProjectOverview = () => {
  return (
    <Card className="overflow-hidden border-buildease-blue-200/50 dark:border-buildease-blue-800/50">
      <CardHeader className="bg-gradient-to-r from-buildease-blue-50/40 to-buildease-earth-50/30 dark:from-buildease-blue-950/20 dark:to-buildease-earth-950/20">
        <CardTitle className="text-xl text-buildease-blue-800 dark:text-buildease-blue-200">Project Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-buildease-earth-600 dark:text-buildease-earth-400">Project Type</p>
              <p className="font-medium text-buildease-blue-800 dark:text-buildease-blue-200">Two-Story Residential House</p>
            </div>
            <div>
              <p className="text-sm text-buildease-earth-600 dark:text-buildease-earth-400">Location</p>
              <p className="font-medium text-buildease-blue-800 dark:text-buildease-blue-200">Accra, Ghana</p>
            </div>
            <div>
              <p className="text-sm text-buildease-earth-600 dark:text-buildease-earth-400">Timeline</p>
              <p className="font-medium text-buildease-blue-800 dark:text-buildease-blue-200">14 months (Mar 2024 - May 2025)</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-buildease-earth-600 dark:text-buildease-earth-400">Total Budget</p>
              <p className="font-medium text-buildease-blue-800 dark:text-buildease-blue-200">$180,000</p>
            </div>
            <div>
              <p className="text-sm text-buildease-earth-600 dark:text-buildease-earth-400">Size</p>
              <p className="font-medium text-buildease-blue-800 dark:text-buildease-blue-200">250 sq.m (2,690 sq.ft)</p>
            </div>
            <div>
              <p className="text-sm text-buildease-earth-600 dark:text-buildease-earth-400">Status</p>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-150 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40 transition-colors">Ready to Start</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectOverview;
