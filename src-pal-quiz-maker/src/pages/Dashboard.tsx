import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, Plus, Share2, Users, Trophy, ArrowLeft, Eye, CheckCircle, XCircle, Brain, FileText, MessageCircle, Sparkles } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import AdBanner from "@/components/AdBanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type Quiz = Tables<"quizzes">;
type QuizAttempt = Tables<"quiz_attempts">;

interface AnswerDetail {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface QuizWithAttempts extends Quiz {
  attempts: QuizAttempt[];
  questionCount: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<QuizWithAttempts[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      loadQuizzes(session.user.id);
    };
    checkUser();
  }, [navigate]);

  const loadQuizzes = async (userId: string) => {
    try {
      const { data: quizzesData, error: quizzesError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (quizzesError) throw quizzesError;

      if (quizzesData) {
        const quizzesWithAttempts = await Promise.all(
          quizzesData.map(async (quiz) => {
            const { data: attempts } = await supabase
              .from("quiz_attempts")
              .select("*")
              .eq("quiz_id", quiz.id)
              .order("score", { ascending: false });

            const { data: answers } = await supabase
              .from("quiz_answers")
              .select("*")
              .eq("quiz_id", quiz.id);

            return {
              ...quiz,
              attempts: attempts || [],
              questionCount: answers?.length || 0,
            };
          })
        );
        setQuizzes(quizzesWithAttempts);
      }
    } catch (error: any) {
      toast.error("Khalad ayaa dhacay markii la soo rarayo su'aalaha");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Waad ka baxday!");
    navigate("/");
  };

  const handleShare = (code: string) => {
    navigate(`/share/${code}`);
  };

  const parseAnswers = (answers: any): AnswerDetail[] => {
    if (Array.isArray(answers)) {
      return answers as AnswerDetail[];
    }
    return [];
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/")} 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/chat")} variant="ghost" size="sm" className="hidden sm:flex">
              <MessageCircle className="mr-2 h-4 w-4" />
              Wada Hadal
            </Button>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Ka Bax
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <AdBanner position="header" className="mb-8" />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 animate-fade-up">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Su'aalahaaga
            </h1>
            <p className="text-muted-foreground">
              Maamul su'aalahaaga oo arag natiijooyinka
            </p>
          </div>
          <Button onClick={() => navigate("/create")} className="bg-gradient-primary hover:opacity-90 shadow-glow shine">
            <Plus className="mr-2 h-4 w-4" />
            Samee Su'aal Cusub
          </Button>
        </div>

        {/* Content */}
        {quizzes.length === 0 ? (
          <div className="text-center py-20 px-8 rounded-2xl glass border border-border/30 animate-fade-up">
            <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Plus className="h-10 w-10 text-white" />
            </div>
            <h3 className="font-display font-bold text-xl text-foreground mb-2">Wali ma sameesan su'aal</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Samee su'aalaha koowaad si aad u bilaawdo tijaabinta saaxiibbadaada.
            </p>
            <Button onClick={() => navigate("/create")} className="bg-gradient-primary hover:opacity-90 shadow-glow shine">
              <Plus className="mr-2 h-4 w-4" />
              Samee Su'aal
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz, index) => (
              <div 
                key={quiz.id} 
                className="p-6 rounded-2xl glass border border-border/30 card-hover animate-fade-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-lg text-foreground mb-1">
                      {quiz.creator_name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono px-2 py-1 bg-secondary/50 rounded-md inline-block">
                      {quiz.quiz_code}
                    </p>
                  </div>
                  <button
                    onClick={() => handleShare(quiz.quiz_code)}
                    className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-primary"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-accent" />
                    <span>{quiz.questionCount} su'aalood</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span>{quiz.attempts.length} dadaal</span>
                  </div>
                </div>

                {quiz.attempts.length > 0 && (
                  <div className="border-t border-border/30 pt-5 mt-5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      Natiijooyinka
                    </p>
                    <div className="space-y-2">
                      {quiz.attempts.slice(0, 3).map((attempt) => (
                        <button
                          key={attempt.id}
                          className="w-full flex justify-between items-center text-sm p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-left group"
                          onClick={() => setSelectedAttempt(attempt)}
                        >
                          <span className="font-medium text-foreground">
                            {attempt.friend_name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="gradient-text font-bold">
                              {attempt.score}/{attempt.total_questions}
                            </span>
                            <Eye className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-5">
                  <Button
                    onClick={() => navigate(`/quiz-answers/${quiz.quiz_code}`)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-border/50 hover:bg-secondary/50"
                  >
                    <FileText className="mr-2 h-3.5 w-3.5" />
                    Jawaabaha
                  </Button>
                  <Button
                    onClick={() => handleShare(quiz.quiz_code)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-border/50 hover:bg-secondary/50"
                  >
                    <Share2 className="mr-2 h-3.5 w-3.5" />
                    Wadaag
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <AdBanner position="footer" className="mt-12" />

        {/* Dialog */}
        <Dialog open={!!selectedAttempt} onOpenChange={() => setSelectedAttempt(null)}>
          <DialogContent className="max-w-lg glass border-border/30">
            <DialogHeader>
              <DialogTitle className="font-display">
                Jawaabaha {selectedAttempt?.friend_name}
              </DialogTitle>
            </DialogHeader>
            <div className="text-center py-6 border-b border-border/30">
              <p className="text-4xl font-display font-bold gradient-text">
                {selectedAttempt?.score}/{selectedAttempt?.total_questions}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Dhibcaha Guud</p>
            </div>
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-3 py-4">
                {selectedAttempt && parseAnswers(selectedAttempt.answers).map((answer, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${
                      answer.isCorrect
                        ? "border-success/30 bg-success/10"
                        : "border-destructive/30 bg-destructive/10"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {answer.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <p className="font-medium text-foreground text-sm">{answer.question}</p>
                    </div>
                    <div className="ml-8 space-y-1 text-xs">
                      <p>
                        <span className="text-muted-foreground">Jawaabtii:</span>{" "}
                        <span className={answer.isCorrect ? "text-success font-medium" : "text-destructive font-medium"}>
                          {answer.userAnswer}
                        </span>
                      </p>
                      {!answer.isCorrect && (
                        <p>
                          <span className="text-muted-foreground">Saxda ah:</span>{" "}
                          <span className="text-success font-medium">{answer.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Dashboard;
