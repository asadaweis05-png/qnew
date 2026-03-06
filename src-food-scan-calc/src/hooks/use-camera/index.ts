
import { useRef, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CameraHookResult, CameraOptions } from './types';
import { cameraUtils } from './camera-utils';

/**
 * Hook to handle camera access and operations
 */
export function useCamera(options: CameraOptions = {}): CameraHookResult {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();
  
  // Clean up the video stream when component unmounts
  const stopScanning = useCallback(() => {
    console.log("Stopping scanner");
    
    if (streamRef.current) {
      cameraUtils.cleanupStream(streamRef.current);
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
  }, []);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      
      // Double check for browser support first
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support camera access");
      }
      
      // Stop any existing stream first
      stopScanning();
      
      // Make sure DOM elements are ready
      if (!videoRef.current) {
        console.error("Video element not available - DOM might not be ready");
        throw new Error("Camera element not found - please wait and try again");
      }
      
      console.log("DOM check passed, proceeding with camera access");
      
      // Create constraints for camera
      const constraints = cameraUtils.createConstraints();
      console.log("Requesting camera with constraints:", constraints);
      
      // Get media stream with timeout
      const stream = await cameraUtils.getMediaStreamWithTimeout(
        constraints, 
        options.timeout || 10000
      );
      
      console.log("Camera access granted:", stream.getTracks().length, "tracks");
      
      // Double check video element exists after async operation
      if (!videoRef.current) {
        console.error("Video element disappeared during initialization");
        cameraUtils.cleanupStream(stream);
        throw new Error("Camera element not found - please try again");
      }
      
      // Store stream and connect to video element
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready
      await cameraUtils.waitForVideoReady({
        videoRef,
        onError: (errorMsg) => setError(errorMsg)
      }, options.timeout || 8000);
      
      // Everything successful
      setIsScanning(true);
      setHasPermission(true);
      console.log("Camera successfully initialized");
      
    } catch (error) {
      console.error('Camera initialization error:', error);
      setHasPermission(false);
      setError(String(error) || "Camera access denied or not available");
      toast({
        title: "Camera Error",
        description: String(error) || "Unable to access camera. Please check permissions or try again.",
        variant: "destructive",
      });
    }
  }, [stopScanning, toast, options]);

  const captureImage = async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current) {
      toast({
        title: "Error",
        description: "Camera not initialized properly",
        variant: "destructive",
      });
      return null;
    }
    
    setIsProcessing(true);
    
    try {
      console.log("Capturing image from video");
      const imageDataUrl = cameraUtils.captureImageFromVideo(videoRef, canvasRef);
      
      if (imageDataUrl) {
        console.log("Image captured, length:", imageDataUrl.length);
      }
      
      return imageDataUrl;
    } catch (error) {
      console.error('Error capturing image:', error);
      toast({
        title: "Capture Failed",
        description: String(error),
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    videoRef,
    canvasRef,
    isScanning,
    isProcessing,
    hasPermission,
    error,
    startScanning,
    stopScanning,
    captureImage
  };
}

// Re-export types for easier imports
export * from './types';
