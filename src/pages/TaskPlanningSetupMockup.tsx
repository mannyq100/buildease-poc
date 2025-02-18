import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ChevronRight,
  Calendar,
  Users,
  Package,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Ruler,
  CheckCircle2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TaskPlanningSetupMockup = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Villa Construction</span>
            <ArrowRight className="w-4 h-4" />
            <span>Foundation Phase</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <h1 className="text-xl font-bold">Task Planning Setup</h1>
            <Badge className="bg-blue-100 text-blue-600">Foundation Phase</Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Phase Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Phase Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <div className="flex space-x-2">
                  <Input type="number" placeholder="Duration" />
                  <Select defaultValue="weeks">
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Size</label>
                <Input type="number" placeholder="Number of team members" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget Allocation</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input className="pl-10" type="number" placeholder="Budget amount" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Deliverables */}
        <Card>
          <CardHeader>
            <CardTitle>Key Deliverables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Foundation Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select foundation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strip">Strip Foundation</SelectItem>
                  <SelectItem value="raft">Raft Foundation</SelectItem>
                  <SelectItem value="pile">Pile Foundation</SelectItem>
                  <SelectItem value="pad">Pad Foundation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Foundation Depth</label>
                <div className="flex space-x-2">
                  <Input type="number" placeholder="Depth" />
                  <Select defaultValue="m">
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m">m</SelectItem>
                      <SelectItem value="ft">ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Foundation Width</label>
                <div className="flex space-x-2">
                  <Input type="number" placeholder="Width" />
                  <Select defaultValue="m">
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m">m</SelectItem>
                      <SelectItem value="ft">ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Special Requirements</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select requirements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waterproofing">Waterproofing</SelectItem>
                  <SelectItem value="reinforcement">Extra Reinforcement</SelectItem>
                  <SelectItem value="drainage">Drainage System</SelectItem>
                  <SelectItem value="insulation">Thermal Insulation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Constraints */}
        <Card>
          <CardHeader>
            <CardTitle>Constraints & Dependencies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prerequisite Tasks</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select prerequisites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="siteClearance">Site Clearance</SelectItem>
                  <SelectItem value="permits">Building Permits</SelectItem>
                  <SelectItem value="utilities">Utility Marking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Weather Constraints</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select conditions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rainy">Rainy Season</SelectItem>
                    <SelectItem value="dry">Dry Season</SelectItem>
                    <SelectItem value="none">No Constraints</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Access Restrictions</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select restrictions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal Hours</SelectItem>
                    <SelectItem value="limited">Limited Hours</SelectItem>
                    <SelectItem value="weekend">No Weekends</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-medium text-blue-800">Ready for Task Generation</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Based on these parameters, I'll generate an optimized task list for your foundation phase.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline">Save as Draft</Button>
          <Button className="space-x-2">
            <span>Generate Tasks</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskPlanningSetupMockup;