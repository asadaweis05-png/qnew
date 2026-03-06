
import React from 'react';

export interface CameraState {
  isScanning: boolean;
  isProcessing: boolean;
  hasPermission: boolean | null;
  error: string | null;
}

export interface CameraHookResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isScanning: boolean;
  isProcessing: boolean;
  hasPermission: boolean | null;
  error: string | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  captureImage: () => Promise<string | null>;
}

export interface CameraOptions {
  timeout?: number;
  maxRetries?: number;
}

export interface CameraUtilsOptions {
  onError: (error: string) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}
