/**
 * ChatEmptyState Component
 * 
 * Displays empty state when no conversation is selected
 * Extracted from Chat.tsx to improve maintainability
 */
import React from 'react';
import { Plus, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { m } from "framer-motion";
import { Conversation, ChatParticipant, ConversationType } from "@/types/messaging";

interface ChatEmptyStateProps {
  conversations: Conversation[];
  currentUser: ChatParticipant;
  onCreateConversation?: (type: ConversationType, participants: ChatParticipant[]) => void;
  className?: string;
}

export function ChatEmptyState({
  conversations,
  currentUser,
  onCreateConversation,
  className
}: ChatEmptyStateProps) {
  const handleNewConversation = () => {
    if (!onCreateConversation) return;
    
    // This is a simplified version - in real usage, we'd open a dialog to select participants
    const firstTeamMember = conversations.length > 0 
      ? conversations[0].participants.find(p => p.id !== currentUser.id)
      : null;
    
    if (firstTeamMember) {
      onCreateConversation("individual", [firstTeamMember]);
    }
  };

  return (
    <m.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`h-full flex items-center justify-center bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 ${className || ''}`}
    >
      <m.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center max-w-md mx-auto p-8"
      >
        <m.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.3 
          }}
          className="mb-6 mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-blue-100 to-sky-100 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center shadow-md"
        >
          <MessagesSquare className="h-12 w-12 text-blue-500 dark:text-blue-400" />
        </m.div>
        
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
          Select a conversation
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Choose an existing conversation or start a new one to begin messaging
        </p>
        
        {onCreateConversation && (
          <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={handleNewConversation}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg shadow-md transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </m.div>
        )}
      </m.div>
    </m.div>
  );
}