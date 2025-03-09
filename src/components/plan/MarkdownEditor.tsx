/**
 * MarkdownEditor component
 * A simple editor for markdown content with preview
 */
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  isDarkMode: boolean;
}

export function MarkdownEditor({ value, onChange, isDarkMode }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<string>('edit');
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
      <Tabs defaultValue="edit" value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <TabsList className="grid grid-cols-2 w-[200px]">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="edit" className="p-0 m-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter markdown content..."
            className="min-h-[500px] font-mono text-sm border-0 rounded-none focus-visible:ring-0 resize-none"
          />
        </TabsContent>
        
        <TabsContent value="preview" className="p-0 m-0">
          <ScrollArea className="h-[500px]">
            <div className="p-4">
              <div className={`prose ${isDarkMode ? 'prose-invert' : 'prose-blue'} max-w-none`}>
                <Markdown remarkPlugins={[remarkGfm]}>
                  {value}
                </Markdown>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
} 