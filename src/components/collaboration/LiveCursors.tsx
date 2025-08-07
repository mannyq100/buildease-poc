/**
 * LiveCursors Component
 * Shows real-time cursor positions of other collaborating users
 * Displays cursors with user names and smooth animations
 */

import { useEffect, useState } from 'react';
import { useRealTimeCollaboration } from '@/hooks/useRealTimeCollaboration';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';
import type { UserPresence } from '@/services/websocketService';

interface LiveCursorsProps {
  roomId: string;
  roomType: 'project' | 'document' | 'phase' | 'task';
  entityId: string;
  enabled?: boolean;
  className?: string;
}

interface CursorPosition {
  x: number;
  y: number;
  user: UserPresence;
  lastUpdate: number;
}

// Generate consistent colors for users
const getUserColor = (userId: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#FFB347', '#87CEEB', '#DEB887', '#F0E68C',
    '#FFE4E1', '#E0E0E0', '#FAFAD2', '#D3D3D3', '#FFF8DC'
  ];
  
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export function LiveCursors({
  roomId,
  roomType,
  entityId,
  enabled = true,
  className = ''
}: LiveCursorsProps) {
  const [cursorPositions, setCursorPositions] = useState<Map<string, CursorPosition>>(new Map());
  const [isTracking, setIsTracking] = useState(false);

  const {
    isJoined,
    cursors,
    updateCursor,
    otherUsers
  } = useRealTimeCollaboration({
    roomId,
    roomType,
    entityId,
    enabled
  });

  // Track mouse movement and send cursor updates
  useEffect(() => {
    if (!isJoined || !enabled) return;

    let throttleTimeout: NodeJS.Timeout;
    let lastUpdate = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      
      // Throttle cursor updates to avoid spam (max 10 updates per second)
      if (now - lastUpdate < 100) return;
      
      clearTimeout(throttleTimeout);
      throttleTimeout = setTimeout(() => {
        // Send relative position (percentage of viewport)
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        
        updateCursor({ x, y });
        lastUpdate = now;
      }, 50);
    };

    const handleMouseEnter = () => {
      setIsTracking(true);
      document.addEventListener('mousemove', handleMouseMove);
    };

    const handleMouseLeave = () => {
      setIsTracking(false);
      document.removeEventListener('mousemove', handleMouseMove);
    };

    // Start tracking when mouse enters the document
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Clean up on unmount
    return () => {
      clearTimeout(throttleTimeout);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isJoined, enabled, updateCursor]);

  // Update cursor positions from collaboration data
  useEffect(() => {
    const newPositions = new Map<string, CursorPosition>();
    
    cursors.forEach((cursor, userId) => {
      const user = otherUsers.find(u => u.user_id === userId);
      if (user) {
        newPositions.set(userId, {
          x: cursor.x,
          y: cursor.y,
          user,
          lastUpdate: Date.now()
        });
      }
    });

    setCursorPositions(newPositions);
  }, [cursors, otherUsers]);

  // Clean up stale cursors (remove cursors that haven't been updated in 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCursorPositions(prev => {
        const updated = new Map(prev);
        let hasStale = false;
        
        updated.forEach((cursor, userId) => {
          if (now - cursor.lastUpdate > 30000) {
            updated.delete(userId);
            hasStale = true;
          }
        });
        
        return hasStale ? updated : prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isJoined || !enabled || cursorPositions.size === 0) {
    return null;
  }

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      <AnimatePresence>
        {Array.from(cursorPositions.entries()).map(([userId, cursor]) => (
          <motion.div
            key={userId}
            className="absolute pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: `${cursor.x}vw`,
              y: `${cursor.y}vh`
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30,
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 }
            }}
            style={{
              color: getUserColor(userId)
            }}
          >
            {/* Cursor Icon */}
            <MousePointer2 
              className="h-5 w-5 drop-shadow-lg"
              style={{ 
                color: getUserColor(userId),
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
            />
            
            {/* User Name Label */}
            <motion.div
              className="absolute top-6 left-1 px-2 py-1 rounded-md text-xs font-medium text-white shadow-lg"
              style={{ 
                backgroundColor: getUserColor(userId),
                whiteSpace: 'nowrap'
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.1 }}
            >
              {cursor.user.user_name}
              
              {/* Typing indicator */}
              {cursor.user.is_typing && (
                <motion.div
                  className="inline-flex ml-2 space-x-0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </motion.div>
              )}
            </motion.div>

            {/* Cursor Trail Effect */}
            <motion.div
              className="absolute w-8 h-8 rounded-full opacity-20 -translate-x-2 -translate-y-2"
              style={{ backgroundColor: getUserColor(userId) }}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs pointer-events-auto">
          <div>Cursors: {cursorPositions.size}</div>
          <div>Tracking: {isTracking ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
}

// Separate component for cursor tracking within a specific container
export function ContainerLiveCursors({
  roomId,
  roomType,
  entityId,
  containerRef,
  enabled = true,
  className = ''
}: LiveCursorsProps & {
  containerRef: React.RefObject<HTMLElement>;
}) {
  const [cursorPositions, setCursorPositions] = useState<Map<string, CursorPosition>>(new Map());

  const {
    isJoined,
    cursors,
    updateCursor,
    otherUsers
  } = useRealTimeCollaboration({
    roomId,
    roomType,
    entityId,
    enabled
  });

  // Track mouse movement within container
  useEffect(() => {
    if (!isJoined || !enabled || !containerRef.current) return;

    const container = containerRef.current;
    let throttleTimeout: NodeJS.Timeout;
    let lastUpdate = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdate < 100) return;

      clearTimeout(throttleTimeout);
      throttleTimeout = setTimeout(() => {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Only send if cursor is within container bounds
        if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
          updateCursor({ x, y });
          lastUpdate = now;
        }
      }, 50);
    };

    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearTimeout(throttleTimeout);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isJoined, enabled, containerRef, updateCursor]);

  // Update cursor positions
  useEffect(() => {
    const newPositions = new Map<string, CursorPosition>();
    
    cursors.forEach((cursor, userId) => {
      const user = otherUsers.find(u => u.user_id === userId);
      if (user) {
        newPositions.set(userId, {
          x: cursor.x,
          y: cursor.y,
          user,
          lastUpdate: Date.now()
        });
      }
    });

    setCursorPositions(newPositions);
  }, [cursors, otherUsers]);

  if (!isJoined || !enabled || cursorPositions.size === 0) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <AnimatePresence>
        {Array.from(cursorPositions.entries()).map(([userId, cursor]) => (
          <motion.div
            key={userId}
            className="absolute pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              left: `${cursor.x}%`,
              top: `${cursor.y}%`
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 25
            }}
          >
            <MousePointer2 
              className="h-4 w-4 drop-shadow-md"
              style={{ 
                color: getUserColor(userId)
              }}
            />
            <div
              className="absolute top-5 left-1 px-1.5 py-0.5 rounded text-xs font-medium text-white shadow-md whitespace-nowrap"
              style={{ backgroundColor: getUserColor(userId) }}
            >
              {cursor.user.user_name}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}