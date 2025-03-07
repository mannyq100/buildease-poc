
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ProjectOverview = () => {
  return (
    <Card className="overflow-hidden border-gray-200">
      <CardHeader className="bg-gray-50/50">
        <CardTitle className="text-xl text-gray-900">Project Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Project Type</p>
              <p className="font-medium text-gray-900">Two-Story Residential House</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-medium text-gray-900">Accra, Ghana</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Timeline</p>
              <p className="font-medium text-gray-900">14 months (Mar 2024 - May 2025)</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="font-medium text-gray-900">$180,000</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Size</p>
              <p className="font-medium text-gray-900">250 sq.m (2,690 sq.ft)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge className="bg-green-100 text-green-600 hover:bg-green-200 transition-colors">Ready to Start</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectOverview;
