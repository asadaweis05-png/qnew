import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Lightbulb, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Profile, DailyTotal, FoodEntry } from '@/types/database';

interface AIHealthTipsProps {
  profile: Profile | null;
  dailyTotal: DailyTotal | null;
  foodHistory: FoodEntry[];
}

const AIHealthTips = ({ profile, dailyTotal, foodHistory }: AIHealthTipsProps) => {
  const [tips, setTips] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getGoalIcon = () => {
    if (!profile?.goal) return <Target className="h-5 w-5" />;
    if (profile.goal === 'lose_weight') return <TrendingDown className="h-5 w-5 text-orange-500" />;
    if (profile.goal === 'gain_weight') return <TrendingUp className="h-5 w-5 text-green-500" />;
    return <Target className="h-5 w-5 text-blue-500" />;
  };

  const getGoalLabel = () => {
    if (!profile?.goal) return 'Caafimaad Guud';
    const labels: Record<string, string> = {
      lose_weight: 'Yaraynta Miisaanka',
      gain_weight: 'Kordhinta Miisaanka',
      maintain: 'Ilaalinta Miisaanka',
      build_muscle: 'Dhisida Murqaha'
    };
    return labels[profile.goal] || 'Caafimaad Guud';
  };

  const fetchTips = async () => {
    setLoading(true);
    try {
      const detailedFoods = foodHistory.slice(0, 10).map(f => ({
        name: f.name,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat
      }));
      
      const totalFoods = detailedFoods.length;
      const avgProtein = totalFoods > 0 ? detailedFoods.reduce((sum, f) => sum + f.protein, 0) / totalFoods : 0;
      const avgCarbs = totalFoods > 0 ? detailedFoods.reduce((sum, f) => sum + f.carbs, 0) / totalFoods : 0;
      const avgFat = totalFoods > 0 ? detailedFoods.reduce((sum, f) => sum + f.fat, 0) / totalFoods : 0;
      
      const { data, error } = await supabase.functions.invoke('ai-health-tips', {
        body: {
          goal: profile?.goal || 'maintain',
          currentCalories: dailyTotal?.calories || 0,
          targetCalories: profile?.target_calories || profile?.daily_calorie_goal || 2000,
          currentProtein: dailyTotal?.protein || 0,
          currentCarbs: dailyTotal?.carbs || 0,
          currentFat: dailyTotal?.fat || 0,
          detailedFoods,
          avgProtein: Math.round(avgProtein),
          avgCarbs: Math.round(avgCarbs),
          avgFat: Math.round(avgFat),
          weight: profile?.weight_kg,
          height: profile?.height_cm,
          age: profile?.age,
          gender: profile?.gender,
          activityLevel: profile?.activity_level
        }
      });

      if (error) throw error;
      
      if (data?.tips) {
        setTips(data.tips);
      }
    } catch (error: any) {
      console.error('Error fetching AI tips:', error);
      toast({
        title: "Ma soo dejin karin talooyinka",
        description: "Fadlan isku day mar kale",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch tips on mount
  useEffect(() => {
    fetchTips();
  }, []);

  const formatTips = (tipsText: string) => {
    const lines = tipsText.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const cleanedLine = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (!cleanedLine) return null;
      return (
        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground/90">{cleanedLine}</p>
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Talooyinka AI</CardTitle>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {getGoalIcon()}
            <span>{getGoalLabel()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {loading && !tips ? (
          <div className="text-center py-6">
            <RefreshCw className="h-8 w-8 text-primary/50 mx-auto mb-3 animate-spin" />
            <p className="text-muted-foreground">Waa la falanqeynayaa cuntadaada...</p>
          </div>
        ) : tips ? (
          <div className="space-y-3">
            {formatTips(tips)}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchTips} 
              disabled={loading}
              className="w-full mt-4"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Waa la cusboonaysiinayaa...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Hel Talooyinka Cusub
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <Sparkles className="h-8 w-8 text-primary/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Talooyinka waa la soo dejin doonaa...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIHealthTips;
