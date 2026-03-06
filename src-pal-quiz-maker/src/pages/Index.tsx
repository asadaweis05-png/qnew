import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Share2, Trophy, LogIn, LayoutDashboard, ArrowRight, Sparkles, Users, MessageCircle, Goal, Newspaper, Zap, Star, Heart, Bell, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdBanner from "@/components/AdBanner";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen mesh-gradient">
      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/30 glass">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Imtixaanka Saaxiibka</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            <Button onClick={() => navigate("/news")} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Newspaper className="mr-2 h-4 w-4" />
              Wararka
            </Button>
            <Button onClick={() => navigate("/football")} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Goal className="mr-2 h-4 w-4" />
              Kubadda
            </Button>
            <Button onClick={() => navigate("/makeup")} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Palette className="mr-2 h-4 w-4" />
              Makeup
            </Button>
            {user ? (
              <>
                <Button onClick={() => navigate("/chat")} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Wada Hadal
                </Button>
                <Button onClick={() => navigate("/admin/notifications")} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Bell className="mr-2 h-4 w-4" />
                  Ogaysiisyo
                </Button>
                <Button onClick={() => navigate("/dashboard")} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/auth")} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <LogIn className="mr-2 h-4 w-4" />
                Soo Gal
              </Button>
            )}
          </nav>

          {/* Mobile menu */}
          <div className="flex md:hidden items-center gap-1">
            <Button onClick={() => navigate("/news")} variant="ghost" size="icon">
              <Newspaper className="h-5 w-5" />
            </Button>
            <Button onClick={() => navigate("/football")} variant="ghost" size="icon">
              <Goal className="h-5 w-5" />
            </Button>
            <Button onClick={() => navigate("/makeup")} variant="ghost" size="icon">
              <Palette className="h-5 w-5" />
            </Button>
            {user && (
              <Button onClick={() => navigate("/chat")} variant="ghost" size="icon">
                <MessageCircle className="h-5 w-5" />
              </Button>
            )}
            {user ? (
              <Button onClick={() => navigate("/dashboard")} variant="ghost" size="icon">
                <LayoutDashboard className="h-5 w-5" />
              </Button>
            ) : (
              <Button onClick={() => navigate("/auth")} variant="ghost" size="icon">
                <LogIn className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-20">
        <AdBanner position="header" className="mb-12" />

        {/* Hero Section */}
        <section className="text-center mb-20 md:mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium mb-8 animate-fade-up border border-border/50">
            <Sparkles className="h-4 w-4 text-primary animate-pulse-soft" />
            <span className="gradient-text">Bilaash ah & Sahlan</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 text-foreground text-balance leading-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Intee ayaad<br />
            <span className="gradient-text glow-text">saaxiibkaaga</span><br />
            u taqaanaa?
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 text-balance animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Samee su'aalo ku saabsan naftaada, kala wadaag saaxiibbadaada, oo arag qofka kugu yaqaan ugu fiican.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button
              onClick={() => navigate("/create")}
              size="lg"
              className="text-base px-8 py-6 bg-gradient-primary hover:opacity-90 shadow-glow transition-all duration-300 group shine"
            >
              <Zap className="mr-2 h-5 w-5" />
              Bilow Hadda
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Ma u baahna diiwaan gelin
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-20 md:mb-32">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-center mb-12 animate-fade-up">
            Sida ay u shaqeyso
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              { num: "01", title: "Samee Su'aalaha", desc: "Geli su'aalo ku saabsan naftaada - waxyaabaha aad jeceshahay iyo dabeecadaada.", icon: Brain },
              { num: "02", title: "La Wadaag", desc: "Hel link gaar ah oo aad kula wadaagto saaxiibbadaada si fudud.", icon: Share2 },
              { num: "03", title: "Arag Natiijooyinka", desc: "Ogow qofka kugu yaqaan ugu fiican oo arag dhibcooyinka faahfaahsan.", icon: Trophy },
            ].map((item, i) => (
              <div 
                key={i}
                className="group p-8 rounded-2xl glass border border-border/30 card-hover animate-fade-up"
                style={{ animationDelay: `${0.1 * (i + 1)}s` }}
              >
                <div className="flex items-start justify-between mb-6">
                  <span className="text-5xl font-display font-bold text-muted-foreground/20 group-hover:text-primary/30 transition-colors">
                    {item.num}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow opacity-0 group-hover:opacity-100 transition-opacity">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold mb-3 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <AdBanner position="middle" className="mb-20 md:mb-32" />

        {/* Features */}
        <section className="mb-20 md:mb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-8 text-foreground">
                Sababaha loogu <span className="gradient-text">isticmaalo</span>
              </h2>
              <ul className="space-y-4">
                {[
                  { text: "Tijaabinta saaxiibadaada ugu dhow", icon: Heart },
                  { text: "Furitaanka saaxiibtinimo cusub", icon: Users },
                  { text: "Tartamada baraha bulshada", icon: Trophy },
                  { text: "Is-garan wanaagsan", icon: Star },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 p-4 rounded-xl glass border border-border/30 hover:border-primary/30 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 rounded-2xl gradient-border animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="font-display font-bold text-xl mb-6 text-foreground flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                Sifooyinka
              </h3>
              <ul className="space-y-4">
                {[
                  "Su'aalo aan xadidnnayn",
                  "Link degdeg ah oo la wadaagi karo",
                  "Dhibcahaaga faahfaahsan",
                  "Raac dhammaan saaxiibbadaada"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-16 px-8 rounded-3xl glass border border-border/30 relative overflow-hidden animate-fade-up">
          <div className="absolute inset-0 bg-gradient-primary opacity-5" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">
              Diyaar ma u tahay?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
              Samee imtixaankaaga hadda oo arag saaxiibbadaada intay kugu yaqaaniin.
            </p>
            <Button
              onClick={() => navigate("/create")}
              size="lg"
              className="text-base px-10 py-6 bg-gradient-primary hover:opacity-90 shadow-glow transition-all duration-300 shine"
            >
              Samee Imtixaankaaga
            </Button>
          </div>
        </section>

        <AdBanner position="footer" className="mt-20" />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 glass mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          © 2024 Imtixaanka Saaxiibka. Dhammaan xuquuqda way dhowrsan yihiin.
        </div>
      </footer>
    </div>
  );
};

export default Index;
