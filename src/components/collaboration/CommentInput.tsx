/**
 * Comment Input Component
 * Input field for creating new comments with real-time typing indicators
 */

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  isSubmitting: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function CommentInput({
  value,
  onChange,
  onSubmit,
  onTypingStart,
  onTypingStop,
  isSubmitting,
  disabled = false,
  placeholder = 'Add a comment...'
}: CommentInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const [isComposing, setIsComposing] = useState(false);

  const TYPING_TIMEOUT_MS = 3000;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Handle typing indicators
    if (newValue.trim() && !isComposing) {
      setIsComposing(true);
      onTypingStart();
    } else if (!newValue.trim() && isComposing) {
      setIsComposing(false);
      onTypingStop();
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after timeout of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isComposing) {
        setIsComposing(false);
        onTypingStop();
      }
    }, TYPING_TIMEOUT_MS);
  }, [isComposing, onChange, onTypingStart, onTypingStop]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!value.trim() || isSubmitting) return;
    
    setIsComposing(false);
    onTypingStop();
    onSubmit();
  };

  return (
    <div className="space-y-3">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="min-h-[80px] resize-none"
        disabled={disabled || isSubmitting}
      />
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Press Enter to send, Shift+Enter for new line
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={!value.trim() || isSubmitting || disabled}
          size="sm"
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
          Send
        </Button>
      </div>
    </div>
  );
}