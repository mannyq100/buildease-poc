/**
 * Voice Note Recorder for hands-free construction updates
 * Designed for workers wearing gloves or in situations where typing is impractical
 */

import { useState, useRef, useCallback } from 'react';
import { Mic, Play, Square } from 'lucide-react';
import { TouchOptimizedButton } from '@/components/ui/TouchOptimizedButton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/core/ui';
import type { VoiceNoteData } from '@/types/enhanced-project';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  grammars: SpeechGrammarList;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

interface VoiceNoteRecorderProps {
  onTranscript: (data: VoiceNoteData) => void;
  placeholder?: string;
  maxDuration?: number; // in seconds
  autoSubmit?: boolean;
  className?: string;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'playback';

export function VoiceNoteRecorder({
  onTranscript,
  placeholder = 'Tap to record voice note',
  maxDuration = 60,
  autoSubmit = true,
  className
}: VoiceNoteRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check for Web Speech API support
  const hasSpeechRecognition = typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  
  const startRecording = useCallback(async () => {
    try {
      setState('recording');
      setTranscript('');
      setDuration(0);
      
      // Start audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      
      // Start speech recognition if available
      if (hasSpeechRecognition) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          let interimTranscript = '';
          let totalConfidence = 0;
          let results = 0;
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
              totalConfidence += confidence;
              results++;
            } else {
              interimTranscript += transcript;
            }
          }
          
          setTranscript(finalTranscript + interimTranscript);
          if (results > 0) {
            setConfidence(totalConfidence / results);
          }
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
        };
        
        recognition.start();
        recognitionRef.current = recognition;
      }
      
      // Duration timer
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setState('idle');
    }
  }, [maxDuration]);
  
  const stopRecording = useCallback(() => {
    setState('processing');
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Clear duration timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    // Process results
    setTimeout(() => {
      if (transcript.trim() && autoSubmit) {
        handleSubmit();
      } else {
        setState('idle');
      }
    }, 1000);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  }, [transcript, autoSubmit]);
  
  const handleSubmit = useCallback(() => {
    if (transcript.trim()) {
      const voiceData: VoiceNoteData = {
        transcript: transcript.trim(),
        confidence,
        timestamp: new Date(),
      };
      
      onTranscript(voiceData);
      setTranscript('');
      setConfidence(0);
      setDuration(0);
      setState('idle');
    }
  }, [transcript, confidence, onTranscript]);
  
  const playAudio = useCallback(() => {
    if (audioUrl && audioRef.current) {
      setState('playback');
      audioRef.current.play();
    }
  }, [audioUrl]);
  
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {/* Record Button */}
          <TouchOptimizedButton
            touchSize="lg"
            hapticFeedback
            onClick={state === 'recording' ? stopRecording : startRecording}
            disabled={state === 'processing'}
            className={cn(
              "rounded-full transition-all duration-200",
              state === 'recording' 
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                : "bg-buildease-blue-500 hover:bg-buildease-blue-600 text-white"
            )}
          >
            {state === 'recording' ? (
              <Square className="h-6 w-6" />
            ) : state === 'processing' ? (
              <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </TouchOptimizedButton>
          
          {/* Content Area */}
          <div className="flex-1 min-h-[60px]">
            {state === 'idle' && !transcript && (
              <div className="flex items-center h-full">
                <p className="text-slate-600">{placeholder}</p>
              </div>
            )}
            
            {state === 'recording' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-red-600">Recording</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatDuration(duration)} / {formatDuration(maxDuration)}
                  </Badge>
                </div>
                {transcript && (
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {transcript}
                  </p>
                )}
              </div>
            )}
            
            {state === 'processing' && (
              <div className="flex items-center gap-2 h-full">
                <div className="w-4 h-4 border-2 border-buildease-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-600">Processing...</span>
              </div>
            )}
            
            {(state === 'idle' || state === 'playback') && transcript && (
              <div className="space-y-3">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {transcript}
                </p>
                
                <div className="flex items-center gap-2">
                  {confidence > 0 && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        confidence > 0.8 ? "border-green-500 text-green-700" :
                        confidence > 0.6 ? "border-yellow-500 text-yellow-700" :
                        "border-red-500 text-red-700"
                      )}
                    >
                      {Math.round(confidence * 100)}% confident
                    </Badge>
                  )}
                  
                  {audioUrl && (
                    <TouchOptimizedButton
                      touchSize="sm"
                      variant="outline"
                      onClick={playAudio}
                      className="h-8"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Play
                    </TouchOptimizedButton>
                  )}
                  
                  <TouchOptimizedButton
                    touchSize="sm"
                    onClick={handleSubmit}
                    disabled={!transcript.trim()}
                    className="h-8"
                  >
                    Submit
                  </TouchOptimizedButton>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Audio element for playback */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setState('idle')}
            className="hidden"
          />
        )}
        
        {/* Capability warning */}
        {!hasSpeechRecognition && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
            Voice-to-text not supported in this browser. Audio will still be recorded.
          </div>
        )}
      </CardContent>
    </Card>
  );
}