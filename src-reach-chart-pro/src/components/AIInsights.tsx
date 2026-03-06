import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, Target, Lightbulb, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Goal } from '@/types/goal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIAnalysis {
  overallScore: number;
  scoreLabel: string;
  strengths: string[];
  areasToImprove: string[];
  tips: string[];
  encouragement: string;
  pattern: string;
}

interface AIInsightsProps {
  goals: Goal[];
}

export const AIInsights = ({ goals }: AIInsightsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeGoals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-goals', {
        body: { goals }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data.analysis);
      setIsOpen(true);
    } catch (err) {
      console.error('Analysis error:', err);
      const message = err instanceof Error ? err.message : 'Failed to analyze goals';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <>
      <Button
        onClick={analyzeGoals}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="gap-2 rounded-full px-4 h-9 border-border hover:border-primary/30"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Brain className="w-4 h-4" />
        )}
        <span className="hidden sm:inline text-sm">{isLoading ? 'Analyzing...' : 'AI Insights'}</span>
      </Button>

      <AnimatePresence>
        {isOpen && analysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-floating border border-border"
            >
              {/* Header */}
              <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-lg">AI Insights</h2>
                    <p className="text-xs text-muted-foreground">Your personalized analysis</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-4 space-y-6">
                {/* Score */}
                <div className="text-center py-4">
                  <div className={`text-5xl font-display font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mt-1">
                    {analysis.scoreLabel}
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 mt-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.overallScore}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full gradient-warm"
                    />
                  </div>
                </div>

                {/* Pattern */}
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">Your Pattern</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{analysis.pattern}</p>
                </div>

                {/* Strengths */}
                {analysis.strengths.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium">Strengths</span>
                    </div>
                    <div className="space-y-2">
                      {analysis.strengths.map((strength, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Areas to improve */}
                {analysis.areasToImprove.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium">Areas to Improve</span>
                    </div>
                    <div className="space-y-2">
                      {analysis.areasToImprove.map((area, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Tips to Improve</span>
                  </div>
                  <div className="space-y-2">
                    {analysis.tips.map((tip, i) => (
                      <div
                        key={i}
                        className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-sm text-foreground"
                      >
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Encouragement */}
                <div className="gradient-warm rounded-xl p-4 text-center">
                  <p className="text-primary-foreground font-medium">
                    "{analysis.encouragement}"
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
