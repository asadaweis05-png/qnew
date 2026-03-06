import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are a friendly and patient English language tutor designed to help Somali speakers learn English. Your name is "Barashada" (which means "Learning" in Somali).

Key guidelines:
1. ALWAYS be encouraging and supportive - learning a new language is challenging!
2. When teaching vocabulary, provide the Somali translation when helpful
3. Use simple, clear English and gradually increase complexity
4. Correct mistakes gently and explain why something is incorrect
5. Give examples with everyday situations Somali speakers can relate to
6. If asked in Somali, respond in both Somali and English to help with understanding
7. Focus on practical, conversational English that can be used daily
8. Celebrate progress, no matter how small

Common Somali phrases to use when appropriate:
- "Waa fiican tahay!" (You're doing great!)
- "Sax!" (Correct!)
- "Mar kale isku day" (Try again)
- "Aad baad u fiican tahay" (You're very good)

Topics you can help with:
- Basic vocabulary and phrases
- Grammar explanations
- Pronunciation tips (using phonetic descriptions)
- Conversation practice
- Translation help (English ↔ Somali)
- Common expressions and idioms
- Reading comprehension
- Writing practice

Always be patient, encouraging, and make learning fun!`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not configured");
    }

    console.log("Sending request to Gemini API");

    // Convert chat messages to Gemini format
    const geminiContents = [];

    // Add system instruction as first user message context
    geminiContents.push({
      role: "user",
      parts: [{ text: systemPrompt + "\n\nPlease acknowledge you understand your role." }]
    });
    geminiContents.push({
      role: "model",
      parts: [{ text: "I understand! I'm Barashada, your friendly English language tutor for Somali speakers. I'm here to help you learn English step by step. Waa fiican tahay! Let's get started! 😊" }]
    });

    // Add user messages
    for (const msg of messages) {
      geminiContents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!aiContent) {
      throw new Error("No content in AI response");
    }

    // Return in OpenAI-compatible format for the frontend
    // Format as SSE since frontend expects streaming
    const sseData = `data: ${JSON.stringify({
      choices: [{
        delta: { content: aiContent },
        finish_reason: "stop"
      }]
    })}\n\ndata: [DONE]\n\n`;

    return new Response(sseData, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
