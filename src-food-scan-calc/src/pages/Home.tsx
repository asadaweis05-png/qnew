
import React from 'react';
import { HomeHeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { ProcessSection } from '@/components/home/ProcessSection';
import { RecipesSection } from '@/components/home/RecipesSection';
import PricingSection from '@/components/home/PricingSection';
import NewsletterSignup from '@/components/NewsletterSignup';
import Footer from '@/components/Footer';
import { Mail } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <HomeHeroSection />
      <FeaturesSection />
      <ProcessSection />
      <RecipesSection />
      <PricingSection />
      
      {/* Newsletter Section */}
      <section className="section-padding bg-card relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(35_90%_55%/0.05)_0%,transparent_70%)]" />
        
        <div className="container-tight relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Stay Updated
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Subscribe to our newsletter for the latest nutrition tips, recipes, and exclusive offers.
            </p>
          </div>
          
          <div className="max-w-xl mx-auto p-8 rounded-2xl bg-background border border-border">
            <NewsletterSignup />
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Premium subscribers receive exclusive recipes and personalized nutrition advice.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
