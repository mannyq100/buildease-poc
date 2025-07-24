# Create BuildEase Construction Form

Create a new form component specifically designed for construction workflows in the BuildEase platform, optimized for on-site mobile usage by construction professionals and accessible to homeowners.

## Construction Form Principles

### Core Design Philosophy
- **Mobile-First Construction Site Usage**: Forms designed for contractors wearing work gloves on mobile devices
- **Quick Data Entry**: Minimize typing, maximize taps/selections for efficiency
- **Offline Capability**: Forms must work without internet connection and sync when available
- **Industry Context**: Use construction terminology, workflows, and visual patterns
- **Safety First**: Include safety considerations and incident reporting in all relevant forms

### Construction Form Architecture

```typescript
// src/components/construction/forms/DailyProgressForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Camera, Users, AlertTriangle, Cloud, Sun } from 'lucide-react';
import { useCreateProgressReport } from '@/hooks/mutations/useProgressReport';
import { CONSTRUCTION_PHASES, WEATHER_CONDITIONS, WORK_CATEGORIES } from '@/data/construction';

// Construction-specific validation schema
const dailyProgressSchema = z.object({
  project_id: z.string().min(1, 'Project is required'),
  phase_id: z.string().min(1, 'Current phase is required'),
  date: z.string().min(1, 'Date is required'),
  
  // Weather conditions (affects work)
  weather_conditions: z.enum(['clear', 'rain', 'snow', 'extreme_heat', 'high_winds', 'fog']),
  temperature: z.number().optional(),
  
  // Crew information
  crew_count: z.number().min(1, 'Crew count required').max(50, 'Maximum 50 crew members'),
  crew_lead: z.string().min(1, 'Crew lead is required'),
  
  // Work completed (checkboxes for quick selection)
  work_completed: z.array(z.string()).min(1, 'Select at least one completed task'),
  work_hours: z.number().min(0.5, 'Minimum 0.5 hours').max(16, 'Maximum 16 hours per day'),
  
  // Materials and deliveries
  materials_delivered: z.array(z.object({
    material_type: z.string(),
    quantity: z.number().positive(),
    unit: z.string(),
    supplier: z.string().optional(),
    delivery_time: z.string().optional()
  })).optional(),
  
  // Safety and incidents
  safety_meeting_held: z.boolean(),
  safety_incidents: z.boolean(),
  incident_details: z.string().optional(),
  near_misses: z.number().min(0).optional(),
  
  // Issues and delays
  delays_encountered: z.boolean(),
  delay_reason: z.enum(['weather', 'materials', 'equipment', 'permits', 'client', 'other']).optional(),
  delay_description: z.string().optional(),
  delay_duration_hours: z.number().min(0).optional(),
  
  // Planning
  next_day_plan: z.string().min(10, 'Provide tomorrow\'s work plan (minimum 10 characters)'),
  equipment_needed: z.array(z.string()).optional(),
  materials_needed: z.array(z.string()).optional(),
  
  // Quality and inspection
  quality_issues: z.boolean(),
  inspection_required: z.boolean(),
  inspection_type: z.enum(['electrical', 'plumbing', 'structural', 'final']).optional(),
  
  // Documentation
  photos_taken: z.boolean(),
  photo_urls: z.array(z.string()).optional(),
  supervisor_notes: z.string().optional()
});

type DailyProgressData = z.infer<typeof dailyProgressSchema>;

interface DailyProgressFormProps {
  projectId: string;
  phaseId: string;
  initialData?: Partial<DailyProgressData>;
  onSubmit: (data: DailyProgressData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function DailyProgressForm({
  projectId,
  phaseId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: DailyProgressFormProps) {
  const form = useForm<DailyProgressData>({
    resolver: zodResolver(dailyProgressSchema),
    defaultValues: {
      project_id: projectId,
      phase_id: phaseId,
      date: new Date().toISOString().split('T')[0],
      weather_conditions: 'clear',
      crew_count: 1,
      work_completed: [],
      safety_meeting_held: false,
      safety_incidents: false,
      delays_encountered: false,
      quality_issues: false,
      inspection_required: false,
      photos_taken: false,
      ...initialData
    }
  });

  const handleSubmit = (data: DailyProgressData) => {
    onSubmit(data);
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-buildease-blue-600" />
          <h2 className="text-xl font-semibold text-slate-900">Daily Progress Report</h2>
        </div>
        <p className="text-sm text-slate-600 mt-1">Record today's construction progress and plan tomorrow's work</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-8">
          
          {/* Weather & Site Conditions - Critical for construction */}
          <div className="bg-blue-50/50 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Site Conditions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weather_conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weather Conditions</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select weather" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="clear">☀️ Clear/Sunny</SelectItem>
                        <SelectItem value="rain">🌧️ Rain</SelectItem>
                        <SelectItem value="snow">❄️ Snow</SelectItem>
                        <SelectItem value="extreme_heat">🔥 Extreme Heat</SelectItem>
                        <SelectItem value="high_winds">💨 High Winds</SelectItem>
                        <SelectItem value="fog">🌫️ Fog</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="crew_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crew Size</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        className="h-12 text-base"
                        placeholder="Number of workers"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Work Completed - Quick selection for mobile */}
          <div className="bg-green-50/50 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 mb-4">Work Completed Today</h3>
            <FormField
              control={form.control}
              name="work_completed"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {WORK_CATEGORIES.map((category) => (
                      <FormField
                        key={category.id}
                        control={form.control}
                        name="work_completed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(category.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, category.id])
                                    : field.onChange(field.value?.filter((value) => value !== category.id))
                                }}
                                className="mt-1"
                              />
                            </FormControl>
                            <div className="grid gap-1.5 leading-none">
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {category.label}
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Safety Section - Always prominent in construction */}
          <div className="bg-yellow-50/50 rounded-lg p-4 border border-yellow-200">
            <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Safety & Incidents
            </h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="safety_meeting_held"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Daily safety meeting held</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="safety_incidents"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Safety incidents occurred</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Tomorrow's Plan - Critical for construction scheduling */}
          <div className="bg-slate-50/50 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 mb-4">Tomorrow's Work Plan</h3>
            <FormField
              control={form.control}
              name="next_day_plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Planned Activities</FormLabel>
                  <FormControl>
                    <textarea
                      className="w-full h-24 p-3 border border-slate-200 rounded-lg resize-none text-base"
                      placeholder="Describe tomorrow's planned work activities..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Form Actions - Mobile-optimized */}
          <div className="flex flex-col gap-3 pt-6 border-t border-slate-200 sm:flex-row sm:justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-12 px-8 sm:h-10"
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="h-12 px-8 bg-buildease-orange-500 hover:bg-buildease-orange-600 sm:h-10"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Progress Report'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
```

## Construction Form Types

### Common Construction Forms

#### 1. Daily Progress Reports
- Weather conditions and site status
- Work completed with visual checkboxes
- Crew information and hours
- Safety incidents and meetings
- Materials delivered
- Tomorrow's work plan

#### 2. Safety Inspection Forms
- Safety checklist with pass/fail indicators
- Incident reporting with photo upload
- PPE compliance checks
- Equipment safety verification
- Corrective action tracking

#### 3. Material Request Forms
- Material type with construction categories
- Quantity with standard units (sq ft, linear ft, etc.)
- Delivery date and location
- Supplier preferences
- Budget approval workflow

#### 4. Quality Control Forms
- Inspection checklists by trade
- Pass/fail with photo documentation
- Deficiency tracking
- Rework requirements
- Sign-off by supervisors

#### 5. Time Tracking Forms
- Crew member check-in/out
- Task-based time allocation
- Equipment usage hours
- Overtime approval
- Weather delays

### Mobile Construction Optimization

#### Touch-Friendly Form Elements
```typescript
// Large touch targets for work gloves
const CONSTRUCTION_FORM_STYLES = {
  // Form inputs - minimum 48px height
  input: 'h-12 px-4 text-base border-2 border-slate-200 rounded-lg',
  
  // Select dropdowns - easy to tap
  select: 'h-12 text-base',
  
  // Checkboxes - larger for visibility
  checkbox: 'h-5 w-5 border-2',
  
  // Buttons - construction-friendly sizing
  primaryButton: 'h-12 px-6 text-base font-medium bg-buildease-orange-500',
  secondaryButton: 'h-12 px-6 text-base border-2 border-slate-300',
  
  // Text areas - adequate size for notes
  textarea: 'min-h-[100px] p-4 text-base border-2 border-slate-200 rounded-lg'
};
```

#### Construction-Specific Validation
```typescript
// Industry-specific validation patterns
const CONSTRUCTION_VALIDATIONS = {
  // Crew size limits
  crewCount: z.number().min(1).max(50),
  
  // Work hours (accounting for overtime)
  workHours: z.number().min(0.5).max(16),
  
  // Material quantities (positive numbers only)
  materialQuantity: z.number().positive(),
  
  // Safety incident severity
  incidentSeverity: z.enum(['minor', 'major', 'critical']),
  
  // Weather impact on work
  weatherImpact: z.enum(['none', 'minor_delay', 'work_stopped', 'site_closed']),
  
  // Construction phases
  constructionPhase: z.enum(['site_prep', 'foundation', 'framing', 'mep', 'finishes']),
  
  // Quality ratings
  qualityRating: z.enum(['excellent', 'good', 'acceptable', 'needs_rework'])
};
```

### Offline Form Handling

#### Construction Site Connectivity
```typescript
// Offline form state management
export function useOfflineForm<T>(formData: T) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingSubmissions, setPendingSubmissions] = useState<T[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Sync pending submissions when back online
      syncPendingSubmissions();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const submitForm = useCallback((data: T) => {
    if (isOffline) {
      // Store locally for later sync
      setPendingSubmissions(prev => [...prev, data]);
      localStorage.setItem('pendingForms', JSON.stringify([...pendingSubmissions, data]));
      toast.success('Form saved offline. Will sync when connection restored.');
    } else {
      // Submit immediately
      return submitToServer(data);
    }
  }, [isOffline, pendingSubmissions]);

  return { isOffline, submitForm, pendingSubmissions };
}
```

### Construction Form Best Practices

#### User Experience for Construction Workers
1. **Minimize Typing**: Use dropdowns, checkboxes, and toggles instead of text inputs
2. **Visual Feedback**: Clear indicators for required fields and form progress
3. **Quick Actions**: Common tasks should be 1-2 taps maximum
4. **Error Prevention**: Validate inputs immediately and provide helpful guidance
5. **Offline Support**: Forms must work without internet and sync later

#### Industry Context Integration
1. **Construction Terminology**: Use industry-standard terms and abbreviations
2. **Workflow Alignment**: Forms should match real construction processes
3. **Safety Priority**: Safety fields should be prominent and required
4. **Photo Integration**: Easy photo capture for documentation
5. **Time Sensitivity**: Quick form completion for busy construction schedules

### Form Integration Examples

#### Usage in Construction Workflow
```typescript
// In a construction dashboard component
import { DailyProgressForm } from '@/components/construction/forms/DailyProgressForm';
import { useCreateProgressReport } from '@/hooks/mutations/useProgressReport';

export function ConstructionDashboard({ projectId }: { projectId: string }) {
  const createReport = useCreateProgressReport();

  const handleProgressSubmit = (data: DailyProgressData) => {
    createReport.mutate(data, {
      onSuccess: () => {
        toast.success('Progress report submitted successfully');
        // Refresh project data
      },
      onError: (error) => {
        toast.error('Failed to submit report. Saved offline for later sync.');
      }
    });
  };

  return (
    <div className="space-y-6">
      <DailyProgressForm
        projectId={projectId}
        phaseId={currentPhase.id}
        onSubmit={handleProgressSubmit}
        isLoading={createReport.isPending}
      />
    </div>
  );
}
```

Every BuildEase form should feel natural to construction professionals while being accessible to homeowners, prioritizing mobile usage and construction industry workflows.
