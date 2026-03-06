
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ImageUploader = ({ onUpload }: { onUpload: (data: any) => void }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    toast({
      title: "Processing Image",
      description: "Analyzing your food image...",
    });

    try {
      console.log('Calling analyze-food function with image');
      
      // Add a timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 30000);
      });
      
      const responsePromise = supabase.functions.invoke('analyze-food', {
        body: { image: selectedImage },
      });
      
      // Race the timeout against the actual request
      const { data, error } = await Promise.race([responsePromise, timeoutPromise]) as any;

      console.log('API response:', { hasData: !!data, hasError: !!error });

      if (error) {
        throw new Error(`Error calling API: ${error.message}`);
      }

      if (data?.nutritionData) {
        console.log('Nutrition data:', data.nutritionData);
        onUpload(data.nutritionData);
        // Clear the image after successful analysis
        handleClearImage();
        toast({
          title: "Analysis Complete",
          description: `Analyzed ${data.nutritionData.name}`,
        });
      } else if (data?.error) {
        throw new Error(`API Error: ${data.error}`);
      } else if (data?.rawResponse) {
        console.log('Raw response:', data.rawResponse);
        toast({
          title: "Processing Error",
          description: "Could not parse the nutrition data. Please try again.",
          variant: "destructive",
        });
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      console.error('Error processing food image:', error);
      toast({
        title: "Analysis Failed",
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-4 w-full max-w-md mx-auto animate-fadeIn">
      <div className="flex flex-col gap-4">
        {selectedImage ? (
          <div className="relative">
            <img 
              src={selectedImage} 
              alt="Food preview" 
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              {!isProcessing && (
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleClearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-white font-semibold animate-pulse">Analyzing food...</div>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={handleUploadClick}
            className="w-full h-64 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-gray-500">Click to upload a food image</p>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {selectedImage && (
          <Button 
            onClick={handleAnalyzeImage} 
            disabled={isProcessing}
            className="w-full"
          >
            Analyze Food Image
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ImageUploader;
