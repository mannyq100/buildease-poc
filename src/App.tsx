// UI Components
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastContextProvider } from "@/components/ui/toast-context";
import { HelmetProvider } from "react-helmet-async";

// Libraries
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LazyMotion, domAnimation } from "framer-motion";
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Auth0Provider } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

// Environment configuration
import config, { isDevelopment, isProduction } from '@/lib/env-config';

// Styles
import '@/styles/dark-theme.css';

// Layout
import { AppLayout } from "@/components/layout/AppLayout";

// Page Components - Lazy load these for better performance
import Dashboard from "./pages/Dashboard";
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
import CreateProject from "./pages/CreateProject";
import Settings from './pages/Settings';
import Messaging from './pages/Messaging';
import LandingPage from './pages/LandingPage';
// removed Account page
import { Unauthorized } from './pages/Unauthorized';

// Set up default query client options with better user feedback
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
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
    },
  });
}

// TODO: Replace with your actual Auth0 domain and clientId
const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN || '';
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID || '';
const AUTH0_CALLBACK_URL = import.meta.env.VITE_AUTH0_REDIRECT_URI || '';
const AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE || '';

function AuthRedirector() {
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && window.location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  return null;
}

function App() {
  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: AUTH0_CALLBACK_URL,
        audience: AUTH0_AUDIENCE
      }}
    >
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
                  <BrowserRouter>
                    <AuthRedirector />
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/unauthorized" element={<Unauthorized />} />
                      
                      {/* Protected routes with AppLayout */}
                      <Route element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }>
                        {/* Main routes */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/create-project" element={<CreateProject />} />
                        <Route path="/generated-plan" element={<GeneratedPlan />} />
                        <Route path="/project-details" element={<ProjectDetails />} />
                        <Route path="/project/:id" element={<ProjectDetails />} />
                        <Route path="/phase-details" element={<PhaseDetails />} />
                        <Route path="/phase/:id" element={<PhaseDetails />} />
                        <Route path="/phases/:phaseId" element={<PhaseDetails />} />
                        <Route path="/generate-tasks" element={<TaskPlanningSetup />} />
                        
                        {/* Sidebar navigation routes */}
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/schedule" element={<Schedule />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/materials" element={<Materials />} />
                        <Route path="/expenses" element={<Expenses />} />
                        <Route path="/documents" element={<Documents />} />
                        <Route path="/messaging" element={<Messaging />} />
                        {/* Account page removed; using settings */}
                         <Route path="/settings" element={<Settings />} />
                        
                        {/* Admin routes with role-based protection */}
                        <Route path="/settings/admin" element={
                          <ProtectedRoute requiredRoles={['owner', 'manager']}>
                            <Settings />
                          </ProtectedRoute>
                        } />
                        
                        {/* 404 route */}
                        <Route path="*" element={<NotFound />} />
                      </Route>
                    </Routes>
                  </BrowserRouter>
                </ToastContextProvider>
              </TooltipProvider>
            </HelmetProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </LazyMotion>
    </Auth0Provider>
  );
}

export default App;
