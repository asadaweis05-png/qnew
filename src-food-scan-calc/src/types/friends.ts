export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface FriendProfile {
  id: string;
  email: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  gender: string | null;
  activity_level: string | null;
  goal: string | null;
  target_calories: number | null;
  daily_calorie_goal: number | null;
}

export interface FriendWithProgress {
  friendship: Friendship;
  profile: FriendProfile;
  dailyTotal: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    daily_calorie_goal: number | null;
  } | null;
  streak: number;
}
