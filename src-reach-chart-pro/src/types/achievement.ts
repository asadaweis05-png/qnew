export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'completion' | 'streak' | 'milestone' | 'special';
  requirement: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface AchievementStats {
  totalUnlocked: number;
  totalAchievements: number;
  recentUnlock?: Achievement;
}
