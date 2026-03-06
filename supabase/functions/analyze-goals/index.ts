import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goals } = await req.json();
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');

    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not configured');
    }

    console.log('Analyzing goals with Gemini API...');

    // Prepare goals summary for analysis
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g: any) => g.completed).length;
    const habits = goals.filter((g: any) => g.isHabit);
    const oneTimeGoals = goals.filter((g: any) => !g.isHabit);

    const timeframeBreakdown = {
      today: goals.filter((g: any) => g.timeframe === 'today'),
      week: goals.filter((g: any) => g.timeframe === 'week'),
      month: goals.filter((g: any) => g.timeframe === 'month'),
      year: goals.filter((g: any) => g.timeframe === 'year'),
    };

    const goalsData = `
User's Goal Data Summary:
- Total goals: ${totalGoals}
- Completed: ${completedGoals} (${totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}%)
- Habits: ${habits.length} (${habits.filter((h: any) => h.completed).length} completed)
- One-time goals: ${oneTimeGoals.length} (${oneTimeGoals.filter((g: any) => g.completed).length} completed)

Timeframe breakdown:
- Today: ${timeframeBreakdown.today.length} goals (${timeframeBreakdown.today.filter((g: any) => g.completed).length} done)
- This Week: ${timeframeBreakdown.week.length} goals (${timeframeBreakdown.week.filter((g: any) => g.completed).length} done)
- This Month: ${timeframeBreakdown.month.length} goals (${timeframeBreakdown.month.filter((g: any) => g.completed).length} done)
- This Year: ${timeframeBreakdown.year.length} goals (${timeframeBreakdown.year.filter((g: any) => g.completed).length} done)

Habit streaks:
${habits.map((h: any) => `- "${h.title}": ${h.streak || 0} day streak${h.completed ? ' (done today)' : ' (not done today)'}`).join('\n') || 'No habits tracked yet'}

Goals list:
${goals.map((g: any) => `- "${g.title}" (${g.timeframe}, ${g.isHabit ? 'habit' : 'goal'}, ${g.completed ? 'completed' : 'in progress'})`).join('\n') || 'No goals added yet'}
`;

    const systemPrompt = `You are an insightful personal productivity coach analyzing a user's goal and habit tracking data. Provide a concise, encouraging, and actionable analysis.

Your response MUST be in this exact JSON format:
{
  "overallScore": <number 1-100>,
  "scoreLabel": "<Excellent|Great|Good|Needs Work|Getting Started>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "areasToImprove": ["<area 1>", "<area 2>"],
  "tips": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>"],
  "encouragement": "<A short motivational message>",
  "pattern": "<Brief observation about their behavior pattern>"
}

Guidelines:
- Be specific and reference their actual goals/habits when possible
- Keep tips actionable and practical
- Be encouraging but honest
- Focus on behavior patterns, not just numbers
- If they have few or no goals, encourage them to start small`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nAnalyze the following goals data:\n${goalsData}` }]
        }]
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorData}`);
    }

    const data = await geminiResponse.json();
    const content = data.candidates[0].content.parts[0].text;

    console.log('AI response:', content);

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      analysis = {
        overallScore: 50,
        scoreLabel: 'Getting Started',
        strengths: ['Taking the first step by tracking goals'],
        areasToImprove: ['Add more goals to track your progress'],
        tips: ['Start with one small daily habit', 'Set realistic timeframes', 'Review your goals weekly'],
        encouragement: 'Every journey begins with a single step. Keep going!',
        pattern: 'Just getting started with goal tracking'
      };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-goals function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
