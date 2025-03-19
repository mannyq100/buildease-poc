import React from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentItem } from '@/components/shared';
import { ContentSection } from '@/components/shared/ContentSection';
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
    <ContentSection
      title="Recent Documents"
      variant="default"
      elevation="sm"
      borderRadius="lg"
      className={cn(
        "shadow-sm border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800",
        className
      )}
      action={
        onViewAll && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[#2B6CB0] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium"
            onClick={onViewAll}
          >
            All Files <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )
      }
    >
      <LazyMotion features={domAnimation}>
        <div className="space-y-3">
          {documents.map((doc, i) => (
            <m.div
              key={i}
              variants={fadeInRightVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ x: 2 }}
            >
              <DocumentItem
                title={doc.title}
                size={doc.size}
                type={doc.type}
                date={doc.date}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 p-3 rounded-lg transition-colors border border-transparent hover:border-gray-100 dark:hover:border-slate-700"
              />
            </m.div>
          ))}
        </div>
      </LazyMotion>
    </ContentSection>
  );
}