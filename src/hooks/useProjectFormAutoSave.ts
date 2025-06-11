/**
 * Auto-save hook for project creation form
 * Saves form data to localStorage periodically
 */
import { useEffect, useCallback } from 'react';
import { UseFormWatch } from 'react-hook-form';
import { ProjectFormValues } from '@/pages/CreateProject';

const STORAGE_KEY = 'buildease_project_draft';
const SAVE_INTERVAL = 30000; // 30 seconds

export function useProjectFormAutoSave(
  watch: UseFormWatch<ProjectFormValues>,
  isDirty: boolean
) {
  // Save to localStorage
  const saveToStorage = useCallback((data: ProjectFormValues) => {
    try {
      const timestamp = new Date().toISOString();
      const draftData = {
        ...data,
        _savedAt: timestamp,
        _version: '1.0'
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
      console.log('Form auto-saved at:', timestamp);
    } catch (error) {
      console.warn('Failed to auto-save form data:', error);
    }
  }, []);

  // Load from localStorage
  const loadFromStorage = useCallback((): Partial<ProjectFormValues> | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Remove metadata before returning
        const { _savedAt, _version, ...formData } = parsed;
        return formData;
      }
    } catch (error) {
      console.warn('Failed to load saved form data:', error);
    }
    return null;
  }, []);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Saved form data cleared');
    } catch (error) {
      console.warn('Failed to clear saved form data:', error);
    }
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!isDirty) return;

    const subscription = watch((data) => {
      saveToStorage(data as ProjectFormValues);
    });

    // Also save on interval
    const intervalId = setInterval(() => {
      if (isDirty) {
        const currentData = watch();
        saveToStorage(currentData as ProjectFormValues);
      }
    }, SAVE_INTERVAL);

    return () => {
      subscription.unsubscribe();
      clearInterval(intervalId);
    };
  }, [watch, saveToStorage, isDirty]);

  return {
    loadFromStorage,
    clearSavedData,
    saveToStorage
  };
}