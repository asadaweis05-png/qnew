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

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
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

CRITICAL: You MUST analyze the actual image provided. Look at visible shine, oiliness, dry patches, pores, acne, wrinkles, and dark circles.

CRITICAL: Respond with ONLY the raw JSON object. Do NOT include markdown code blocks like \`\`\`json. Do NOT include any text before or after the JSON.
          
Respond with this exact structure:
{
  "skinHealth": {
    "qoyaan": number,
    "nadiifnimo": number,
    "dhadhanka": number,
    "acne": number,
    "wrinkles": number,
    "darkCircles": number
  },
  "skinType": {
    "type": "oily" | "dry" | "combination" | "normal",
    "confidence": number,
    "indicators": string[],
    "tZone": string,
    "cheeks": string
  },
  "talooyinka": string[],
  "features": {
    "midabMaqaarka": string,
    "daQiyaas": number,
    "nooMaqaarka": string
  },
  "detailedAnalysis": {
    "oilLevel": string,
    "dryness": string,
    "poreSize": string,
    "overallCondition": string
  }
}

Important: Use Somali for "talooyinka", "features", and "detailedAnalysis.overallCondition".`
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topP: 1,
          topK: 32,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);

      return new Response(
        JSON.stringify({
          error: 'Failed to analyze face with Gemini API',
          status: response.status,
          details: errorText.substring(0, 100)
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    console.log('Gemini API response received');

    // Extract the AI's response from candidates
    const aiContent = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!aiContent) {
      console.error('No content in AI response:', JSON.stringify(aiResponse));
      return new Response(
        JSON.stringify({
          error: 'AI did not provide analysis. Please try again.',
          debug: aiResponse
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to parse JSON from the AI response with better robustness
    let result;
    try {
      // Cleanup common AI garbage (markdown bolding, trailing comments, etc)
      let jsonStr = aiContent.trim();

      // Remove markdown code blocks if present
      const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/) ||
        jsonStr.match(/```\s*([\s\S]*?)\s*```/) ||
        jsonStr.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        jsonStr = jsonMatch[1] || jsonMatch[0];
      }

      console.log('Attempting to parse JSON string of length:', jsonStr.length);
      result = JSON.parse(jsonStr);

      // Normalize result: Map Somali keys back to English if Gemini translated them
      // This is a safety measure in case Gemini ignores instructions and translates keys
      const normalizedResult: any = {
        skinHealth: result.skinHealth || result.caafimaadkaMaqaarka || {},
        skinType: result.skinType || result.noocaMaqaarka || {},
        talooyinka: result.talooyinka || result.recommendations || [],
        features: result.features || result.astaamaha || {},
        detailedAnalysis: result.detailedAnalysis || result.falanqaynFaahfaahsan || {}
      };

      // Fill in nested defaults
      if (!normalizedResult.skinHealth.qoyaan) normalizedResult.skinHealth.qoyaan = result.skinHealth?.hydration || 70;
      if (!normalizedResult.skinHealth.nadiifnimo) normalizedResult.skinHealth.nadiifnimo = result.skinHealth?.clarity || 70;
      if (!normalizedResult.skinHealth.dhadhanka) normalizedResult.skinHealth.dhadhanka = result.skinHealth?.texture || 70;

      // Ensure talooyinka is at least an array
      if (!Array.isArray(normalizedResult.talooyinka)) {
        normalizedResult.talooyinka = ["Fadlan sii wad raadraaca maqaarkaaga si aad u hesho xog dheeraad ah."];
      }

      result = normalizedResult;
      console.log('Successfully parsed and normalized AI analysis');
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw content attempted to parse:', aiContent.substring(0, 500));

      return new Response(
        JSON.stringify({
          error: 'Maqaalku ma uusan soo bixin qaab sax ah.',
          details: 'The AI returned an invalid format. Please try again.',
          raw: aiContent.substring(0, 200)
        }),
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
