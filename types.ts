export interface ImageFile {
  file: File;
  preview: string;
  base64: string;
  mimeType: string;
}

export enum ClothingType {
  MODEL = 'MODEL',
  TOP = 'TOP',
  BOTTOM = 'BOTTOM'
}

export interface GeneratedContent {
  imageUrl?: string;
  videoUrl?: string;
}