# BuildEase Media Implementation Plan

**Implementation Date:** September 1, 2025  
**Estimated Duration:** 5 phases over 3-4 weeks  
**Approach:** Systematic consolidation with no backwards compatibility requirements

---

## Implementation Overview

This plan systematically consolidates BuildEase's media functionality from ~2,500 lines across 15+ files down to ~1,500 lines in 3 core files. Each phase includes clear instructions, expected outcomes, file modifications, testing criteria, and rollback procedures.

**Target Architecture:**
- **Single Service:** `MediaService.ts` (enhanced)
- **Single Hook:** `useMedia.ts` (expanded)  
- **Single Component:** `MediaUpload.tsx` (standardized)
- **Single Type System:** `upload.ts` (consolidated)

---

## Phase 1: Critical Bug Fixes

**Duration:** 2-3 days  
**Priority:** High  
**Objective:** Fix all identified critical bugs before consolidation

### Step 1.1: Fix Database Schema Conflicts

**What to do:**
1. Standardize all queries to use `be_media_items` table
2. Update `useProjectMedia.ts` query structure
3. Fix query key mismatches in cache invalidation

**File Modifications:**
```typescript
// src/hooks/useProjectMedia.ts - Line 103
// BEFORE:
.from('be_media_items')

// AFTER: 
.from('be_media_items')
.select(`
  id,
  name,
  description,
  media_type,
  category,
  project_id,
  phase_id,
  file_path,
  file_size_bytes,
  mime_type,
  metadata,
  created_at,
  updated_at
`)
```

**Expected Outcome:**
- All queries use consistent table structure
- No more schema conflict errors
- Consistent data shape across all media operations

**Testing Criteria:**
- [ ] All media queries return data without errors
- [ ] Project media displays correctly in UI
- [ ] Document operations work without conflicts
- [ ] No console errors related to database schema

**Rollback Procedure:**
```bash
git checkout HEAD~1 -- src/hooks/useProjectMedia.ts
```

### Step 1.2: Resolve Type System Conflicts

**What to do:**
1. Create unified MediaItem interface in `types/media.ts`
2. Update all files to use unified interface
3. Fix category mapping logic

**File Modifications:**

**Create:** `src/types/media.ts`
```typescript
export interface MediaItem {
  id: string;
  name: string;
  description?: string;
  media_type: 'PHOTO' | 'VIDEO' | 'DOCUMENT';
  category: 'profile_image' | 'inspiration_image' | 'progress_image' | 'document';
  project_id: string;
  phase_id?: string;
  file_path: string;
  file_size_bytes: number;
  mime_type: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type MediaCategory = 'profile_image' | 'inspiration_image' | 'progress_image' | 'document';
```

**Update:** `src/hooks/useMediaOperations.ts`
```typescript
// BEFORE: Lines 32-46 (remove duplicate interface)
// AFTER: 
import type { MediaItem, MediaCategory } from '@/types/media';
```

**Update:** `src/services/MediaService.ts`
```typescript
// BEFORE: Lines 14-28 (remove duplicate interface)
// AFTER:
import type { MediaItem, MediaCategory } from '@/types/media';
```

**Expected Outcome:**
- Single MediaItem interface used across all files
- No more type conflicts or compilation errors
- Consistent category mapping logic

**Testing Criteria:**
- [ ] TypeScript compilation succeeds without errors
- [ ] All media operations use consistent types
- [ ] Category mapping works correctly for all media types
- [ ] IDE provides proper autocompletion

**Rollback Procedure:**
```bash
rm src/types/media.ts
git checkout HEAD~1 -- src/hooks/useMediaOperations.ts src/services/MediaService.ts
```

### Step 1.3: Fix Memory Management Issues

**What to do:**
1. Implement centralized blob URL cleanup
2. Fix ProfileCard preview URL cleanup timing
3. Add proper component unmount handlers

**File Modifications:**

**Update:** `src/components/settings/ProfileCard.tsx`
```typescript
// BEFORE: Line 111
setTimeout(() => onUploadStateChange({ showProgress: false }), 500);

// AFTER:
useEffect(() => {
  return () => {
    // Cleanup any remaining preview URLs on unmount
    if (formData.pictureUrl && formData.pictureUrl.startsWith('blob:')) {
      revokePreviewUrl(formData.pictureUrl);
    }
  };
}, [formData.pictureUrl]);

setTimeout(() => {
  onUploadStateChange({ showProgress: false });
  // Cleanup preview URL after upload completes
  if (previewUrl) {
    revokePreviewUrl(previewUrl);
  }
}, 500);
```

**Create:** `src/utils/memoryManager.ts`
```typescript
class MemoryManager {
  private previewUrls = new Set<string>();

  createPreviewUrl(file: File): string {
    const url = URL.createObjectURL(file);
    this.previewUrls.add(url);
    return url;
  }

  revokePreviewUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
      this.previewUrls.delete(url);
    }
  }

  cleanup(): void {
    this.previewUrls.forEach(url => URL.revokeObjectURL(url));
    this.previewUrls.clear();
  }
}

export const memoryManager = new MemoryManager();
```

**Expected Outcome:**
- No memory leaks from blob URLs
- Proper cleanup on component unmount
- Centralized memory management

**Testing Criteria:**
- [ ] Memory usage doesn't increase with repeated uploads
- [ ] No blob URLs remain after component unmount
- [ ] Preview functionality works correctly
- [ ] No console warnings about memory leaks

**Rollback Procedure:**
```bash
rm src/utils/memoryManager.ts
git checkout HEAD~1 -- src/components/settings/ProfileCard.tsx
```

---

## Phase 2: Duplication Removal

**Duration:** 5-7 days  
**Priority:** High  
**Objective:** Consolidate duplicate functionalities into unified implementations

### Step 2.1: Consolidate Service Layer

**What to do:**
1. Enhance `MediaService.ts` as primary service
2. Migrate document operations from `useDocuments.ts`
3. Mark `storageService.ts` as deprecated

**File Modifications:**

**Update:** `src/services/MediaService.ts`
```typescript
// Add document-specific operations
export class MediaService {
  // ... existing methods ...

  /**
   * Get documents for a specific project
   */
  static async getProjectDocuments(projectId: string): Promise<MediaItem[]> {
    const { data, error } = await supabase
      .from('be_media_items')
      .select('*')
      .eq('project_id', projectId)
      .eq('category', 'document')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update document metadata
   */
  static async updateDocument(
    mediaId: string, 
    updates: Partial<Pick<MediaItem, 'name' | 'description' | 'phase_id'>>
  ): Promise<MediaItem> {
    const { data, error } = await supabase
      .from('be_media_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', mediaId)
      .select()
      .single();

    if (error) {
      throw new Error(`Update failed: ${error.message}`);
    }

    return data;
  }
}
```

**Create:** `src/services/storageService.deprecated.ts`
```typescript
// Move storageService.ts content here and add deprecation notice
/**
 * @deprecated This service is deprecated. Use MediaService instead.
 * This file will be removed in the next major version.
 */
```

**Expected Outcome:**
- Single MediaService handles all media operations
- Document operations integrated into unified service
- Legacy storageService marked for removal

**Testing Criteria:**
- [ ] All upload operations work through MediaService
- [ ] Document operations function correctly
- [ ] No functionality lost in migration
- [ ] Performance maintained or improved

**Rollback Procedure:**
```bash
git checkout HEAD~1 -- src/services/MediaService.ts
mv src/services/storageService.deprecated.ts src/services/storageService.ts
```

### Step 2.2: Consolidate Hook Layer

**What to do:**
1. Expand `useMedia.ts` with project-specific queries
2. Integrate document operations
3. Remove redundant hooks

**File Modifications:**

**Update:** `src/hooks/useMedia.ts`
```typescript
// Add project-specific query functions
export function useProjectMedia(projectId: string, category?: MediaCategory) {
  return useQuery({
    queryKey: ['media', 'project', projectId, category],
    queryFn: async () => {
      if (category) {
        return MediaService.getProjectMedia(projectId, category);
      }
      return MediaService.getProjectMedia(projectId);
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  });
}

// Add document-specific operations
export function useDocumentOperations(projectId: string) {
  const queryClient = useQueryClient();

  const updateDocument = useMutation({
    mutationFn: ({ documentId, updates }: { 
      documentId: string; 
      updates: Partial<Pick<MediaItem, 'name' | 'description' | 'phase_id'>>
    }) => MediaService.updateDocument(documentId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media', 'project', projectId] });
    }
  });

  return { updateDocument };
}
```

**Mark for deletion:**
- `src/hooks/useProjectMedia.ts` (198 lines)
- `src/hooks/useMediaOperations.ts` (207 lines)
- Document operations from `src/hooks/queries/useDocuments.ts`

**Expected Outcome:**
- Single useMedia hook handles all media operations
- Project-specific and document queries integrated
- ~400 lines of duplicate code removed

**Testing Criteria:**
- [ ] All media queries work through useMedia hook
- [ ] Project media displays correctly
- [ ] Document operations function properly
- [ ] Cache invalidation works correctly

**Rollback Procedure:**
```bash
git checkout HEAD~1 -- src/hooks/useMedia.ts
git checkout HEAD~1 -- src/hooks/useProjectMedia.ts src/hooks/useMediaOperations.ts
```

### Step 2.3: Consolidate Upload Functions

**What to do:**
1. Standardize all uploads through MediaUpload component
2. Remove duplicate upload logic from ProfileCard
3. Consolidate imageStore upload functionality

**File Modifications:**

**Update:** `src/components/settings/ProfileCard.tsx`
```typescript
// BEFORE: Lines 62-126 (custom upload logic)
// AFTER: Use MediaUpload component

import { MediaUpload } from '@/components/MediaUpload';

// Replace custom upload handler with:
const handleProfilePictureUpload = (results: UploadResult[]) => {
  if (results.length > 0 && results[0].url) {
    onFormDataChange({ pictureUrl: results[0].url });
    toast({
      title: "Image uploaded",
      description: "Profile picture uploaded successfully!",
    });
  }
};

// Replace file input with MediaUpload component:
<MediaUpload
  type="profile"
  maxFiles={1}
  onUploadComplete={handleProfilePictureUpload}
  className="absolute -bottom-1 -right-1"
/>
```

**Update:** `src/stores/createProject/imageStore.ts`
```typescript
// Remove upload logic (lines 200-400), keep only state management
// Upload operations will go through MediaUpload component
```

**Expected Outcome:**
- All uploads use MediaUpload component
- Duplicate upload logic removed
- Consistent upload experience across app

**Testing Criteria:**
- [ ] Profile image upload works correctly
- [ ] Project image upload functions properly
- [ ] Document upload operates as expected
- [ ] Upload progress and error handling consistent

**Rollback Procedure:**
```bash
git checkout HEAD~1 -- src/components/settings/ProfileCard.tsx
git checkout HEAD~1 -- src/stores/createProject/imageStore.ts
```

---

## Phase 3: Code Cleanup

**Duration:** 2-3 days  
**Priority:** Medium  
**Objective:** Remove obsolete code and files

### Step 3.1: Remove Empty and Obsolete Files

**What to do:**
1. Delete empty useImageMutations.ts
2. Remove deprecated storageService
3. Clean up unused imports

**Files to Delete:**
```bash
rm src/hooks/mutations/useImageMutations.ts
rm src/services/storageService.deprecated.ts
rm src/hooks/useProjectMedia.ts
rm src/hooks/useMediaOperations.ts
```

**Files to Update:**
- Remove unused imports from all remaining files
- Update import paths to use consolidated modules

**Expected Outcome:**
- 6 obsolete files removed
- Clean import statements
- Reduced bundle size

**Testing Criteria:**
- [ ] Application builds without errors
- [ ] No unused import warnings
- [ ] All functionality still works
- [ ] Bundle size reduced

**Rollback Procedure:**
```bash
git checkout HEAD~1 -- src/hooks/mutations/useImageMutations.ts
git checkout HEAD~1 -- src/hooks/useProjectMedia.ts
git checkout HEAD~1 -- src/hooks/useMediaOperations.ts
```

### Step 3.2: Consolidate Type Definitions

**What to do:**
1. Move all upload types to `upload.ts`
2. Remove duplicate type files
3. Update all imports

**File Modifications:**

**Update:** `src/types/upload.ts`
```typescript
// Consolidate all upload-related types here
export * from './fileUpload'; // Import existing types
export * from './media'; // Import media types

// Remove duplicate definitions
```

**Delete:**
- `src/types/fileUpload.ts` (content moved to upload.ts)

**Update all import statements:**
```typescript
// BEFORE:
import type { FileUploadOptions } from '@/types/fileUpload';
import type { MediaItem } from '@/types/media';

// AFTER:
import type { FileUploadOptions, MediaItem } from '@/types/upload';
```

**Expected Outcome:**
- Single source for all upload and media types
- Reduced type definition duplication
- Cleaner import statements

**Testing Criteria:**
- [ ] TypeScript compilation succeeds
- [ ] All type imports resolve correctly
- [ ] IDE autocompletion works properly
- [ ] No duplicate type definitions

**Rollback Procedure:**
```bash
git checkout HEAD~1 -- src/types/upload.ts
git checkout HEAD~1 -- src/types/fileUpload.ts
```

### Step 3.3: Remove Redundant Bucket Configurations

**What to do:**
1. Standardize on single bucket approach
2. Remove multiple bucket configurations
3. Update all storage operations

**File Modifications:**

**Update:** `src/services/MediaService.ts`
```typescript
// Standardize on single bucket
const BUCKET_NAME = 'project-media';

// Remove multiple bucket configurations
// Use path-based organization instead:
// projects/{projectId}/profile/{filename}
// projects/{projectId}/inspiration/{filename}
// projects/{projectId}/progress/{filename}
// projects/{projectId}/documents/{filename}
```

**Expected Outcome:**
- Single bucket for all media storage
- Path-based organization
- Simplified storage logic

**Testing Criteria:**
- [ ] All uploads work with single bucket
- [ ] File organization is logical
- [ ] No storage conflicts
- [ ] File retrieval works correctly

**Rollback Procedure:**
```bash
git checkout HEAD~1 -- src/services/MediaService.ts
```

---

## Phase 4: Performance Optimization

**Duration:** 2-3 days  
**Priority:** Medium  
**Objective:** Implement performance improvements

### Step 4.1: Optimize Query Patterns

**What to do:**
1. Implement smart caching strategies
2. Optimize query key patterns
3. Add proper query dependencies

**File Modifications:**

**Update:** `src/hooks/useMedia.ts`
```typescript
// Implement hierarchical query keys
const queryKeys = {
  media: ['media'] as const,
  projects: (projectId: string) => [...queryKeys.media, 'project', projectId] as const,
  categories: (projectId: string, category: MediaCategory) => 
    [...queryKeys.projects(projectId), 'category', category] as const,
  phases: (phaseId: string) => [...queryKeys.media, 'phase', phaseId] as const,
};

// Implement smart invalidation
const invalidateMediaQueries = (projectId: string, category?: MediaCategory) => {
  if (category) {
    queryClient.invalidateQueries({ queryKey: queryKeys.categories(projectId, category) });
  } else {
    queryClient.invalidateQueries({ queryKey: queryKeys.projects(projectId) });
  }
};
```

**Expected Outcome:**
- Optimized cache performance
- Reduced unnecessary re-fetches
- Better query organization

**Testing Criteria:**
- [ ] Queries cache properly
- [ ] Invalidation works correctly
- [ ] No unnecessary network requests
- [ ] UI updates responsively

**Rollback Procedure:**
```bash
git checkout HEAD~1 -- src/hooks/useMedia.ts
```

### Step 4.2: Implement Mobile Optimizations

**What to do:**
1. Enhance network condition detection
2. Optimize batch upload for mobile
3. Implement progressive loading

**File Modifications:**

**Update:** `src/services/MediaService.ts`
```typescript
// Enhanced mobile optimization
class MobileOptimizer {
  static async getOptimalBatchSize(): Promise<number> {
    // Detect connection type
    const connection = (navigator as any).connection;
    if (connection) {
      switch (connection.effectiveType) {
        case 'slow-2g':
        case '2g':
          return 1;
        case '3g':
          return 2;
        case '4g':
        default:
          return 3;
      }
    }
    return 2; // Conservative default
  }

  static async optimizeForMobile(files: File[]): Promise<File[]> {
    // Implement image compression for mobile
    return files; // Placeholder for compression logic
  }
}
```

**Expected Outcome:**
- Better mobile upload performance
- Network-aware batch sizing
- Reduced data usage on slow connections

**Testing Criteria:**
- [ ] Mobile uploads work smoothly
- [ ] Batch sizes adapt to network conditions
- [ ] No timeouts on slow connections
- [ ] Progress tracking accurate

**Rollback Procedure:**
```bash
git checkout HEAD~1 -- src/services/MediaService.ts
```

### Step 4.3: Optimize Bundle Size

**What to do:**
1. Implement code splitting for media components
2. Lazy load heavy dependencies
3. Remove unused code paths

**File Modifications:**

**Update:** `src/components/MediaUpload.tsx`
```typescript
// Implement lazy loading for heavy dependencies
const ImageCompressor = lazy(() => import('@/utils/imageCompressor'));
const VideoProcessor = lazy(() => import('@/utils/videoProcessor'));

// Use dynamic imports for optional features
const loadAdvancedFeatures = async () => {
  const { AdvancedUploadFeatures } = await import('@/components/AdvancedUploadFeatures');
  return AdvancedUploadFeatures;
};
```

**Expected Outcome:**
- Reduced initial bundle size
- Faster initial page load
- Better code splitting

**Testing Criteria:**
- [ ] Bundle size reduced
- [ ] Initial load time improved
- [ ] Lazy loading works correctly
- [ ] No functionality lost

**Rollback Procedure:**
```bash
git checkout HEAD~1 -- src/components/MediaUpload.tsx
```

---

## Phase 5: Testing & Validation

**Duration:** 2-3 days  
**Priority:** High  
**Objective:** Ensure all functionality works correctly

### Step 5.1: Integration Testing

**What to do:**
1. Test all upload scenarios
2. Validate network error handling
3. Test mobile upload performance

**Testing Scenarios:**

**Profile Image Upload:**
```typescript
// Test profile image upload
describe('Profile Image Upload', () => {
  it('should upload profile image successfully', async () => {
    // Test implementation
  });
  
  it('should handle upload errors gracefully', async () => {
    // Test error handling
  });
  
  it('should show progress correctly', async () => {
    // Test progress tracking
  });
});
```

**Project Media Upload:**
```typescript
// Test project media upload
describe('Project Media Upload', () => {
  it('should upload inspiration images', async () => {
    // Test inspiration upload
  });
  
  it('should upload progress images', async () => {
    // Test progress upload
  });
  
  it('should upload documents', async () => {
    // Test document upload
  });
});
```

**Expected Outcome:**
- All upload scenarios work correctly
- Error handling functions properly
- Progress tracking accurate

**Testing Criteria:**
- [ ] Profile uploads work
- [ ] Project image uploads function
- [ ] Document uploads operate correctly
- [ ] Error handling works
- [ ] Progress tracking accurate
- [ ] Mobile performance acceptable

### Step 5.2: Performance Validation

**What to do:**
1. Measure bundle size reduction
2. Test memory usage improvements
3. Validate mobile performance

**Performance Metrics:**

**Bundle Size:**
```bash
# Before consolidation
npm run build
# Note bundle sizes

# After consolidation
npm run build
# Compare bundle sizes
```

**Memory Usage:**
```javascript
// Monitor memory usage during uploads
const measureMemoryUsage = () => {
  if (performance.memory) {
    console.log('Used:', performance.memory.usedJSHeapSize);
    console.log('Total:', performance.memory.totalJSHeapSize);
    console.log('Limit:', performance.memory.jsHeapSizeLimit);
  }
};
```

**Expected Outcome:**
- Bundle size reduced by ~30%
- Memory usage improved
- Mobile performance enhanced

**Testing Criteria:**
- [ ] Bundle size reduced significantly
- [ ] Memory usage stable
- [ ] Mobile uploads smooth
- [ ] No performance regressions

### Step 5.3: Migration Verification

**What to do:**
1. Verify all existing functionality preserved
2. Test backward compatibility
3. Document any breaking changes

**Verification Checklist:**
- [ ] All upload types work (profile, inspiration, progress, documents)
- [ ] Media display functions correctly
- [ ] Error handling preserved
- [ ] Progress tracking maintained
- [ ] Mobile functionality intact
- [ ] Cache invalidation works
- [ ] Query performance acceptable

**Expected Outcome:**
- All functionality preserved
- No breaking changes for users
- Clean, maintainable codebase

**Final Testing Criteria:**
- [ ] Complete upload workflow works
- [ ] Media management functions properly
- [ ] No console errors
- [ ] Performance meets requirements
- [ ] Mobile experience smooth
- [ ] Code quality improved

---

## Rollback Strategy

### Emergency Rollback (Complete)
```bash
# Rollback entire implementation
git reset --hard HEAD~[number_of_commits]
npm install
npm run build
```

### Selective Rollback (Phase-specific)
```bash
# Rollback specific phase
git checkout HEAD~[commits_for_phase] -- [affected_files]
npm run build
```

### Validation After Rollback
- [ ] Application builds successfully
- [ ] All functionality works
- [ ] No console errors
- [ ] Tests pass

---

## Success Metrics

### Code Quality Metrics
- **Lines of Code:** Reduced from ~2,500 to ~1,500 (40% reduction)
- **Files:** Reduced from 15+ to 3 core files
- **Duplication:** Eliminated 6 redundant implementations
- **Type Safety:** Single source of truth for all types

### Performance Metrics
- **Bundle Size:** Reduced by 30%+
- **Memory Usage:** No memory leaks
- **Mobile Performance:** Smooth uploads on 3G+
- **Cache Performance:** Optimized invalidation patterns

### Maintainability Metrics
- **Single Service:** MediaService.ts for all operations
- **Single Hook:** useMedia.ts for all queries
- **Single Component:** MediaUpload.tsx for all uploads
- **Single Type System:** upload.ts for all types

### User Experience Metrics
- **Upload Success Rate:** 99%+
- **Error Recovery:** Graceful error handling
- **Progress Tracking:** Accurate progress indicators
- **Mobile Experience:** Optimized for construction sites

---

## Post-Implementation Tasks

### Documentation Updates
1. Update architecture documentation
2. Create migration guide for future developers
3. Document new API patterns
4. Update component usage examples

### Monitoring Setup
1. Add performance monitoring for uploads
2. Set up error tracking for media operations
3. Monitor bundle size in CI/CD
4. Track mobile performance metrics

### Future Enhancements
1. Image compression for mobile uploads
2. Video upload support
3. Bulk operations for media management
4. Advanced caching strategies

---

## Conclusion

This implementation plan provides a systematic approach to consolidating BuildEase's media functionality. Each phase builds upon the previous one, ensuring a stable transition from the current fragmented system to a unified, maintainable architecture.

The plan prioritizes critical bug fixes first, then systematically removes duplication, cleans up obsolete code, optimizes performance, and validates the results. With proper testing and rollback procedures, this consolidation will result in a more maintainable, performant, and user-friendly media system.
