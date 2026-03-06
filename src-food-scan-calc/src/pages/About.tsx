
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HeroSection } from "@/components/ui/hero-section";
import { CheckCircle, Users, Award, Clock } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <HeroSection
        title="About FoodTracker"
        subtitle={{
          regular: "Our Mission to Make ",
          gradient: "Nutrition Simple",
        }}
        description="We're passionate about helping people achieve their health and fitness goals through better nutrition tracking and insights."
        gridOptions={{
          angle: 65,
          opacity: 0.4,
          cellSize: 50,
          lightLineColor: "#4CAF50",
          darkLineColor: "#2a6c2d",
        }}
        bottomImage={undefined}
      />

      <div className="relative overflow-hidden py-20">
        <div className="absolute top-0 z-[0] h-full w-screen bg-primary-100/5 dark:bg-primary-700/5 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,198,120,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,198,120,0.2),rgba(255,255,255,0))]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-sm text-gray-600 dark:text-gray-400 group font-sans mx-auto px-5 py-2 bg-gradient-to-tr from-zinc-300/20 via-gray-400/20 to-transparent dark:from-zinc-300/5 dark:via-gray-400/5 border-[2px] border-black/5 dark:border-white/5 rounded-3xl w-fit">
              Our Story
              <CheckCircle className="inline w-4 h-4 ml-2" />
            </h3>
            <h2 className="text-3xl tracking-tighter font-bold mt-4 bg-clip-text text-transparent mx-auto md:text-4xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">
              How We <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 dark:from-primary-300 dark:to-primary-200">Started</span>
            </h2>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-3xl mx-auto">
            <p>
              FoodTracker began with a simple idea: nutrition tracking should be easy, accurate, and insightful. Our founder, a nutrition enthusiast and software developer, was frustrated with existing tools that were either too complicated or not detailed enough.
            </p>
            
            <p>
              What started as a personal project in 2020 quickly grew into something more. As friends and family began using the early version of FoodTracker, we realized there was a genuine need for a better nutrition tracking solution that combined simplicity with powerful insights.
            </p>
            
            <p>
              Today, our team of nutritionists, developers, and fitness experts work together to create the most user-friendly and accurate nutrition tracking app available. We're constantly improving and expanding our database, features, and insights to help you achieve your health goals.
            </p>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-sm text-gray-600 dark:text-gray-400 group font-sans mx-auto px-5 py-2 bg-gradient-to-tr from-zinc-300/20 via-gray-400/20 to-transparent dark:from-zinc-300/5 dark:via-gray-400/5 border-[2px] border-black/5 dark:border-white/5 rounded-3xl w-fit">
              Our Values
              <Award className="inline w-4 h-4 ml-2" />
            </h3>
            <h2 className="text-3xl tracking-tighter font-bold mt-4 bg-clip-text text-transparent mx-auto md:text-4xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">
              What We <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 dark:from-primary-300 dark:to-primary-200">Believe In</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 p-8 rounded-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary-600 dark:text-primary-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Accuracy</h3>
              <p className="text-gray-600 dark:text-gray-300">We're committed to providing the most accurate nutritional data possible, with regular updates and verification.</p>
            </div>
            
            <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 p-8 rounded-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600 dark:text-primary-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Accessibility</h3>
              <p className="text-gray-600 dark:text-gray-300">We believe nutrition tracking should be accessible to everyone, regardless of their experience level or goals.</p>
            </div>
            
            <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 p-8 rounded-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary-600 dark:text-primary-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-300">We're constantly exploring new technologies and approaches to make nutrition tracking simpler and more intuitive.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden py-20">
        <div className="absolute top-0 z-[0] h-full w-screen bg-primary-100/10 dark:bg-primary-700/10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,198,120,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,198,120,0.3),rgba(255,255,255,0))]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-sm text-gray-600 dark:text-gray-400 group font-sans mx-auto px-5 py-2 bg-gradient-to-tr from-zinc-300/20 via-gray-400/20 to-transparent dark:from-zinc-300/5 dark:via-gray-400/5 border-[2px] border-black/5 dark:border-white/5 rounded-3xl w-fit">
              Join Us
              <Users className="inline w-4 h-4 ml-2" />
            </h3>
            <h2 className="text-3xl tracking-tighter font-bold mt-4 bg-clip-text text-transparent mx-auto md:text-4xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">
              Ready to Improve Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 dark:from-primary-300 dark:to-primary-200">Nutrition?</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto text-center p-12 backdrop-blur-sm bg-white/70 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl">
            <p className="text-xl mb-8 text-gray-700 dark:text-gray-300">
              Start your journey to better health with FoodTracker today. Our easy-to-use tools will help you make informed nutrition decisions and reach your goals faster.
            </p>
            <div className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#CBFFE2_0%,#39B23A_50%,#CBFFE2_100%)]" />
              <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white dark:bg-gray-950 text-xs font-medium backdrop-blur-3xl">
                <Link
                  to="/dashboard"
                  className="inline-flex rounded-full text-center group items-center w-full justify-center bg-gradient-to-tr from-zinc-300/20 via-primary-400/30 to-transparent dark:from-zinc-300/5 dark:via-primary-400/20 text-gray-900 dark:text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-zinc-300/30 hover:via-primary-400/40 hover:to-transparent dark:hover:from-zinc-300/10 dark:hover:via-primary-400/30 transition-all sm:w-auto py-4 px-10"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/50 border-t border-gray-200/50 dark:border-gray-700/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-primary-600">FoodTracker</h2>
              <p className="text-gray-600 dark:text-gray-300">Smart nutrition tracking for everyone</p>
            </div>
            <div className="flex gap-6">
              <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">Dashboard</Link>
              <Link to="/about" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">About</Link>
              <Link to="/privacy" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">Privacy</Link>
              <Link to="/terms" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">Terms</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} FoodTracker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
