
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFood } from '@/hooks/useFood';
import { useProfile } from '@/hooks/useProfile';
import AuthSection from '@/components/AuthSection';
import FoodInputTabs from '@/components/FoodInputTabs';
import NutritionPanel from '@/components/NutritionPanel';
import Footer from '@/components/Footer';
import { LayoutDashboard } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface NutritionData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const Dashboard = () => {
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const { user, signInWithEmail, signOut } = useAuth();
  const { foodHistory, dailyTotal, streak, saveFoodEntry } = useFood(user);
  const { profile } = useProfile(user);
  const isMobile = useIsMobile();

  const handleFoodData = async (data: NutritionData) => {
    setNutritionData(data);
    
    if (user) {
      await saveFoodEntry(data);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 pt-24 md:pt-28">
        <div className="container-wide px-4 md:px-8 pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl text-foreground">
                  Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">Track and manage your nutrition</p>
              </div>
            </div>
            <AuthSection 
              user={user} 
              onSignOut={signOut} 
            />
          </div>

          {/* Main content */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 md:p-8 rounded-2xl">
              <FoodInputTabs onFoodData={handleFoodData} />
            </div>
            
            <div className={`space-y-6 ${isMobile ? 'mt-4' : ''}`}>
              <NutritionPanel 
                nutritionData={nutritionData} 
                user={user} 
                foodHistory={foodHistory}
                dailyTotal={dailyTotal}
                profile={profile}
                streak={streak}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
