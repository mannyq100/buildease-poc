# Activity Batching System Guide

## Overview

The Activity Batching System intelligently groups similar activities together to reduce noise in activity feeds and improve user experience. Instead of showing individual entries for each small action, related activities are batched and presented as summaries.

## How It Works

### Batching Logic

Activities are batched based on:
- **Project ID** - Only activities within the same project are batched together
- **Activity Type** - Only same types of activities are batched (e.g., task_create with task_create)
- **User ID** - Only activities from the same user are batched together
- **Entity Type** - Only activities on the same type of entity are batched together
- **Time Window** - Activities must occur within 5 minutes of each other

### Configuration

```typescript
const BATCHING_CONFIG = {
  TIME_WINDOW: 5 * 60 * 1000,     // 5 minutes
  MAX_BATCH_SIZE: 10,             // Maximum activities per batch
  BATCH_DELAY: 30 * 1000,         // 30 seconds delay before processing
}
```

### Batchable Activity Types

The following activity types are automatically batched:
- `task_create` - When multiple tasks are created quickly
- `task_update` - When tasks are updated frequently  
- `task_complete` - When multiple tasks are completed
- `document_upload` - When multiple documents are uploaded
- `expense_create` - When budget expenses are added in bulk
- `expense_update` - When expenses are updated frequently
- `comment_create` - When multiple comments are posted
- `comment_reply` - When multiple replies are added

### Never-Batched Activity Types

Critical activities that always show individually:
- `project_create` - Project creation
- `project_delete` - Project deletion
- `phase_create` - Phase creation
- `phase_delete` - Phase deletion
- `team_member_add` - Team member additions
- `team_member_remove` - Team member removals
- `project_status_update` - Project status changes

## Usage

### Using Batched Activities

For activities that should be batched, use `createBatchedActivity()`:

```typescript
import * as activityService from '@/services/activityService';

// This will be batched with similar activities
await activityService.createBatchedActivity({
  project_id: projectId,
  activity_type: 'task_create',
  title: `Task created: ${taskTitle}`,
  description: `New task "${taskTitle}" was added`,
  user_id: userId,
  user_name: userName,
  entity_type: 'task',
  entity_id: taskId,
  metadata: { taskTitle, priority, status },
  status: 'success'
});
```

### Using Direct Activities

For critical activities that should never be batched, use `createActivity()`:

```typescript
// This will always appear individually
await activityService.createActivity({
  project_id: projectId,
  activity_type: 'project_status_update',
  title: 'Project completed',
  description: 'Project has been marked as completed',
  // ... other fields
});
```

## Batch Processing Examples

### Example 1: Task Creation Batch
If a user creates 5 tasks within 5 minutes:

**Individual Activities (before batching):**
- Task created: Design wireframes
- Task created: Setup development environment  
- Task created: Create database schema
- Task created: Implement authentication
- Task created: Write API endpoints

**Batched Activity (after batching):**
- **5 tasks created** (with badge showing "5 items")
- Description: "John created 5 tasks"
- Expandable details showing all individual tasks

### Example 2: Comment Batch
If a user posts 3 comments quickly:

**Individual Activities (before batching):**
- Comment added: "Looking good so far!"
- Comment added: "Can we adjust the colors?"
- Comment added: "Timeline looks reasonable"

**Batched Activity (after batching):**
- **3 comments added** (with badge showing "3 items") 
- Description: "Sarah added 3 comments"

## UI Display

### Activity Feed Display

Batched activities appear with:
- **Batch indicator badge** showing number of items (e.g., "5 items")
- **Aggregated title** (e.g., "5 tasks created" instead of individual titles)
- **Summarized description** showing the user and action count
- **Metadata** containing details of all original activities

### Example UI:

```
[📝] 5 tasks created                           [5 items]
     John created 5 tasks                      2 minutes ago
     ● John Doe
```

Instead of:

```
[📝] Task created: Design wireframes           2 minutes ago
[📝] Task created: Setup development           2 minutes ago  
[📝] Task created: Create database             3 minutes ago
[📝] Task created: Implement authentication   3 minutes ago
[📝] Task created: Write API endpoints         4 minutes ago
```

## Benefits

### Reduced Noise
- Prevents activity feeds from being overwhelmed by repetitive actions
- Makes it easier to see important activities like project milestones

### Better User Experience
- Users can see patterns of work (e.g., "John was busy creating tasks")
- Less scrolling required to see diverse activity types

### Performance
- Fewer database records for high-frequency activities
- Reduced network traffic when loading activity feeds
- Better query performance on activity tables

## Technical Implementation

### Database Structure

Batched activities are stored with:
- `entity_type: 'batch'` to identify them as batched
- `entity_id: 'batch_{batchKey}'` for unique identification
- `metadata` containing all original activity details

### Fallback Behavior

If batching fails for any reason:
- System automatically falls back to creating individual activities
- No activities are lost
- Users still see all their actions, just not batched

### Memory Management

- Batches are stored in memory temporarily (max 30 seconds)
- Automatic cleanup prevents memory leaks
- `flushAllBatches()` available for manual cleanup

## Best Practices

### When to Use Batching
- ✅ Bulk operations (importing multiple items)
- ✅ Rapid user interactions (quick task updates)
- ✅ Background processing (document processing)
- ✅ Form submissions with multiple fields

### When NOT to Use Batching
- ❌ Critical system events (errors, security events)
- ❌ Milestone achievements (project completion)  
- ❌ User onboarding events (first login, account setup)
- ❌ Notifications that users specifically wait for

### Code Examples

```typescript
// ✅ Good - Batch repetitive task updates
await activityService.createBatchedActivity({
  activity_type: 'task_update',
  // ...
});

// ❌ Bad - Don't batch critical events
await activityService.createActivity({
  activity_type: 'project_status_update', 
  // ...
});
```

## Monitoring

### Debug Information

Enable batch debugging with:
```javascript
console.log(getBatchingStats());
```

Returns:
```javascript
{
  activeBatches: 3,
  pendingTimers: 3,
  batchDetails: [
    {
      batchKey: "proj123_task_create_user456_task",
      activityCount: 4,
      activityType: "task_create",
      timeSpan: 120000 // 2 minutes
    }
  ]
}
```

### Console Logs

Look for `[ACTIVITY_BATCH]` prefixed logs to monitor batching behavior:

```
[ACTIVITY_BATCH] Adding activity to batch: task_create
[ACTIVITY_BATCH] Processing batch: 4 activities batched
[ACTIVITY_BATCH] Batch processed successfully: "4 tasks created"
```

This system ensures users see meaningful activity summaries while preserving all the detailed information for when they need it.