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
    const {
      goal,
      currentCalories,
      targetCalories,
      currentProtein,
      currentCarbs,
      currentFat,
      detailedFoods,
      avgProtein,
      avgCarbs,
      avgFat,
      weight,
      height,
      age,
      gender,
      activityLevel
    } = await req.json();

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not configured');
    }

    // Translate goal to Somali
    const goalTranslations: Record<string, string> = {
      'lose_weight': 'Yaraynta miisaanka',
      'gain_weight': 'Kordhinta miisaanka',
      'maintain': 'Ilaalinta miisaanka',
      'build_muscle': 'Dhisida murqaha'
    };

    const activityTranslations: Record<string, string> = {
      'sedentary': 'Dhaqdhaqaaq yar (fadhiid badan)',
      'lightly_active': 'Dhaqdhaqaaq fudud',
      'moderately_active': 'Dhaqdhaqaaq dhexdhexaad',
      'very_active': 'Dhaqdhaqaaq badan',
      'extremely_active': 'Dhaqdhaqaaq aad u badan'
    };

    // Build comprehensive user profile analysis
    const userProfile = [];
    userProfile.push(`📊 HADAFKA: ${goalTranslations[goal] || goal || 'Caafimaad guud'}`);

    if (weight) userProfile.push(`⚖️ Miisaanka: ${weight}kg`);
    if (height) userProfile.push(`📏 Dhererka: ${height}cm`);
    if (age) userProfile.push(`🎂 Da'da: ${age} sano`);
    if (gender) userProfile.push(`👤 Jinsiga: ${gender === 'male' ? 'Lab' : 'Dhedig'}`);
    if (activityLevel) userProfile.push(`🏃 Dhaqdhaqaaqa: ${activityTranslations[activityLevel] || activityLevel}`);

    // Daily nutrition analysis
    const nutritionAnalysis = [];
    nutritionAnalysis.push(`\n📈 FALANQAYNTA MAANTA:`);
    nutritionAnalysis.push(`- Kaloriyada: ${currentCalories || 0} / ${targetCalories || 2000} (Bartilmaameedka)`);

    const caloriesDiff = (targetCalories || 2000) - (currentCalories || 0);
    if (caloriesDiff > 0) {
      nutritionAnalysis.push(`- ⚠️ Waxaad u baahan tahay ${caloriesDiff} kalori oo dheeraad ah maanta`);
    } else if (caloriesDiff < 0) {
      nutritionAnalysis.push(`- ⚠️ Waxaad dhaaftay bartilmaameedkaaga ${Math.abs(caloriesDiff)} kalori`);
    }

    if (currentProtein) nutritionAnalysis.push(`- Borotiinka maanta: ${currentProtein}g`);
    if (currentCarbs) nutritionAnalysis.push(`- Kaarboohaydraatka maanta: ${currentCarbs}g`);
    if (currentFat) nutritionAnalysis.push(`- Duxda maanta: ${currentFat}g`);

    // Food pattern analysis
    const foodAnalysis = [];
    if (detailedFoods && detailedFoods.length > 0) {
      foodAnalysis.push(`\n🍽️ CUNTADA DHOWAAN LA CUNAY (${detailedFoods.length} cunto):`);
      detailedFoods.slice(0, 5).forEach((food: any) => {
        foodAnalysis.push(`- ${food.name}: ${food.calories} kal, ${food.protein}g borotiin, ${food.carbs}g kaarbo, ${food.fat}g dux`);
      });

      foodAnalysis.push(`\n📉 CELCELISKA NAFAQADA:`);
      foodAnalysis.push(`- Celceliska Borotiinka: ${avgProtein}g`);
      foodAnalysis.push(`- Celceliska Kaarboohaydraatka: ${avgCarbs}g`);
      foodAnalysis.push(`- Celceliska Duxda: ${avgFat}g`);
    }

    const fullContext = [...userProfile, ...nutritionAnalysis, ...foodAnalysis].join('\n');

    const systemPrompt = `Waxaad tahay khabiir nafaqo iyo caafimaad Soomaali ah. Waxaad siisaa talooyinka shakhsi ahaaneed ee ku saleysan falanqaynta qoto dheer.

⚠️ MUHIIM AAD: KU JAWAAB AF-SOOMAALI KALIYA! HADDII HADAFKU YAHAY:
- "Yaraynta miisaanka": Sii talooyinka sida loo dhimo miisaanka si caafimaad leh
- "Kordhinta miisaanka": Sii talooyinka sida loo kordhiyo miisaanka
- "Dhisida murqaha": Sii talooyinka borotiinka iyo jimicsiga

QAABKA JAWAABTA:
1. Falanqayn kooban oo ku saabsan cuntadooda iyo caadooyinkooda
2. 3-5 talooyinka gaarka ah ee ku saleysan xogtooda
3. Talo kasta waa inay noqotaa mid la hirgelin karo oo gaar ah

Isticmaal emoji-yada si ay u fududaato fahamka. Noqo mid dhiirigeliya laakiin run sheeg.`;

    const userPrompt = `FALANQEE XOGTAN OO SII TALOOYINKA SHAKHSI AHAANEED:

${fullContext}

Ku saleysan xogtan, falanqee:
1. Wax fiican ee uu sameynayo
2. Meelaha uu u baahan yahay hagaajin
3. Sii talooyinka gaarka ah ee ku saleysan hadafkiisa (${goalTranslations[goal] || 'Caafimaad guud'})

KU JAWAAB AF-SOOMAALI KALIYA!`;

    console.log('Sending request to Gemini API...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt + "\n\n" + userPrompt }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const tips = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || 'No tips available at the moment.';

    console.log('AI tips generated successfully');
    return new Response(
      JSON.stringify({ tips }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-health-tips function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate tips' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});







