import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  ChevronRight,
  Mic,
  Camera,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Upload,
  Lightbulb
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProjectInputMockup = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <div className="bg-white p-4 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Create New Project</h1>
            <Button variant="ghost" className="text-blue-600">
              Advanced Mode
            </Button>
          </div>
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={25} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Details</span>
              <span>AI Planning</span>
              <span>Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* AI Assistant Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-medium text-blue-800">AI Project Assistant</h3>
                <p className="text-sm text-blue-700 mt-1">
                  I'll help create a detailed project plan. Start by providing basic information about your construction project.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Voice Input Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Description</label>
              <div className="flex space-x-2">
                <Input 
                  className="flex-1" 
                  placeholder="Describe your project (e.g., 'Two-story residential house with 3 bedrooms')" 
                />
                <Button variant="outline" size="icon">
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Core Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Type</label>
                <Select>
                  <SelectTrigger>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input placeholder="Enter city/region" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Budget Range</label>
                <Select>
                  <SelectTrigger>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Timeline</label>
                <Select>
                  <SelectTrigger>
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

            {/* Optional Uploads */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium mb-3">Additional References (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-1">
                  <Upload className="h-5 w-5" />
                  <span className="text-sm">Floor Plans</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-1">
                  <Camera className="h-5 w-5" />
                  <span className="text-sm">Reference Photos</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Initial AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span>Initial Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InsightItem 
              title="Local Regulations"
              description="Building permits typically take 4-6 weeks in this region"
            />
            <InsightItem 
              title="Weather Considerations"
              description="Plan for rainy season during Apr-Jun in your timeline"
            />
            <InsightItem 
              title="Cost Estimation"
              description="Current material prices suggest 10% contingency buffer"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline">Save Draft</Button>
          <Button className="space-x-2">
            <span>Generate Plan</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const InsightItem = ({ title, description }) => (
  <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
    <Sparkles className="w-5 h-5 text-yellow-600 mt-0.5" />
    <div>
      <h4 className="font-medium text-yellow-900">{title}</h4>
      <p className="text-sm text-yellow-800 mt-1">{description}</p>
    </div>
  </div>
);

export default ProjectInputMockup;