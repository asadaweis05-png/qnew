import { useMemo } from 'react';
import { Goal } from '@/types/goal';
import { Achievement, AchievementStats } from '@/types/achievement';

const ACHIEVEMENT_DEFINITIONS = [
  // Completion achievements
  { id: 'first-goal', name: 'First Step', description: 'Complete your first goal', icon: '🎯', category: 'completion', requirement: 1, tier: 'bronze' },
  { id: 'five-goals', name: 'Getting Started', description: 'Complete 5 goals', icon: '✨', category: 'completion', requirement: 5, tier: 'bronze' },
  { id: 'ten-goals', name: 'On a Roll', description: 'Complete 10 goals', icon: '🔥', category: 'completion', requirement: 10, tier: 'silver' },
  { id: 'twenty-five-goals', name: 'Goal Crusher', description: 'Complete 25 goals', icon: '💪', category: 'completion', requirement: 25, tier: 'silver' },
  { id: 'fifty-goals', name: 'Unstoppable', description: 'Complete 50 goals', icon: '🚀', category: 'completion', requirement: 50, tier: 'gold' },
  { id: 'hundred-goals', name: 'Centurion', description: 'Complete 100 goals', icon: '👑', category: 'completion', requirement: 100, tier: 'platinum' },
  
  // Streak achievements
  { id: 'streak-3', name: 'Habit Starter', description: 'Reach a 3-day streak', icon: '🌱', category: 'streak', requirement: 3, tier: 'bronze' },
  { id: 'streak-7', name: 'Week Warrior', description: 'Reach a 7-day streak', icon: '⚡', category: 'streak', requirement: 7, tier: 'silver' },
  { id: 'streak-14', name: 'Fortnight Champion', description: 'Reach a 14-day streak', icon: '🏆', category: 'streak', requirement: 14, tier: 'gold' },
  { id: 'streak-30', name: 'Monthly Master', description: 'Reach a 30-day streak', icon: '🌟', category: 'streak', requirement: 30, tier: 'platinum' },
  
  // Milestone achievements
  { id: 'create-5', name: 'Planner', description: 'Create 5 goals', icon: '📝', category: 'milestone', requirement: 5, tier: 'bronze' },
  { id: 'create-10', name: 'Strategist', description: 'Create 10 goals', icon: '🗺️', category: 'milestone', requirement: 10, tier: 'silver' },
  { id: 'create-25', name: 'Visionary', description: 'Create 25 goals', icon: '🔮', category: 'milestone', requirement: 25, tier: 'gold' },
  
  // Special achievements
  { id: 'perfect-day', name: 'Perfect Day', description: 'Complete all daily goals', icon: '☀️', category: 'special', requirement: 1, tier: 'silver' },
  { id: 'habit-lover', name: 'Habit Lover', description: 'Create 3 habits', icon: '💖', category: 'special', requirement: 3, tier: 'bronze' },
  { id: 'note-taker', name: 'Note Taker', description: 'Add 5 notes to goals', icon: '📓', category: 'special', requirement: 5, tier: 'bronze' },
] as const;

export const useAchievements = (goals: Goal[]) => {
  const achievements = useMemo((): Achievement[] => {
    const completedGoals = goals.filter(g => g.completed).length;
    const totalGoals = goals.length;
    const maxStreak = Math.max(...goals.map(g => g.streak || 0), 0);
    const habitsCount = goals.filter(g => g.isHabit).length;
    const notesCount = goals.reduce((acc, g) => acc + g.notes.length, 0);
    const dailyGoals = goals.filter(g => g.timeframe === 'today');
    const completedDailyGoals = dailyGoals.filter(g => g.completed).length;
    const perfectDay = dailyGoals.length > 0 && completedDailyGoals === dailyGoals.length;

    return ACHIEVEMENT_DEFINITIONS.map(def => {
      let progress = 0;
      let unlocked = false;

      switch (def.category) {
        case 'completion':
          progress = completedGoals;
          unlocked = completedGoals >= def.requirement;
          break;
        case 'streak':
          progress = maxStreak;
          unlocked = maxStreak >= def.requirement;
          break;
        case 'milestone':
          progress = totalGoals;
          unlocked = totalGoals >= def.requirement;
          break;
        case 'special':
          if (def.id === 'perfect-day') {
            progress = perfectDay ? 1 : 0;
            unlocked = perfectDay;
          } else if (def.id === 'habit-lover') {
            progress = habitsCount;
            unlocked = habitsCount >= def.requirement;
          } else if (def.id === 'note-taker') {
            progress = notesCount;
            unlocked = notesCount >= def.requirement;
          }
          break;
      }

      return {
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        category: def.category,
        requirement: def.requirement,
        tier: def.tier,
        unlocked,
        progress: Math.min(progress, def.requirement),
      } as Achievement;
    });
  }, [goals]);

  const stats = useMemo((): AchievementStats => {
    const unlocked = achievements.filter(a => a.unlocked);
    return {
      totalUnlocked: unlocked.length,
      totalAchievements: achievements.length,
      recentUnlock: unlocked[unlocked.length - 1],
    };
  }, [achievements]);

  return { achievements, stats };
};
