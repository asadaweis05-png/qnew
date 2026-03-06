
import { supabase } from '@/integrations/supabase/client';

export interface NutritionData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export async function analyzeFoodImage(imageDataUrl: string): Promise<NutritionData> {
  console.log('Calling analyze-food function');
  const { data, error } = await supabase.functions.invoke('analyze-food', {
    body: { image: imageDataUrl },
  });

  console.log('API response:', { hasData: !!data, hasError: !!error });

  if (error) {
    throw new Error(`Error calling API: ${error.message}`);
  }

  // Process the response and send data back to parent component
  if (data?.nutritionData) {
    console.log('Nutrition data:', data.nutritionData);
    return data.nutritionData;
  } else if (data?.error) {
    throw new Error(`API Error: ${data.error}`);
  } else {
    throw new Error("Invalid response format from API");
  }
}
