import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
interface FoodItem {
  name: string;
  grams: number;
}
interface ManualEntryProps {
  onAnalyze: (data: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
}
const ManualEntry = ({
  onAnalyze
}: ManualEntryProps) => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([{
    name: '',
    grams: 0
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handleAddItem = () => {
    setFoodItems([...foodItems, {
      name: '',
      grams: 0
    }]);
  };
  const handleRemoveItem = (index: number) => {
    if (foodItems.length === 1) return;
    const newItems = [...foodItems];
    newItems.splice(index, 1);
    setFoodItems(newItems);
  };
  const handleItemChange = (index: number, field: 'name' | 'grams', value: string) => {
    const newItems = [...foodItems];
    if (field === 'grams') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        newItems[index].grams = numValue;
      } else if (value === '') {
        // Allow empty string for easier editing
        newItems[index].grams = 0;
      }
    } else {
      newItems[index][field] = value;
    }
    setFoodItems(newItems);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out any items with empty names
    const validItems = foodItems.filter(item => item.name.trim() !== '');
    if (validItems.length === 0) {
      toast({
        title: "No food items",
        description: "Please enter at least one food item",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      console.log('Calling analyze-food-by-weight function with items:', validItems);
      const {
        data,
        error
      } = await supabase.functions.invoke('analyze-food-by-weight', {
        body: {
          foodItems: validItems
        }
      });
      console.log('API response:', {
        hasData: !!data,
        hasError: !!error
      });
      if (error) {
        throw new Error(`Error calling API: ${error.message}`);
      }
      if (data?.nutritionData) {
        console.log('Nutrition data:', data.nutritionData);
        onAnalyze(data.nutritionData);
        toast({
          title: "Analysis complete",
          description: `Analyzed ${validItems.length} food items`
        });
      } else if (data?.error) {
        throw new Error(`API Error: ${data.error}`);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error analyzing food:', error);
      toast({
        title: "Analysis failed",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <Card className="p-4">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="text-sm mb-2">halkaan geli cuntada aad cuneesid miizaankeeda hadii aad ogtahay</div>

          {foodItems.map((item, index) => <div key={index} className="grid grid-cols-5 gap-2 items-center">
              <div className="col-span-3">
                <Label htmlFor={`name-${index}`} className="sr-only">Food Name</Label>
                <Input id={`name-${index}`} placeholder="Food name (e.g. apple, chicken breast)" value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} className="w-full" required />
              </div>
              <div className="col-span-1">
                <Label htmlFor={`grams-${index}`} className="sr-only">Weight (g)</Label>
                <Input id={`grams-${index}`} type="number" min="0" step="1" placeholder="Grams" value={item.grams === 0 ? '' : item.grams} onChange={e => handleItemChange(index, 'grams', e.target.value)} className="w-full" required />
              </div>
              <div className="col-span-1 flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveItem(index)} disabled={foodItems.length === 1}>
                  ×
                </Button>
              </div>
            </div>)}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleAddItem}>
              Add Item
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
        </div>
      </form>
    </Card>;
};
export default ManualEntry;