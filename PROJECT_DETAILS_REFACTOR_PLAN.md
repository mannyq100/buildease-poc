# Refactoring and Integration Plan: ProjectDetails Page

This document outlines the steps to refactor the `ProjectDetails` page, replacing mock data with a full-fledged Supabase integration, implementing all interactive features, and preparing for end-to-end testing.

## Phase 1: Data Layer and State Management Refactoring

The highest priority is to replace all mock data with live data from the backend.

1.  **Fetch Project Data with React Query:**
    *   Create a new custom hook, `useProject`, in `src/hooks/useProject.ts`.
    *   This hook will use React Query's `useQuery` to fetch a single project's details from Supabase based on the `projectId`.
    *   The query key should be `['project', projectId]`.
    *   The query function will call a new Supabase service function `getProjectById(projectId)`.
    *   The hook should return `{ project, isLoading, isError, error }`.
    *   **File to create:** `src/services/projectService.ts` (if not exists) to house `getProjectById`.

2.  **Integrate `useProject` Hook:**
    *   In `ProjectDetails.tsx`, replace the `useState` for `project` with the new `useProject(projectId)` hook.
    *   Handle `isLoading` and `isError` states gracefully (e.g., show a loading spinner or an error message).

3.  **Implement Data Mutations with React Query:**
    *   Create custom hooks for updating data:
        *   `useUpdateProject`: Uses `useMutation` to update project details. On success, it should invalidate the `['project', projectId]` query to refetch the data.
        *   `useUpdateProjectStatus`: Similar to `useUpdateProject`, but for status updates.
        *   `useSavePhase`, `useSaveTask`, `useSaveMaterial`: Create corresponding mutation hooks for each of these actions. They should invalidate the main project query on success.
    *   Replace the `handleSaveProject`, `handleUpdateStatus`, and other `handleSave*` functions with calls to these new mutation hooks.
    *   Remove the `isSaving` `useState` and rely on the `isPending` (or `isLoading`) state from the mutation hooks.

## Phase 2: Feature Integration

With the data layer in place, we can implement the interactive UI components.

### 1. Team Management

*   **"Manage Team" Button:**
    *   This button should navigate the user to a dedicated "Project Team" page.
    *   The route should be `/projects/{projectId}/team`.
    *   A new page component `src/pages/ProjectTeamPage.tsx` needs to be created.
*   **"Add Team Member" Button:**
    *   This should open a reusable modal for adding a new team member.
    *   Create a new component: `src/components/team/AddTeamMemberModal.tsx`.
    *   This modal should contain a form (using React Hook Form) to search for existing users in the system and assign them a role on the project.
    *   The form submission should trigger a `useAddTeamMember` mutation hook.

### 2. Budget and Financials

*   **Display Budget Metrics:**
    *   The "Budget & Financials" accordion section should display key metrics.
    *   Create a new component: `src/components/project/BudgetSummary.tsx`.
    *   This component will display:
        *   Total Budget (from `project.budget`)
        *   Total Expenses (calculated by summing up all related expenses)
        *   Remaining Budget
        *   A progress bar showing budget utilization.
*   **Itemized Expenses:**
    *   Below the summary, display a table of itemized expenses.
    *   Create a component: `src/components/project/ExpensesTable.tsx`.
    *   This table should be powered by data fetched from a new `expenses` table in Supabase, linked to the project.
    *   Implement "Add Expense" functionality, likely via another modal.

### 3. Project Documents and Files

*   **File Management UI:**
    *   The "Documents & Files" section needs a UI for file uploads and listings.
    *   Create a component: `src/components/project/FileManager.tsx`.
    *   This component will include:
        *   A file upload zone (drag-and-drop).
        *   A list/grid of uploaded files, with icons based on file type.
        *   Actions for each file (Download, Rename, Delete).
*   **Supabase Storage Integration:**
    *   Use Supabase Storage to handle file uploads.
    *   Create a new service, `src/services/storageService.ts`, with functions for `uploadFile`, `downloadFile`, and `deleteFile`.
    *   File metadata (name, path, uploader) should be stored in a `project_documents` table in the database.

### 4. Project Settings

*   **Navigation:**
    *   The "Project Settings" section should contain a link/button that navigates to a dedicated settings page: `/projects/{projectId}/settings`.
*   **Settings Page:**
    *   Create `src/pages/ProjectSettingsPage.tsx`.
    *   This page will allow editing of less-frequently changed project details, managing integrations, or archiving/deleting the project.

## Phase 3: End-to-End Testing Plan

Once the features are integrated, we need to ensure they work together seamlessly.

1.  **User Flow: Project Creation to Details View**
    *   **Test:** A user can create a new project and is then redirected to the `ProjectDetails` page for that new project.
    *   **Assertions:** The URL contains the correct new project ID. The fetched data on the details page matches the data entered during creation.

2.  **User Flow: Team Management**
    *   **Test:** A project manager can add a new team member, see them in the team list, and then remove them.
    *   **Assertions:** The team member list updates correctly after adding/removing. The added user receives appropriate permissions.

3.  **User Flow: Financial Management**
    *   **Test:** A user adds several expenses. The budget summary and expenses table update accordingly.
    *   **Assertions:** The "Remaining Budget" and progress bar reflect the new totals. The new expenses appear in the table.

4.  **User Flow: Document Management**
    *   **Test:** A user uploads a file, sees it in the file manager, downloads it, and then deletes it.
    *   **Assertions:** The file appears in the list after upload. The downloaded file is correct. The file is removed from the list after deletion.

5.  **User Flow: Updating Project Details**
    *   **Test:** A user changes the project name via the `EditProjectModal` and updates the status via the `UpdateStatusModal`.
    *   **Assertions:** The project name and status displayed on the page update immediately after the modals are closed, reflecting the new data from the refetched query.

This plan provides a clear path forward for enhancing the `ProjectDetails` page. The next step would be to start with Phase 1, setting up the data layer.
