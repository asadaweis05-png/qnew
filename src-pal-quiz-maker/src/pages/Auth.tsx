import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, Mail, Lock, LogIn, UserPlus, ArrowLeft, Sparkles } from "lucide-react";
import AdBanner from "@/components/AdBanner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Guul! Si sax ah ayaad u soo gashay!");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast.success("Akoonkaaga waa la sameeyay! Hadda geli!");
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Khalad ayaa dhacay");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-gradient flex flex-col">
      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <AdBanner position="header" className="mb-8" />

          <div className="animate-fade-up">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                <User className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                {isLogin ? "Soo Gal" : "Samee Akoon"}
              </h1>
              <p className="text-muted-foreground">
                {isLogin
                  ? "Soo gal si aad u aragto su'aalahaaga"
                  : "Samee akoon si aad u raacdo su'aalahaaga"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="p-8 rounded-2xl glass border border-border/30 space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  disabled={loading}
                  className="bg-secondary/50 border-border/50 h-12"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                  className="bg-secondary/50 border-border/50 h-12"
                />
              </div>

              <Button
                type="submit"
                className="w-full py-6 bg-gradient-primary hover:opacity-90 shadow-glow transition-all duration-300 shine"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Fadlan sug...
                  </div>
                ) : isLogin ? (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Soo Gal
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Samee Akoon
                  </>
                )}
              </Button>
            </form>

            {/* Toggle */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                disabled={loading}
              >
                {isLogin
                  ? "Ma lihid akoon? Samee mid cusub"
                  : "Akoon ayaad leedahay? Soo gal"}
              </button>
            </div>

            {/* Back Link */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/")}
                disabled={loading}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Ku noqo bogga hore
              </button>
            </div>
          </div>

          <AdBanner position="footer" className="mt-8" />
        </div>
      </main>
    </div>
  );
};

export default Auth;
