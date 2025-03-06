import { 
  Calendar, 
  ListChecks, 
  FileText, 
  Users, 
  BarChart2, 
  Settings,
  Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type IconType = 'calendar' | 'list' | 'document' | 'users' | 'chart' | 'settings' | 'inbox';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconType;
  actionText?: string;
  onAction?: () => void;
}

const iconMap = {
  calendar: Calendar,
  list: ListChecks,
  document: FileText,
  users: Users,
  chart: BarChart2,
  settings: Settings,
  inbox: Inbox
};

export const EmptyState = ({ 
  title, 
  description, 
  icon = 'inbox', 
  actionText, 
  onAction 
}: EmptyStateProps) => {
  const IconComponent = iconMap[icon];
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <IconComponent className="h-10 w-10 text-gray-500" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      
      {description && (
        <p className="mt-2 text-sm text-gray-500 max-w-sm">{description}</p>
      )}
      
      {actionText && onAction && (
        <Button
          className="mt-4"
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}; 