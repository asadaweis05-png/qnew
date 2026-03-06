
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export const HomeHeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(35_90%_55%/0.08)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(150_45%_45%/0.05)_0%,transparent_50%)]" />
      
      {/* Decorative grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 container-tight px-4 md:px-8 pt-32 pb-20">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full opacity-0 animate-fade-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Nutrition</span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground leading-[1.1] opacity-0 animate-fade-up animation-delay-100">
            Track Your
            <br />
            <span className="text-gradient">Nutrition</span>
            <br />
            Effortlessly
          </h1>

          {/* Subheading */}
          <p className="max-w-xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed opacity-0 animate-fade-up animation-delay-200">
            The intelligent food tracking app that helps you achieve your health goals with precise nutrition insights and beautiful analytics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 opacity-0 animate-fade-up animation-delay-300">
            <Link 
              to="/dashboard" 
              className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-sm tracking-wide uppercase transition-all duration-300 hover:bg-primary/90 hover:gap-4"
            >
              Get Started
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              to="/about" 
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-border text-foreground rounded-full font-semibold text-sm tracking-wide uppercase transition-all duration-300 hover:border-primary hover:text-primary"
            >
              Learn More
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto pt-16 opacity-0 animate-fade-up animation-delay-400">
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl text-foreground">10K+</div>
              <div className="text-sm text-muted-foreground mt-1">Active Users</div>
            </div>
            <div className="text-center border-x border-border">
              <div className="font-display text-3xl md:text-4xl text-foreground">50K+</div>
              <div className="text-sm text-muted-foreground mt-1">Foods Tracked</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl text-foreground">99%</div>
              <div className="text-sm text-muted-foreground mt-1">Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
