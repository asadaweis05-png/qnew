import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Share2, ArrowLeft, Check, Sparkles, Eye } from "lucide-react";
import AdBanner from "@/components/AdBanner";

const ShareQuiz = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const quizUrl = `${window.location.origin}/quiz/${code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(quizUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Take my Best Friend Quiz!",
          text: "Think you know me well? Take this quiz and find out!",
          url: quizUrl
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen mesh-gradient flex flex-col">
      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-success/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          <AdBanner position="header" className="mb-8" />
          
          <div className="text-center animate-fade-up">
            {/* Success Icon */}
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-success to-accent rounded-3xl flex items-center justify-center shadow-glow-accent mx-auto">
                <Check className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse-soft">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3 text-foreground">
              Waad ku guuleysatay!
            </h1>
            <p className="text-lg text-muted-foreground mb-10">
              Su'aalahaaga waa diyaar. Hadda kala wadaag saaxiibbadaada.
            </p>

            {/* Quiz Link */}
            <div className="p-6 rounded-2xl glass border border-border/30 mb-8">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Linkiga Su'aalaha</p>
              <p className="font-mono text-sm break-all text-foreground bg-secondary/50 p-3 rounded-xl">{quizUrl}</p>
            </div>

            {/* Actions */}
            <div className="space-y-4 mb-10">
              <Button 
                onClick={handleShare} 
                size="lg" 
                className="w-full py-6 bg-gradient-primary hover:opacity-90 shadow-glow transition-all duration-300 shine"
              >
                <Share2 className="mr-2 h-5 w-5" />
                La Wadaag Saaxiibada
              </Button>

              <Button 
                onClick={handleCopyLink} 
                variant="outline" 
                size="lg" 
                className="w-full py-6 border-border/50 hover:bg-secondary/50"
              >
                <Copy className="mr-2 h-5 w-5" />
                Koobiyee Linkiga
              </Button>

              <Button 
                onClick={() => navigate(`/quiz-answers/${code}`)} 
                variant="outline" 
                size="lg" 
                className="w-full py-6 border-primary/30 hover:bg-primary/10 text-primary"
              >
                <Eye className="mr-2 h-5 w-5" />
                Arag Jawaabaha
              </Button>
            </div>

            {/* Quiz Code */}
            <div className="p-6 rounded-2xl gradient-border mb-10">
              <p className="text-xs text-muted-foreground mb-2">Koodka Su'aalaha</p>
              <p className="text-4xl font-display font-bold gradient-text tracking-widest">{code}</p>
            </div>

            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Ku noqo Bogga Hore
            </button>
          </div>

          <AdBanner position="footer" className="mt-8" />
        </div>
      </main>
    </div>
  );
};

export default ShareQuiz;
