
import React, { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCamera } from '@/hooks/use-camera';
import { analyzeFoodImage } from '@/services/food-analysis';
import CameraView from '@/components/scanner/CameraView';
import PermissionError from '@/components/scanner/PermissionError';
import CameraButton from '@/components/scanner/CameraButton';

const Scanner = ({ onScan }: { onScan: (data: any) => void }) => {
  const [retryCount, setRetryCount] = useState(0);
  const mountRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { 
    videoRef, 
    canvasRef, 
    isScanning, 
    isProcessing, 
    hasPermission, 
    error, 
    startScanning, 
    stopScanning, 
    captureImage 
  } = useCamera();
  
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted flag on initial render
  useEffect(() => {
    setIsMounted(true);
    mountRef.current = true;
    
    return () => {
      stopScanning();
      mountRef.current = false;
      setIsMounted(false);
    };
  }, [stopScanning]);

  // Init camera after component is fully rendered and stable in the DOM
  useEffect(() => {
    if (isMounted && containerRef.current) {
      // Ensure the container is in the DOM before trying to initialize camera
      const timer = setTimeout(() => {
        if (mountRef.current) {
          console.log("Scanner component fully mounted, container ready:", !!containerRef.current);
          startScanning();
        }
      }, 2000); // Increased delay to ensure DOM is fully ready
      
      return () => clearTimeout(timer);
    }
  }, [isMounted, startScanning]);

  // Retry camera initialization if it failed
  useEffect(() => {
    if (error && retryCount < 3 && isMounted && containerRef.current) {
      const timer = setTimeout(() => {
        if (mountRef.current) {
          console.log(`Retrying camera initialization (attempt ${retryCount + 1})`);
          setRetryCount(prev => prev + 1);
          startScanning();
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, startScanning, isMounted]);

  const handleCapture = async () => {
    toast({
      title: "Processing Image",
      description: "Analyzing your food...",
    });

    try {
      const imageDataUrl = await captureImage();
      if (!imageDataUrl) {
        toast({
          title: "Capture Failed",
          description: "Could not capture image from camera",
          variant: "destructive",
        });
        return;
      }
      
      const nutritionData = await analyzeFoodImage(imageDataUrl);
      onScan(nutritionData);
      stopScanning();
    } catch (error) {
      console.error('Error processing food image:', error);
      toast({
        title: "Scan Failed",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  const retryPermission = () => {
    setRetryCount(0); // Reset retry count
    startScanning();
  };

  const handleStartScanning = () => {
    setRetryCount(0);
    startScanning();
  };

  return (
    <Card className="p-4 w-full max-w-md mx-auto animate-fadeIn relative" ref={containerRef}>
      <div className="relative" id="camera-container">
        {isScanning ? (
          <CameraView 
            videoRef={videoRef}
            canvasRef={canvasRef}
            onCapture={handleCapture}
            onClose={stopScanning}
            isProcessing={isProcessing}
          />
        ) : hasPermission === false ? (
          <PermissionError 
            errorMessage={error} 
            onRetry={retryPermission} 
          />
        ) : (
          <CameraButton 
            onStart={handleStartScanning}
            isDisabled={isProcessing}
          />
        )}
      </div>
    </Card>
  );
};

export default Scanner;
