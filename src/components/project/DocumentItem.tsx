import React from 'react';
import { SimpleDocumentItem } from '@/types/documents';
import { DocumentItem as SharedDocumentItem } from '@/components/shared/DocumentItem';

/**
 * Document item component for displaying document details
 * Using the consolidated SharedDocumentItem with simplified mode
 */
export function DocumentItem({ title, type, date, size }: SimpleDocumentItem) {
  return (
    <SharedDocumentItem
      title={title}
      type={type}
      date={date}
      size={size}
      simplified={true}
    />
  );
}