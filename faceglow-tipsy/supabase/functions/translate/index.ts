import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { text, fromLang, toLang } = await req.json();
        const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

        if (!GOOGLE_API_KEY) {
            throw new Error("GOOGLE_API_KEY is not configured");
        }

        const fromLanguage = fromLang === "so" ? "Somali" : "English";
        const toLanguage = toLang === "so" ? "Somali" : "English";

        const systemPrompt = `You are a professional translator. Translate the given text from ${fromLanguage} to ${toLanguage}. ONLY provide the translation.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    { role: "user", parts: [{ text: `${systemPrompt}\n\nText: ${text}` }] }
                ],
            }),
        });

        if (!response.ok) {
            console.error("Gemini API error:", response.status);
            return new Response(JSON.stringify({ error: "Translation failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const data = await response.json();
        const translation = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        return new Response(JSON.stringify({ translation }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Translation error:", error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
});
