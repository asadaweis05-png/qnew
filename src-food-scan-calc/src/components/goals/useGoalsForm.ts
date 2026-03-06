
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { GoalsFormData } from '@/schemas/goalsFormSchema';
import { calculateDailyCalories } from '@/utils/calorieCalculator';

export const useGoalsForm = () => {
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile(user);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: GoalsFormData) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const validatedData = {
        weight_kg: data.weight_kg as number,
        height_cm: data.height_cm as number,
        age: data.age as number,
        gender: data.gender as 'male' | 'female' | 'other',
        activity_level: data.activity_level as 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active',
        goal: data.goal as 'lose_weight' | 'maintain' | 'gain_weight',
      };
      
      const target_calories = calculateDailyCalories(validatedData);
      
      // Update user profile with new goals
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          ...data,
          target_calories,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update today's daily total with new calorie goal
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const { error: dailyTotalError } = await supabase
        .from('daily_totals')
        .update({
          daily_calorie_goal: target_calories,
        })
        .eq('user_id', user.id)
        .eq('date', today);

      if (dailyTotalError) throw dailyTotalError;

      await refreshProfile();
      
      toast({
        title: "Goals updated",
        description: `Your daily calorie target is now ${target_calories} calories`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update your goals",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          weight_kg: null,
          height_cm: null,
          age: null,
          gender: null,
          activity_level: null,
          goal: null,
          target_calories: null,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Goals deleted",
        description: "Your fitness goals have been reset",
      });
      return true;
    } catch (error) {
      console.error('Error deleting goals:', error);
      toast({
        title: "Error",
        description: "Failed to delete your goals",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    profile,
    isSubmitting,
    onSubmit,
    handleDelete
  };
};
