
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    // Validate that either query or image is provided
    if (!query && !image) {
      throw new Error('Either query or image must be provided');
    }

    // Prepare the messages array
    const messages = [
      {
        role: 'system',
        content: `You are a nutrition expert. Analyze food items and provide accurate nutritional information in JSON format only.`
      }
    ];

    // Add user's input based on whether it's text or image
    if (image) {
      messages.push({
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: 'Analyze this food image and provide nutritional information. Return ONLY a JSON object with these exact fields: name (string), calories (number), protein (number in grams), carbs (number in grams), and fat (number in grams). All nutritional values should be per serving.' 
          },
          { type: 'image_url', image_url: { url: image } }
        ]
      });
    } else if (query) {
      messages.push({
        role: 'user',
        content: `Provide nutritional information for: ${query}. Return ONLY a JSON object with these exact fields: name (string), calories (number), protein (number in grams), carbs (number in grams), and fat (number in grams).`
      });
    }

    console.log('Sending request to OpenAI...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        tools: [{
          type: 'function',
          function: {
            name: 'provide_nutrition_info',
            description: 'Provide nutritional information for a food item',
            parameters: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Name of the food item' },
                calories: { type: 'number', description: 'Calories per serving' },
                protein: { type: 'number', description: 'Protein in grams per serving' },
                carbs: { type: 'number', description: 'Carbohydrates in grams per serving' },
                fat: { type: 'number', description: 'Fat in grams per serving' }
              },
              required: ['name', 'calories', 'protein', 'carbs', 'fat'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'provide_nutrition_info' } },
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenAI API error response:', errorBody);
      throw new Error(`OpenAI API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    console.log('Received response from OpenAI:', JSON.stringify(data));
    
    // Extract nutrition data from tool call
    let nutritionData;
    try {
      const toolCall = data.choices[0].message.tool_calls?.[0];
      if (toolCall && toolCall.function) {
        nutritionData = JSON.parse(toolCall.function.arguments);
      } else {
        throw new Error('No tool call in response');
      }
    } catch (parseError) {
      console.error('Error parsing tool call:', parseError);
      throw new Error('Failed to parse nutrition data from OpenAI response');
    }
    
    // Validate and sanitize the nutrition data
    if (!nutritionData) {
      throw new Error('No nutrition data returned from OpenAI');
    }
    
    const validNutritionData = {
      name: nutritionData.name || (query || 'Unknown food'),
      calories: Number(nutritionData.calories) || 0,
      protein: Number(nutritionData.protein) || 0,
      carbs: Number(nutritionData.carbs) || 0,
      fat: Number(nutritionData.fat) || 0
    };

    console.log('Returning validated nutrition data:', validNutritionData);
    return new Response(
      JSON.stringify({ nutritionData: validNutritionData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Detailed Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
