import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText, FileImage, FileSpreadsheet, File } from 'lucide-react';

interface DocumentItemProps {
  title?: string;
  name?: string;
  type: string;
  date: string;
  size: string;
  status?: 'current' | 'approved' | 'rejected' | 'pending';
  onClick?: () => void;
}

export function DocumentItem({ 
  title, 
  name,
  type, 
  date, 
  size,
  status,
  onClick 
}: DocumentItemProps) {
  // Support both title and name for flexibility
  const displayName = title || name || '';
  
  function getIcon() {
    switch (type) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'DWG':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'XLSX':
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      case 'JPG':
      case 'PNG':
        return <FileImage className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  }
  
  function getStatusBadge() {
    if (!status) return null;
    
    const statusStyles = {
      current: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    };
    
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }
  
  return (
    <div 
      className="flex items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all hover:shadow-sm"
      onClick={onClick}
    >
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="flex-grow">
        <h3 className="font-medium flex items-center">
          {displayName}
          {getStatusBadge()}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{date} · {size}</p>
      </div>
      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
} 