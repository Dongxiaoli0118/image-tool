import { ResizeMode } from '../types';

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const processImage = async (
  imageSrc: string,
  targetWidth: number,
  targetHeight: number,
  mode: ResizeMode
): Promise<string> => {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // Background default white (for transparent PNGs converted to JPEG or just safety)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  if (mode === ResizeMode.STRETCH) {
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  } else if (mode === ResizeMode.CROP_CENTER) {
    const sourceAspect = img.width / img.height;
    const targetAspect = targetWidth / targetHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (sourceAspect > targetAspect) {
      // Source is wider, crop width
      drawHeight = img.height;
      drawWidth = img.height * targetAspect;
      offsetX = (img.width - drawWidth) / 2;
      offsetY = 0;
    } else {
      // Source is taller, crop height
      drawWidth = img.width;
      drawHeight = img.width / targetAspect;
      offsetX = 0;
      offsetY = (img.height - drawHeight) / 2;
    }

    ctx.drawImage(
      img,
      offsetX, offsetY, drawWidth, drawHeight, // Source crop
      0, 0, targetWidth, targetHeight // Destination
    );
  } else if (mode === ResizeMode.FIT_CONTAIN) {
    const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (targetWidth - w) / 2;
    const y = (targetHeight - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  }

  return canvas.toDataURL('image/jpeg', 0.95);
};