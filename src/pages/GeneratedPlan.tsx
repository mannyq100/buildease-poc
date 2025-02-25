import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronRight, 
  ChevronLeft, 
  Download,
  Building,
  FileText,
  Calendar,
  BarChart4,
  Clock,
  DollarSign,
  Settings,
  Sparkles,
  Share2,
  Printer,
  User,
  MessageSquare,
  PlusCircle,
  RotateCw
} from 'lucide-react';
import ProgressHeader from "@/components/generated-plan/ProgressHeader";
import ProjectOverview from "@/components/generated-plan/ProjectOverview";
import ProjectPhases from "@/components/generated-plan/ProjectPhases";
import AIRecommendations from "@/components/generated-plan/AIRecommendations";
import { useNavigate } from 'react-router-dom';

const GeneratedPlan = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [showCollaborateModal, setShowCollaborateModal] = useState<boolean>(false);

  const handleRegenerate = () => {
    setIsRegenerating(true);
    // Simulate regeneration
    setTimeout(() => {
      setIsRegenerating(false);
    }, 3000);
  };

  const navigateToProjectInput = () => {
    navigate('/create-project');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 transition-all duration-500">
      <ProgressHeader />

      {/* Tabs Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center px-6 py-2">
              <TabsList className="grid grid-cols-4 h-10">
                <TabsTrigger value="overview" className="flex items-center gap-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Building className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center gap-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Timeline</span>
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center gap-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <BarChart4 className="w-4 h-4" />
                  <span className="hidden sm:inline">Resources</span>
                </TabsTrigger>
                <TabsTrigger value="docs" className="flex items-center gap-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Documents</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCollaborateModal(true)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
              </div>
            </div>

            {/* Content Sections */}
            <div className="p-6">
              <TabsContent value="overview" className="space-y-6 mt-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Project Plan Overview</h1>
                    <p className="text-gray-500 mt-1">AI generated based on your specifications</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2" 
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                  >
                    <RotateCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                    {isRegenerating ? 'Regenerating...' : 'Regenerate Plan'}
                  </Button>
                </div>
                
                <ProjectOverview />
                <ProjectPhases />
                <AIRecommendations />
              </TabsContent>

              <TabsContent value="timeline" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Interactive Timeline</CardTitle>
                    <CardDescription>
                      Visualize your project timeline and dependencies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-100 border rounded-md p-8 text-center">
                      <p className="text-gray-500">Gantt chart visualization would appear here</p>
                      <div className="h-64 flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-gray-300" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure View
                      </Button>
                      <Button size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export Timeline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Allocation</CardTitle>
                    <CardDescription>
                      Manage and optimize your project resources
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ResourceCard 
                        title="Labor" 
                        allocated="$78,500" 
                        percentage={35}
                        status="optimized"
                      />
                      <ResourceCard 
                        title="Materials" 
                        allocated="$105,300" 
                        percentage={47}
                        status="warning"
                      />
                      <ResourceCard 
                        title="Equipment" 
                        allocated="$40,200" 
                        percentage={18}
                        status="optimized"
                      />
                    </div>
                    <div className="bg-gray-100 border rounded-md p-8 text-center">
                      <p className="text-gray-500">Resource distribution chart would appear here</p>
                      <div className="h-48 flex items-center justify-center">
                        <BarChart4 className="w-16 h-16 text-gray-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="docs" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Documents</CardTitle>
                    <CardDescription>
                      Generated documents and specifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DocumentCard 
                        title="Project Specification"
                        type="PDF"
                        modified="Today"
                        status="generated"
                      />
                      <DocumentCard 
                        title="Budget Breakdown"
                        type="XLSX"
                        modified="Today"
                        status="generated"
                      />
                      <DocumentCard 
                        title="Team Allocation"
                        type="PDF"
                        modified="Today"
                        status="generated"
                      />
                      <DocumentCard 
                        title="Material Specifications"
                        type="PDF"
                        modified="Pending"
                        status="pending"
                      />
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Generate Additional Document
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            className="space-x-2 hover:bg-gray-50 transition-colors"
            onClick={navigateToProjectInput}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Adjust Inputs</span>
          </Button>
          <Button className="space-x-2 bg-blue-600 hover:bg-blue-700 transition-colors">
            <span>Continue to Details</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Collaborate Modal (simplified for mockup) */}
      {showCollaborateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Share Project Plan</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Add Collaborators</label>
                <div className="flex gap-2">
                  <div className="flex-grow relative">
                    <input 
                      type="text" 
                      placeholder="Email address" 
                      className="w-full p-2 border rounded-md"
                    />
                    <User className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <Button>
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Link</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value="https://buildese.com/projects/abc123" 
                    className="w-full p-2 border rounded-md bg-gray-50"
                    readOnly
                  />
                  <Button variant="outline">Copy</Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Add a Message</label>
                <textarea 
                  className="w-full p-2 border rounded-md h-20"
                  placeholder="Add a note to your collaborators..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCollaborateModal(false)}>
                Cancel
              </Button>
              <Button>
                <MessageSquare className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper components
const ResourceCard = ({ title, allocated, percentage, status }) => (
  <div className="border rounded-lg p-4 hover:border-gray-300 transition-all duration-300">
    <div className="flex justify-between items-start">
      <h3 className="font-medium text-gray-900">{title}</h3>
      <Badge className={
        status === 'optimized' 
          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
          : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
      }>
        {status === 'optimized' ? 'Optimized' : 'Review'}
      </Badge>
    </div>
    <div className="mt-2">
      <div className="flex justify-between items-center text-sm mb-1">
        <span className="font-medium text-lg">{allocated}</span>
        <span className="text-gray-500">{percentage}% of budget</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${status === 'optimized' ? 'bg-green-500' : 'bg-yellow-500'}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  </div>
);

const DocumentCard = ({ title, type, modified, status }) => (
  <div className="border rounded-lg p-4 hover:border-gray-300 transition-all duration-300">
    <div className="flex justify-between items-start">
      <div className="flex items-center">
        <div className={`h-10 w-10 rounded flex items-center justify-center ${
          type === 'PDF' ? 'bg-red-100 text-red-600' : 
          type === 'XLSX' ? 'bg-green-100 text-green-600' :
          'bg-blue-100 text-blue-600'
        }`}>
          <FileText className="h-5 w-5" />
        </div>
        <div className="ml-3">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">Modified: {modified}</p>
        </div>
      </div>
      <Badge className={
        status === 'generated' 
          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }>
        {status === 'generated' ? (
          <div className="flex items-center">
            <Sparkles className="h-3 w-3 mr-1" />
            <span>Generated</span>
          </div>
        ) : 'Pending'}
      </Badge>
    </div>
    <div className="flex justify-end mt-3">
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-1" />
        Download
      </Button>
    </div>
  </div>
);

export default GeneratedPlan;
