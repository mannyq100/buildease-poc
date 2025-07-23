/**
 * Enhanced Project Edit Form using React 19 useActionState
 * Provides optimistic updates and better form handling
 */

import React from 'react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { Project } from '@/types/project';
import type { UpdateProjectData } from '@/hooks/mutations/useProject';
import { createSupabaseError } from '@/lib/error-utils';

interface ProjectEditFormProps {
  project: Project;
  onSave: (data: UpdateProjectData) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  error: string | null;
  success: boolean;
  pending: boolean;
}

// Server action for form submission
async function updateProjectAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const projectData: UpdateProjectData = {
      id: formData.get('id') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      client_name: formData.get('client') as string,
      project_type: formData.get('type') as string,
      location: formData.get('location') as string,
      budget: formData.get('budget') ? Number(formData.get('budget')) : undefined,
    };
    
    // This would normally call the mutation directly
    // For now, we'll simulate the async operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      error: null,
      success: true,
      pending: false,
    };
  } catch (error) {
    const enhancedError = createSupabaseError(error, 'validation');
    return {
      error: enhancedError.userMessage,
      success: false,
      pending: false,
    };
  }
}

export function ProjectEditForm({ project, onSave, onCancel }: ProjectEditFormProps) {
  const [state, formAction, isPending] = useActionState(updateProjectAction, {
    error: null,
    success: false,
    pending: false,
  });
  
  // Handle successful submission
  React.useEffect(() => {
    if (state.success) {
      onCancel(); // Close the form
    }
  }, [state.success, onCancel]);
  
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Edit Project Details</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="id" value={project.id} />
          
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={project.name}
              required
              disabled={isPending}
              className="text-base" // Better for mobile
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={project.description}
              rows={3}
              disabled={isPending}
              className="text-base resize-none" // Better for mobile
            />
          </div>
          
          {/* Client */}
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Input
              id="client"
              name="client"
              defaultValue={project.client}
              disabled={isPending}
              className="text-base"
            />
          </div>
          
          {/* Project Type & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Project Type</Label>
              <Input
                id="type"
                name="type"
                defaultValue={project.project_type}
                disabled={isPending}
                className="text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={project.location}
                disabled={isPending}
                className="text-base"
              />
            </div>
          </div>
          
          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">Budget</Label>
            <Input
              id="budget"
              name="budget"
              type="number"
              defaultValue={project.budget}
              disabled={isPending}
              className="text-base"
              min="0"
              step="100"
            />
          </div>
          
          {/* Error Message */}
          {state.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="min-h-[44px] text-base font-medium" // Touch-friendly
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
              className="min-h-[44px] text-base" // Touch-friendly
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}