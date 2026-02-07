import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { translations } from '../lib/translations';
import { config } from '../lib/config';
import { Component, Settings, Sun, Moon, AlertTriangle, X, Check, Search, Save } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme, language, toggleLanguage, error, setError, isConfigured, checkConfiguration, fetchModels, allModels, activeModelIds, toggleActiveModel } = useStore();
  const t = translations[language];
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [customKey, setCustomKey] = useState(localStorage.getItem('bsc_ai_hub_custom_key') || '');
  const [searchTerm, setSearchTerm] = useState('');

  // Sync theme to DOM
  useEffect(() => {
      if (theme === 'dark') {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  }, [theme]);

  // Sync config on mount
  useEffect(() => {
    checkConfiguration();
    if (isConfigOpen) {
        setCustomKey(localStorage.getItem('bsc_ai_hub_custom_key') || '');
        if (isConfigured) fetchModels();
    }
  }, [checkConfiguration, isConfigOpen, isConfigured, fetchModels]);

  const saveConfig = () => {
    if (customKey) localStorage.setItem('bsc_ai_hub_custom_key', customKey);
    else localStorage.removeItem('bsc_ai_hub_custom_key');
    
    // Ensure standard API base
    localStorage.removeItem('bsc_ai_hub_custom_base');

    checkConfiguration();
    fetchModels(); // Refresh models immediately
    // Don't close immediately, let user see models? Or close? 
    // Usually save closes modal, but here we might want to let them select models.
    // Let's keep it open if they just saved the key, but maybe close if they click "Done"?
    // For now, I'll separate "Save Key" from "Close". 
    // Actually, user expects "Save & Reload" to finish. 
    // I will auto-refresh models on key change/save.
  };

  const filteredModels = allModels.filter(m => m.id.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-gray-900 dark:text-white transition-colors duration-300">
      <main className="flex-grow">
        {children}
      </main>

      {isConfigOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-surface-border transform transition-all flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-surface-border flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 font-display">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Settings className="w-6 h-6" />
                </div>
                {t.config.title}
                </h2>
                <button onClick={() => setIsConfigOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                {/* API Key Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.config.customApiKey} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                        <input
                        type="password"
                        value={customKey}
                        onChange={(e) => setCustomKey(e.target.value)}
                        placeholder="sk-..."
                        className="flex-1 bg-white dark:bg-background-dark border border-gray-200 dark:border-surface-border text-gray-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary block p-3 shadow-inner transition-all hover:border-gray-300 dark:hover:border-gray-600 outline-none"
                        />
                        <button 
                            onClick={saveConfig}
                            className="bg-primary hover:bg-primary-hover text-white px-4 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                       Key is stored locally. Connected to <span className="font-mono text-primary">api.hodlai.fun</span>.
                    </p>
                </div>

                {/* Model Selection Section */}
                {isConfigured && (
                    <div className="pt-4 border-t border-gray-100 dark:border-surface-border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Active Models</h3>
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Filter..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-7 pr-3 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-[#171717] focus:border-primary outline-none transition-all w-32" 
                                />
                            </div>
                        </div>

                        {allModels.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                                {filteredModels.map((model) => (
                                    <label 
                                        key={model.id}
                                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                            activeModelIds.includes(model.id)
                                            ? 'bg-primary/5 border-primary/30'
                                            : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                                            activeModelIds.includes(model.id)
                                            ? 'bg-primary border-primary text-white'
                                            : 'bg-white dark:bg-[#171717] border-gray-300 dark:border-[#555]'
                                        }`}>
                                            {activeModelIds.includes(model.id) && <Check className="w-3 h-3" />}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={activeModelIds.includes(model.id)}
                                            onChange={() => toggleActiveModel(model.id)}
                                        />
                                        <span className={`text-xs font-medium truncate select-none ${
                                            activeModelIds.includes(model.id) ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                            {model.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-xs text-gray-500">Loading models...</p>
                                <button onClick={() => fetchModels()} className="text-[10px] text-primary mt-2 hover:underline cursor-pointer">Retry Fetch</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-surface-border bg-gray-50/50 dark:bg-surface-dark/50 rounded-b-2xl flex justify-end">
                <button
                onClick={() => setIsConfigOpen(false)}
                className="px-6 py-2 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30 cursor-pointer"
                >
                Done
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};