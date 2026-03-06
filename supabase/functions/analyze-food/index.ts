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
    const { query, image } = await req.json();

    if (!query && !image) {
      throw new Error('Either query or image must be provided');
    }

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    if (!GOOGLE_API_KEY) {
      throw new Error('Google AI API key is not configured');
    }

    console.log('Analyzing food with Gemini API...');

    let contents = [];
    if (image) {
      const base64Data = image.split(',')[1] || image;
      const mimeType = image.match(/data:([^;]+);/)?.[1] || 'image/jpeg';

      contents = [{
        parts: [
          {
            text: `You are a nutrition expert. Analyze this food image and provide nutritional information.
            
CRITICAL: Respond with ONLY a raw JSON object with these exact fields. Do NOT include markdown code blocks.
{
  "name": "string (name of food)",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams)
}
All nutritional values should be per serving.`
          },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          }
        ]
      }];
    } else if (query) {
      contents = [{
        parts: [
          {
            text: `You are a nutrition expert. Provide nutritional information for: ${query}.
            
CRITICAL: Respond with ONLY a raw JSON object with these exact fields. Do NOT include markdown code blocks.
{
  "name": "string (name of food)",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams)
}`
          }
        ]
      }];
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.1,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!aiContent) {
      throw new Error('No content in AI response');
    }

    let nutritionData;
    try {
      let jsonStr = aiContent.trim();
      const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/) ||
        jsonStr.match(/```\s*([\s\S]*?)\s*```/) ||
        jsonStr.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        jsonStr = jsonMatch[1] || jsonMatch[0];
      }
      nutritionData = JSON.parse(jsonStr);
    } catch (parseError) {
      throw new Error('Failed to parse nutrition data from AI response: ' + aiContent.substring(0, 100));
    }

    const validNutritionData = {
      name: nutritionData.name || (query || 'Unknown food'),
      calories: Number(nutritionData.calories) || 0,
      protein: Number(nutritionData.protein) || 0,
      carbs: Number(nutritionData.carbs) || 0,
      fat: Number(nutritionData.fat) || 0
    };

    return new Response(
      JSON.stringify({ nutritionData: validNutritionData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Detailed Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});







