# Debug BuildEase Construction Platform Issues

Troubleshoot common issues in the BuildEase construction management platform with construction-specific debugging approaches.

## Usage
```bash
# Example usage for different debugging scenarios:
# Debug mobile responsiveness issues
debug-issues --type=mobile --domain=project --component=ProjectTimelineCard

# Debug Supabase connection issues
debug-issues --type=database --domain=team --error="RLS policy violation"

# Debug form validation issues
debug-issues --type=form --domain=safety --component=SafetyChecklistForm

# Debug performance issues on construction sites
debug-issues --type=performance --domain=materials --context=mobile-offline
```

## Arguments
- `--type`: Issue type (mobile|database|form|performance|auth|realtime|offline)
- `--domain`: Construction domain (project|team|budget|safety|materials|timeline|reports)
- `--component`: Specific component name (optional)
- `--error`: Error message or description (optional)
- `--context`: Usage context (mobile-offline|construction-site|homeowner-dashboard)

## Instructions

You are debugging issues in the BuildEase construction management platform. Use this guide to systematically identify and resolve construction-specific problems.

### Common Issue Categories

#### 1. TypeScript Errors
**Check these first:**
- Missing type definitions in `src/types/`
- Incorrect imports or exports
- Supabase type mismatches
- React Hook Form type issues

**Debug Steps:**
```bash
# Run TypeScript checker
npm run typecheck

# Check specific file
npx tsc --noEmit src/path/to/file.tsx

# Generate fresh Supabase types
npm run generate-types
```

#### 2. React Query Issues
**Common Problems:**
- Stale data not refetching
- Query keys not invalidating properly
- Optimistic updates failing
- Cache timing issues

**Debug Steps:**
```typescript
// Check query status
const { data, error, isLoading, isError } = useQuery({
  queryKey: ['key'],
  queryFn: fetchData,
  // Add debug options
  meta: { 
    errorMessage: 'Custom error message' 
  },
  retry: (failureCount, error) => {
    console.log('Query retry:', { failureCount, error });
    return failureCount < 3;
  }
});

// Manual cache inspection
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
console.log('Cache data:', queryClient.getQueryData(['key']));
```

#### 3. Supabase Connection Issues
**Common Problems:**
- RLS policy blocking queries
- Missing permissions
- Environment variables not set
- Database schema mismatch

**Debug Steps:**
```typescript
// Test Supabase connection
import { supabase } from '@/lib/supabase';

// Check auth status
const { data: { user }, error } = await supabase.auth.getUser();
console.log('Current user:', user);

// Test basic query
const { data, error } = await supabase
  .from('be_project')
  .select('id')
  .limit(1);
console.log('Query test:', { data, error });

// Check RLS policies
const { data, error } = await supabase.rpc('check_user_permissions', {
  user_id: user?.id
});
```

#### 4. Mobile Responsiveness Issues
**Common Problems:**
- Touch targets too small
- Text not readable on mobile
- Layout breaking on small screens
- Performance issues on mobile

**Debug Steps:**
```css
/* Add debug borders */
.debug * {
  border: 1px solid red !important;
}

/* Check touch target sizes */
button, a, [role="button"] {
  min-height: 44px !important;
  min-width: 44px !important;
  background: rgba(255, 0, 0, 0.1) !important;
}
```

#### 5. Form Validation Issues
**Common Problems:**
- Zod schema mismatches
- Form not submitting
- Validation errors not showing
- Default values not loading

**Debug Steps:**
```typescript
// Debug form state
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues,
  mode: 'onChange', // Show validation on change
});

// Watch form values
const watchedValues = form.watch();
console.log('Form values:', watchedValues);

// Check validation errors
const errors = form.formState.errors;
console.log('Validation errors:', errors);

// Test schema separately
try {
  const result = schema.parse(formData);
  console.log('Schema validation passed:', result);
} catch (error) {
  console.log('Schema validation failed:', error);
}
```

### Debugging Workflow

#### Step 1: Identify the Problem Area
```typescript
// Add console logs at key points
console.log('Component rendered:', { props, state });
console.log('API call started:', { params });
console.log('API response:', { data, error });
console.log('State updated:', { newState });
```

#### Step 2: Check Network Requests
```typescript
// Enable detailed Supabase logging
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key, {
  auth: {
    debug: true, // Enable auth debugging
  },
  global: {
    fetch: (url, options) => {
      console.log('Supabase request:', { url, options });
      return fetch(url, options).then(response => {
        console.log('Supabase response:', response);
        return response;
      });
    }
  }
});
```

#### Step 3: Inspect React DevTools
- Check component props and state
- Verify React Query cache state
- Inspect Context values
- Check for unnecessary re-renders

#### Step 4: Database Debugging
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'be_project';

-- Test queries manually
SELECT * FROM be_project WHERE owner_id = 'user-id';

-- Check permissions
SELECT * FROM be_project_member WHERE user_id = 'user-id';
```

### Performance Debugging

#### 1. Identify Performance Issues
```typescript
// Performance monitoring
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Component performance:', {
    id,
    phase,
    actualDuration
  });
}

<Profiler id="ComponentName" onRender={onRenderCallback}>
  <ComponentName />
</Profiler>
```

#### 2. Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Check for large dependencies
npm ls --depth=0 --parseable | xargs du -sh
```

#### 3. Memory Leaks
```typescript
// Check for memory leaks
useEffect(() => {
  const cleanup = () => {
    // Cleanup logic
  };
  
  return cleanup; // Always return cleanup function
}, []);

// Check for useEffect dependencies
useEffect(() => {
  // Effect logic
}, []); // Missing dependencies can cause issues
```

### Error Boundary Debugging

#### Enhanced Error Boundary
```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-lg font-semibold text-red-800">
        Something went wrong
      </h2>
      <details className="mt-2">
        <summary className="cursor-pointer text-red-600">
          Error Details
        </summary>
        <pre className="mt-2 text-sm text-red-700">
          {error.message}
        </pre>
        <pre className="mt-2 text-xs text-red-600">
          {error.stack}
        </pre>
      </details>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
      >
        Try Again
      </button>
    </div>
  );
}

// Usage
<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={(error, errorInfo) => {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### Environment Debugging

#### Check Environment Variables
```typescript
// In component or hook
console.log('Environment check:', {
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  useMockData: import.meta.env.VITE_USE_MOCK_DATA,
});
```

### Useful Debug Utilities

#### 1. Debug Hook
```typescript
import { useEffect, useRef } from 'react';

export function useDebug(value: any, name: string) {
  const prev = useRef();
  
  useEffect(() => {
    if (prev.current !== value) {
      console.log(`${name} changed:`, {
        from: prev.current,
        to: value
      });
      prev.current = value;
    }
  });
}
```

#### 2. Performance Hook
```typescript
export function usePerformance(name: string) {
  useEffect(() => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
    };
  });
}
```

#### 3. Network Monitor
```typescript
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network: Back online');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log('Network: Gone offline');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}
```

### Quick Fix Checklist

#### Build Issues
- [ ] Clear node_modules and reinstall
- [ ] Check for TypeScript errors
- [ ] Verify all imports are correct
- [ ] Check for missing dependencies

#### Runtime Issues
- [ ] Check browser console for errors
- [ ] Verify environment variables
- [ ] Test network connectivity
- [ ] Check Supabase connection

#### UI Issues
- [ ] Test on different screen sizes
- [ ] Check for CSS conflicts
- [ ] Verify component props
- [ ] Test user interactions

#### Data Issues
- [ ] Check database permissions
- [ ] Verify API responses
- [ ] Test with different user roles
- [ ] Check data transformation logic

### Remember
- Always reproduce the issue first
- Use systematic debugging approaches
- Check the simplest things first
- Document solutions for future reference
- Test fixes thoroughly before deploying