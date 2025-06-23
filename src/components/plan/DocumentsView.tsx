import React from 'react';
import { ConstructionPlan } from '@/data/mock/generatedPlan/planData';
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
        <Card className="border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-xl bg-gradient-to-br from-white via-buildease-blue-50/20 to-buildease-earth-50/20 dark:from-gray-900 dark:via-buildease-blue-950/10 dark:to-buildease-earth-950/10 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-buildease-blue-50/50 via-white/80 to-buildease-earth-50/40 dark:from-buildease-blue-950/30 dark:via-gray-800/40 dark:to-buildease-earth-950/20 border-b border-buildease-blue-200/40 dark:border-buildease-blue-800/40 pb-4 backdrop-blur-sm">
            <CardTitle className="text-xl font-bold text-buildease-blue-800 dark:text-buildease-blue-200 flex items-center tracking-tight">
              <FileText className="h-5 w-5 mr-2 text-buildease-blue-600 dark:text-buildease-blue-400" />
              Project Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="divide-y divide-buildease-blue-200/40 dark:divide-buildease-blue-800/40">
              {documents.map((document, index) => (
                <m.div
                  key={document.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-buildease-blue-100/50 dark:border-buildease-blue-800/50 shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getDocumentIcon(document.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-buildease-blue-800 dark:text-buildease-blue-200 text-sm">
                          {document.name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-xs text-buildease-earth-600 dark:text-buildease-earth-400">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-buildease-blue-600 dark:text-buildease-blue-400" />
                            {formatDate(document.createdAt)}
                          </div>
                          <div className="flex items-center text-xs text-buildease-earth-600 dark:text-buildease-earth-400">
                            <User className="h-3.5 w-3.5 mr-1 text-buildease-blue-600 dark:text-buildease-blue-400" />
                            {document.createdBy}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-buildease-earth-600 dark:text-buildease-earth-400 hover:text-buildease-blue-700 dark:hover:text-buildease-blue-300 hover:bg-buildease-blue-50 dark:hover:bg-buildease-blue-900/20 rounded-md transition-all duration-200"
                      onClick={() => window.open(document.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </m.div>
              ))}
              
              {documents.length === 0 && (
                <div className="text-center py-12 text-buildease-earth-600 dark:text-buildease-earth-400 bg-gradient-to-br from-buildease-blue-50/40 to-white/60 dark:from-buildease-blue-950/20 dark:to-gray-800/40 rounded-xl border border-dashed border-buildease-blue-300/60 dark:border-buildease-blue-700/60 backdrop-blur-sm">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-buildease-blue-100/60 dark:bg-buildease-blue-900/40 mb-4 shadow-sm ring-2 ring-buildease-blue-200/50 dark:ring-buildease-blue-800/50">
                    <FileText className="h-8 w-8 text-buildease-blue-600 dark:text-buildease-blue-400" />
                  </div>
                  <h3 className="text-sm font-medium text-buildease-blue-800 dark:text-buildease-blue-200 mb-2">No documents available</h3>
                  <p className="text-xs text-buildease-earth-600 dark:text-buildease-earth-400">Project documents will appear here when uploaded</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </m.div>
    </div>
  );
}
