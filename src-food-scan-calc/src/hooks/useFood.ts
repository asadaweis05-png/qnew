import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FoodEntry, FoodEntryInsert, DailyTotal } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface NutritionData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const useFood = (user: any) => {
  const [foodHistory, setFoodHistory] = useState<FoodEntry[]>([]);
  const [dailyTotal, setDailyTotal] = useState<DailyTotal | null>(null);
  const [streak, setStreak] = useState(0);
  const { toast } = useToast();

  // Fetch food history, daily totals, and streak when user changes
  useEffect(() => {
    if (user) {
      fetchFoodHistory();
      fetchDailyTotal();
      fetchStreak();
    } else {
      setFoodHistory([]);
      setDailyTotal(null);
      setStreak(0);
    }
  }, [user]);

  const fetchFoodHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      setFoodHistory(data as FoodEntry[] || []);
    } catch (error) {
      console.error('Error fetching food history:', error);
      toast({
        title: "Failed to load history",
        description: "Could not retrieve your food history",
        variant: "destructive",
      });
    }
  };

  const fetchDailyTotal = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      let { data: existingTotal, error: fetchError } = await supabase
        .from('daily_totals')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!existingTotal) {
        // Create a new daily total if none exists
        const { data: newTotal, error: insertError } = await supabase
          .from('daily_totals')
          .insert({
            user_id: user.id,
            date: today,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          })
          .select()
          .single();

        if (insertError) throw insertError;
        existingTotal = newTotal;
      }
      
      setDailyTotal(existingTotal);
    } catch (error) {
      console.error('Error fetching daily total:', error);
      toast({
        title: "Failed to load daily summary",
        description: "Could not retrieve your daily totals",
        variant: "destructive",
      });
    }
  };

  const fetchStreak = async () => {
    if (!user) return;
    
    try {
      // Get the last 7 days
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      
      // Check if user logged food on each day
      const { data, error } = await supabase
        .from('daily_totals')
        .select('date')
        .eq('user_id', user.id)
        .in('date', dates)
        .gt('calories', 0);
        
      if (error) throw error;
      
      // Sort the dates in descending order
      const loggedDates = data.map(entry => entry.date).sort().reverse();
      
      // Calculate streak
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      
      // Check if logged today
      if (loggedDates.includes(today)) {
        currentStreak = 1;
        
        // Check previous consecutive days
        for (let i = 1; i < 7; i++) {
          const prevDate = new Date();
          prevDate.setDate(prevDate.getDate() - i);
          const prevDateStr = prevDate.toISOString().split('T')[0];
          
          if (loggedDates.includes(prevDateStr)) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
      
      setStreak(currentStreak);
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  const updateDailyTotal = async (newFood: NutritionData) => {
    if (!user || !dailyTotal) return;
    
    try {
      const { error } = await supabase
        .from('daily_totals')
        .update({
          calories: Number(dailyTotal.calories || 0) + Number(newFood.calories),
          protein: Number(dailyTotal.protein || 0) + Number(newFood.protein),
          carbs: Number(dailyTotal.carbs || 0) + Number(newFood.carbs),
          fat: Number(dailyTotal.fat || 0) + Number(newFood.fat),
          updated_at: new Date().toISOString()
        })
        .eq('id', dailyTotal.id);

      if (error) throw error;

      await fetchDailyTotal(); // Refresh the daily total
    } catch (error) {
      console.error('Error updating daily total:', error);
      toast({
        title: "Failed to update daily total",
        description: "Could not update your daily nutrition totals",
        variant: "destructive",
      });
    }
  };

  const saveFoodEntry = async (data: NutritionData) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Sign in to save foods to your history",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      const foodEntry: FoodEntryInsert = {
        user_id: user.id,
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat
      };
      
      const { error } = await supabase
        .from('food_entries')
        .insert(foodEntry);
      
      if (error) throw error;

      // Update daily totals after successfully saving the food entry
      await updateDailyTotal(data);
      
      // Show gamified toast with emoji
      const emoji = getRandomFoodEmoji();
      toast({
        title: `${emoji} Food saved!`,
        description: `${data.name} added to your food log`,
      });
      
      // Refresh the food history and streak
      fetchFoodHistory();
      fetchDailyTotal();
      fetchStreak();
      return true;
    } catch (error) {
      console.error('Error saving food entry:', error);
      toast({
        title: "Save failed",
        description: "Could not save to your food log",
        variant: "destructive",
      });
      return false;
    }
  };

  const getRandomFoodEmoji = () => {
    const foodEmojis = ["🥗", "🥦", "🥑", "🍎", "🍌", "🥕", "🍗", "🥩", "🍳", "🥚"];
    return foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
  };

  return {
    foodHistory,
    dailyTotal,
    streak,
    saveFoodEntry,
    refreshData: () => {
      fetchFoodHistory();
      fetchDailyTotal();
      fetchStreak();
    }
  };
};
