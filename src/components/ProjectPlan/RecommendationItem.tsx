
import React from 'react';
import { Sparkles } from 'lucide-react';

interface RecommendationItemProps {
  title: string;
  description: string;
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({ title, description }) => (
  <div className="flex items-start space-x-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100/50 hover:border-blue-200 transition-all duration-300">
    <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
    <div>
      <h4 className="font-medium text-blue-900">{title}</h4>
      <p className="text-sm text-blue-700 mt-1">{description}</p>
    </div>
  </div>
);

export default RecommendationItem;
