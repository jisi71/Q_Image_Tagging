import React, { useState } from 'react';
import { X, RefreshCw, Copy, Check, Edit2, Plus, Trash2, GripVertical, AlertCircle } from 'lucide-react';
import { ImageItem, Tag } from '../types';

interface ImageCardProps {
  item: ImageItem;
  onRemove: (id: string) => void;
  onUpdateTags: (id: string, newTags: Tag[]) => void;
  onRetry: (id: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ item, onRemove, onUpdateTags, onRetry }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTagEn, setNewTagEn] = useState('');
  const [newTagZh, setNewTagZh] = useState('');
  const [copied, setCopied] = useState(false);
  const [draggedTagIndex, setDraggedTagIndex] = useState<number | null>(null);

  const copyTags = () => {
    const text = item.tags.map(t => t.en).join(', ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const removeTag = (indexToRemove: number) => {
    const updated = item.tags.filter((_, idx) => idx !== indexToRemove);
    onUpdateTags(item.id, updated);
  };

  const addTag = () => {
    if (newTagEn.trim()) {
      onUpdateTags(item.id, [...item.tags, { en: newTagEn.trim(), zh: newTagZh.trim() || 'Custom' }]);
      setNewTagEn('');
      setNewTagZh('');
    }
  };

  const updateTag = (index: number, key: 'en' | 'zh', value: string) => {
    const updated = [...item.tags];
    updated[index] = { ...updated[index], [key]: value };
    onUpdateTags(item.id, updated);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTagIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Required for Firefox to allow dragging
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedTagIndex === null || draggedTagIndex === targetIndex) return;

    const newTags = [...item.tags];
    const [draggedItem] = newTags.splice(draggedTagIndex, 1);
    newTags.splice(targetIndex, 0, draggedItem);

    onUpdateTags(item.id, newTags);
    setDraggedTagIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedTagIndex(null);
  };

  return (
    <div className="bg-white rounded-[24px] apple-shadow overflow-hidden flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100/50">
      {/* Image Preview Header */}
      <div className="relative group h-48 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100/50">
        <img 
          src={item.previewUrl} 
          alt="Preview" 
          className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={() => onRemove(item.id)}
            className="p-2 bg-white/90 backdrop-blur-md text-gray-900 rounded-full hover:bg-red-500 hover:text-white apple-shadow transition-all ring-1 ring-black/5"
            title="Remove Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Status Overlay */}
        {item.status === 'processing' && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Analyzing</span>
            </div>
          </div>
        )}
        {item.status === 'error' && (
          <div className="absolute inset-0 bg-red-50/90 backdrop-blur-[2px] flex flex-col items-center justify-center text-red-600 p-4 text-center">
             <AlertCircle className="w-6 h-6 mb-2" />
            <p className="text-xs font-bold uppercase tracking-tight mb-3">Analysis Failed</p>
            <button 
              onClick={() => onRetry(item.id)}
              className="px-4 py-1.5 bg-red-600 text-white text-[10px] rounded-full font-bold hover:bg-red-700 transition-all apple-shadow flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" /> RETRY
            </button>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col bg-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[13px] font-bold text-gray-900 truncate pr-4">
            {item.file.name}
          </h4>
          <div className="flex gap-2">
             <button
              onClick={() => setIsEditing(!isEditing)}
              className={`p-1.5 rounded-lg transition-all ${isEditing ? 'bg-blue-600 text-white apple-shadow' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900 pr-1.5'}`}
              title="Edit Tags"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={copyTags}
              className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all"
              title="Copy English Tags"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Tags Display/Edit Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar max-h-56 min-h-[140px]">
          {item.status === 'success' || item.tags.length > 0 ? (
            <div className="space-y-1.5">
              {item.tags.map((tag, idx) => (
                <div 
                  key={idx} 
                  className={`group flex items-center gap-2 rounded-xl p-1 transition-all ${
                    draggedTagIndex === idx 
                      ? 'opacity-30 bg-gray-100 ring-2 ring-dashed ring-gray-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                >
                  <div 
                    className="cursor-grab active:cursor-grabbing text-gray-200 hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>

                  {isEditing ? (
                    <div className="flex-1 flex gap-1.5 items-center">
                      <input 
                        value={tag.en}
                        onChange={(e) => updateTag(idx, 'en', e.target.value)}
                        className="flex-1 min-w-0 text-[11px] font-medium bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                      <input 
                        value={tag.zh}
                        onChange={(e) => updateTag(idx, 'zh', e.target.value)}
                        className="flex-1 min-w-0 text-[11px] font-medium bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                      <button 
                        onClick={() => removeTag(idx)}
                        className="text-gray-300 hover:text-red-500 p-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center bg-gray-50 hover:bg-white hover:apple-shadow border border-transparent hover:border-gray-100 rounded-xl px-3 py-2 text-[11px] transition-all">
                      <span className="font-bold text-gray-900">{tag.en}</span>
                      <span className="mx-2 text-gray-200">/</span>
                      <span className="text-gray-400 font-medium">{tag.zh}</span>
                    </div>
                  )}
                </div>
              ))}
              
              {isEditing && (
                <div className="flex gap-2 items-center mt-3 pt-3 border-t border-gray-50 pl-6">
                  <input 
                    placeholder="New (EN)"
                    value={newTagEn}
                    onChange={(e) => setNewTagEn(e.target.value)}
                    className="flex-1 min-w-0 text-[11px] font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20"
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  />
                   <input 
                    placeholder="中文"
                    value={newTagZh}
                    onChange={(e) => setNewTagZh(e.target.value)}
                    className="flex-1 min-w-0 text-[11px] font-medium bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20"
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  />
                  <button 
                    onClick={addTag}
                    className="bg-gray-900 text-white p-2 rounded-lg hover:bg-black apple-shadow transition-all flex-shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                {item.status === 'idle' ? 'Ready to analyze' : 'Empty tags'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCard;