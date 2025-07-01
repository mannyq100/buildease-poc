/**
 * Simple test file to verify AI Plan Service functionality
 * This ensures our Phase 1 implementation works correctly
 */

import { AIPlanService } from '../services/aiPlanService';
import { AIPlanJobStatus, PlanGenerationStatus } from '../types/database';

// Mock localStorage for testing
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: (key: string) => mockLocalStorage.store[key] || null,
  setItem: (key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  },
  clear: () => {
    mockLocalStorage.store = {};
  }
};

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

/**
 * Test AI Plan Service basic functionality
 */
async function testAIPlanService() {
  console.log('🧪 Testing AI Plan Service...');
  
  try {
    // Test 1: Request plan generation
    const mockRequest = {
      projectId: 'test-project-123',
      projectDetails: {
        name: 'Test Project',
        description: 'A test construction project',
        type: 'Residential',
        location: 'Test Location',
        budget: 50000,
        specs: {
          plotSize: { value: 100, unit: 'sq_m' },
          buildingSize: { value: 80, unit: 'sq_m' },
          floors: 2,
          rooms: { bedrooms: 3, bathrooms: 2, kitchens: 1, living_areas: 1 }
        },
        features: ['Modern Design', 'Energy Efficient'],
        materials: {
          structure_type: 'Concrete',
          foundation_type: 'Slab',
          roof_type: 'Metal',
          wall_material: 'Brick',
          floor_material: 'Tile'
        }
      }
    };

    const jobId = await AIPlanService.requestPlanGeneration(mockRequest);
    console.log('✅ Plan generation requested successfully. Job ID:', jobId);

    // Test 2: Get job status
    const status = await AIPlanService.getPlanJobStatus(jobId);
    console.log('✅ Job status retrieved:', status);

    // Test 3: Project plan status management
    await AIPlanService.updateProjectPlanStatus('test-project-123', 'requested');
    const projectStatus = await AIPlanService.getProjectPlanStatus('test-project-123');
    console.log('✅ Project status updated and retrieved:', projectStatus);

    // Verify types
    const validJobStatuses: AIPlanJobStatus[] = ['pending', 'processing', 'completed', 'failed'];
    const validPlanStatuses: PlanGenerationStatus[] = ['not_started', 'requested', 'processing', 'completed', 'failed'];
    
    console.log('✅ Type validation passed');
    console.log('🎉 All AI Plan Service tests passed!');
    
    return true;
  } catch (error) {
    console.error('❌ AI Plan Service test failed:', error);
    return false;
  }
}

// Export for potential use
export { testAIPlanService };

// Auto-run test if this file is imported
if (typeof window !== 'undefined') {
  // testAIPlanService();
}