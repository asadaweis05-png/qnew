import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface UserScore {
  id: string;
  user_id: string;
  score: number;
  points: number;
  completion_time: number;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  created_at: string | null;
}

interface ScoreWithProfile extends UserScore {
  profile?: Profile;
}

// Update the user's score in the database
export const updateUserScore = async (user: User | null, wordsGuessed: number, points: number = 0, completionTime: number = 0) => {
  if (!user) return null;
  
  // First, try to get the existing record
  const { data: existingScore } = await supabase
    .from('user_scores')
    .select()
    .eq('user_id', user.id)
    .single();
  
  if (existingScore) {
    // If the new score is higher, update it
    if (wordsGuessed > existingScore.score || points > (existingScore.points || 0)) {
      const { data } = await supabase
        .from('user_scores')
        .update({ 
          score: wordsGuessed, 
          points: points,
          completion_time: completionTime
        })
        .eq('user_id', user.id)
        .select();
      return data;
    }
  } else {
    // Create a new score record
    const { data } = await supabase
      .from('user_scores')
      .insert([
        { 
          user_id: user.id, 
          score: wordsGuessed, 
          points: points,
          completion_time: completionTime
        }
      ])
      .select();
    return data;
  }
  
  return null;
};

// Get top scores for the leaderboard
export const getTopScores = async (limit = 10): Promise<ScoreWithProfile[]> => {
  // Fetch all scores
  const { data: scores, error } = await supabase
    .from('user_scores')
    .select('*');
  
  if (error || !scores) {
    console.error('Error fetching scores:', error);
    return [];
  }
  
  // Create a map to consolidate scores by user_id
  const userScoreMap = new Map<string, UserScore>();
  
  for (const score of scores) {
    const userId = score.user_id;
    
    if (userScoreMap.has(userId)) {
      // If user already exists in map, combine the scores
      const existingScore = userScoreMap.get(userId)!;
      userScoreMap.set(userId, {
        ...existingScore,
        score: Math.max(existingScore.score, score.score),
        points: (existingScore.points || 0) + (score.points || 0),
        // Keep the best completion time (lowest value)
        completion_time: existingScore.completion_time && score.completion_time 
          ? Math.min(existingScore.completion_time, score.completion_time)
          : (existingScore.completion_time || score.completion_time || 0)
      });
    } else {
      // Add new user to map
      userScoreMap.set(userId, {
        ...score,
        points: score.points || 0,
        completion_time: score.completion_time || 0
      });
    }
  }
  
  // Convert map to array and sort by points
  let consolidatedScores = Array.from(userScoreMap.values())
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, limit);
  
  // Fetch profile information for each user
  const scoresWithProfiles: ScoreWithProfile[] = [];
  
  for (const score of consolidatedScores) {
    const { data: profile } = await supabase
      .from('profiles')
      .select()
      .eq('id', score.user_id)
      .single();
    
    scoresWithProfiles.push({
      ...score,
      profile: profile || undefined
    });
  }
  
  return scoresWithProfiles;
};
