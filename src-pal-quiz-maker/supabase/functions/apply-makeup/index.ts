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
    const { imageBase64, makeupStyle } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const makeupPrompts: Record<string, string> = {
      natural: "Apply subtle, natural-looking makeup with light foundation, soft blush, neutral lip color, and minimal eye makeup. Keep the look fresh and everyday-appropriate.",
      glamour: "Apply glamorous evening makeup with flawless foundation, contoured cheekbones, smoky eye shadow, dramatic eyeliner, full lashes, and bold red or berry lips.",
      bridal: "Apply elegant bridal makeup with dewy foundation, soft pink blush, romantic rose-toned eye shadow, defined but soft eyeliner, natural lashes, and pink or nude lips.",
      editorial: "Apply high-fashion editorial makeup with artistic elements, bold color choices, graphic eyeliner, and creative lip colors. Make it runway-ready.",
      korean: "Apply Korean-style makeup with glass skin effect, gradient lips (inside darker), soft blusher on cheeks, subtle shimmer eye shadow, and natural brows.",
      gothic: "Apply gothic makeup with pale foundation, dark smoky eyes, heavy black eyeliner, dark purple or black lips, and dramatic contouring.",
      smoky: "Apply classic smoky eye makeup with black and grey eyeshadow blended outward, smudged eyeliner, voluminous lashes, nude lips, and subtle contouring.",
      nomakeup: "Apply the 'no-makeup makeup' look with sheer coverage, concealer only where needed, cream blush, tinted lip balm, brushed brows, and subtle mascara. Enhance natural beauty without looking made up.",
      festival: "Apply festival-style makeup with colorful glitter around the eyes, gems or face jewels, bold neon eyeshadow, holographic highlighter, and fun lip colors. Make it sparkly and celebratory.",
      vintage: "Apply vintage Old Hollywood makeup with winged eyeliner, red lipstick, defined brows, false lashes, matte foundation, and classic beauty marks if appropriate.",
      sunset: "Apply sunset-inspired eye makeup with warm oranges, pinks, and yellows blended across the lids, peachy blush, and coral or nude lips. Create a warm, glowing effect.",
      fairy: "Apply ethereal fairy-core makeup with soft pastel eyeshadow, delicate shimmer on cheeks and eyes, glossy pink lips, soft blush, and an overall dreamy, magical appearance.",
    };

    const stylePrompt = makeupPrompts[makeupStyle] || makeupPrompts.natural;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Edit this person's photo to add professional makeup. ${stylePrompt} Keep the person's identity, facial features, and expression exactly the same. Only add makeup - do not change hair, clothes, background, or facial structure. The result should look realistic and natural, as if the person actually applied this makeup.`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to process image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content || "";

    if (!generatedImage) {
      return new Response(
        JSON.stringify({ error: "No image was generated. Please try again with a different photo." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        image: generatedImage,
        message: textResponse 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in apply-makeup function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
