# BuildEase Media Upload and Retrieval Refactoring Plan

## Executive Summary

This document outlines the comprehensive refactoring plan for centralizing all BuildEase project media storage in the `be_document` table. The current system uses multiple storage patterns that create complexity and potential data inconsistencies.

## Current System Analysis

### Storage Patterns
- **Profile Images**: Single field `project.profile_image` (string URL)
- **Inspiration Images**: Array field `project.inspiration_images[]` (string URLs)
- **Progress Images**: **Dual storage** - both `project.progress_images[]` array AND Supabase storage buckets
- **Documents**: Already properly stored in `be_document` table with metadata

### Key Issues
1. **Data Inconsistency**: Multiple sources of truth for media
2. **Complex Retrieval Logic**: Different patterns for different media types
3. **Maintenance Overhead**: Duplicate code across upload/retrieval operations
4. **Performance Impact**: Multiple queries and data processing steps

## Target Architecture

### Unified Storage Model
```typescript
interface MediaItem {
  id: string;
  projectId: string;
  phaseId?: string;
  category: 'profile_image' | 'inspiration_image' | 'progress_image' | 'document';
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string; // Storage bucket path
  publicUrl?: string; // Generated on-demand
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### Core Principles
1. **Single Source of Truth**: All media stored in `be_document` table
2. **Unified Operations**: Single hook for all CRUD operations
3. **Category-Based Organization**: Clear categorization for UI filtering
4. **Mobile-First Performance**: Optimized for construction site usage

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Objective**: Establish unified data layer and database schema

**Tasks**:
1. Complete `useMediaOperations` hook implementation
2. Create `useProjectMedia` unified data fetching hook
3. Database schema updates for media categories
4. Data migration scripts for existing media
5. Database indexes for performance optimization

**Success Criteria**:
- All media queryable from `be_document` table
- Unified hooks ready for component integration
- Data migration completed successfully

### Phase 2: Upload Migration (Week 2)
**Objective**: Centralize all upload operations

**Tasks**:
1. Update `SimplifiedUpload` to use unified operations
2. Migrate upload mutation hooks to `be_document` CRUD
3. Update `useImageMutations` for document-based operations
4. Ensure all uploads create proper database records

**Success Criteria**:
- All uploads create `be_document` records
- Consistent upload behavior across media types
- Proper error handling and user feedback

### Phase 3: Display Migration (Week 3)
**Objective**: Unify media retrieval and display

**Tasks**:
1. Replace `useMediaData` with `useProjectMedia`
2. Update `ProjectDocumentsSection` for single data source
3. Implement proper cache invalidation strategies
4. Update display components for unified data

**Success Criteria**:
- UI displays media from centralized source
- Consistent loading states and error handling
- Proper cache management

### Phase 4: Legacy Cleanup (Week 4)
**Objective**: Remove deprecated code and patterns

**Tasks**:
1. Remove project table media fields
2. Clean up unused hooks (`useProjectStorageImages`)
3. Remove duplicate code and imports
4. Update TypeScript interfaces

**Success Criteria**:
- Clean, maintainable codebase
- No unused or deprecated code
- Consistent coding patterns

### Phase 5: Testing & Optimization (Week 5)
**Objective**: Ensure production readiness

**Tasks**:
1. Performance testing and mobile optimization
2. Cache strategy validation
3. End-to-end workflow verification
4. Load testing and error scenario testing

**Success Criteria**:
- <2s load time for media grids on mobile
- 100% media persistence to database
- Seamless user experience

## Migration Impact Assessment

### High-Impact Components (Require Significant Changes)
- `useMediaData.ts` - Replace project field processing
- `useImageMutations.ts` - Convert to `be_document` CRUD
- `useProjectWithActivityTracking.ts` - Update operations

### Medium-Impact Components (Require Updates)
- `SimplifiedUpload.tsx` - Use unified operations
- `ProjectDocumentsSection.tsx` - Single data source
- Upload mutation hooks - Standardize operations

### Low-Impact Components (Minimal Changes)
- `DocumentUploadForm.tsx` - Already uses correct pattern
- `MediaGrid.tsx` - Same interface, different source
- UI display components - Minimal changes

## Database Schema Changes

### Required Updates
```sql
-- Ensure category enum includes all media types
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'profile_image';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'inspiration_image';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'progress_image';

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_be_document_project_category 
ON be_document(project_id, category);

CREATE INDEX IF NOT EXISTS idx_be_document_project_created 
ON be_document(project_id, created_at DESC);
```

### Data Migration Script
```sql
-- Migrate profile images
INSERT INTO be_document (project_id, category, file_name, file_path, file_type, created_at, uploaded_by)
SELECT 
  id as project_id,
  'profile_image' as category,
  'profile.jpg' as file_name,
  profile_image as file_path,
  'image/jpeg' as file_type,
  created_at,
  created_by as uploaded_by
FROM be_project 
WHERE profile_image IS NOT NULL;

-- Migrate inspiration images
INSERT INTO be_document (project_id, category, file_name, file_path, file_type, created_at, uploaded_by)
SELECT 
  p.id as project_id,
  'inspiration_image' as category,
  'inspiration_' || generate_random_uuid() || '.jpg' as file_name,
  unnest(p.inspiration_images) as file_path,
  'image/jpeg' as file_type,
  p.created_at,
  p.created_by as uploaded_by
FROM be_project p
WHERE inspiration_images IS NOT NULL AND array_length(inspiration_images, 1) > 0;

-- Migrate progress images
INSERT INTO be_document (project_id, category, file_name, file_path, file_type, created_at, uploaded_by)
SELECT 
  p.id as project_id,
  'progress_image' as category,
  'progress_' || generate_random_uuid() || '.jpg' as file_name,
  unnest(p.progress_images) as file_path,
  'image/jpeg' as file_type,
  p.created_at,
  p.created_by as uploaded_by
FROM be_project p
WHERE progress_images IS NOT NULL AND array_length(progress_images, 1) > 0;
```

## Risk Mitigation

### Backward Compatibility
- Support dual sources during migration period
- Gradual component migration without breaking changes
- Feature flags for controlled rollout
- Comprehensive rollback procedures

### Data Integrity
- Validation scripts for migration accuracy
- Backup procedures before each phase
- Incremental migration with verification steps
- Monitoring and alerting for issues

### Performance Considerations
- Query optimization and proper indexing
- Cache warming strategies
- Progressive loading for large media sets
- Mobile-first optimization throughout

## Success Metrics

### Performance Targets
- **Load Time**: <2s for media grids on mobile
- **Upload Speed**: <5s for typical image uploads
- **Cache Hit Rate**: >90% for frequently accessed media

### Quality Targets
- **Data Consistency**: 100% media persistence to database
- **User Experience**: Seamless upload/delete with immediate feedback
- **Code Quality**: 50% reduction in media-related complexity

### Reliability Targets
- **Uptime**: 99.9% availability during migration
- **Error Rate**: <1% for media operations
- **Data Loss**: 0% during migration process

## Post-Migration Benefits

### Immediate Improvements
- Single source of truth for all media
- Unified CRUD operations across media types
- Better metadata and search capabilities
- Improved error handling and user feedback

### Long-term Advantages
- Easier to add new media types
- Better mobile performance and offline support
- Centralized access control and permissions
- Simplified maintenance and debugging

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1 | Week 1 | Unified hooks, DB schema, migration |
| Phase 2 | Week 2 | Upload operations centralized |
| Phase 3 | Week 3 | Display components unified |
| Phase 4 | Week 4 | Legacy code cleanup |
| Phase 5 | Week 5 | Testing and optimization |

**Total Duration**: 5 weeks
**Go-Live Target**: End of Week 5

This plan ensures a systematic, low-risk migration to a more maintainable and scalable media management system for the BuildEase construction management platform.
