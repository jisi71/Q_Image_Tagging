import React from 'react';
import { Tags, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gray-900 p-2 rounded-xl shadow-lg ring-1 ring-white/10">
              <Tags className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900">TagMaster AI</h1>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Intelligent Labeling</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-100/50 border border-gray-200/50 px-3 py-1.5 rounded-full font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Powered by Gemini Vision</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;