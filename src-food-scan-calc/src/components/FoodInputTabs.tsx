
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FoodSearch from '@/components/FoodSearch';
import ManualEntry from '@/components/ManualEntry';
import ImageUploader from '@/components/ImageUploader';
import { useIsMobile } from '@/hooks/use-mobile';
import { Search, Weight, Image } from 'lucide-react';

interface NutritionData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodInputTabsProps {
  onFoodData: (data: NutritionData) => void;
}

const FoodInputTabs = ({ onFoodData }: FoodInputTabsProps) => {
  const isMobile = useIsMobile();

  return (
    <Tabs defaultValue="image">
      <TabsList className="grid grid-cols-3 mb-4 w-full">
        <TabsTrigger value="image" className="flex items-center gap-1">
          <Image className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4 mr-1'}`} />
          {!isMobile && <span>Image</span>}
        </TabsTrigger>
        <TabsTrigger value="search" className="flex items-center gap-1">
          <Search className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4 mr-1'}`} />
          {!isMobile && <span>Search</span>}
        </TabsTrigger>
        <TabsTrigger value="manual" className="flex items-center gap-1">
          <Weight className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4 mr-1'}`} />
          {!isMobile && <span>Weight</span>}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="image" className="mt-0">
        <ImageUploader onUpload={onFoodData} />
      </TabsContent>

      <TabsContent value="search" className="mt-0">
        <FoodSearch onSearch={onFoodData} />
      </TabsContent>

      <TabsContent value="manual" className="mt-0">
        <ManualEntry onAnalyze={onFoodData} />
      </TabsContent>
    </Tabs>
  );
};

export default FoodInputTabs;
