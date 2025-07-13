import * as React from "react";
import { cn } from "@/utils/core/ui";
import type { AIInsight } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertTriangle, DollarSign, Calendar, CheckCircle2, X } from "lucide-react";

export interface AIAssistantCardProps {
  projectId: string;
  insights: AIInsight[];
  onAcceptRecommendation: (insight: AIInsight) => void;
  compact?: boolean;
  className?: string;
}

/**
 * AIAssistantCard - Prominent AI insights and recommendations
 * Features AI-generated recommendations, risk alerts, and smart suggestions
 */
const AIAssistantCard = React.forwardRef<
  HTMLDivElement,
  AIAssistantCardProps
>(({ className, projectId, insights, onAcceptRecommendation, compact = false, ...props }, ref) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <TrendingUp className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      case 'budget': return <DollarSign className="h-4 w-4" />;
      case 'schedule': return <Calendar className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };


  return (
    <Card 
      ref={ref} 
      className={cn("w-full border-0 shadow-sm bg-white dark:bg-gray-900", className)} 
      {...props}
    >
      <CardHeader className="pb-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-slate-700 dark:bg-slate-300 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white dark:text-slate-900" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Insights
              </CardTitle>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Smart recommendations
            </p>
          </div>
          {insights.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {insights.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {insights.length > 0 ? (
          insights.slice(0, compact ? 2 : 3).map((insight) => (
            <div 
              key={insight.id} 
              className="p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    {getInsightIcon(insight.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">
                      {insight.title}
                    </h4>
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex-shrink-0"
                    >
                      {insight.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                    {insight.recommendation}
                  </p>
                  {!compact && (
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        className="text-xs"
                        onClick={() => onAcceptRecommendation(insight)}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Apply
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 opacity-50" />
            </div>
            <p className="text-sm font-medium mb-1">No insights yet</p>
            <p className="text-xs">AI will analyze your project soon</p>
          </div>
        )}
        
        {insights.length > (compact ? 2 : 3) && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            View {insights.length - (compact ? 2 : 3)} more insights
          </Button>
        )}
      </CardContent>
    </Card>
  );
});

AIAssistantCard.displayName = "AIAssistantCard";

export { AIAssistantCard };
