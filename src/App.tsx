import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContextProvider } from "@/components/ui/toast-context";
import { LazyMotion, domAnimation } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import { ProjectDetails } from "./pages/ProjectDetails";
import PhaseDetails from "./pages/PhaseDetails";
import ProjectInputs from "./pages/ProjectInputs";
import GeneratedPlan from "./pages/GeneratedPlan";
import TaskPlanningSetup from "./pages/TaskPlanningSetup";
import NotFound from "./pages/NotFound";
import Team from "./pages/Team";
import Schedule from "./pages/Schedule";
import Materials from "./pages/Materials";
import Documents from "./pages/Documents";
import Expenses from "./pages/Expenses";
import { Projects } from "./pages/Projects";

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

const App = () => (
  <LazyMotion features={domAnimation}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ToastContextProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route element={<AppLayout />}>
              {/* Main routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-project" element={<ProjectInputs />} />
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
              <Route path="/settings" element={<Dashboard />} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </LazyMotion>
);

export default App;
