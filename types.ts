export interface IDPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  description: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export enum ResizeMode {
  STRETCH = 'STRETCH',
  CROP_CENTER = 'CROP_CENTER',
  FIT_CONTAIN = 'FIT_CONTAIN'
}