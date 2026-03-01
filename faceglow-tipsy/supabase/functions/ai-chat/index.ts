import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are a friendly and patient English language tutor designed to help Somali speakers learn English. Your name is "Barashada".

Key guidelines:
1. ALWAYS be encouraging and supportive.
2. Provide Somali translations for vocabulary.
3. Correct mistakes gently.
4. If asked in Somali, respond in both Somali and English.

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

        const contents = mungeMessages(messages);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GOOGLE_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: contents,
            }),
        });

        if (!response.ok) {
            console.error("Gemini API error:", response.status);
            return new Response(JSON.stringify({ error: "Failed to get AI response" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // Set up a TransformStream to convert Gemini SSE to OpenAI-compatible SSE
        const transformStream = new TransformStream({
            transform(chunk, controller) {
                const text = new TextDecoder().decode(chunk);
                const lines = text.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (content) {
                                // Wrap it in OpenAI format: data: {"choices": [{"delta": {"content": "..."}}]}
                                const wrapper = {
                                    choices: [{ delta: { content: content } }]
                                };
                                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(wrapper)}\n\n`));
                            }
                        } catch (e) {
                            // ignore bad chunks
                        }
                    }
                }
            }
        });

        return new Response(response.body?.pipeThrough(transformStream), {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
    } catch (error) {
        console.error("Chat error:", error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
});

function mungeMessages(messages: any[]) {
    // Remove system messages (handled by system_instruction) and handle other changes
    return messages
        .filter(m => m.role !== 'system')
        .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));
}
