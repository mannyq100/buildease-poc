import React from 'react';
import { DocumentItem as SharedDocumentItem } from '@/components/shared/DocumentItem';

interface PhasesDocumentItemProps {
  name: string;
  type: string;
  date: string;
  size: string;
  status: 'current' | 'approved' | 'pending' | 'archived';
}

/**
 * DocumentItem component for displaying document details in phase views
 * Now using the consolidated SharedDocumentItem with animation
 */
export function DocumentItem({ name, type, date, size, status }: PhasesDocumentItemProps) {
  return (
    <SharedDocumentItem
      name={name}
      type={type}
      date={date}
      size={size}
      status={status}
      animated={true}
    />
  );
}