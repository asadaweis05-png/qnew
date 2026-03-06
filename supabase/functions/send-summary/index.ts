import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SummaryEmailRequest {
  email: string;
  period: 'weekly' | 'monthly';
  goals: any[];
}

async function generateAIInsights(goals: any[], period: string): Promise<string> {
  const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');

  if (!GOOGLE_API_KEY) {
    console.log('No GOOGLE_API_KEY, using fallback insights');
    return generateFallbackInsights(goals, period);
  }

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const habits = goals.filter((g) => g.isHabit);
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const goalsData = `
${period.charAt(0).toUpperCase() + period.slice(1)} Summary:
- Total goals: ${totalGoals}
- Completed: ${completedGoals} (${completionRate}%)
- Habits tracked: ${habits.length}
- Active streaks: ${habits.filter(h => (h.streak || 0) > 0).length}

Goals breakdown:
${goals.map((g) => `- "${g.title}" (${g.timeframe}, ${g.isHabit ? 'habit' : 'goal'}, ${g.completed ? '✓ done' : '○ pending'})`).join('\n') || 'No goals yet'}
`;

  try {
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `You are a supportive productivity coach writing a ${period} email summary. Write 2-3 short, encouraging paragraphs about the user's progress. Include specific observations about their goals and 1-2 actionable tips. Keep it warm and motivating. Do not use markdown formatting - write plain text suitable for an HTML email.\n\nAnalyze the following goals data:\n${goalsData}` }]
        }]
      }),
    });

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', geminiResponse.status);
      return generateFallbackInsights(goals, period);
    }

    const data = await geminiResponse.json();
    return data.candidates[0].content.parts[0].text || generateFallbackInsights(goals, period);
  } catch (error) {
    console.error('AI error:', error);
    return generateFallbackInsights(goals, period);
  }
}

function generateFallbackInsights(goals: any[], period: string): string {
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  const habits = goals.filter((g) => g.isHabit);
  const activeStreaks = habits.filter(h => (h.streak || 0) > 0);

  if (totalGoals === 0) {
    return `It looks like you haven't added any goals yet. Start small - even one daily habit can make a big difference over time. Consider adding a simple goal like "drink 8 glasses of water" or "read for 10 minutes" to get started on your journey.`;
  }

  let message = `This ${period}, you've been working on ${totalGoals} goal${totalGoals !== 1 ? 's' : ''} and completed ${completedGoals} of them - that's a ${completionRate}% completion rate! `;

  if (completionRate >= 80) {
    message += `Excellent work! You're crushing it. Keep this momentum going.`;
  } else if (completionRate >= 50) {
    message += `Good progress! You're on the right track. Focus on consistency over perfection.`;
  } else {
    message += `Every step counts. Consider breaking larger goals into smaller, more manageable tasks.`;
  }

  if (activeStreaks.length > 0) {
    message += ` You have ${activeStreaks.length} active habit streak${activeStreaks.length !== 1 ? 's' : ''} - keep them going!`;
  }

  return message;
}

function generateEmailHTML(email: string, period: string, goals: any[], insights: string): string {
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  const habits = goals.filter((g) => g.isHabit);
  const periodTitle = period === 'weekly' ? 'Weekly' : 'Monthly';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #f97316, #fbbf24); padding: 16px 32px; border-radius: 16px;">
        <h1 style="margin: 0; color: white; font-size: 24px;">🗺️ Your ${periodTitle} Roadmap</h1>
      </div>
    </div>

    <!-- Stats Card -->
    <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 18px;">📊 Your Progress</h2>
      <div style="display: flex; justify-content: space-around; text-align: center;">
        <div>
          <div style="font-size: 32px; font-weight: bold; color: #f97316;">${completedGoals}</div>
          <div style="font-size: 14px; color: #666;">Completed</div>
        </div>
        <div>
          <div style="font-size: 32px; font-weight: bold; color: #1a1a1a;">${totalGoals}</div>
          <div style="font-size: 14px; color: #666;">Total Goals</div>
        </div>
        <div>
          <div style="font-size: 32px; font-weight: bold; color: #22c55e;">${completionRate}%</div>
          <div style="font-size: 14px; color: #666;">Success Rate</div>
        </div>
      </div>
    </div>

    <!-- AI Insights -->
    <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 18px;">🧠 AI Insights</h2>
      <p style="margin: 0; color: #444; line-height: 1.6;">${insights}</p>
    </div>

    <!-- Goals List -->
    ${goals.length > 0 ? `
    <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 18px;">📋 Goals Overview</h2>
      ${goals.slice(0, 10).map(g => `
        <div style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="margin-right: 12px;">${g.completed ? '✅' : '⭕'}</span>
          <span style="flex: 1; color: ${g.completed ? '#888' : '#1a1a1a'}; ${g.completed ? 'text-decoration: line-through;' : ''}">${g.title}</span>
          <span style="font-size: 12px; color: #888; background: #f5f5f5; padding: 2px 8px; border-radius: 4px;">${g.isHabit ? '🔄 Habit' : '🎯 Goal'}</span>
        </div>
      `).join('')}
      ${goals.length > 10 ? `<p style="color: #888; font-size: 14px; margin: 16px 0 0 0;">... and ${goals.length - 10} more</p>` : ''}
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="text-align: center; color: #888; font-size: 14px;">
      <p>Keep pushing forward! Every small step counts. 🚀</p>
      <p style="font-size: 12px; margin-top: 24px;">
        You're receiving this because you requested a ${period} summary from Roadmap.
      </p>
    </div>
  </div>
</body>
</html>
`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, period, goals }: SummaryEmailRequest = await req.json();

    if (!email || !period || !goals) {
      throw new Error('Missing required fields: email, period, goals');
    }

    console.log(`Generating ${period} summary for ${email} with ${goals.length} goals`);

    // Generate AI insights
    const insights = await generateAIInsights(goals, period);

    // Generate email HTML
    const html = generateEmailHTML(email, period, goals, insights);

    const periodTitle = period === 'weekly' ? 'Weekly' : 'Monthly';

    // Send email using Resend API directly
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "Roadmap <onboarding@resend.dev>",
        to: [email],
        subject: `🗺️ Your ${periodTitle} Roadmap Summary`,
        html,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend error:", emailData);
      throw new Error(emailData.message || 'Failed to send email');
    }

    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, id: emailData.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-summary function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
