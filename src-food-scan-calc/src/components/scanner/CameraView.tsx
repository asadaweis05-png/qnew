
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Scan, X, RefreshCw } from 'lucide-react';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onCapture: () => void;
  onClose: () => void;
  isProcessing: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  canvasRef,
  onCapture,
  onClose,
  isProcessing
}) => {
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [initAttempts, setInitAttempts] = useState(0);

  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (!videoElement) {
      console.error("Video element not found in CameraView");
      setVideoError("Camera element not initialized");
      return;
    }
    
    const handleCanPlay = () => {
      console.log("Video can play now");
      setVideoReady(true);
      setVideoError(null);
    };
    
    const handleError = (e: Event) => {
      console.error("Video error in CameraView:", e);
      setVideoError("Camera error occurred");
    };
    
    // Add event listeners
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('error', handleError);
    
    // Check if video is already playing
    if (videoElement.readyState >= 3) { // HAVE_FUTURE_DATA or higher
      setVideoReady(true);
    }
    
    // Auto-retry play if not ready yet and we have stream
    if (!videoReady && videoElement.srcObject && initAttempts < 4) {
      const playTimer = setTimeout(() => {
        console.log(`Auto-retry play attempt ${initAttempts + 1}`);
        setInitAttempts(prev => prev + 1);
        videoElement.play().catch(err => {
          console.error("Error auto-playing video:", err);
        });
      }, 1000);
      
      return () => clearTimeout(playTimer);
    }
    
    // Ensure video is playing if we have a stream
    if (videoElement.srcObject && videoElement.paused) {
      setTimeout(() => {
        console.log("Attempting to play video");
        videoElement.play().catch(err => {
          console.error("Error playing video in CameraView:", err);
          setVideoError("Cannot play video stream. Please try again.");
        });
      }, 500);
    }

    return () => {
      // Clean up event listeners
      videoElement?.removeEventListener('canplay', handleCanPlay);
      videoElement?.removeEventListener('error', handleError);
      
      // Some browsers require explicit pause
      if (videoElement && !videoElement.paused) {
        videoElement.pause();
      }
    };
  }, [videoRef, videoReady, initAttempts]);

  const handleRetry = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      setVideoError(null);
      setInitAttempts(0);
      
      // Try to reinitialize the video
      if (videoElement.srcObject) {
        console.log("Retrying play with existing stream");
        videoElement.play().catch(err => {
          console.error("Error retrying video play:", err);
          setVideoError("Cannot start video stream. Try closing and opening the scanner again.");
        });
      } else {
        setVideoError("No camera stream found. Please close and try again.");
      }
    }
  };

  return (
    <>
      <div className="camera-container w-full h-64 overflow-hidden rounded-lg relative">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline
          muted
          className="w-full h-full object-cover bg-black"
          id="camera-video-element"
        />
      </div>
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="absolute top-2 right-2 flex gap-2">
        {videoError ? (
          <Button
            variant="destructive"
            size="icon"
            onClick={handleRetry}
            disabled={isProcessing}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="icon"
            onClick={onCapture}
            disabled={isProcessing || !videoReady}
          >
            <Scan className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="secondary"
          size="icon"
          onClick={onClose}
          disabled={isProcessing}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {videoError && !isProcessing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <div className="text-white font-semibold text-center p-4">
            <div className="mb-2">{videoError}</div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="bg-white/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </div>
        </div>
      )}
      
      {isProcessing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <div className="text-white font-semibold animate-pulse">Analyzing food...</div>
        </div>
      )}
    </>
  );
};

export default CameraView;
