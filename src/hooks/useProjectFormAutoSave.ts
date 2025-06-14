/**
 * Auto-save hook for project creation form
 * Uses enhanced storage system with proper size management
 */
import { useEffect, useCallback } from 'react';
import { UseFormWatch } from 'react-hook-form';
import { ProjectFormValues } from '@/pages/CreateProject';
import { useDebounce } from '@/utils/core/debounce';
import { storageManager } from '@/utils/storage/StorageManager';
import { STORAGE_KEYS, STORAGE_CONFIG } from '@/utils/storage/constants';
const DEBOUNCE_DELAY = 2000; // 2 seconds - more responsive than 30s interval

export function useProjectFormAutoSave(
  watch: UseFormWatch<ProjectFormValues>,
  isDirty: boolean
) {
  // Save using storage manager
  const saveToStorage = useCallback(async (data: ProjectFormValues) => {
    try {
      const timestamp = new Date().toISOString();
      const draftData = {
        ...data,
        _savedAt: timestamp,
        _version: '1.0'
      };
      
      await storageManager.set(STORAGE_KEYS.FORM.PROJECT_DRAFT, draftData, {
        expiresIn: STORAGE_CONFIG.CACHE_EXPIRY.FORM_DRAFT
      });
      
      // Form auto-saved successfully
    } catch (error) {
      console.warn('Failed to auto-save form data:', error);
    }
  }, []);

  // Create debounced save function
  const debouncedSave = useDebounce(saveToStorage, DEBOUNCE_DELAY, [saveToStorage]);

  // Load from storage manager
  const loadFromStorage = useCallback(async (): Promise<Partial<ProjectFormValues> | null> => {
    try {
      const saved = await storageManager.get(STORAGE_KEYS.FORM.PROJECT_DRAFT);
      if (saved) {
        // Remove metadata before returning
        const { _savedAt, _version, ...formData } = saved;
        return formData;
      }
    } catch (error) {
      console.warn('Failed to load saved form data:', error);
    }
    return null;
  }, []);

  // Clear saved data
  const clearSavedData = useCallback(async () => {
    try {
      await storageManager.remove(STORAGE_KEYS.FORM.PROJECT_DRAFT);
      // Saved form data cleared successfully
    } catch (error) {
      console.warn('Failed to clear saved form data:', error);
    }
  }, []);

  // Auto-save effect with debouncing
  useEffect(() => {
    if (!isDirty) return;

    const subscription = watch((data) => {
      // Use debounced save to prevent excessive localStorage writes
      debouncedSave(data as ProjectFormValues);
    });

    return () => {
      subscription.unsubscribe();
      // Flush any pending save when unmounting if form is dirty
      if (isDirty) {
        debouncedSave.flush();
      }
    };
  }, [watch, debouncedSave, isDirty]);

  return {
    loadFromStorage,
    clearSavedData,
    saveToStorage,
    forceSave: debouncedSave.flush // Allow manual save triggering
  };
}