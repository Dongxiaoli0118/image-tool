import { IDPreset } from './types';

export const ID_PRESETS: IDPreset[] = [
  {
    id: '1inch',
    label: '1 Inch (1寸)',
    width: 295,
    height: 413,
    description: '25mm x 35mm @ 300dpi - Standard ID',
  },
  {
    id: '2inch',
    label: '2 Inch (2寸)',
    width: 413,
    height: 579,
    description: '35mm x 49mm @ 300dpi - Passport/Visa',
  },
  {
    id: '2inch_lg',
    label: 'Large 2 Inch (大2寸)',
    width: 413,
    height: 626,
    description: '35mm x 53mm @ 300dpi',
  }
];

export const MAX_FILE_SIZE_MB = 10;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];