import React from 'react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Share2, Filter } from 'lucide-react';
import type { PageHeaderAction } from '@/components/shared/PageHeader';

export const usePageActions = (page: string) => {
  const navigate = useNavigate();

  const getCommonActions = useCallback((): PageHeaderAction[] => {
    const actions: Record<string, PageHeaderAction[]> = {
      projects: [
        {
          label: 'New Project',
          icon: <Plus className="h-4 w-4" />,
          variant: 'glow',
          onClick: () => navigate('/projects/create')
        },
        {
          label: 'Export',
          icon: <Download className="h-4 w-4" />,
          variant: 'blueprint',
          onClick: () => console.log('Export')
        },
        {
          label: 'Share',
          icon: <Share2 className="h-4 w-4" />,
          variant: 'blueprint',
          onClick: () => console.log('Share')
        },
        {
          label: 'Filter',
          icon: <Filter className="h-4 w-4" />,
          variant: 'construction',
          onClick: () => console.log('Filter')
        }
      ],
      tasks: [
        {
          label: 'New Task',
          icon: <Plus className="h-4 w-4" />,
          variant: 'glow',
          onClick: () => navigate('/tasks/create')
        }
      ],
      documents: [
        {
          label: 'Upload Document',
          icon: <Plus className="h-4 w-4" />,
          variant: 'glow',
          onClick: () => console.log('Upload')
        }
      ],
      materials: [
        {
          label: 'Add Material',
          icon: <Plus className="h-4 w-4" />,
          variant: 'glow',
          onClick: () => console.log('Add Material')
        }
      ],
      expenses: [
        {
          label: 'Add Expense',
          icon: <Plus className="h-4 w-4" />,
          variant: 'glow',
          onClick: () => console.log('Add Expense')
        }
      ],
      team: [
        {
          label: 'Add Member',
          icon: <Plus className="h-4 w-4" />,
          variant: 'glow',
          onClick: () => console.log('Add Member')
        }
      ]
    };

    return actions[page.toLowerCase()] || [];
  }, [navigate, page]);

  return {
    getCommonActions
  };
};
