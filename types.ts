export interface Tag {
  en: string;
  zh: string;
}

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

export interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  status: ProcessingStatus;
  tags: Tag[];
  error?: string;
}

export interface TagResponse {
  tags: Tag[];
}