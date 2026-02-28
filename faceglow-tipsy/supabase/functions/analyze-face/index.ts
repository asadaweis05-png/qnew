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
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY') || 'AIzaSyCcQk6281y1Wju4VdLpC1avhYtz-GVLn8o';
    if (!GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Google AI API key is not configured. Please add it to Supabase secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing face with Direct Gemini API...');

    // Prepare image for Gemini (strip prefix if present)
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    const mimeType = imageBase64.match(/data:([^;]+);/)?.[1] || 'image/jpeg';

    // Call Google Gemini API directly
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `You are a professional dermatologist AI. Analyze this face image carefully and provide a detailed skin assessment.

CRITICAL: You MUST analyze the actual image provided. Look at:
- Visible shine/oiliness on forehead, nose, chin (T-zone)
- Dry patches, flakiness, or rough texture
- Pore size and visibility
- Skin texture and tone
- Any acne, blemishes, or spots
- Under-eye area condition
- Fine lines or wrinkles

Respond with ONLY a JSON object (no markdown, no code blocks) with this exact structure:

{
  "skinHealth": {
    "qoyaan": <0-100 hydration level based on visible moisture>,
    "nadiifnimo": <0-100 cleanliness/clarity>,
    "dhadhanka": <0-100 skin texture smoothness>,
    "acne": <0-100 where 100=no acne, 0=severe acne>,
    "wrinkles": <0-100 where 100=no wrinkles, 0=many wrinkles>,
    "darkCircles": <0-100 where 100=no dark circles, 0=severe dark circles>
  },
  "skinType": {
    "type": "<EXACT: 'oily' OR 'dry' OR 'combination' OR 'normal'>",
    "confidence": <50-100 how confident you are>,
    "indicators": ["<list 2-4 specific visual signs you detected>"],
    "tZone": "<describe T-zone condition: oily/normal/dry>",
    "cheeks": "<describe cheek area condition: oily/normal/dry>"
  },
  "talooyinka": [
    "<6-8 specific skincare recommendations in Somali based on detected skin type>",
    "<If oily: recommend oil-control, clay masks, lightweight moisturizers>",
    "<If dry: recommend hydrating serums, rich moisturizers, avoid harsh cleansers>",
    "<If combination: recommend zone-specific care>"
  ],
  "features": {
    "midabMaqaarka": "<skin tone and undertone description in Somali>",
    "daQiyaas": <estimated age number>,
    "nooMaqaarka": "<skin type in Somali: Maqaar saliid leh (oily) / Maqaar qallalan (dry) / Maqaar isku dhafan (combination) / Maqaar caadi ah (normal)>"
  },
  "detailedAnalysis": {
    "oilLevel": "<none/mild/moderate/high - describe visible shine>",
    "dryness": "<none/mild/moderate/severe - describe dry patches>",
    "poreSize": "<small/medium/large/enlarged>",
    "overallCondition": "<2-3 sentence summary of skin condition in Somali>"
  }
}

Be honest and specific. Your analysis must match what you actually see in the image.`
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);

      return new Response(
        JSON.stringify({ error: 'Failed to analyze face with Gemini API' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    console.log('Gemini analysis completed successfully');

    // Extract the AI's response from candidates
    const aiContent = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!aiContent) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'AI did not provide analysis. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to parse JSON from the AI response
    let result;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) ||
        aiContent.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.error('No JSON found in AI response:', aiContent);
        return new Response(
          JSON.stringify({ error: 'Failed to get valid analysis. Please try uploading the image again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      result = JSON.parse(jsonStr);

      // Validate that we have the required fields
      if (!result.skinHealth || !result.talooyinka) {
        console.error('Missing required fields in AI response:', result);
        return new Response(
          JSON.stringify({ error: 'Incomplete analysis received. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Successfully parsed AI analysis');
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, 'Content:', aiContent);
      return new Response(
        JSON.stringify({ error: 'Could not process the analysis. Please try uploading your image again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-face function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
