/**
 * CollaborationProvider Component
 * Context provider for managing global collaboration state
 * Handles authentication, connection management, and error handling
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { websocketService } from '@/services/websocketService';
import { getUserDisplayName } from '@/utils/projectUtils';
import { toast } from 'sonner';

interface CollaborationContextType {
  isInitialized: boolean;
  isConnected: boolean;
  connectionError: string | null;
  reconnect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

interface CollaborationProviderProps {
  children: ReactNode;
  enableAutoConnect?: boolean;
}

export function CollaborationProvider({ 
  children, 
  enableAutoConnect = true 
}: CollaborationProviderProps) {
  const { user } = useSupabaseAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Initialize collaboration service when user is available
  useEffect(() => {
    if (!user || !enableAutoConnect) return;

    const initializeCollaboration = async () => {
      try {
        const userName = getUserDisplayName({ user } as any);
        await websocketService.initialize(user.id, userName);
        setIsInitialized(true);
        setConnectionError(null);
      } catch (error) {
        console.error('Failed to initialize collaboration:', error);
        setConnectionError(error instanceof Error ? error.message : 'Connection failed');
        setIsInitialized(false);
      }
    };

    initializeCollaboration();
  }, [user, enableAutoConnect]);

  // Monitor connection status
  useEffect(() => {
    const unsubscribe = websocketService.onConnection((connected) => {
      setIsConnected(connected);
      
      if (connected) {
        setConnectionError(null);
        if (isInitialized) {
          toast.success('Real-time collaboration connected', { duration: 2000 });
        }
      } else {
        setConnectionError('Connection lost');
        if (isInitialized) {
          toast.error('Lost connection to collaboration services', { duration: 3000 });
        }
      }
    });

    return unsubscribe;
  }, [isInitialized]);

  // Reconnect function
  const reconnect = async () => {
    if (!user) return;
    
    try {
      setConnectionError(null);
      const userName = getUserDisplayName({ user } as any);
      await websocketService.initialize(user.id, userName);
      setIsInitialized(true);
    } catch (error) {
      console.error('Reconnection failed:', error);
      setConnectionError(error instanceof Error ? error.message : 'Reconnection failed');
    }
  };

  // Disconnect function
  const disconnect = async () => {
    try {
      await websocketService.disconnect();
      setIsInitialized(false);
      setIsConnected(false);
      setConnectionError(null);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const value: CollaborationContextType = {
    isInitialized,
    isConnected,
    connectionError,
    reconnect,
    disconnect
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
}