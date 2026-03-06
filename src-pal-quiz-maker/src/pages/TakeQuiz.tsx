import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Brain, Send, Sparkles, HelpCircle } from "lucide-react";
import AdBanner from "@/components/AdBanner";

const TakeQuiz = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [friendName, setFriendName] = useState("");
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, [code]);

  const loadQuiz = async () => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("quiz_code", code)
        .single();

      if (quizError || !quizData) {
        toast.error("Quiz not found");
        navigate("/");
        return;
      }

      const { data: questionsData, error: questionsError } = await supabase
        .from("quiz_answers")
        .select("*")
        .eq("quiz_id", quizData.id)
        .order("question_number");

      if (questionsError) throw questionsError;

      setQuiz(quizData);
      setQuestions(questionsData || []);
    } catch (error) {
      console.error("Error loading quiz:", error);
      toast.error("Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionNumber: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionNumber]: value }));
  };

  const handleSubmit = async () => {
    if (!friendName.trim()) {
      toast.error("Fadlan geli magacaaga");
      return;
    }

    const answeredQuestions = Object.keys(answers).length;
    if (answeredQuestions < questions.length) {
      toast.error("Fadlan ka jawaab dhammaan su'aalaha");
      return;
    }

    setIsSubmitting(true);

    try {
      let score = 0;
      const detailedAnswers = questions.map((q) => {
        const userAnswer = answers[q.question_number]?.trim().toLowerCase();
        const correctAnswer = q.answer.trim().toLowerCase();
        const isCorrect = userAnswer === correctAnswer;
        
        if (isCorrect) score++;
        
        return {
          question: q.question_text,
          userAnswer: answers[q.question_number],
          correctAnswer: q.answer,
          isCorrect,
        };
      });

      const { error } = await supabase.from("quiz_attempts").insert({
        quiz_id: quiz.id,
        friend_name: friendName,
        score,
        total_questions: questions.length,
        answers: detailedAnswers,
      });

      if (error) throw error;

      navigate(`/results/${quiz.id}/${score}/${questions.length}`, {
        state: { detailedAnswers, creatorName: quiz.creator_name },
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Imtixaanka waa la rarayo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient">
      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-40 right-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/30 glass">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
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

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        <AdBanner position="header" className="mb-8" />

        {/* Page Header */}
        <div className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium mb-6 border border-border/50">
            <HelpCircle className="h-4 w-4 text-accent animate-pulse-soft" />
            <span className="text-accent">Imtixaanka</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Intee ayaad u taqaan <span className="gradient-text">{quiz?.creator_name}</span>?
          </h1>
          <p className="text-muted-foreground text-lg">
            Ka jawaab su'aalahan si aad u ogaato dhibcahaaga.
          </p>
        </div>

        {/* Name Input */}
        <div className="mb-8 p-6 rounded-2xl glass border border-border/30 animate-fade-up">
          <Label htmlFor="friendName" className="text-sm font-medium text-foreground mb-3 block">
            Magacaaga
          </Label>
          <Input
            id="friendName"
            placeholder="Geli magacaaga"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            className="bg-secondary/50 border-border/50 h-12"
            maxLength={50}
          />
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-10">
          {questions.map((question, index) => (
            <div
              key={question.question_number}
              className="p-6 rounded-2xl glass border border-border/30 animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Label
                htmlFor={`q${question.question_number}`}
                className="text-sm font-medium text-foreground mb-4 block"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
                    {question.question_number + 1}
                  </span>
                  {question.question_text}
                </span>
              </Label>
              <Input
                id={`q${question.question_number}`}
                placeholder="Jawaabta"
                value={answers[question.question_number] || ""}
                onChange={(e) => handleAnswerChange(question.question_number, e.target.value)}
                className="bg-secondary/50 border-border/50 h-12"
                maxLength={100}
              />
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center animate-fade-up">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="px-10 py-6 bg-gradient-primary hover:opacity-90 shadow-glow transition-all duration-300 shine w-full sm:w-auto"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Waa la dirayaa...
              </div>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Dir Jawaabaha
              </>
            )}
          </Button>
        </div>

        <AdBanner position="footer" className="mt-12" />
      </main>
    </div>
  );
};

export default TakeQuiz;
