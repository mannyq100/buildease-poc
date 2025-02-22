import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import GeneratedPlan from "./pages/GeneratedPlan";
import NotFound from "./pages/NotFound";
import ProjectInputMockup from "./pages/ProjectInputMockup";
import ProjectDetailsMockup from "./pages/ProjectDetailsMockup";
import PhaseDetailsMockup from "./pages/PhaseDetailsMockup";
import TaskPlanningSetupMockup from "./pages/TaskPlanningSetupMockup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/create-project" element={<ProjectInputMockup/>} />
            <Route path="/generated-plan" element={<GeneratedPlan />} />
            <Route path="/project-details" element={<ProjectDetailsMockup />} />
            <Route path="/phase-details" element={<PhaseDetailsMockup/>} />
            <Route path="/generate-tasks" element={<TaskPlanningSetupMockup/>}/>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
