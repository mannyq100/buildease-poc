
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Users, AlertCircle } from 'lucide-react';

interface PhaseCardProps {
  name: string;
  duration: string;
  budget: string;
  team: number;
  tasks: number;
  status: 'optimized' | 'warning';
  warning?: string;
}

const PhaseCard: React.FC<PhaseCardProps> = ({ 
  name, 
  duration, 
  budget, 
  team, 
  tasks, 
  status, 
  warning 
}) => (
  <div className="border rounded-lg p-4 hover:border-gray-300 transition-all duration-300">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-medium text-gray-900">{name}</h3>
        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="w-4 h-4" />
            <span>{budget}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{team} members</span>
          </div>
        </div>
      </div>
      <Badge className={
        status === 'optimized' 
          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
          : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
      }>
        {status === 'optimized' ? 'AI Optimized' : 'Needs Attention'}
      </Badge>
    </div>
    {warning && (
      <div className="mt-3 flex items-center space-x-2 text-sm text-yellow-600">
        <AlertCircle className="w-4 h-4" />
        <span>{warning}</span>
      </div>
    )}
  </div>
);

export default PhaseCard;
