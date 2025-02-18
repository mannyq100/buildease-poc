
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RecommendationItem from './RecommendationItem';

const AIRecommendations = () => {
  return (
    <Card className="overflow-hidden border-blue-100">
      <CardHeader className="bg-blue-50/50">
        <CardTitle className="text-xl text-blue-900">AI Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <RecommendationItem
          title="Resource Optimization"
          description="Schedule material deliveries 2 weeks before each phase"
        />
        <RecommendationItem
          title="Risk Mitigation"
          description="Plan foundation work before rainy season (April-June)"
        />
        <RecommendationItem
          title="Cost Savings"
          description="Bulk purchase of materials could save 12% on total cost"
        />
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;
