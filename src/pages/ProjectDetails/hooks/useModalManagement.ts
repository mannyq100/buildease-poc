/**
 * useModalManagement - Custom hook for managing modal states
 * Extracted from ProjectDetailsContent.tsx for better organization
 * Handles modal open/close states and editing items for CRUD operations
 */

import { useState } from 'react';

interface EditingItem {
  type: 'budget' | 'phase' | 'team';
  data: Record<string, unknown>;
}

export function useModalManagement() {
  // Modal states
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [currentPhaseId, setCurrentPhaseId] = useState<string>('');
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Helper functions
  const openCreateModal = (type: 'budget' | 'phase' | 'team') => {
    setModalMode('create');
    setEditingItem(null);
    
    if (type === 'budget') setShowBudgetModal(true);
    if (type === 'phase') setShowPhaseModal(true);
    if (type === 'team') setShowTeamModal(true);
  };
  
  const openEditModal = (type: 'budget' | 'phase' | 'team', data: Record<string, unknown>) => {
    setModalMode('edit');
    setEditingItem({ type, data });
    if (type === 'budget') setShowBudgetModal(true);
    if (type === 'phase') setShowPhaseModal(true);
    if (type === 'team') setShowTeamModal(true);
  };
  
  const closeModals = () => {
    setShowBudgetModal(false);
    setShowPhaseModal(false);
    setShowTeamModal(false);
    setEditingItem(null);
    setCurrentPhaseId('');
  };

  return {
    // Modal states
    showBudgetModal,
    showPhaseModal,
    showTeamModal,
    currentPhaseId,
    editingItem,
    modalMode,
    
    // Modal actions
    openCreateModal,
    openEditModal,
    closeModals,
    
    // Setters for specific use cases
    setCurrentPhaseId,
  };
}