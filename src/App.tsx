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
import { AuthProvider } from '@/auth/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Environment configuration
import config, { isDevelopment, isProduction } from '@/lib/env-config';

// Layout
import AppLayout from "@/components/layout/AppLayout";

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

// Auth Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthCallback } from './pages/AuthCallback';
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

function App() {
  return (
    <LazyMotion features={domAnimation}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
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
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/auth/callback/:provider" element={<AuthCallback />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    
                    {/* Protected routes with AppLayout */}
                    <Route element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }>
                      {/* Main routes */}
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/create-project" element={<CreateProject />} />
                      <Route path="/generated-plan" element={<GeneratedPlan />} />
                      <Route path="/project-details" element={<ProjectDetails />} />
                      <Route path="/project/:id" element={<ProjectDetails />} />
                      <Route path="/phase-details" element={<PhaseDetails />} />
                      <Route path="/phase/:id" element={<PhaseDetails />} />
                      <Route path="/generate-tasks" element={<TaskPlanningSetup />} />
                      
                      {/* Sidebar navigation routes */}
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/schedule" element={<Schedule />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/materials" element={<Materials />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/messaging" element={<Messaging />} />
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
        </AuthProvider>
      </QueryClientProvider>
    </LazyMotion>
  );
}

export default App;
