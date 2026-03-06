import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UserCircle, Target, Flame, Trash2 } from 'lucide-react';
import { FriendWithProgress } from '@/types/friends';

interface FriendCardProps {
  friend: FriendWithProgress;
  onRemove: (friendshipId: string) => Promise<void>;
}

const goalLabels: Record<string, string> = {
  lose_weight: 'Dhimis Miisaan',
  maintain: 'Ilaalinta Miisaan',
  gain_weight: 'Kordhinta Miisaan'
};

const FriendCard: React.FC<FriendCardProps> = ({ friend, onRemove }) => {
  const { profile, dailyTotal, friendship } = friend;
  
  const calorieGoal = dailyTotal?.daily_calorie_goal || profile.target_calories || profile.daily_calorie_goal || 2000;
  const currentCalories = dailyTotal?.calories || 0;
  const progress = Math.min((currentCalories / calorieGoal) * 100, 100);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="w-7 h-7 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{profile.email || 'Saaxiib'}</CardTitle>
              {profile.goal && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {goalLabels[profile.goal] || profile.goal}
                </p>
              )}
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(friendship.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calories Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Maanta Calories</span>
            <span className="font-medium">
              {currentCalories.toFixed(0)} / {calorieGoal} kcal
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Macros */}
        {dailyTotal && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Protein</p>
              <p className="font-semibold text-sm">{dailyTotal.protein.toFixed(0)}g</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Carbs</p>
              <p className="font-semibold text-sm">{dailyTotal.carbs.toFixed(0)}g</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Fat</p>
              <p className="font-semibold text-sm">{dailyTotal.fat.toFixed(0)}g</p>
            </div>
          </div>
        )}

        {!dailyTotal && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Maanta wax cunto ah ma gelin
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default FriendCard;
