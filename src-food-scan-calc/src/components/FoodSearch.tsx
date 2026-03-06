import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
interface FoodSearchProps {
  onSearch: (data: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
}
const FoodSearch = ({
  onSearch
}: FoodSearchProps) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({
        title: "Empty search",
        description: "Please enter a food item to search",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      // Call the Supabase Edge Function
      const {
        data,
        error
      } = await supabase.functions.invoke('analyze-food', {
        body: {
          query
        }
      });
      if (error) throw error;
      if (data?.nutritionData) {
        onSearch(data.nutritionData);
        toast({
          title: "Food analyzed",
          description: `Nutrition data for ${data.nutritionData.name}`
        });
      } else {
        throw new Error('Invalid response data');
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
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="text-sm mb-2">halkaan kuqor cuntada magaceeda </div>
        
        <div className="flex space-x-2">
          <Input type="text" placeholder="Enter a food (e.g. apple, chicken breast, pizza)" value={query} onChange={e => setQuery(e.target.value)} className="flex-1" />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </form>
    </Card>;
};
export default FoodSearch;