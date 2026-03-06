
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DailyTotal, Profile } from '@/types/database';
import { Award } from 'lucide-react';

interface DailyStatsCardProps {
  dailyTotal: DailyTotal | null;
  profile: Profile | null;
  streak?: number;
}

const DailyStatsCard = ({ dailyTotal, profile, streak = 0 }: DailyStatsCardProps) => {
  if (!dailyTotal) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Daily Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No data available for today</p>
        </CardContent>
      </Card>
    );
  }

  // Use target_calories from profile, or default to 2000 if not available
  const calorieGoal = profile?.target_calories || 2000;
  const caloriePercentage = Math.min(100, (dailyTotal.calories / calorieGoal) * 100);
  
  // Calculate remaining calories and macros
  const remainingCalories = calorieGoal - dailyTotal.calories;
  
  // Calculate recommended macro goals based on calorie goal if specific targets aren't available
  // Default macro distribution: 30% protein, 50% carbs, 20% fat
  const proteinGoal = Math.round(calorieGoal * 0.3 / 4); // 30% of calories from protein, 4 cal/g
  const carbsGoal = Math.round(calorieGoal * 0.5 / 4);   // 50% of calories from carbs, 4 cal/g
  const fatGoal = Math.round(calorieGoal * 0.2 / 9);     // 20% of calories from fat, 9 cal/g

  // Calculate remaining macros
  const remainingProtein = Math.max(0, proteinGoal - dailyTotal.protein);
  const remainingCarbs = Math.max(0, carbsGoal - dailyTotal.carbs);
  const remainingFat = Math.max(0, fatGoal - dailyTotal.fat);
  
  // Get emoji based on percentage
  const getProgressEmoji = (percentage: number) => {
    if (percentage <= 30) return "🟢";
    if (percentage <= 60) return "🟡";
    if (percentage <= 90) return "🟠";
    return "🔴";
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Daily Summary</CardTitle>
        {streak > 0 && (
          <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm">
            <Award className="h-4 w-4" />
            <span>{streak} day{streak !== 1 ? 's' : ''} streak!</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Calories</span>
              <span className="text-sm font-medium flex items-center">
                {getProgressEmoji(caloriePercentage)} 
                {dailyTotal.calories} / {calorieGoal}
              </span>
            </div>
            <Progress value={caloriePercentage} className="h-2" />
            <div className="text-xs text-right mt-1 text-gray-500">
              {remainingCalories > 0 
                ? `${remainingCalories} calories remaining` 
                : "Daily goal reached!"}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <div className="text-2xl font-bold">{dailyTotal.protein}g</div>
              <div className="text-xs text-gray-500">Protein</div>
              <div className="text-xs text-gray-500">
                {remainingProtein > 0 ? `${remainingProtein}g left` : "✓"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{dailyTotal.carbs}g</div>
              <div className="text-xs text-gray-500">Carbs</div>
              <div className="text-xs text-gray-500">
                {remainingCarbs > 0 ? `${remainingCarbs}g left` : "✓"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{dailyTotal.fat}g</div>
              <div className="text-xs text-gray-500">Fat</div>
              <div className="text-xs text-gray-500">
                {remainingFat > 0 ? `${remainingFat}g left` : "✓"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyStatsCard;
