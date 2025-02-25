import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import ProjectDetails from "./pages/ProjectDetails";
import PhaseDetailsMockup from "./pages/PhaseDetailsMockup";
import ProjectInputMockup from "./pages/ProjectInputMockup";
import GeneratedPlan from "./pages/GeneratedPlan";
import TaskPlanningSetupMockup from "./pages/TaskPlanningSetupMockup";
import NotFound from "./pages/NotFound";
import Team from "./pages/Team";
import Schedule from "./pages/Schedule";
import Materials from "./pages/Materials";
import Documents from "./pages/Documents";
import Expenses from "./pages/Expenses";
import UIComponentsDemo from "./pages/UIComponentsDemo";
import Projects from "./pages/Projects";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Main routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-project" element={<ProjectInputMockup />} />
            <Route path="/generated-plan" element={<GeneratedPlan />} />
            <Route path="/project-details" element={<ProjectDetails />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
            <Route path="/phase-details" element={<PhaseDetailsMockup />} />
            <Route path="/phase/:id" element={<PhaseDetailsMockup />} />
            <Route path="/generate-tasks" element={<TaskPlanningSetupMockup />} />
            <Route path="/ui-components" element={<UIComponentsDemo />} />
            
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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
