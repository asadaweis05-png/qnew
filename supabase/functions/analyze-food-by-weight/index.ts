import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`)
    }

    const requestData = await req.json()
    console.log('Request received:', JSON.stringify(requestData))

    if (!requestData.foodItems || !Array.isArray(requestData.foodItems) || requestData.foodItems.length === 0) {
      throw new Error('Request must include an array of foodItems')
    }

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY')
    if (!GOOGLE_API_KEY) {
      throw new Error('Google AI API key not configured')
    }

    const nutritionData = await analyzeFoodItemsByWeight(GOOGLE_API_KEY, requestData.foodItems)

    return new Response(
      JSON.stringify({ nutritionData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing request:', error)

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown Error',
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function analyzeFoodItemsByWeight(apiKey, foodItems) {
  try {
    const formattedItems = foodItems.map(item =>
      `${item.name}: ${item.grams}g`
    ).join('\n');

    const prompt = `
      Analyze these food items with their weights and provide combined nutritional information:
      ${formattedItems}
      
      Calculate the total nutritional value of all items combined.
      CRITICAL: Respond ONLY with valid JSON in this exact format, with no markdown code blocks:
      {
        "name": "Combined meal",
        "calories": number (total),
        "protein": number (total in grams),
        "carbs": number (total in grams),
        "fat": number (total in grams)
      }
    `

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
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
    let jsonStr = aiContent.trim();
    const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/) ||
      jsonStr.match(/```\s*([\s\S]*?)\s*```/) ||
      jsonStr.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      jsonStr = jsonMatch[1] || jsonMatch[0];
    }
    nutritionData = JSON.parse(jsonStr);

    return validateNutritionData(nutritionData);

  } catch (error) {
    console.error('Error in analyzeFoodItemsByWeight:', error)
    throw error
  }
}

function validateNutritionData(data) {
  const requiredFields = ['name', 'calories', 'protein', 'carbs', 'fat']
  for (const field of requiredFields) {
    if (data[field] === undefined) {
      throw new Error(`Missing required field: ${field}`)
    }
  }

  const numericFields = ['calories', 'protein', 'carbs', 'fat']
  for (const field of numericFields) {
    if (typeof data[field] !== 'number') {
      const num = Number(data[field])
      if (isNaN(num)) {
        throw new Error(`Field ${field} must be a number`)
      }
      data[field] = num
    }
  }

  return data
}
