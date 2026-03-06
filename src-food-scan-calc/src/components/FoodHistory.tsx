
import React from 'react';
import { Card } from "@/components/ui/card";
import { FoodEntry } from '@/types/database';

interface FoodHistoryProps {
  foodHistory: FoodEntry[];
}

const FoodHistory = ({ foodHistory }: FoodHistoryProps) => {
  if (foodHistory.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Recent Food History</h2>
      <div className="space-y-3">
        {foodHistory.map((entry) => (
          <Card key={entry.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{entry.name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{entry.calories} cal</p>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span>P: {entry.protein}g</span>
                  <span>C: {entry.carbs}g</span>
                  <span>F: {entry.fat}g</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FoodHistory;
