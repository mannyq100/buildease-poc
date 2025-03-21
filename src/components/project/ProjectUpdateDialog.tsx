import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { X, FileText, AlertCircle, CheckCircle, Info, Calendar } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { ProjectUpdate } from '@/types/update';

// Validation schema for project update form
const updateFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(1000, 'Content cannot exceed 1000 characters'),
  type: z.enum(['progress', 'issue', 'milestone', 'general'], {
    required_error: 'Please select an update type',
  }),
});

type UpdateFormValues = z.infer<typeof updateFormSchema>;

interface ProjectUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onUpdateSubmit: (update: Omit<ProjectUpdate, 'id' | 'createdAt'>) => void;
}

/**
 * Dialog component for adding project updates
 */
export function ProjectUpdateDialog({
  open,
  onOpenChange,
  projectId,
  onUpdateSubmit,
}: ProjectUpdateDialogProps) {
  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      title: '',
      content: '',
      type: 'general',
    },
  });

  const handleSubmit = (values: UpdateFormValues) => {
    // Create the update object
    const update: Omit<ProjectUpdate, 'id' | 'createdAt'> = {
      projectId,
      title: values.title,
      content: values.content,
      type: values.type,
      createdBy: 'Current User', // This would come from auth context in a real app
    };

    onUpdateSubmit(update);
    form.reset();
    onOpenChange(false);
  };

  // Map update types to icons
  const typeIcons = {
    progress: <CheckCircle className="h-5 w-5 text-blue-500" />,
    issue: <AlertCircle className="h-5 w-5 text-red-500" />,
    milestone: <Calendar className="h-5 w-5 text-green-500" />,
    general: <Info className="h-5 w-5 text-gray-500" />,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#2B6CB0]" />
            Add Project Update
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Share important updates, milestones, or issues with the project team.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">
                    Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="E.g., Foundation completed ahead of schedule" 
                      {...field} 
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">
                    Update Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select update type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="progress" className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          {typeIcons.progress}
                          <span>Progress Update</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="issue">
                        <div className="flex items-center gap-2">
                          {typeIcons.issue}
                          <span>Issue or Blocker</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="milestone">
                        <div className="flex items-center gap-2">
                          {typeIcons.milestone}
                          <span>Milestone Reached</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="general">
                        <div className="flex items-center gap-2">
                          {typeIcons.general}
                          <span>General Information</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the type of update you're sharing.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">
                    Details <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide details about this update..."
                      className="min-h-[120px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-[#2B6CB0] hover:bg-blue-700 text-white"
              >
                Submit Update
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
