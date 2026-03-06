import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus, X, Brain, Sparkles, Zap } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import AdBanner from "@/components/AdBanner";

interface QuizQuestion {
  question: string;
  answer: string;
}

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [creatorName, setCreatorName] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([{ question: "", answer: "" }]);
  const [isCreating, setIsCreating] = useState(false);

  const handleQuestionChange = (index: number, field: 'question' | 'answer', value: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, { question: "", answer: "" }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const generateQuizCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateQuiz = async () => {
    if (!creatorName.trim()) {
      toast.error("Fadlan geli magacaaga");
      return;
    }
    
    const invalidQuestions = questions.filter(q => !q.question.trim() || !q.answer.trim());
    if (invalidQuestions.length > 0) {
      toast.error("Fadlan buuxi dhammaan su'aalaha iyo jawaabaha");
      return;
    }

    setIsCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const quizCode = generateQuizCode();
      const { data: quiz, error: quizError } = await supabase.from("quizzes").insert({
        creator_name: creatorName,
        quiz_code: quizCode,
        user_id: session?.user?.id || null
      }).select().single();

      if (quizError) throw quizError;

      const answersToInsert = questions.map((q, index) => ({
        quiz_id: quiz.id,
        question_number: index,
        question_text: q.question,
        answer: q.answer
      }));

      const { error: answersError } = await supabase.from("quiz_answers").insert(answersToInsert);
      if (answersError) throw answersError;

      toast.success("Quiz created successfully!");
      navigate(`/share/${quizCode}`);
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("Failed to create quiz. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen mesh-gradient">
      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-40 left-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
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
        <div className="mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium mb-6 border border-border/50">
            <Sparkles className="h-4 w-4 text-primary animate-pulse-soft" />
            <span className="gradient-text">Samee Su'aalaha</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Samee Su'aalahaaga
          </h1>
          <p className="text-muted-foreground text-lg">
            Geli su'aalo ku saabsan naftaada si saaxiibbadaada ay u ka jawaabaan.
          </p>
        </div>

        {/* Name Input */}
        <div className="mb-8 p-6 rounded-2xl glass border border-border/30 animate-fade-up">
          <Label htmlFor="name" className="text-sm font-medium text-foreground mb-3 block">
            Magacaaga
          </Label>
          <Input 
            id="name" 
            placeholder="Geli magacaaga" 
            value={creatorName} 
            onChange={e => setCreatorName(e.target.value)} 
            className="bg-secondary/50 border-border/50 h-12"
            maxLength={50} 
          />
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-8">
          {questions.map((q, index) => (
            <div 
              key={index} 
              className="p-6 rounded-2xl glass border border-border/30 animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-primary uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </span>
                  Su'aal
                </span>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(index)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Textarea
                placeholder="Geli su'aashaada (tusaale: Waa maxay midabkayga aan jecel yahay?)"
                value={q.question}
                onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                className="mb-4 bg-secondary/50 border-border/50 resize-none min-h-[100px]"
                maxLength={200}
              />
              <Input
                placeholder="Jawaabta saxda ah"
                value={q.answer}
                onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                className="bg-secondary/50 border-border/50 h-12"
                maxLength={100}
              />
            </div>
          ))}
          
          <button
            onClick={addQuestion}
            className="w-full p-5 rounded-2xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-3 text-muted-foreground hover:text-primary group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Plus className="h-5 w-5" />
            </div>
            <span className="font-medium">Ku dar su'aal cusub</span>
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center animate-fade-up">
          <Button 
            onClick={handleCreateQuiz} 
            disabled={isCreating} 
            size="lg" 
            className="px-10 py-6 bg-gradient-primary hover:opacity-90 shadow-glow transition-all duration-300 shine w-full sm:w-auto"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Waa la samaynayaa...
              </div>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Samee Su'aalaha
              </>
            )}
          </Button>
        </div>

        <AdBanner position="footer" className="mt-12" />
      </main>
    </div>
  );
};

export default CreateQuiz;
