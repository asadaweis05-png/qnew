
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  name: string;
}

const NutritionCard = ({ data }: { data: NutritionData }) => {
  const maxValues = {
    calories: 2000,
    protein: 50,
    carbs: 275,
    fat: 78
  };

  return (
    <Card className="p-6 w-full max-w-md mx-auto mt-4 animate-fadeIn">
      <h3 className="text-2xl font-semibold mb-4">{data.name}</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Calories</span>
            <span className="text-sm text-primary-600">{data.calories} kcal</span>
          </div>
          <Progress value={(data.calories / maxValues.calories) * 100} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Protein</span>
            <span className="text-sm text-primary-600">{data.protein}g</span>
          </div>
          <Progress value={(data.protein / maxValues.protein) * 100} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Carbs</span>
            <span className="text-sm text-primary-600">{data.carbs}g</span>
          </div>
          <Progress value={(data.carbs / maxValues.carbs) * 100} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Fat</span>
            <span className="text-sm text-primary-600">{data.fat}g</span>
          </div>
          <Progress value={(data.fat / maxValues.fat) * 100} className="h-2" />
        </div>
      </div>
    </Card>
  );
};

export default NutritionCard;
