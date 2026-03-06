
import { CameraUtilsOptions } from './types';

/**
 * Utility functions for camera operations
 */
export const cameraUtils = {
  /**
   * Create camera constraints object for getUserMedia
   */
  createConstraints() {
    return {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      audio: false
    };
  },

  /**
   * Get media stream with timeout
   */
  async getMediaStreamWithTimeout(
    constraints: MediaStreamConstraints,
    timeoutMs: number = 10000
  ): Promise<MediaStream> {
    const streamPromise = navigator.mediaDevices.getUserMedia(constraints);
    const timeoutPromise = new Promise<MediaStream>((_, reject) => {
      setTimeout(() => reject(new Error("Camera access timeout - please try again")), timeoutMs);
    });
    
    return Promise.race([streamPromise, timeoutPromise]);
  },

  /**
   * Clean up a media stream by stopping all tracks
   */
  cleanupStream(stream: MediaStream | null) {
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log(`Stopping track: ${track.kind}`);
        track.stop();
      });
    }
  },

  /**
   * Wait for video element to be ready
   */
  async waitForVideoReady(
    { videoRef, onError }: CameraUtilsOptions,
    timeoutMs: number = 8000
  ): Promise<void> {
    if (!videoRef.current) {
      throw new Error("Video element disappeared");
    }
    
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Camera initialization timed out - please try again"));
      }, timeoutMs);
      
      const handleCanPlay = () => {
        clearTimeout(timeout);
        if (videoRef.current) {
          videoRef.current.removeEventListener('canplay', handleCanPlay);
        }
        resolve();
      };
      
      videoRef.current.addEventListener('canplay', handleCanPlay, { once: true });
      
      videoRef.current.play().catch(err => {
        clearTimeout(timeout);
        console.error("Error playing video:", err);
        onError("Could not start video stream");
        reject(new Error("Could not start video stream"));
      });
      
      if (videoRef.current.readyState >= 3) {
        clearTimeout(timeout);
        resolve();
      }
    });
  },

  /**
   * Capture an image from video to canvas
   */
  captureImageFromVideo(
    videoRef: React.RefObject<HTMLVideoElement>,
    canvasRef: React.RefObject<HTMLCanvasElement>
  ): string | null {
    if (!videoRef.current || !canvasRef.current) {
      return null;
    }
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Ensure video dimensions are available
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      throw new Error("Video not ready yet - please wait a moment and try again");
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to a data URL
    return canvas.toDataURL('image/jpeg', 0.8);
  }
};
