/**
 * Test file for useProjectDetailsState hook
 * Verifies centralized UI state management and localStorage persistence
 */

import { renderHook, act } from '@testing-library/react';
import { useProjectDetailsState } from '../useProjectDetailsState';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('useProjectDetailsState', () => {
  const projectId = 'test-project-123';

  beforeEach(() => {
    // Clear all localStorage mocks
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  it('should initialize with default states', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useProjectDetailsState(projectId));

    expect(result.current.expandedSections).toEqual({
      budget: true,
      phases: true,
      team: false,
      documents: false,
      settings: false
    });

    expect(result.current.expandedPhases).toEqual({});
    expect(result.current.viewModes.teamView).toBe('compact');
    expect(result.current.imageUploadStates.showImageUpload).toBe(false);
  });

  it('should toggle sections correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useProjectDetailsState(projectId));

    act(() => {
      result.current.toggleSection('team');
    });

    expect(result.current.expandedSections.team).toBe(true);
  });

  it('should toggle phases correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useProjectDetailsState(projectId));

    act(() => {
      result.current.togglePhase('phase-123');
    });

    expect(result.current.expandedPhases['phase-123']).toBe(true);
  });

  it('should update view modes correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useProjectDetailsState(projectId));

    act(() => {
      result.current.setViewMode('teamView', 'detailed');
    });

    expect(result.current.viewModes.teamView).toBe('detailed');
  });

  it('should update image upload states correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useProjectDetailsState(projectId));

    act(() => {
      result.current.setImageUploadState('showImageUpload', true);
    });

    expect(result.current.imageUploadStates.showImageUpload).toBe(true);
  });

  it('should load from localStorage on initialization', () => {
    const savedExpandedSections = JSON.stringify({ budget: false, phases: false, team: true, documents: true, settings: false });
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key.includes('expanded-sections')) {
        return savedExpandedSections;
      }
      return null;
    });
    
    const { result } = renderHook(() => useProjectDetailsState(projectId));

    expect(result.current.expandedSections.team).toBe(true);
    expect(result.current.expandedSections.documents).toBe(true);
    expect(result.current.expandedSections.budget).toBe(false);
  });

  it('should reset state correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useProjectDetailsState(projectId));

    // Modify state
    act(() => {
      result.current.toggleSection('team');
      result.current.setViewMode('teamView', 'detailed');
      result.current.setImageUploadState('showImageUpload', true);
    });

    // Reset state
    act(() => {
      result.current.resetState();
    });

    expect(result.current.expandedSections.team).toBe(false);
    expect(result.current.viewModes.teamView).toBe('compact');
    expect(result.current.imageUploadStates.showImageUpload).toBe(false);
  });

  it('should use scoped localStorage keys', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    renderHook(() => useProjectDetailsState(projectId));

    // Check that localStorage.getItem was called with scoped keys
    expect(localStorageMock.getItem).toHaveBeenCalledWith(
      expect.stringContaining(`project-details-expanded-sections-${projectId}`)
    );
    expect(localStorageMock.getItem).toHaveBeenCalledWith(
      expect.stringContaining(`project-details-view-modes-${projectId}`)
    );
  });
});