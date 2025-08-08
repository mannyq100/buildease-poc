# Project URL Slug – End-to-End Implementation Plan

Status: Planned
Owner: Frontend (BuildEase)
Scope: Replace UUID-based project URLs with human-friendly, unique slugs
Backward compatibility: Not required (active development)

## Goals
- Use `/project/:slug` for all project detail routes.
- Generate and persist unique `slug` for every project.
- Navigate to and display slugs only (no UUID in URLs or UI).
- Keep existing data hooks (budget/team/phases) unchanged by resolving `slug → id` internally in the page.

---

## Architecture Overview
- DB: Add `slug text not null` to `construction_mgr.be_project` with unique index on `lower(slug)`.
- Create Flow: Generate slug from project name on submit, resolve collisions, persist with project insert.
- Routing: `App.tsx` route becomes `project/:slug`.
- Page Loader: In `ProjectDetailsPage`, resolve `slug → project.id` with a minimal query, then call existing hooks using `id`.
- UI: Replace any visible UUIDs with slug. Update all project links to use slug.

---

## Step-by-Step Tasks

### 1) Database (Supabase)
- [ ] Add `slug` column (text, not null) to `construction_mgr.be_project`.
- [ ] Add unique index (case-insensitive): `create unique index be_project_slug_key on construction_mgr.be_project (lower(slug));`
- [ ] (Dev only) Backfill any existing rows with generated slugs from `name` and ensure uniqueness.
- [ ] Update Supabase types (if generating types) so `slug` appears in TypeScript.

Deliverables:
- Migration SQL script committed under `supabase/migrations/` (or equivalent).

### 2) Type & Transform Updates
- [ ] Update `Project`-related types to include `slug` (e.g., `src/types/...`).
- [ ] Ensure `ProjectTransformService.transformProjectSummary()` passes through `slug`.

Files:
- `src/services/projectTransformService.ts`
- `src/types/...` (where `Project` is defined)

### 3) Slug Generation Utility
- [ ] Create `slugifyName(name: string): string` utility with:
  - Lowercase, trim, collapse spaces/hyphens, remove unsafe chars, transliterate non-Latin.
  - Fallback to `project-<shortid>` when name is empty after slugify.
- [ ] Collision handling helper: `ensureUniqueSlug(base: string): Promise<string>` that queries `be_project` by slug; if taken, append `-<shortid>` and retry.

Files:
- `src/utils/slug.ts` (new)

### 4) Submission Pipeline – Persist Slug on Create
- [ ] Integrate slug generation in the create flow prior to insert.
- [ ] Save `{ slug }` with the new project row in `projectCreationService.ts`.
- [ ] Ensure `submitProject` returns `slug` (alongside `id`).

Files:
- `src/services/projectCreationService.ts`
- `src/stores/createProject/submissionStore.ts`

### 5) Routing – Use Slug
- [ ] Update `src/App.tsx` route: `"project/:id"` → `"project/:slug"`.
- [ ] Update any other route references if present.

Files:
- `src/App.tsx`

### 6) ProjectDetails Page – Resolve Slug to ID
- [ ] Read `slug` from `useParams()` in `ProjectDetailsPage` (or small wrapper).
- [ ] Minimal query: `be_project.select('id, slug, name').eq('slug', slug).single()`
- [ ] After resolving `id`, render existing hooks unmodified:
  - `useProjectDetailsData(id)`
  - `useProjectBudgetSummary(id)`
  - `useProjectTimelineSummary(id)`
  - `useProjectTeamSummary(id)`
- [ ] Handle not-found by showing existing 404 state.

Files:
- `src/pages/ProjectDetails/ProjectDetailsPage.tsx`
- Optionally a tiny helper in `src/hooks/queries/useProjectDetails.ts` or `src/services/ProjectLookupService.ts` (new)

### 7) Create Flow – Navigate with Slug
- [ ] After successful creation in `CreateProject.tsx`, navigate to `/project/${slug}` instead of ID.
- [ ] Ensure state reads `slug` from submission store hook result.

Files:
- `src/pages/CreateProject.tsx`

### 8) Update All Links & UI
- [ ] Projects list/cards and any project links use `slug` for URL building.
- [ ] Replace any visible project ID displays with slug (breadcrumbs, header, copy-link UI).
- [ ] Remove any UUID exposure from UI and logs (production builds).

Files (examples, search for project URL usage):
- `src/pages/Projects.tsx`
- Components under `src/pages/ProjectDetails/`
- Any sidebar/nav widgets linking to a project

### 9) Tests & QA
- [ ] Unit tests for `slugifyName()` and `ensureUniqueSlug()`:
  - Special chars, whitespace, collisions, reserved words, non-Latin.
- [ ] Integration tests/manual QA:
  - Create project → slug persisted → navigate to `/project/:slug`.
  - Open `/project/:slug` → resolves to id → all sections load (budget/team/phases).
  - Projects list links correctly to slug URLs.
- [ ] Dev DB backfill validated; `slug` NOT NULL enforced.

---

## Acceptance Criteria
- All project detail URLs use `/project/:slug`.
- New project creation returns a slug and navigates with slug.
- `ProjectDetailsPage` loads correctly via slug for all data sections.
- No UUID is shown in any URL or visible UI.
- DB enforces unique `lower(slug)`; collision handling is implemented.

## Edge Cases & Rules
- Reserved slugs: maintain a small list (e.g., `new`, `edit`, `dashboard`, `settings`); auto-suffix when encountered.
- Non-Latin names: transliterate; if empty after cleaning, fallback to `project-<shortid>`.
- Length limit: cap base slug at ~60 chars before suffixing to keep URLs manageable.
- Slugs are immutable post-creation for link stability.

## Risk & Mitigations
- Link breakage during refactor → Mitigate by updating all internal links in one PR.
- Collision race in multi-user creation → Mitigate via check-then-insert with retry and DB unique index.
- Type drift → Ensure types and transform service include `slug` consistently.

## Rollout Checklist
- [ ] DB migration applied locally.
- [ ] Types updated & build passes.
- [ ] Submission flow persists & returns slug.
- [ ] Router switched to slug.
- [ ] Page resolves slug → id and loads data.
- [ ] All links updated to slug.
- [ ] QA pass on create + details flows.
- [ ] Remove any stray UUID displays in UI.
