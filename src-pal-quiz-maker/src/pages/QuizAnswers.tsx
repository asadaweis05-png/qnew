import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Brain, Users, CheckCircle, XCircle, Trophy, ChevronDown, ChevronUp, Share2, Sparkles } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import AdBanner from "@/components/AdBanner";

type Quiz = Tables<"quizzes">;
type QuizAttempt = Tables<"quiz_attempts">;

interface AnswerDetail {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

const QuizAnswers = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);

  useEffect(() => {
    loadQuizData();
  }, [code]);

  const loadQuizData = async () => {
    try {
      // Load quiz by code - no auth required
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("quiz_code", code)
        .maybeSingle();

      if (quizError) throw quizError;

      if (!quizData) {
        toast.error("Su'aalaha lama helin");
        navigate("/");
        return;
      }

      setQuiz(quizData);

      // Load attempts
      const { data: attemptsData, error: attemptsError } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizData.id)
        .order("created_at", { ascending: false });

      if (attemptsError) throw attemptsError;

      setAttempts(attemptsData || []);
    } catch (error) {
      console.error("Error loading quiz:", error);
      toast.error("Khalad ayaa dhacay");
    } finally {
      setLoading(false);
    }
  };

  const parseAnswers = (answers: any): AnswerDetail[] => {
    if (Array.isArray(answers)) {
      return answers as AnswerDetail[];
    }
    return [];
  };

  const toggleExpanded = (attemptId: string) => {
    setExpandedAttempt(expandedAttempt === attemptId ? null : attemptId);
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 70) return "text-success";
    if (percentage >= 50) return "text-accent";
    return "text-destructive";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("so-SO", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Fadlan sug...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient">
      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/15 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/30 glass">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate("/")} 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Dib u noqo</span>
          </button>
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <Brain className="h-5 w-5 text-white" />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <AdBanner position="header" className="mb-8" />

        {/* Quiz Info */}
        <div className="mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium mb-6 border border-border/50">
            <Trophy className="h-4 w-4 text-primary animate-pulse-soft" />
            <span className="gradient-text">Natiijooyinka</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Jawaabaha <span className="gradient-text">{quiz?.creator_name}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="font-mono px-3 py-1.5 bg-secondary/50 rounded-lg">{quiz?.quiz_code}</span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-accent" />
              {attempts.length} qof ayaa qaatay
            </span>
          </div>
        </div>

        {/* Attempts List */}
        {attempts.length === 0 ? (
          <div className="text-center py-20 px-8 rounded-2xl glass border border-border/30 animate-fade-up">
            <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h3 className="font-display font-bold text-xl text-foreground mb-2">Wali qof ma qaadan</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              La wadaag saaxiibbadaada si ay u qaataan su'aalahaaga.
            </p>
            <Button 
              onClick={() => navigate(`/share/${code}`)}
              className="bg-gradient-primary hover:opacity-90 shadow-glow shine"
            >
              <Share2 className="mr-2 h-4 w-4" />
              La Wadaag
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt, index) => {
              const answers = parseAnswers(attempt.answers);
              const isExpanded = expandedAttempt === attempt.id;
              
              return (
                <div
                  key={attempt.id}
                  className="rounded-2xl glass border border-border/30 overflow-hidden card-hover animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Attempt Header */}
                  <button
                    onClick={() => toggleExpanded(attempt.id)}
                    className="w-full p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                        <span className="font-display font-bold text-white text-lg">
                          {attempt.friend_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-left">
                        <h3 className="font-display font-bold text-foreground">{attempt.friend_name}</h3>
                        <p className="text-xs text-muted-foreground">{formatDate(attempt.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-2xl font-display font-bold ${getScoreColor(attempt.score, attempt.total_questions)}`}>
                          {attempt.score}/{attempt.total_questions}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((attempt.score / attempt.total_questions) * 100)}%
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Answers */}
                  {isExpanded && (
                    <div className="border-t border-border/30 p-5 bg-secondary/20">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-primary" />
                        Jawaabaha Faahfaahsan
                      </h4>
                      <div className="space-y-3">
                        {answers.map((answer, answerIndex) => (
                          <div
                            key={answerIndex}
                            className={`p-4 rounded-xl border ${
                              answer.isCorrect 
                                ? "border-success/30 bg-success/10" 
                                : "border-destructive/30 bg-destructive/10"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                answer.isCorrect ? 'bg-success/20' : 'bg-destructive/20'
                              }`}>
                                {answer.isCorrect ? (
                                  <CheckCircle className="h-4 w-4 text-success" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-destructive" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground mb-2">
                                  {answerIndex + 1}. {answer.question}
                                </p>
                                <div className="text-sm space-y-1">
                                  <p>
                                    <span className="text-muted-foreground">Jawaabtii:</span>{" "}
                                    <span className={`font-medium px-2 py-0.5 rounded-md ${
                                      answer.isCorrect ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                                    }`}>
                                      {answer.userAnswer}
                                    </span>
                                  </p>
                                  {!answer.isCorrect && (
                                    <p>
                                      <span className="text-muted-foreground">Saxda ah:</span>{" "}
                                      <span className="font-medium px-2 py-0.5 rounded-md bg-success/20 text-success">
                                        {answer.correctAnswer}
                                      </span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <AdBanner position="footer" className="mt-12" />
      </main>
    </div>
  );
};

export default QuizAnswers;
