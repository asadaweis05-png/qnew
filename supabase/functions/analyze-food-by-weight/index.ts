
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient as createOpenAIClient } from 'https://esm.sh/openai@4.16.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Check request method
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`)
    }

    // Parse request body
    const requestData = await req.json()
    console.log('Request received:', JSON.stringify(requestData))

    // Check if we have foodItems
    if (!requestData.foodItems || !Array.isArray(requestData.foodItems) || requestData.foodItems.length === 0) {
      throw new Error('Request must include an array of foodItems')
    }

    // Initialize OpenAI
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const openai = createOpenAIClient({ apiKey: openAiKey })

    // Analyze food items
    const nutritionData = await analyzeFoodItemsByWeight(openai, requestData.foodItems)

    // Return successful response
    return new Response(
      JSON.stringify({ nutritionData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function analyzeFoodItemsByWeight(openai, foodItems) {
  try {
    // Format the food items for the prompt
    const formattedItems = foodItems.map(item => 
      `${item.name}: ${item.grams}g`
    ).join('\n');

    const prompt = `
      Analyze these food items with their weights and provide combined nutritional information:
      ${formattedItems}
      
      Calculate the total nutritional value of all items combined.
      Respond ONLY with valid JSON in this exact format:
      {
        "name": "Combined meal",
        "calories": total number,
        "protein": total number in grams,
        "carbs": total number in grams,
        "fat": total number in grams
      }
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a nutritional analysis assistant. You provide accurate nutrition information for foods." },
        { role: "user", content: prompt }
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'provide_nutrition_info',
          description: 'Provide combined nutritional information for food items',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Name of the combined meal' },
              calories: { type: 'number', description: 'Total calories' },
              protein: { type: 'number', description: 'Total protein in grams' },
              carbs: { type: 'number', description: 'Total carbs in grams' },
              fat: { type: 'number', description: 'Total fat in grams' }
            },
            required: ['name', 'calories', 'protein', 'carbs', 'fat'],
            additionalProperties: false
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'provide_nutrition_info' } },
      temperature: 0.3,
      max_tokens: 500
    })

    console.log('Received response from OpenAI')
    
    if (!response.choices || response.choices.length === 0) {
      throw new Error('Invalid response from OpenAI API')
    }

    // Extract nutrition data from tool call
    try {
      const toolCall = response.choices[0].message.tool_calls?.[0];
      if (toolCall && toolCall.function) {
        const parsedData = JSON.parse(toolCall.function.arguments);
        validateNutritionData(parsedData);
        return parsedData;
      } else {
        throw new Error('No tool call in response');
      }
    } catch (parseError) {
      console.error('Error parsing tool call:', parseError);
      throw new Error('Could not parse nutrition data from response')
    }
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

  // Ensure numeric fields are actually numbers
  const numericFields = ['calories', 'protein', 'carbs', 'fat']
  for (const field of numericFields) {
    if (typeof data[field] !== 'number') {
      // Try to convert string to number if possible
      const num = Number(data[field])
      if (isNaN(num)) {
        throw new Error(`Field ${field} must be a number`)
      }
      data[field] = num
    }
  }

  return data
}
