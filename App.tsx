import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ImageCard from './components/ImageCard';
import { ImageItem, Tag } from './types';
import { generateImageTags } from './services/geminiService';
import { generateZip, downloadBlob } from './utils/fileUtils';
import { Download, Play, Trash, AlertCircle, Plus, Tag as TagIcon, Image as ImageIcon } from 'lucide-react';
import { nanoid } from 'nanoid';

const App: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  
  // Batch tag inputs
  const [batchTagEn, setBatchTagEn] = useState('');
  const [batchTagZh, setBatchTagZh] = useState('');

  const handleUpload = (files: File[]) => {
    const newImages: ImageItem[] = files.map(file => ({
      id: nanoid(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'idle',
      tags: []
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const target = prev.find(img => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear all images?")) {
      images.forEach(img => URL.revokeObjectURL(img.previewUrl));
      setImages([]);
    }
  };

  const updateTags = (id: string, newTags: Tag[]) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, tags: newTags } : img));
  };

  const handleBatchAddTag = () => {
    if (!batchTagEn.trim()) return;
    
    const newTag: Tag = {
      en: batchTagEn.trim(),
      zh: batchTagZh.trim() || batchTagEn.trim()
    };

    setImages(prev => prev.map(img => ({
      ...img,
      // Add to the beginning of the array
      tags: [newTag, ...img.tags]
    })));

    setBatchTagEn('');
    setBatchTagZh('');
  };

  const processQueue = useCallback(async () => {
    setIsProcessing(true);
    
    const idsToProcess = images.filter(img => img.status === 'idle' || img.status === 'error').map(img => img.id);

    for (const id of idsToProcess) {
       setImages(prev => prev.map(img => img.id === id ? { ...img, status: 'processing', error: undefined } : img));
       
       const currentImg = images.find(img => img.id === id);
       if (!currentImg) continue;

       try {
         const result = await generateImageTags(currentImg.file);
         setImages(prev => prev.map(img => 
           img.id === id ? { ...img, status: 'success', tags: result.tags } : img
         ));
       } catch (err: any) {
         setImages(prev => prev.map(img => 
           img.id === id ? { ...img, status: 'error', error: err.message || "Failed" } : img
         ));
       }
    }
    
    setIsProcessing(false);
  }, [images]);

  const handleDownloadZip = async () => {
    if (images.length === 0) return;
    setIsZipping(true);
    try {
      const blob = await generateZip(images);
      downloadBlob(blob, `tagmaster_batch_${Date.now()}.zip`);
    } catch (error) {
      console.error("Zip failed", error);
      alert("Failed to create zip file");
    } finally {
      setIsZipping(false);
    }
  };

  const stats = {
    total: images.length,
    processed: images.filter(i => i.status === 'success').length,
    pending: images.filter(i => i.status === 'idle').length,
    errors: images.filter(i => i.status === 'error').length
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Top Controls */}
        <div className="space-y-8 mb-12">
          <UploadArea onUpload={handleUpload} isProcessing={isProcessing} />
          
          {images.length > 0 && (
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-[24px] apple-shadow border border-white/40 sticky top-24 z-20 flex flex-col gap-6">
              
              {/* Batch Actions Section */}
              <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-gray-100/50">
                  <div className="flex items-center gap-3">
                       <div className="p-2.5 bg-gray-900 rounded-xl text-white shadow-sm ring-1 ring-white/10">
                           <TagIcon className="w-4 h-4" />
                       </div>
                       <div>
                         <span className="text-sm font-bold text-gray-900 block">Batch Tagging</span>
                         <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Apply to all items</span>
                       </div>
                  </div>
                  
                  <div className="flex-1 flex items-center gap-3 min-w-[320px]">
                      <input 
                          type="text" 
                          placeholder="Tag (English)" 
                          value={batchTagEn}
                          onChange={(e) => setBatchTagEn(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleBatchAddTag()}
                          className="flex-1 text-sm bg-gray-50 border-none rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-300"
                      />
                      <input 
                          type="text" 
                          placeholder="Translation (Optional)" 
                          value={batchTagZh}
                          onChange={(e) => setBatchTagZh(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleBatchAddTag()}
                          className="flex-1 text-sm bg-gray-50 border-none rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-300"
                      />
                      <button
                          onClick={handleBatchAddTag}
                          disabled={!batchTagEn.trim()}
                          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 shrink-0"
                      >
                          <Plus className="w-4 h-4" /> Add
                      </button>
                  </div>
              </div>

              {/* Status & Main Actions Row */}
              <div className="flex flex-wrap gap-6 items-center justify-between">
                <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span>Total: <span className="text-gray-900">{stats.total}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <span>Done: <span className="text-gray-900">{stats.processed}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                    <span>Pending: <span className="text-gray-900">{stats.pending}</span></span>
                  </div>
                  {stats.errors > 0 && (
                    <div className="flex items-center gap-2 text-red-500">
                      <AlertCircle className="w-3.5 h-3.5"/> 
                      <span>Errors: {stats.errors}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                   <button
                    onClick={clearAll}
                    disabled={isProcessing}
                    className="px-4 py-2 text-gray-400 hover:text-red-500 rounded-xl text-sm font-semibold transition-all hover:bg-red-50 disabled:opacity-30"
                  >
                    Clear All
                  </button>
                  
                  <button
                    onClick={processQueue}
                    disabled={isProcessing || stats.pending + stats.errors === 0}
                    className={`
                      px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-xl transition-all flex items-center gap-2
                      ${isProcessing 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : (stats.pending + stats.errors === 0 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-gray-900 hover:bg-black shadow-black/10')
                      }
                    `}
                  >
                    <Play className={`w-3.5 h-3.5 ${isProcessing ? 'animate-pulse' : 'fill-current'}`} />
                    {isProcessing ? 'Labeling...' : 'Start Analysis'}
                  </button>

                  <button
                    onClick={handleDownloadZip}
                    disabled={isZipping || images.length === 0}
                    className="px-6 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 apple-shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {isZipping ? (
                       <div className="w-4 h-4 border-2 border-gray-900/10 border-t-gray-900 rounded-full animate-spin" />
                     ) : (
                       <Download className="w-3.5 h-3.5 text-blue-600" />
                     )}
                     Export ZIP
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Image Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {images.map(img => (
              <div key={img.id} className="h-[430px]">
                <ImageCard 
                  item={img} 
                  onRemove={removeImage} 
                  onUpdateTags={updateTags}
                  onRetry={() => {
                    setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'idle', error: undefined } : i));
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <div className="inline-flex p-6 bg-white rounded-[32px] apple-shadow mb-6">
              <ImageIcon className="w-12 h-12 text-gray-100" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">No images yet</h2>
            <p className="text-gray-400 max-w-xs mx-auto text-sm font-medium">Upload photos to start identifying and labeling them with AI.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;