
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HeroSection } from "@/components/ui/hero-section";
import { CheckCircle, FileText, ShieldCheck, UserCheck } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <HeroSection
        title="Terms of Service"
        subtitle={{
          regular: "Guidelines for Using ",
          gradient: "FoodTracker",
        }}
        description="By using the FoodTracker application, you agree to these Terms of Service."
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
        
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-3xl tracking-tighter font-bold mt-4 bg-clip-text text-transparent md:text-4xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">
              Usage <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 dark:from-primary-300 dark:to-primary-200">Guidelines</span>
            </h2>
            
            <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 p-8 rounded-lg my-8">
              <div className="flex items-start mb-4">
                <FileText className="h-6 w-6 text-primary-500 mr-3 mt-1" />
                <p className="text-gray-600 dark:text-gray-300 m-0">
                  FoodTracker is provided for personal use to help you track your nutrition. You agree to use the service responsibly and lawfully. This includes not attempting to access or manipulate data that doesn't belong to you, and not using the service to harass or harm others.
                </p>
              </div>
            </div>
            
            <h2 className="text-3xl tracking-tighter font-bold mt-12 bg-clip-text text-transparent md:text-4xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">
              User <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 dark:from-primary-300 dark:to-primary-200">Accounts</span>
            </h2>
            
            <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 p-8 rounded-lg my-8">
              <div className="flex items-start mb-4">
                <UserCheck className="h-6 w-6 text-primary-500 mr-3 mt-1" />
                <p className="text-gray-600 dark:text-gray-300 m-0">
                  You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. If you suspect any unauthorized use of your account, you should notify us immediately.
                </p>
              </div>
            </div>
            
            <h2 className="text-3xl tracking-tighter font-bold mt-12 bg-clip-text text-transparent md:text-4xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">
              Limitations of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 dark:from-primary-300 dark:to-primary-200">Liability</span>
            </h2>
            
            <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 p-8 rounded-lg my-8">
              <div className="flex items-start mb-4">
                <ShieldCheck className="h-6 w-6 text-primary-500 mr-3 mt-1" />
                <p className="text-gray-600 dark:text-gray-300 m-0">
                  FoodTracker provides nutritional information as a guide only. We are not responsible for any decisions you make based on this information. The app is not a substitute for professional medical advice, diagnosis, or treatment.
                </p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <div className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#CBFFE2_0%,#39B23A_50%,#CBFFE2_100%)]" />
                <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white dark:bg-gray-950 text-xs font-medium backdrop-blur-3xl">
                  <Link
                    to="/"
                    className="inline-flex rounded-full text-center group items-center w-full justify-center bg-gradient-to-tr from-zinc-300/20 via-primary-400/30 to-transparent dark:from-zinc-300/5 dark:via-primary-400/20 text-gray-900 dark:text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-zinc-300/30 hover:via-primary-400/40 hover:to-transparent dark:hover:from-zinc-300/10 dark:hover:via-primary-400/30 transition-all sm:w-auto py-4 px-10"
                  >
                    Return Home
                  </Link>
                </div>
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

export default Terms;
