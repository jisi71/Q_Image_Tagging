import React, { useState, useEffect } from 'react';
import { Tags, Sparkles, Settings, Key, Check, X, ShieldCheck } from 'lucide-react';
import { resetAIInstance } from '../services/geminiService';

const Header: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasEnvKey, setHasEnvKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY') || '';
    setApiKey(savedKey);
    // Check if key exists in env (via define in vite.config)
    setHasEnvKey(!!(process.env.API_KEY || process.env.GEMINI_API_KEY));
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
    }
    resetAIInstance();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowSettings(false);
    }, 1500);
  };

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
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-600 bg-gray-100/50 border border-gray-200/50 px-3 py-1.5 rounded-full font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Powered by Gemini Vision</span>
            </div>

            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl transition-all ${showSettings ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-gray-400 hover:bg-gray-100'}`}
              title="API Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Dropdown/Modal */}
      {showSettings && (
        <div className="absolute top-full right-4 mt-2 w-80 bg-white rounded-2xl apple-shadow border border-gray-100 p-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-500" />
              API Settings
            </h3>
            <button onClick={() => setShowSettings(false)} className="text-gray-300 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                Gemini API Key
              </label>
              <div className="relative">
                <input 
                  type="password"
                  placeholder="Paste your API key here..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            {hasEnvKey && !apiKey && (
              <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-xl border border-green-100">
                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-[10px] text-green-700 font-medium">
                  Using system environment key. You can still override it here.
                </p>
              </div>
            )}

            <button
              onClick={handleSave}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                saved ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-black/10'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" /> Key Saved
                </>
              ) : (
                'Save changes'
              )}
            </button>

            <p className="text-[10px] text-gray-400 text-center px-4">
              Your key is saved locally in your browser and never sent to our servers.
            </p>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;