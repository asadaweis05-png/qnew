// 3D LUT Parser and Applicator for .cube files

export interface LUT3D {
  size: number;
  data: Float32Array;
}

// Parse a .cube LUT file
export async function parseCubeLUT(cubeContent: string): Promise<LUT3D> {
  const lines = cubeContent.trim().split('\n');
  let size = 0;
  const data: number[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // Parse LUT size
    if (trimmed.startsWith('LUT_3D_SIZE')) {
      size = parseInt(trimmed.split(/\s+/)[1], 10);
      continue;
    }
    
    // Skip other metadata
    if (trimmed.startsWith('TITLE') || trimmed.startsWith('DOMAIN_')) continue;
    
    // Parse RGB values
    const values = trimmed.split(/\s+/).map(Number);
    if (values.length === 3 && !values.some(isNaN)) {
      data.push(...values);
    }
  }

  if (size === 0) {
    throw new Error('Invalid LUT file: missing LUT_3D_SIZE');
  }

  return {
    size,
    data: new Float32Array(data),
  };
}

// Load LUT from URL
export async function loadLUT(url: string): Promise<LUT3D> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load LUT: ${response.statusText}`);
  }
  const content = await response.text();
  return parseCubeLUT(content);
}

// Trilinear interpolation for 3D LUT lookup
function trilinearInterpolate(
  lut: LUT3D,
  r: number,
  g: number,
  b: number
): [number, number, number] {
  const size = lut.size;
  const maxIndex = size - 1;

  // Scale to LUT indices
  const rScaled = r * maxIndex;
  const gScaled = g * maxIndex;
  const bScaled = b * maxIndex;

  // Get integer indices
  const r0 = Math.floor(rScaled);
  const g0 = Math.floor(gScaled);
  const b0 = Math.floor(bScaled);

  const r1 = Math.min(r0 + 1, maxIndex);
  const g1 = Math.min(g0 + 1, maxIndex);
  const b1 = Math.min(b0 + 1, maxIndex);

  // Get fractional parts
  const rFrac = rScaled - r0;
  const gFrac = gScaled - g0;
  const bFrac = bScaled - b0;

  // Helper to get LUT value at index
  const getLutValue = (ri: number, gi: number, bi: number): [number, number, number] => {
    const index = (bi * size * size + gi * size + ri) * 3;
    return [lut.data[index], lut.data[index + 1], lut.data[index + 2]];
  };

  // Get 8 corner values
  const c000 = getLutValue(r0, g0, b0);
  const c100 = getLutValue(r1, g0, b0);
  const c010 = getLutValue(r0, g1, b0);
  const c110 = getLutValue(r1, g1, b0);
  const c001 = getLutValue(r0, g0, b1);
  const c101 = getLutValue(r1, g0, b1);
  const c011 = getLutValue(r0, g1, b1);
  const c111 = getLutValue(r1, g1, b1);

  // Trilinear interpolation
  const result: [number, number, number] = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    const c00 = c000[i] * (1 - rFrac) + c100[i] * rFrac;
    const c01 = c001[i] * (1 - rFrac) + c101[i] * rFrac;
    const c10 = c010[i] * (1 - rFrac) + c110[i] * rFrac;
    const c11 = c011[i] * (1 - rFrac) + c111[i] * rFrac;

    const c0 = c00 * (1 - gFrac) + c10 * gFrac;
    const c1 = c01 * (1 - gFrac) + c11 * gFrac;

    result[i] = c0 * (1 - bFrac) + c1 * bFrac;
  }

  return result;
}

// Apply 3D LUT to image data
export function applyLUT(imageData: ImageData, lut: LUT3D, intensity: number = 1): ImageData {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;

    // Clamp input values
    const rClamped = Math.max(0, Math.min(1, r));
    const gClamped = Math.max(0, Math.min(1, g));
    const bClamped = Math.max(0, Math.min(1, b));

    // Get LUT color
    const [lutR, lutG, lutB] = trilinearInterpolate(lut, rClamped, gClamped, bClamped);

    // Blend with original based on intensity
    const finalR = r + (lutR - r) * intensity;
    const finalG = g + (lutG - g) * intensity;
    const finalB = b + (lutB - b) * intensity;

    // Write back (clamped to valid range)
    data[i] = Math.round(Math.max(0, Math.min(1, finalR)) * 255);
    data[i + 1] = Math.round(Math.max(0, Math.min(1, finalG)) * 255);
    data[i + 2] = Math.round(Math.max(0, Math.min(1, finalB)) * 255);
  }

  return imageData;
}

// Cached LUT instance
let cachedLUT: LUT3D | null = null;

export async function getCachedLUT(): Promise<LUT3D> {
  if (!cachedLUT) {
    cachedLUT = await loadLUT('/luts/teal-orange-blue-tint.cube');
  }
  return cachedLUT;
}
