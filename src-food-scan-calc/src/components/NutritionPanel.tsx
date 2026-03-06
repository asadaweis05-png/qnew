
import React from 'react';
import { Card } from "@/components/ui/card";
import NutritionCard from '@/components/NutritionCard';
import FoodHistory from '@/components/FoodHistory';
import DailyStatsCard from '@/components/DailyStatsCard';
import AIHealthTips from '@/components/AIHealthTips';
import { FoodEntry, DailyTotal, Profile } from '@/types/database';

interface NutritionData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionPanelProps {
  nutritionData: NutritionData | null;
  user: any;
  foodHistory: FoodEntry[];
  dailyTotal: DailyTotal | null;
  profile: Profile | null;
  streak?: number;
}

const NutritionPanel = ({ nutritionData, user, foodHistory, dailyTotal, profile, streak = 0 }: NutritionPanelProps) => {
  return (
    <div className="space-y-6">
      {user && <DailyStatsCard dailyTotal={dailyTotal} profile={profile} streak={streak} />}
      
      {nutritionData ? (
        <NutritionCard data={nutritionData} />
      ) : (
        <Card className="p-6 flex items-center justify-center h-64 text-muted-foreground">
          Search or scan food to see nutrition information
        </Card>
      )}
      
      {user && (
        <AIHealthTips profile={profile} dailyTotal={dailyTotal} foodHistory={foodHistory} />
      )}
      
      {user && foodHistory.length > 0 && (
        <FoodHistory foodHistory={foodHistory} />
      )}
    </div>
  );
};

export default NutritionPanel;
