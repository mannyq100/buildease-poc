import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BaseModal } from "@/components/ui/BaseModal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Loader2, CheckCircle, Clock, Play, Pause } from "lucide-react";
import type { Project, ProjectStatus } from "@/types/project";

const updateStatusSchema = z.object({
  status: z.enum(['active', 'planning', 'completed', 'upcoming', 'on-hold']),
  progress: z.number().min(0).max(100),
  notes: z.string().optional(),
});

type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (statusData: { status: ProjectStatus; progress: number; notes?: string }) => void;
  project: Project;
  isSaving?: boolean;
}

const statusConfig = {
  planning: {
    label: "Planning",
    icon: Clock,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Project is in planning phase"
  },
  upcoming: {
    label: "Upcoming", 
    icon: Play,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Project scheduled to start soon"
  },
  active: {
    label: "Active",
    icon: Play,
    color: "bg-green-100 text-green-800 border-green-200", 
    description: "Project is actively in progress"
  },
  'on-hold': {
    label: "On Hold",
    icon: Pause,
    color: "bg-amber-100 text-amber-800 border-amber-200",
    description: "Project temporarily paused"
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "Project successfully completed"
  }
};

export function UpdateStatusModal({
  isOpen,
  onClose,
  onSave,
  project,
  isSaving = false,
}: UpdateStatusModalProps) {
  const form = useForm<UpdateStatusFormData>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: project.status,
      progress: project.progress,
      notes: '',
    },
  });

  const watchedStatus = form.watch('status');
  const watchedProgress = form.watch('progress');

  const handleSubmit = (data: UpdateStatusFormData) => {
    onSave({
      status: data.status,
      progress: data.progress,
      notes: data.notes,
    });
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  const StatusIcon = statusConfig[watchedStatus]?.icon || Clock;

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleCancel}
        disabled={isSaving}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="update-status-form"
        disabled={isSaving}
        className="bg-buildease-blue-600 hover:bg-buildease-blue-700"
      >
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Update Status
      </Button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Project Status"
      description={`Change the status and progress of ${project.name}`}
      size="md"
    >
      <Form {...form}>
        <form id="update-status-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Current Status Display */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Current Status
                </span>
                <Badge variant="outline" className={statusConfig[project.status]?.color}>
                  {statusConfig[project.status]?.label}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Progress: {project.progress}%
              </div>
            </div>

            {/* New Status Selection */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {statusConfig[watchedStatus] && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {statusConfig[watchedStatus].description}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Progress Slider */}
            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Progress</FormLabel>
                    <Badge variant="outline" className="text-xs">
                      {watchedProgress}%
                    </Badge>
                  </div>
                  <FormControl>
                    <div className="px-2">
                      <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Preview */}
            <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950">
              <div className="flex items-center gap-3">
                <StatusIcon className="h-5 w-5 text-buildease-blue-600" />
                <div>
                  <div className="font-medium text-buildease-blue-900 dark:text-buildease-blue-100">
                    {statusConfig[watchedStatus]?.label} • {watchedProgress}%
                  </div>
                  <div className="text-sm text-buildease-blue-700 dark:text-buildease-blue-300">
                    {statusConfig[watchedStatus]?.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any notes about this status change..." 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

        </form>
      </Form>
      
      {/* Footer */}
      <div className="flex justify-end gap-2 pt-6 border-t">
        {footer}
      </div>
    </BaseModal>
  );
}