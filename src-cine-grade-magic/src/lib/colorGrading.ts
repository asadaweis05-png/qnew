// Cinematic Color Grading using 3D LUT
import { getCachedLUT, applyLUT } from './lutParser';

export interface ColorGradingOptions {
  intensity: number; // 0-1
}

const defaultOptions: ColorGradingOptions = {
  intensity: 1.0,
};

// Process image on canvas using the .cube LUT
export async function processImage(
  file: File,
  options?: Partial<ColorGradingOptions>
): Promise<{ original: string; processed: string; format: string; filename: string }> {
  const opts = { ...defaultOptions, ...options };
  
  // Determine output format based on input file type
  const isPng = file.type === 'image/png';
  const format = isPng ? 'image/png' : 'image/jpeg';
  const extension = isPng ? 'png' : 'jpg';
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    const originalUrl = URL.createObjectURL(file);

    img.onload = async () => {
      try {
        // Create canvas for processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Load and apply LUT
        const lut = await getCachedLUT();
        applyLUT(imageData, lut, opts.intensity);

        // Put processed data back
        ctx.putImageData(imageData, 0, 0);

        // Convert to data URL (preserve format)
        const processedUrl = canvas.toDataURL(format, isPng ? undefined : 0.95);

        resolve({
          original: originalUrl,
          processed: processedUrl,
          format: extension,
          filename: file.name.replace(/\.[^/.]+$/, ''),
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = originalUrl;
  });
}

// Download processed image
export function downloadImage(dataUrl: string, filename: string = 'cinematic-graded.jpg') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
