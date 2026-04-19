import React, { useRef, useCallback } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

interface UploadAreaProps {
  onUpload: (files: File[]) => void;
  isProcessing: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onUpload, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (validFiles.length > 0) {
      onUpload(validFiles);
    }
  }, [onUpload]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isProcessing) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        relative group border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 apple-shadow-hover
        ${isProcessing 
          ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60' 
          : 'bg-white border-gray-200 hover:border-blue-500/50 hover:bg-white'
        }
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center gap-6">
        <div className={`
          p-5 rounded-2xl transition-all duration-300
          ${isProcessing ? 'bg-gray-100' : 'bg-gray-50 group-hover:bg-blue-50'}
        `}>
          <UploadCloud className={`w-8 h-8 transition-colors ${isProcessing ? 'text-gray-300' : 'text-gray-400 group-hover:text-blue-500'}`} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
            {isProcessing ? 'Processing Images...' : 'Import Images'}
          </h3>
          <p className="text-gray-400 text-sm mt-1 font-medium">Drag & Drop or click to browse</p>
        </div>
        {!isProcessing && (
          <div className="flex gap-4 mt-2">
            <div className="flex items-center text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
              <ImageIcon className="w-3 h-3 mr-2" />
              Batch Ready
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadArea;