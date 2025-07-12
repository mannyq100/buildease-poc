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
      className={cn("w-full border border-buildease-orange-200/50 dark:border-buildease-orange-800/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg", className)} 
      {...props}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-buildease-orange-500 dark:bg-buildease-orange-600 text-white shadow-md">
            <Sparkles className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg font-bold bg-gradient-to-r from-buildease-orange-900 via-buildease-orange-800 to-buildease-orange-900 dark:from-buildease-orange-100 dark:via-white dark:to-buildease-orange-100 bg-clip-text text-transparent">
            AI Project Assistant
          </CardTitle>
          <Badge className="ml-auto text-xs bg-buildease-orange-100 dark:bg-buildease-orange-900/40 text-buildease-orange-800 dark:text-buildease-orange-200 border border-buildease-orange-200 dark:border-buildease-orange-700">
            {insights.length} insights
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {insights.length > 0 ? (
          insights.slice(0, compact ? 2 : 3).map((insight) => (
            <div 
              key={insight.id} 
              className="flex items-start gap-3 p-3 bg-buildease-orange-50 dark:bg-buildease-orange-950/30 rounded-lg border border-buildease-orange-200/40 dark:border-buildease-orange-700/40 hover:shadow-md hover:scale-[1.01] transition-all duration-300 group"
            >
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-xs border",
                insight.type === 'optimization' && "bg-status-completed/10 text-status-completed border-status-completed/20",
                insight.type === 'risk' && "bg-destructive/10 text-destructive border-destructive/20",
                insight.type === 'budget' && "bg-buildease-blue-100/50 text-buildease-blue-700 border-buildease-blue-200 dark:bg-buildease-blue-900/20 dark:text-buildease-blue-400 dark:border-buildease-blue-800",
                insight.type === 'schedule' && "bg-buildease-orange-100/50 text-buildease-orange-700 border-buildease-orange-200 dark:bg-buildease-orange-900/20 dark:text-buildease-orange-400 dark:border-buildease-orange-800",
                !insight.type && "bg-buildease-orange-100/50 text-buildease-orange-700 border-buildease-orange-200 dark:bg-buildease-orange-900/20 dark:text-buildease-orange-400 dark:border-buildease-orange-800"
              )}>
                {getInsightIcon(insight.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-buildease-orange-900 dark:text-buildease-orange-100 mb-1">
                      {insight.title}
                    </p>
                    <p className="text-xs text-buildease-orange-700 dark:text-buildease-orange-300 leading-relaxed">
                      {insight.recommendation}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button 
                      size="sm" 
                      className="h-7 px-3 text-xs bg-buildease-orange-600 hover:bg-buildease-orange-700 text-white border-0"
                      onClick={() => onAcceptRecommendation(insight)}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-0 text-buildease-orange-400 hover:text-buildease-orange-600 hover:bg-buildease-orange-100/50 dark:hover:bg-buildease-orange-950/30 rounded-md"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-buildease-orange-400 dark:text-buildease-orange-500 opacity-50" />
            <p className="text-sm text-buildease-orange-700 dark:text-buildease-orange-300 mb-1">
              AI Assistant is analyzing your project
            </p>
            <p className="text-xs text-buildease-orange-600 dark:text-buildease-orange-400">
              Check back soon for personalized recommendations
            </p>
          </div>
        )}
        
        {insights.length > (compact ? 2 : 3) && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-buildease-orange-700 dark:text-buildease-orange-300 hover:text-buildease-orange-800 dark:hover:text-buildease-orange-200 hover:bg-buildease-orange-100/50 dark:hover:bg-buildease-orange-950/30"
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
