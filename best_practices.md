### 📘 Project Best Practices

#### 1. Project Purpose  
BuildEase is a mobile-first construction management platform focused on fast, reliable field usage. It streamlines project planning, scheduling, collaboration, documents, materials, and expenses while emphasizing robust offline/poor-network behavior and a clear, professional UI.

#### 2. Project Structure  
- Top-level
  - Vite + React 19 + TypeScript monofrontend
  - TailwindCSS + shadcn-ui (Radix primitives) for UI
  - Supabase for auth/data; React Query for server state; Zustand for client state
- Key directories (src/)
  - components/: Reusable UI and feature components (mobile-first)
    - ui/: shadcn/Radix-based primitives and wrappers (use these before creating new)
    - layout/: AppLayout, navigation, breadcrumb
    - error-boundaries/: error containment for feature areas
  - pages/: Route-level pages, lazy-loaded for performance
  - contexts/: Providers (Theme, SupabaseAuth)
  - hooks/: Custom hooks (queries, mutations, utilities, mobile/network behaviors)
  - lib/: Core utilities (env-config, queryClient, supabase, validators)
  - services/: Data/services layer (domain-specific service modules)
  - types/: Centralized TypeScript types (shared across app)
  - styles/: Global and theme CSS tokens; Tailwind-driven styling
  - data/: Mock and static data (JSON preferred)
- Entry points & config
  - src/main.tsx: App bootstrap
  - src/App.tsx: Providers (Helmet, Theme, Auth, QueryClient), routing and Suspense
  - vite.config.ts: Build config, alias '@' -> src
  - tsconfig.json: Strict TS, path aliases, bundler resolution
  - eslint.config.js: Rules and plugins (unused-imports, react-hooks)
  - tailwind.config.ts: Tokens and design system

#### 3. Test Strategy  
- Frameworks: Vitest (+ @testing-library/react, jest-dom)
- Location & naming
  - Tests live under src/tests and/or co-located next to modules using *.test.ts(x) or *.spec.ts(x)
  - Build tools ignore *.test.* files during builds
- Setup: src/tests/setup.ts registers jest-dom matchers and cleans up after each test
- Philosophy
  - Unit tests for hooks, utilities, and pure services
  - Integration tests for page/component flows behind providers (Auth, Query, Router)
  - Mock external services (Supabase, network) using light stubs or MSW (recommended) to avoid flakiness
  - Avoid snapshot brittleness; assert behavior and accessibility roles/labels
- Mocking guidelines
  - Supabase: mock client methods used by services/components
  - React Router: use MemoryRouter wrappers
  - React Query: wrap in QueryClientProvider with test client

#### 4. Code Style  
- Language/typing
  - Strict TypeScript enabled; noImplicitAny, strictNullChecks, etc.
  - All shared types live in src/types; extend existing models before adding new
  - Prefer discriminated unions and readonly where applicable; avoid any
- Components
  - Use function declarations (export function Component)
  - File structure order: export Component -> Sub-components -> Helper functions -> Constants -> Types
  - Keep files < 400 lines; refactor into subcomponents/hooks
  - Lazy-load page routes; use Suspense fallbacks optimized for mobile
- Styling
  - Use Tailwind utility classes only; no inline style objects except dynamic widths/heights
  - Prefer semantic tokens from Tailwind config (bg-background, text-foreground, border-border)
  - Use shadcn-ui primitives before creating custom UI; extend via CVA variants when needed
- Naming conventions
  - Files: components/ui primitives are lowercase (button.tsx); pages and feature modules use PascalCase when appropriate
  - Components: PascalCase; hooks: useCamelCase; types/interfaces: PascalCase; variables/functions: camelCase
  - Query keys: centralize in lib/queryClient.ts (queryKeys factory)
- Imports & paths
  - Use '@/*' alias for src-based imports
  - Order: external > alias > relative; remove unused imports (enforced by eslint-plugin-unused-imports)
- Comments & docs
  - Prefer short, purposeful comments near non-obvious logic
  - Co-locate README-like docs in docs/ and keep them up to date
- Error handling
  - Wrap views with ErrorBoundary or domain error boundaries where appropriate
  - Prefer returning typed error states from hooks and letting UI render recovery paths

#### 5. Common Patterns  
- Server state: React Query
  - Use queryKeys in lib/queryClient.ts; respect L1/L2/L3 hierarchy and TTL guidelines
  - Use smartPrefetch and invalidateByPattern utilities for cache-aware operations
  - Retry/backoff tuned for poor connectivity; do not override without reason
- Client state: Zustand
  - Use for global UI/client state; keep server data in React Query
- Auth: Supabase
  - Central client: lib/supabase.ts using secure storage adapter
  - App auth: contexts/SupabaseAuthContext with profile caching and role-based access via ProtectedRoute
- Routing
  - React Router v7; protected routes with role checks; redirect logic centralized in App.tsx/AuthRedirector
- Forms & validation
  - React Hook Form + Zod; show validation feedback inline using existing ui primitives
- UI & theming
  - shadcn + Radix primitives; ThemeProvider for dark/light; use semantic tokens over hard-coded colors
- Mobile-first & performance
  - Always design from mobile up; ensure 44px min touch targets
  - Lazy-load pages; code split vendors with vite manualChunks; prefer virtualization for large lists

#### 6. Do's and Don'ts  
- Do
  - Reuse existing components/hooks/utilities; search src before adding new
  - Keep components focused and small; extract logic to hooks
  - Use React Query for all server state; Zustand for client-only
  - Put shared types in src/types; mock/static data in src/data
  - Use Tailwind tokens and shadcn primitives; maintain accessibility (focus-visible, ARIA)
  - Follow mobile-first layout; stack on mobile, enhance at sm/md+
  - Handle errors gracefully with ErrorBoundary and toasts
- Don't
  - Duplicate utilities/components or introduce alternative UI libs
  - Fetch inside components without React Query; avoid ad-hoc cache layers
  - Mix server and client state in Zustand stores
  - Hardcode colors; avoid arbitrary pixel sizes for primary flows
  - Bypass existing auth/query providers; avoid direct DOM manipulation

#### 7. Tools & Dependencies  
- Key libraries
  - React 19, React Router 7, TypeScript, Vite
  - TailwindCSS, shadcn-ui, Radix
  - @tanstack/react-query, Zustand
  - react-hook-form, zod
  - Supabase JS client
  - Utility: date-fns, axios, lucide-react, recharts, framer-motion
- Setup & scripts
  - Install: npm install
  - Develop: npm run dev (port 3000)
  - Lint: npm run lint (unused-imports enforced)
  - Build: npm run build (Vite; manualChunks configured)
  - Test: npm run test (Vitest)
- Configuration patterns
  - Env: lib/env-config.ts with environment helpers (development/staging/production)
  - Query client: lib/queryClient.ts with cache hierarchy and mobile optimizations
  - Supabase: lib/supabase.ts using secure storage adapter, schema 'construction_mgr'
  - Path alias: '@' -> src

#### 8. Other Notes  
- LLM/codegen guidance
  - Adhere to AGENT.md directives: mobile-first, Tailwind-only, shadcn before custom, 44px touch targets, color scheme (#2B6CB0 primary, #ED8936 accent)
  - Use function declarations; export at top; maintain file order: export -> subcomponents -> helpers -> constants -> types
  - Keep components under 400 lines; refactor proactively
  - Prefer existing ui primitives in src/components/ui; extend via CVA variants
- Networking & performance
  - Assume unreliable networks; respect retry/backoff in queryClient; avoid aggressive refetch on focus
  - Use background prefetch/smart cache utilities when warming data
- Access control
  - Use ProtectedRoute for auth-guarded routes; pass requiredRoles when needed; check memberships via profile
- Environment variables
  - Use lib/env-config.getConfig(); avoid direct import.meta.env reads outside env-config
  - Required Supabase vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY; API and app vars via VITE_* keys
- Testing
  - Wrap components in providers for integration tests; use MemoryRouter, QueryClientProvider, ThemeProvider
  - Place tests as *.test.ts(x) or *.spec.ts(x); keep them isolated from production bundles
