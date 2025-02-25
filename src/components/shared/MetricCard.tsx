import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  icon, 
  label, 
  value, 
  subtext,
  className
}) => (
  <Card className={cn("transition-all duration-300 hover:shadow-md", className)}>
    <CardContent className="p-4">
      <div className="flex items-center space-x-2">
        <div className="text-primary">{icon}</div>
        <span className="font-medium">{label}</span>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        {subtext && <div className="text-sm text-gray-600">{subtext}</div>}
      </div>
    </CardContent>
  </Card>
); 