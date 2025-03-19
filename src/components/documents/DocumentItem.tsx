import React from 'react';
import { type DocumentItemLegacyProps } from '@/types/documents';
import { DocumentItem as SharedDocumentItem } from '@/components/shared/DocumentItem';

/**
 * Legacy document item component for the document list.
 * Uses the consolidated SharedDocumentItem implementation while maintaining
 * backward compatibility with existing code.
 */
export function DocumentItem(props: DocumentItemLegacyProps) {
  return <SharedDocumentItem {...props} animated />;
}