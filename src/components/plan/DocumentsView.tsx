import React from 'react';
import { Document, ConstructionPlan } from '@/data/mock/generatedPlan/planData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion as m } from 'framer-motion';

interface DocumentsViewProps {
  plan: ConstructionPlan;
}

export function DocumentsView({ plan }: DocumentsViewProps) {
  const { documents } = plan;

  const getDocumentIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500 dark:text-red-400" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="h-5 w-5 text-orange-500 dark:text-orange-400" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden rounded-xl">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700 pb-3">
            <CardTitle className="text-lg font-semibold text-[#2B6CB0] dark:text-[#93C5FD] flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Project Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {documents.map((document, index) => (
                <m.div
                  key={document.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getDocumentIcon(document.type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                          {document.name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {formatDate(document.createdAt)}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <User className="h-3.5 w-3.5 mr-1" />
                            {document.createdBy}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-[#2B6CB0] dark:text-gray-400 dark:hover:text-[#93C5FD]"
                      onClick={() => window.open(document.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </m.div>
              ))}
              
              {documents.length === 0 && (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No documents available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </m.div>
    </div>
  );
}
