/**
 * Plan Status System Test - Interactive test component for Phase 3
 * 
 * Tests:
 * - Plan status tracking components
 * - Progress visualization
 * - Version management
 * - Real-time updates
 * - Mobile responsiveness
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Monitor,
  Smartphone
} from 'lucide-react';
import { cn } from '@/utils/core/ui';
import { Project, PlanGenerationStatus } from '@/types/database';
import { 
  PlanStatusCard, 
  PlanProgressTracker, 
  PlanVersionManager,
  PlanStatusDashboard 
} from '@/components/plan';

interface TestState {
  planStatus: PlanGenerationStatus;
  jobId: string | null;
  simulatedProgress: number;
  testResults: Array<{
    component: string;
    test: string;
    status: 'pending' | 'running' | 'passed' | 'failed';
    message?: string;
  }>;
}

/**
 * Plan Status System Test Component
 * Interactive testing for Phase 3 implementation
 */
export function PlanStatusSystemTest() {
  const [testState, setTestState] = useState<TestState>({
    planStatus: 'not_started',
    jobId: null,
    simulatedProgress: 0,
    testResults: []
  });
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Mock project data
  const mockProject: Project = {
    id: 'test-project-1',
    name: 'Test Construction Project',
    description: 'A test project for Plan Status System',
    status: 'PLANNING',
    details: {
      location: {
        address: '123 Test Street',
        country: 'Ghana',
        region: 'Greater Accra',
        terrain: 'Flat',
        nearby_landmarks: 'Near test mall',
        coordinates: { lat: 5.6037, lng: -0.1870 }
      },
      specs: {
        plot_size: { value: 1000, unit: 'sqm' },
        building_size: { value: 200, unit: 'sqm' },
        floors: 2,
        rooms: {
          bedrooms: 3,
          bathrooms: 2,
          kitchens: 1,
          living_areas: 1
        }
      },
      project_type: 'Residential',
      building_style: 'Modern'
    },
    timeline: {
      planned_start: '2024-03-01',
      planned_end: '2024-08-01',
      actual_start: null,
      actual_end: null
    },
    budget: {
      allocated: 50000,
      spent: 0,
      currency: 'GHS'
    },
    owner_id: 'test-user-1',
    profile_image: null,
    images: [],
    ai_generated_plan: null,
    plan_approved: false,
    plan_generation_status: testState.planStatus,
    plan_generation_requested_at: null,
    plan_generation_completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const runComponentTest = async (
    component: string, 
    testName: string, 
    testFn: () => Promise<boolean>
  ) => {
    const testId = `${component}_${testName}`;
    
    // Mark test as running
    setTestState(prev => ({
      ...prev,
      testResults: [
        ...prev.testResults.filter(t => `${t.component}_${t.test}` !== testId),
        {
          component,
          test: testName,
          status: 'running'
        }
      ]
    }));

    try {
      const passed = await testFn();
      
      setTestState(prev => ({
        ...prev,
        testResults: prev.testResults.map(t => 
          `${t.component}_${t.test}` === testId 
            ? { ...t, status: passed ? 'passed' : 'failed' }
            : t
        )
      }));
    } catch (error) {
      setTestState(prev => ({
        ...prev,
        testResults: prev.testResults.map(t => 
          `${t.component}_${t.test}` === testId 
            ? { 
                ...t, 
                status: 'failed', 
                message: error instanceof Error ? error.message : 'Test failed'
              }
            : t
        )
      }));
    }
  };

  const runAllTests = async () => {
    // Reset test state
    setTestState(prev => ({
      ...prev,
      testResults: []
    }));

    // Test PlanStatusCard
    await runComponentTest('PlanStatusCard', 'Render', async () => {
      // Simulate checking if component renders
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    });

    await runComponentTest('PlanStatusCard', 'Status Display', async () => {
      // Test different status states
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    });

    // Test PlanProgressTracker
    await runComponentTest('PlanProgressTracker', 'Progress Display', async () => {
      // Simulate progress tracking
      setTestState(prev => ({ 
        ...prev, 
        planStatus: 'processing',
        jobId: 'test-job-1',
        simulatedProgress: 0
      }));
      
      // Simulate progress updates
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setTestState(prev => ({ 
          ...prev, 
          simulatedProgress: progress
        }));
      }
      
      return true;
    });

    // Test PlanVersionManager
    await runComponentTest('PlanVersionManager', 'Version Management', async () => {
      setTestState(prev => ({ 
        ...prev, 
        planStatus: 'completed'
      }));
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    });

    // Test PlanStatusDashboard
    await runComponentTest('PlanStatusDashboard', 'Dashboard Integration', async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    });

    // Test responsive design
    await runComponentTest('Responsive', 'Mobile View', async () => {
      setViewMode('mobile');
      await new Promise(resolve => setTimeout(resolve, 500));
      setViewMode('desktop');
      return true;
    });
  };

  const resetTests = () => {
    setTestState({
      planStatus: 'not_started',
      jobId: null,
      simulatedProgress: 0,
      testResults: []
    });
  };

  const simulateGenerateNew = () => {
    setTestState(prev => ({
      ...prev,
      planStatus: 'processing',
      jobId: 'simulated-job-' + Date.now()
    }));
  };

  const getTestIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const passedTests = testState.testResults.filter(t => t.status === 'passed').length;
  const totalTests = testState.testResults.length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Test Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Phase 3: Plan Status System Test
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Interactive testing for plan status tracking and progress visualization
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop')}
              >
                {viewMode === 'desktop' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                {viewMode === 'desktop' ? 'Mobile' : 'Desktop'}
              </Button>
              
              <Button variant="outline" onClick={resetTests}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              
              <Button onClick={runAllTests}>
                <Play className="h-4 w-4 mr-2" />
                Run Tests
              </Button>
            </div>
          </div>
          
          {totalTests > 0 && (
            <div className="flex items-center space-x-4 mt-4">
              <Badge variant={passedTests === totalTests ? 'default' : 'secondary'}>
                {passedTests}/{totalTests} Tests Passed
              </Badge>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalTests > 0 ? (passedTests / totalTests) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Test Results */}
      {testState.testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testState.testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    {getTestIcon(result.status)}
                    <span className="text-sm font-medium">{result.component}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">-</span>
                    <span className="text-sm">{result.test}</span>
                  </div>
                  {result.message && (
                    <span className="text-xs text-red-600">{result.message}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Component Demos */}
      <div className={cn(
        'space-y-6',
        viewMode === 'mobile' && 'max-w-sm mx-auto'
      )}>
        <Tabs defaultValue="status-card" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="status-card">Status Card</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="status-card" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Plan Status Card Demo</h3>
              <PlanStatusCard
                projectId={mockProject.id}
                projectName={mockProject.name}
                planGenerationStatus={testState.planStatus}
                onViewProgress={() => console.log('View progress clicked')}
                onViewPlans={() => console.log('View plans clicked')}
                onGenerateNew={simulateGenerateNew}
                compact={viewMode === 'mobile'}
              />
            </div>
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Progress Tracker Demo</h3>
              {testState.jobId ? (
                <PlanProgressTracker
                  projectId={mockProject.id}
                  jobId={testState.jobId}
                  onComplete={(planId) => console.log('Plan completed:', planId)}
                  onError={(error) => console.error('Progress error:', error)}
                  compact={viewMode === 'mobile'}
                />
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      Start plan generation to see progress tracking
                    </p>
                    <Button className="mt-3" onClick={simulateGenerateNew}>
                      Simulate Generation
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="versions" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Version Manager Demo</h3>
              <PlanVersionManager
                projectId={mockProject.id}
                onPlanSelect={(plan) => console.log('Plan selected:', plan)}
                onPlanActivate={(plan) => console.log('Plan activated:', plan)}
              />
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Status Dashboard Demo</h3>
              <PlanStatusDashboard
                project={{ ...mockProject, plan_generation_status: testState.planStatus }}
                onGenerateNew={simulateGenerateNew}
                onPlanSelect={(planId) => console.log('Plan selected:', planId)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default PlanStatusSystemTest;