// UI Components
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastContextProvider } from "@/components/ui/toast-context";
import { HelmetProvider } from "react-helmet-async";

// Libraries
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { LazyMotion, domAnimation } from "framer-motion";
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SupabaseAuthProvider, useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useEffect } from 'react';

// Environment configuration
import config, { isDevelopment, isProduction } from '@/lib/env-config';


// Styles
import '@/styles/dark-theme.css';

// Layout
import { AppLayout } from "@/components/layout/AppLayout";

// Page Components - Lazy load these for better performance
import { Dashboard } from "./pages/Dashboard";
import { ProjectDetails } from "./pages/ProjectDetails";
import PhaseDetails from "./pages/PhaseDetails";
import GeneratedPlan from "./pages/GeneratedPlan";
import TaskPlanningSetup from "./pages/TaskPlanningSetup";
import NotFound from "./pages/NotFound";
import Team from "./pages/Team";
import { Schedule } from "./pages/Schedule";
import { Materials } from "./pages/Materials";
import Documents from "./pages/Documents";
import Expenses from "./pages/Expenses";
import { Projects } from "./pages/Projects";
import { CreateProject } from "./pages/CreateProject";
import Settings from './pages/Settings';
import Messaging from './pages/Messaging';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthCallback from './pages/AuthCallback';
import { Unauthorized } from './pages/Unauthorized';

// Set up default query client options with better user feedback
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Enable React 19 optimizations
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

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
    // If user is authenticated and on the landing page, redirect to dashboard
    if (!isLoading && isAuthenticated && location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
    
    // If user is authenticated and trying to access login/signup pages, redirect to dashboard
    if (!isLoading && isAuthenticated && 
        (location.pathname === '/login' || location.pathname === '/signup')) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  return null;
}

function App() {

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
                        {/* Dashboard (default protected route) */}
                        <Route path="dashboard" element={<Dashboard />} />
                        
                        {/* Project management routes */}
                        <Route path="create-project" element={<CreateProject />} />
                        <Route path="projects" element={<Projects />} />
                        <Route path="project-details" element={<ProjectDetails />} />
                        <Route path="project/:id" element={<ProjectDetails />} />
                        
                        {/* Phase management routes */}
                        <Route path="phase-details" element={<PhaseDetails />} />
                        <Route path="phase/:id" element={<PhaseDetails />} />
                        <Route path="phases/:phaseId" element={<PhaseDetails />} />
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
