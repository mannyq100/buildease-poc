# Unified Media Architecture

## Overview

The BuildEase platform now uses a unified media management system that consolidates all media storage and operations into the `be_document` table. This eliminates data duplication and provides consistent metadata handling across all media types.

## Key Components

### Database Schema

**Primary Table: `be_document`**
- Stores all media types: documents, images, and files
- Uses `category` field to distinguish between media types:
  - `profile_image`: Project profile/hero images
  - `inspiration_image`: Inspiration and reference images
  - `progress_image`: Construction progress photos
  - `document`: Documents and other file types

**Media Categories Enum:**
```sql
CREATE TYPE construction_mgr.media_category AS ENUM (
  'profile_image',
  'inspiration_image', 
  'progress_image',
  'document'
);
```

### Frontend Architecture

#### Core Hooks

**`useMediaOperations`** - Central hook for all media CRUD operations:
```typescript
const mediaOperations = useMediaOperations(projectId);

// Upload operations
await mediaOperations.upload.uploadMedia(results, 'profile_image');
await mediaOperations.upload.uploadImages(results, 'inspiration_image');
await mediaOperations.upload.uploadDocuments(results, phaseId);

// Media management
await mediaOperations.media.setAsProfile(documentId);
await mediaOperations.media.delete(documentId);
await mediaOperations.media.updateCategory(documentId, 'progress_image');
```

**`useProjectMedia`** - Unified hook for fetching project media:
```typescript
// Fetch all media
const { data: allMedia } = useProjectMedia({ projectId });

// Fetch by category
const { data: profileImages } = useProjectMedia({ 
  projectId, 
  category: 'profile_image' 
});

// Fetch by phase
const { data: phaseMedia } = useProjectMedia({ 
  projectId, 
  phaseId 
});
```

#### Specialized Hooks

- `useProjectProfileImages(projectId)` - Profile images only
- `useProjectInspirationImages(projectId)` - Inspiration images only  
- `useProjectProgressImages(projectId)` - Progress images only
- `useProjectDocumentsOnly(projectId)` - Documents only

### Component Integration

#### Upload Components

**SimplifiedUpload Component:**
```typescript
<SimplifiedUpload
  mediaCategory="inspiration_image"
  phaseId={phaseId}
  onUploadComplete={(results) => {
    // Automatically creates be_document records
  }}
/>
```

**CreateProject Page:**
```typescript
// Uses unified media operations for all uploads
await mediaOperations.upload.uploadImages(imageResults, 'inspiration');
```

## Migration Strategy

### Database Migrations

1. **017_media_categories_schema.sql** - Adds media category support
2. **018_migrate_existing_media.sql** - Sets up unified structure

### Legacy Code Migration

- ✅ Replaced `useUploadImages` with `useMediaOperations`
- ✅ Updated `SimplifiedUpload` component
- ✅ Refactored `useImageMutations` hook
- ✅ Updated `CreateProject` page
- ✅ Fixed `ProjectDocumentsSection` component

## Benefits

### Consistency
- Single source of truth for all media
- Consistent metadata and tagging
- Unified access patterns

### Performance
- Optimized queries with proper indexing
- React Query caching for all media operations
- Efficient category-based filtering

### Maintainability
- Centralized media logic
- Reusable hooks and components
- Clear separation of concerns

### Scalability
- Flexible category system
- Phase-based organization
- Extensible metadata structure

## Usage Examples

### Upload Profile Image
```typescript
const mediaOperations = useMediaOperations(projectId);

const handleProfileUpload = async (files: File[]) => {
  const results = await uploadFiles(files);
  await mediaOperations.upload.uploadImages(results, 'profile_image');
};
```

### Fetch and Display Media
```typescript
const { data: inspirationImages } = useProjectInspirationImages(projectId);

return (
  <div>
    {inspirationImages?.map(image => (
      <img key={image.id} src={image.file_path} alt={image.name} />
    ))}
  </div>
);
```

### Set Profile Image
```typescript
const mediaOperations = useMediaOperations(projectId);

const handleSetAsProfile = async (documentId: string) => {
  await mediaOperations.media.setAsProfile(documentId);
};
```

## Development Notes

- All uploads now create proper database records with consistent metadata
- Media categories are enforced at the database level
- React Query handles caching and invalidation automatically
- Components use TypeScript for type safety
- Mobile-first responsive design maintained throughout

## Future Enhancements

- Media processing queue for thumbnails and compression
- Advanced search and filtering capabilities
- Bulk operations for media management
- Media collections and albums
- Enhanced metadata and tagging system
