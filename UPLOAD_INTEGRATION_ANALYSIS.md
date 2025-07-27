# Upload System Integration Analysis

## Phase 1: Current State Documentation

### Current Upload Components in Use

#### 1. ProjectImageUpload Component
**Location**: `/src/components/ui/project-image-upload.tsx`
**Usage in ProjectDocumentsSection**: Lines 718, 746, 774

**Current Interface**:
```typescript
interface ProjectImageUploadProps {
  imageType: 'inspiration' | 'progress' | 'profile';
  projectId?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  className?: string;
  profileImage?: string | null;
  onSelectProfileImage?: (url: string) => void;
  hookInstance?: UseProjectImagesReturn;
}
```

**Current Usage Patterns**:
- **Profile Images**: `maxImages={1}`, uses `handleProfileImageChange`
- **Inspiration Images**: Uses `inspirationHook` instance
- **Progress Images**: Uses `progressHook` instance

#### 2. DocumentUpload Component
**Location**: `/src/components/documents/DocumentUpload.tsx`
**Usage in ProjectDocumentsSection**: Line 902

**Current Interface**:
```typescript
interface DocumentUploadProps {
  projectId: string;
  phaseId?: string;
  onUploadComplete?: (documentId: string) => void;
  onCancel?: () => void;
  className?: string;
}
```

**Current Usage Pattern**:
- Triggered by `showDocumentUpload` state
- Uses `handleUploadComplete` callback
- Integrated with document management system

#### 3. useProjectImages Hook
**Location**: `/src/hooks/useProjectImages.ts`
**Usage**: Three separate instances for different image types

**Current Hook Instances**:
```typescript
// Inspiration images
const inspirationHook = useProjectImages({
  imageType: 'inspiration',
  projectId: project.id,
  initialImages: project.inspirationalImages?.map(img => img.url) || [],
  onChange: (urls) => { /* handle inspiration change */ }
});

// Progress images  
const progressHook = useProjectImages({
  imageType: 'progress', 
  projectId: project.id,
  initialImages: project.progressImages?.map(img => img.url) || [],
  onChange: (urls) => { /* handle progress change */ }
});

// Profile image
const profileHook = useProjectImages({
  imageType: 'profile',
  projectId: project.id,
  initialImages: currentProfileImage ? [currentProfileImage] : [],
  onChange: (urls) => handleProfileImageChange(urls[0] || '')
});
```

### Current Upload Flows

#### Image Upload Flow
1. **User Interaction**: Click on upload placeholder in ProjectImageUpload
2. **File Selection**: Native file input with image type restrictions
3. **Local Preview**: Images stored in `localFiles` state with blob URLs
4. **Upload Trigger**: Manual upload via form submission or auto-upload
5. **Progress Tracking**: Upload progress shown in component
6. **Completion**: URLs returned via `onChange` callback

#### Document Upload Flow
1. **User Interaction**: Click "Upload Documents" button
2. **Modal Display**: `showDocumentUpload` state triggers DocumentUpload modal
3. **File Selection**: Drag & drop or file picker with document type validation
4. **Metadata Entry**: Document type, name, and description fields
5. **Batch Upload**: All files uploaded simultaneously
6. **Completion**: `onUploadComplete` callback with document ID

### Integration Points for SimplifiedUpload

#### 1. Profile Image Upload
**Current**: `ProjectImageUpload` with `imageType="profile"`
**New**: `SimplifiedUpload` with `type="images"` and `maxFiles={1}`

**Integration Requirements**:
- Replace lines 718-727 in ProjectDocumentsSection
- Maintain `handleProfileImageChange` callback
- Preserve profile image selection logic

#### 2. Inspiration Images Upload  
**Current**: `ProjectImageUpload` with `imageType="inspiration"`
**New**: `SimplifiedUpload` with `type="images"` and `maxFiles={20}`

**Integration Requirements**:
- Replace lines 746-760 in ProjectDocumentsSection
- Maintain inspiration images array handling
- Preserve image preview functionality

#### 3. Progress Images Upload
**Current**: `ProjectImageUpload` with `imageType="progress"`  
**New**: `SimplifiedUpload` with `type="images"` and `maxFiles={20}`

**Integration Requirements**:
- Replace lines 774-788 in ProjectDocumentsSection
- Maintain progress images array handling
- Preserve construction progress context

#### 4. Document Upload
**Current**: `DocumentUpload` component in modal
**New**: `SimplifiedUpload` with `type="documents"`

**Integration Requirements**:
- Replace lines 902-906 in ProjectDocumentsSection
- Maintain `handleUploadComplete` callback
- Preserve document metadata handling
- Replace modal trigger logic

### Dependency Analysis

#### No Circular Import Risks Detected
- New simplified upload components are self-contained
- No existing imports of new components found
- Clean separation between old and new systems

#### Current Dependencies to Replace
```typescript
// Remove these imports:
import { ProjectImageUpload } from '@/components/ui/project-image-upload';
import { useProjectImages } from '@/hooks/useProjectImages';
import { DocumentUpload, DocumentList } from '@/components/documents';

// Add these imports:
import SimplifiedUpload from '@/components/upload/SimplifiedUpload';
import { UploadResult } from '@/types/upload';
```

### State Management Changes Required

#### Current State Variables to Update
```typescript
// Current image upload states
interface ImageUploadStates {
  imagesCollapsed: boolean;
  previewImage: { url: string; caption?: string; index?: number } | null;
  documentsCollapsed?: boolean;
  showDocumentUpload?: boolean;  // ← Remove this
  showImageUpload?: boolean;     // ← Remove this
}

// Current hook instances (remove these)
const inspirationHook = useProjectImages({ ... });
const progressHook = useProjectImages({ ... });
const profileHook = useProjectImages({ ... });
```

#### New State Management Approach
- Remove complex hook instances
- Simplify state to just uploaded file tracking
- Use SimplifiedUpload's internal state management
- Maintain only essential UI state (collapsed, preview)

### Rollback Points

#### Checkpoint 1: Import Replacement
- Replace component imports
- Verify build still compiles
- No functional changes yet

#### Checkpoint 2: Profile Image Integration
- Replace profile image upload component
- Test profile image selection
- Verify save functionality

#### Checkpoint 3: Inspiration/Progress Images
- Replace inspiration and progress image components
- Test multi-image upload
- Verify image preview functionality

#### Checkpoint 4: Document Upload Integration
- Replace document upload modal
- Test document upload flow
- Verify document metadata handling

#### Checkpoint 5: Cleanup
- Remove unused imports and state
- Clean up old hook instances
- Final testing and validation

### Risk Assessment

#### Low Risk Items
- Import replacement (easily reversible)
- Component interface compatibility
- Build system integration

#### Medium Risk Items  
- State management changes
- Callback function integration
- UI/UX consistency

#### High Risk Items
- Document metadata handling
- Image preview functionality
- Upload progress tracking
- Error handling integration

### Success Criteria

#### Functional Requirements
- ✅ All existing upload functionality preserved
- ✅ Mobile-first responsive design maintained
- ✅ Error handling and validation working
- ✅ Progress tracking functional
- ✅ File type restrictions enforced

#### Performance Requirements
- ✅ Bundle size reduced (target: -40%)
- ✅ Upload speed maintained or improved
- ✅ Memory usage optimized (no leaks)
- ✅ Mobile performance acceptable

#### Code Quality Requirements
- ✅ TypeScript compilation clean
- ✅ No ESLint errors
- ✅ Consistent code style
- ✅ Proper error boundaries

## Next Steps: Phase 2 Implementation

1. **Replace ProjectImageUpload imports** with SimplifiedUpload
2. **Update component usage** for each image type
3. **Integrate callback functions** with new UploadResult format
4. **Replace DocumentUpload modal** with SimplifiedUpload
5. **Test each integration point** before proceeding
6. **Remove unused code** and clean up imports

---
*Generated: 2025-01-26 17:31:15*
*Branch: feature/simplified-upload-integration*
