// UI Components
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastContextProvider } from "@/components/ui/toast-context";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Libraries
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from '@/lib/queryClient';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { LazyMotion, domAnimation } from "framer-motion";
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SupabaseAuthProvider, useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useEffect, Suspense, lazy } from 'react';

// Environment configuration
import config, { isDevelopment, isProduction } from '@/lib/env-config';

// Store initialization (includes development tools)
import '@/stores';

// Security initialization


// Styles
import '@/styles/dark-theme.css';

// Layout
import { AppLayout } from "@/components/layout/AppLayout";

// Page Components - Lazy loaded for better performance and code splitting
// Dashboard removed - now redirects to Projects page
const ProjectDetails = lazy(() => import("./pages/ProjectDetails/ProjectDetailsPage").then(m => ({ default: m.ProjectDetailsPage })));
const GeneratedPlan = lazy(() => import("./pages/GeneratedPlan"));
const TaskPlanningSetup = lazy(() => import("./pages/TaskPlanningSetup"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Team = lazy(() => import("./pages/Team"));
const Schedule = lazy(() => import("./pages/Schedule").then(m => ({ default: m.Schedule })));
const Materials = lazy(() => import("./pages/Materials").then(m => ({ default: m.Materials })));
const Documents = lazy(() => import("./pages/Documents"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Projects = lazy(() => import("./pages/Projects").then(m => ({ default: m.Projects })));
const CreateProject = lazy(() => import("./pages/CreateProject").then(m => ({ default: m.CreateProject })));
const Settings = lazy(() => import('./pages/Settings'));
const Messaging = lazy(() => import('./pages/Messaging'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Unauthorized = lazy(() => import('./pages/Unauthorized').then(m => ({ default: m.Unauthorized })));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B6CB0]"></div>
      <p className="text-sm text-slate-500">Loading...</p>
    </div>
  </div>
);

// Mobile-optimized query client imported from lib/queryClient.ts
// Configured for construction site usage with unreliable connections

// Environment-specific configurations
if (isDevelopment()) {
  // Enable additional features for development
  queryClient.setDefaultOptions({
    queries: {
      retry: false,
      staleTime: 1000, // 1 second in development for faster iteration
      refetchOnWindowFocus: true,
      // React 19 development optimizations
      networkMode: 'always',
    },
  });
}

function AuthRedirector() {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is authenticated and on the landing page, redirect to projects
    if (!isLoading && isAuthenticated && location.pathname === '/') {
      navigate('/projects', { replace: true });
    }
    
    // If user is authenticated and trying to access login/signup pages, redirect to projects
    if (!isLoading && isAuthenticated && 
        (location.pathname === '/login' || location.pathname === '/signup')) {
      navigate('/projects', { replace: true });
    }

    // If user is trying to access old dashboard route, redirect to projects
    if (!isLoading && isAuthenticated && location.pathname === '/dashboard') {
      navigate('/projects', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  return null;
}

function App() {
  // Initialize security systems on app start
  useEffect(() => {
    try {
      if (isDevelopment()) {
        console.log('🛡️ Lightweight security systems initialized');
      }
    } catch (error) {
      console.error('Failed to initialize security systems:', error);
    }
  }, []);

  return (
    <BrowserRouter>
      <LazyMotion features={domAnimation}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <HelmetProvider>
              <TooltipProvider>
                <ToastContextProvider>
                  <Toaster />
                  <Sonner />
                  {/* Display environment indicator in non-production environments */}
                  {!isProduction() && (
                    <div className="fixed top-0 right-0 z-50 px-2 py-1 text-xs font-bold text-white bg-blue-500 rounded-bl-md">
                      {config.appTitle}
                    </div>
                  )}
                  <SupabaseAuthProvider>
                    <AuthRedirector />
                    <ErrorBoundary>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                        {/* Public routes - accessible without authentication */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                      
                      {/* Protected routes wrapped in AppLayout */}
                      <Route path="/*" element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }>
                        {/* Dashboard route now redirects to Projects (handled in AuthRedirector) */}
                        
                        {/* Project management routes - Projects is now the main page */}
                        <Route path="projects" element={<Projects />} />
                        <Route path="project/:slug" element={<ProjectDetails />} />
                        <Route path="projects/new" element={<CreateProject />} />

                        
                        {/* Phase management routes */}
                        <Route path="generate-tasks" element={<TaskPlanningSetup />} />
                        <Route path="generated-plan" element={<GeneratedPlan />} />
                        
                        {/* Sidebar navigation routes */}
                        <Route path="schedule" element={<Schedule />} />
                        <Route path="team" element={<Team />} />
                        <Route path="materials" element={<Materials />} />
                        <Route path="expenses" element={<Expenses />} />
                        <Route path="documents" element={<Documents />} />
                        <Route path="messaging" element={<Messaging />} />
                        <Route path="settings" element={<Settings />} />
                        
                        {/* Admin routes with role-based protection */}
                        <Route path="settings/admin" element={
                          <ProtectedRoute requiredRoles={['owner', 'manager']}>
                            <Settings />
                          </ProtectedRoute>
                        } />
                        
                        {/* Catch-all route for protected section */}
                        <Route path="*" element={<NotFound />} />
                      </Route>
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </SupabaseAuthProvider>
                </ToastContextProvider>
              </TooltipProvider>
            </HelmetProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </LazyMotion>
    </BrowserRouter>
  );
}

export default App;
