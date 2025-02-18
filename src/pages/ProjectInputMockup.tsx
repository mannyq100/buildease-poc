import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  ChevronRight,
  Mic,
  Lightbulb
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface InsightItemProps {
  title: string;
  description: string;
}

const ProjectInputMockup = () => {
  const [progress, setProgress] = React.useState(25);
  const navigate = useNavigate();

  const handleGeneratePlan = () => {
    navigate('/generated-plan');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 transition-all duration-500">
      {/* Top Navigation */}
      <div className="bg-white/80 backdrop-blur-lg p-6 shadow-sm sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Create New Project</h1>
            <Button variant="ghost" className="text-gray-700 hover:text-gray-900 transition-colors">
              Advanced Mode
            </Button>
          </div>
          {/* Progress Bar */}
          <div className="mt-6">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-3 text-sm text-gray-600">
              <span className="font-medium">Details</span>
              <span>AI Planning</span>
              <span>Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* AI Assistant Card */}
        <Card className="bg-blue-50/50 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Sparkles className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900">AI Project Assistant</h3>
                <p className="text-sm text-blue-800/90 mt-2 leading-relaxed">
                  I'll help create a detailed project plan. Start by providing basic information about your construction project.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Details Tabs */}
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 p-1 rounded-lg">
            <TabsTrigger value="basic" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="building" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300">
              Building Details
            </TabsTrigger>
            <TabsTrigger value="requirements" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300">
              Requirements
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card className="overflow-hidden border-gray-200">
              <CardHeader className="bg-gray-50/50">
                <CardTitle className="text-xl text-gray-900">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Voice Input Section */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-900">Project Description</label>
                  <div className="flex space-x-3">
                    <Input 
                      className="flex-1 border-gray-200 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300" 
                      placeholder="Describe your project (e.g., 'Two-story residential house with 3 bedrooms')" 
                    />
                    <Button variant="outline" size="icon" className="hover:bg-gray-50 transition-colors">
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Core Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900">Project Type</label>
                    <Select>
                      <SelectTrigger className="border-gray-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential House</SelectItem>
                        <SelectItem value="apartment">Apartment Building</SelectItem>
                        <SelectItem value="commercial">Commercial Building</SelectItem>
                        <SelectItem value="renovation">Renovation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900">Location</label>
                    <Input placeholder="Enter city/region" className="border-gray-200" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900">Budget Range</label>
                    <Select>
                      <SelectTrigger className="border-gray-200">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50-100k">$50,000 - $100,000</SelectItem>
                        <SelectItem value="100-200k">$100,000 - $200,000</SelectItem>
                        <SelectItem value="200-500k">$200,000 - $500,000</SelectItem>
                        <SelectItem value="500k+">Above $500,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900">Timeline</label>
                    <Select>
                      <SelectTrigger className="border-gray-200">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6-12">6-12 months</SelectItem>
                        <SelectItem value="12-18">12-18 months</SelectItem>
                        <SelectItem value="18-24">18-24 months</SelectItem>
                        <SelectItem value="24+">Over 24 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Building Details Tab */}
          <TabsContent value="building" className="space-y-6">
            <Card>
              <CardHeader className="bg-gray-50/50">
                <CardTitle className="text-xl text-gray-900">Building Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 p-6">
                {/* Building Type */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-900">Building Structure</label>
                  <Select>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select structure type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Story</SelectItem>
                      <SelectItem value="double">Two Story</SelectItem>
                      <SelectItem value="multi">Multi Story</SelectItem>
                      <SelectItem value="split">Split Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Plot & Building Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900">Plot Size</label>
                    <div className="flex space-x-3">
                      <Input type="number" placeholder="Size" className="border-gray-200" />
                      <Select defaultValue="sqm">
                        <SelectTrigger className="w-28 border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sqm">sq.m</SelectItem>
                          <SelectItem value="sqft">sq.ft</SelectItem>
                          <SelectItem value="acres">acres</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900">Building Size</label>
                    <div className="flex space-x-3">
                      <Input type="number" placeholder="Size" className="border-gray-200" />
                      <Select defaultValue="sqm">
                        <SelectTrigger className="w-28 border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sqm">sq.m</SelectItem>
                          <SelectItem value="sqft">sq.ft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Room Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900">Bedrooms</label>
                    <Input type="number" placeholder="Number of bedrooms" className="border-gray-200" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900">Bathrooms</label>
                    <Input type="number" placeholder="Number of bathrooms" className="border-gray-200" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900">Living Areas</label>
                    <Input type="number" placeholder="Number of living areas" className="border-gray-200" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900">Kitchens</label>
                    <Input type="number" placeholder="Number of kitchens" className="border-gray-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-6">
            <Card>
              <CardHeader className="bg-gray-50/50">
                <CardTitle className="text-xl text-gray-900">Additional Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900">Garage</label>
                    <Select>
                      <SelectTrigger className="border-gray-200">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Garage</SelectItem>
                        <SelectItem value="single">Single Car</SelectItem>
                        <SelectItem value="double">Double Car</SelectItem>
                        <SelectItem value="triple">Triple Car</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900">Outdoor Space</label>
                    <Select>
                      <SelectTrigger className="border-gray-200">
                        <SelectValue placeholder="Select options" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="garden">Garden</SelectItem>
                        <SelectItem value="patio">Patio</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900">Style</label>
                    <Select>
                      <SelectTrigger className="border-gray-200">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="traditional">Traditional</SelectItem>
                        <SelectItem value="contemporary">Contemporary</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900">Special Features</label>
                    <Select>
                      <SelectTrigger className="border-gray-200">
                        <SelectValue placeholder="Select features" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balcony">Balcony</SelectItem>
                        <SelectItem value="basement">Basement</SelectItem>
                        <SelectItem value="pool">Swimming Pool</SelectItem>
                        <SelectItem value="solar">Solar Panels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Initial AI Insights */}
        <Card className="overflow-hidden border-yellow-100">
          <CardHeader className="bg-yellow-50/50">
            <CardTitle className="flex items-center space-x-3 text-xl text-gray-900">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span>AI Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <InsightItem 
              title="Layout Optimization"
              description="Based on plot size, recommend north-facing living areas"
            />
            <InsightItem 
              title="Local Considerations"
              description="Building permits typically take 4-6 weeks in this region"
            />
            <InsightItem 
              title="Cost Estimation"
              description="Similar projects in the area average $180/sq.ft"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            variant="outline" 
            className="hover:bg-gray-50 transition-colors"
          >
            Save Draft
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 transition-colors"
            onClick={handleGeneratePlan}
          >
            <span>Generate Plan</span>
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const InsightItem: React.FC<InsightItemProps> = ({ title, description }) => (
  <div className="flex items-start space-x-4 p-4 bg-yellow-50/50 rounded-lg border border-yellow-100/50 hover:border-yellow-200 transition-all duration-300">
    <Sparkles className="w-5 h-5 text-yellow-500 mt-0.5" />
    <div>
      <h4 className="font-medium text-gray-900">{title}</h4>
      <p className="text-sm text-gray-700 mt-1 leading-relaxed">{description}</p>
    </div>
  </div>
);

export default ProjectInputMockup;
