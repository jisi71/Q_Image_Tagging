import JSZip from 'jszip';
import { ImageItem } from '../types';

export const generateZip = async (images: ImageItem[]): Promise<Blob> => {
  const zip = new JSZip();
  const folderName = `tagmaster_batch_${new Date().toISOString().slice(0, 10)}`;
  const root = zip.folder(folderName);

  if (!root) throw new Error("Failed to create zip folder");

  for (const img of images) {
    // Add the image file
    root.file(img.file.name, img.file);

    // Format tags: en1, en2, en3...
    // You can customize this format (e.g., Danbooru style)
    const tagContent = img.tags.map(t => t.en).join(', ');
    
    // Create a text file with the same name as the image
    const txtFileName = img.file.name.replace(/\.[^/.]+$/, "") + ".txt";
    root.file(txtFileName, tagContent);
  }

  return await zip.generateAsync({ type: "blob" });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};