import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MaterialItemProps {
  name: string;
  quantity: string;
  used: string;
  status: 'sufficient' | 'low' | 'pending';
  className?: string;
}

export const MaterialItem: React.FC<MaterialItemProps> = ({ 
  name, 
  quantity, 
  used, 
  status,
  className
}) => {
  const statusConfig = {
    'sufficient': { bg: 'bg-green-100', text: 'text-green-600' },
    'low': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    'pending': { bg: 'bg-blue-100', text: 'text-blue-600' }
  };

  return (
    <div className={cn("flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-300", className)}>
      <div>
        <h4 className="font-medium">{name}</h4>
        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
          <span>Total: {quantity}</span>
          <span>Used: {used}</span>
        </div>
      </div>
      <Badge className={cn(statusConfig[status].bg, statusConfig[status].text)}>
        {status}
      </Badge>
    </div>
  );
}; 