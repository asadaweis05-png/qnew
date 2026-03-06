
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Trophy, Play, Clock, CheckCircle, Layers, Sparkles, Zap, Users, Award } from 'lucide-react';
import Navigation from '@/components/Navigation';
import AdSense from '@/components/AdSense';
import { useIsMobile } from '@/hooks/use-mobile';

const HomePage: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation bar */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-3/4 right-1/4 w-24 h-24 md:w-48 md:h-48 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-80 md:h-80 bg-gradient-to-r from-primary/5 to-purple-400/5 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative">
          {/* Floating sparkles */}
          <div className="absolute -top-4 left-1/4 text-primary/40 animate-bounce">
            <Sparkles className="w-4 h-4 md:w-6 md:h-6" />
          </div>
          <div className="absolute top-8 right-1/4 text-purple-400/40 animate-bounce delay-500">
            <Zap className="w-5 h-5 md:w-7 md:h-7" />
          </div>
          
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-8 text-sm">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">Master Somali Words</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
            <span className="block bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">SOMALI</span> 
            <span className="block bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent mt-2"> ERAYO</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-12 text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Ereyo badan oo Somali ah oo aad qiyaasi karto. Maskaxdaada tijaabi oo iskuday in aad qiyaastid ereyga lagaa rabbo
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <Link to="/play" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-lg group bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300">
                <Play className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                Play Now
              </Button>
            </Link>
            <Link to="/leaderboard" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300">
                <Trophy className="mr-2 h-5 w-5" />
                Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="group p-6 md:p-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:bg-card/80 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mb-4 group-hover:bg-primary/30 transition-colors">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-primary mb-2">70+</h3>
              <p className="text-muted-foreground text-sm md:text-base">Somali Words</p>
            </div>
            <div className="group p-6 md:p-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:bg-card/80 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mb-4 group-hover:bg-primary/30 transition-colors">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-primary mb-2">500+</h3>
              <p className="text-muted-foreground text-sm md:text-base">Active Players</p>
            </div>
            <div className="group p-6 md:p-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:bg-card/80 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mb-4 group-hover:bg-primary/30 transition-colors">
                <Play className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-primary mb-2">1K+</h3>
              <p className="text-muted-foreground text-sm md:text-base">Games Played</p>
            </div>
            <div className="group p-6 md:p-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:bg-card/80 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mb-4 group-hover:bg-primary/30 transition-colors">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-primary mb-2">4</h3>
              <p className="text-muted-foreground text-sm md:text-base">Game Modes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Why Choose Somali Erayo?
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Experience the most engaging way to learn Somali vocabulary
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16">
            <Card className="group bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden hover:border-primary/30 hover:bg-card/80 transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6 md:p-8 flex flex-col items-start h-full">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-4">Learn Naturally</h3>
                <p className="text-muted-foreground leading-relaxed flex-1">
                  Master Somali vocabulary through interactive gameplay. Our intuitive approach makes learning feel like play, not work.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden hover:border-primary/30 hover:bg-card/80 transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6 md:p-8 flex flex-col items-start h-full">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-4">Quick & Efficient</h3>
                <p className="text-muted-foreground leading-relaxed flex-1">
                  60-second games designed for busy schedules. Perfect for learning during breaks, commutes, or whenever you have a moment.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden hover:border-primary/30 hover:bg-card/80 transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6 md:p-8 flex flex-col items-start h-full">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-4">Compete & Progress</h3>
                <p className="text-muted-foreground leading-relaxed flex-1">
                  Track your progress and compete with others on the leaderboard. Gamification makes learning addictive and rewarding.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden hover:border-primary/30 hover:bg-card/80 transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6 md:p-8 flex flex-col items-start h-full">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-4">Always Available</h3>
                <p className="text-muted-foreground leading-relaxed flex-1">
                  Play anywhere, anytime on any device. Our responsive design ensures a perfect experience on mobile, tablet, and desktop.
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* CTA Section */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 backdrop-blur-sm border border-primary/20 p-8 md:p-12 rounded-3xl">
                <div className="flex justify-center mb-6">
                  <div className="flex items-center gap-2 bg-primary/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-primary font-medium text-sm">Start Your Journey</span>
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">Ready to Master Somali?</h3>
                <p className="mb-8 text-muted-foreground max-w-md mx-auto">
                  Join thousands of learners improving their Somali vocabulary every day
                </p>
                <Link to="/play">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8">
                    <Play className="mr-2 h-5 w-5" />
                    Start Playing Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Single AdSense Banner - Bottom - Only on desktop */}
      {!isMobile && (
        <div className="w-full flex justify-center py-4 bg-white/5">
          <AdSense 
            adClient="ca-pub-8055550781914254" 
            adSlot="6361286418" 
            style={{ width: '100%', maxWidth: '320px', height: '100px' }} 
            className="ad-home-bottom"
          />
        </div>
      )}
      
      {/* Footer */}
      <footer className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 border-t border-border/50 bg-muted/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                SOMALI ERAYO
              </h3>
              <p className="text-muted-foreground text-sm md:text-base mt-1">
                Master Somali vocabulary through play
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm md:text-base">
                Home
              </Link>
              <Link to="/play" className="text-muted-foreground hover:text-primary transition-colors text-sm md:text-base">
                Play
              </Link>
              <Link to="/leaderboard" className="text-muted-foreground hover:text-primary transition-colors text-sm md:text-base">
                Leaderboard
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border/30 text-center">
            <p className="text-muted-foreground text-xs md:text-sm">
              © 2024 Somali Erayo. Made with ❤️ for the Somali community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
