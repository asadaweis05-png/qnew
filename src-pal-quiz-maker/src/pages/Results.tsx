import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, CheckCircle, XCircle, Trophy, Star, Sparkles } from "lucide-react";
import AdBanner from "@/components/AdBanner";

const Results = () => {
  const { quizId, score, total } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { detailedAnswers, creatorName } = location.state || {};

  const percentage = Math.round((Number(score) / Number(total)) * 100);

  const getScoreMessage = () => {
    if (percentage >= 90) return "Cajiib! Waa laysu yaqaan!";
    if (percentage >= 70) return "Saaxiibtinimo fiican!";
    if (percentage >= 50) return "Ma xun! Sii wadaa is-garasho!";
    return "Waxaad u baahan tahay waqti badan!";
  };

  const getScoreStyle = () => {
    if (percentage >= 70) return "text-success";
    if (percentage >= 50) return "text-accent";
    return "text-destructive";
  };

  const getGradientStyle = () => {
    if (percentage >= 70) return "from-success to-accent";
    if (percentage >= 50) return "from-accent to-primary";
    return "from-destructive to-primary";
  };

  return (
    <div className="min-h-screen mesh-gradient">
      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <AdBanner position="header" className="mb-8" />

        {/* Score Section */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="relative inline-block mb-8">
            <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${getGradientStyle()} flex items-center justify-center shadow-glow mx-auto`}>
              <Trophy className="h-16 w-16 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse-soft">
              <Star className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className={`text-6xl md:text-7xl font-display font-bold mb-4 ${getScoreStyle()}`}>
            {score}/{total}
          </div>
          
          <div className="text-3xl md:text-4xl font-display font-bold mb-4 gradient-text">
            {percentage}%
          </div>

          <p className="text-xl text-muted-foreground mb-2">
            {getScoreMessage()}
          </p>

          {creatorName && (
            <p className="text-sm text-muted-foreground">
              Imtixaanka <span className="text-foreground font-medium">{creatorName}</span>
            </p>
          )}
        </div>

        {/* Detailed Answers */}
        {detailedAnswers && (
          <div className="space-y-3 mb-12">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Jawaabaha Faahfaahsan
            </h2>
            
            {detailedAnswers.map((item: any, index: number) => (
              <div
                key={index}
                className={`p-5 rounded-2xl glass border ${
                  item.isCorrect 
                    ? "border-success/30" 
                    : "border-destructive/30"
                } animate-fade-up`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.isCorrect ? 'bg-success/20' : 'bg-destructive/20'
                  }`}>
                    {item.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground mb-3">
                      {index + 1}. {item.question}
                    </p>
                    <div className="text-sm space-y-2">
                      <p className="flex items-center gap-2">
                        <span className="text-muted-foreground">Jawaabtaada:</span>
                        <span className={`font-medium px-2 py-0.5 rounded-md ${
                          item.isCorrect ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                        }`}>
                          {item.userAnswer}
                        </span>
                      </p>
                      {!item.isCorrect && (
                        <p className="flex items-center gap-2">
                          <span className="text-muted-foreground">Jawaabta saxda ah:</span>
                          <span className="font-medium px-2 py-0.5 rounded-md bg-success/20 text-success">
                            {item.correctAnswer}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center animate-fade-up">
          <Button 
            onClick={() => navigate("/")} 
            size="lg" 
            className="px-10 py-6 bg-gradient-primary hover:opacity-90 shadow-glow transition-all duration-300 shine"
          >
            <Home className="mr-2 h-5 w-5" />
            Ku noqo Bogga Hore
          </Button>
        </div>

        <AdBanner position="footer" className="mt-12" />
      </main>
    </div>
  );
};

export default Results;
