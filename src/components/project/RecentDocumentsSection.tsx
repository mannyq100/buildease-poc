import React from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentItem } from '@/components/shared';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { fadeInRightVariants } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface DocumentProps {
  title: string;
  type: string;
  size: string;
  date: string;
}

interface RecentDocumentsSectionProps {
  documents: DocumentProps[];
  onViewAll?: () => void;
  className?: string;
}

/**
 * RecentDocumentsSection - Displays a list of recent project documents
 */
export function RecentDocumentsSection({
  documents,
  onViewAll,
  className
}: RecentDocumentsSectionProps) {
  return (
    <Card className={cn(
      "shadow-sm border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800",
      className
    )}>
      <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-row justify-between items-center">
        <h2 className="text-lg font-semibold">Recent Documents</h2>
        {onViewAll && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[#2B6CB0] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium"
            onClick={onViewAll}
          >
            All Files <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <LazyMotion features={domAnimation}>
          <m.div 
            className="space-y-2"
            variants={fadeInRightVariants}
            initial="hidden"
            animate="visible"
          >
            {documents.map((doc, i) => (
              <m.div 
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <DocumentItem
                  title={doc.title}
                  type={doc.type}
                  size={doc.size}
                  date={doc.date}
                />
              </m.div>
            ))}
          </m.div>
        </LazyMotion>
      </CardContent>
    </Card>
  );
}