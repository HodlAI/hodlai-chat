import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { translations } from '../lib/translations';
import { Rocket, MessageSquare, AlertTriangle, X, Bot, Coins, Wallet, Settings, Check, Search, Save } from 'lucide-react';

export const Home: React.FC = () => {
  const { signAndVerify, user, language, isLoading, error, setError, allModels, activeModelIds, toggleActiveModel, fetchModels, checkConfiguration } = useStore();
  const t = translations[language].home;
  const tStatus = translations[language].status;
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Settings State
  const [apiKey, setApiKey] = useState(localStorage.getItem('bsc_ai_hub_custom_key') || '');
  const [isSaved, setIsSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const baseUrl = localStorage.getItem('bsc_ai_hub_custom_base') || 'https://api.hodlai.fun/v1';

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleConnect = async () => {
    if (isConnecting || isLoading) return;
    setIsConnecting(true);
    setError(null);
    try {
      if (typeof (window as any).ethereum !== 'undefined') {
        const accounts = await ((window as any).ethereum).request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const address = accounts[0];
          const signMessage = async (message: string): Promise<string> => {
            return await ((window as any).ethereum).request({
              method: 'personal_sign',
              params: [message, address],
            });
          };
          await signAndVerify(address, signMessage);
        }
      } else {
        setError("Please install MetaMask or Trust Wallet");
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      if (error.code !== 4001) setError(error.message || "Connection Failed");
    } finally {
      setIsConnecting(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('bsc_ai_hub_custom_key', apiKey);
    checkConfiguration();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    fetchModels(); // Refresh models with new key
  };

  const filteredModels = allModels.filter(m => m.id.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full flex flex-col bg-white dark:bg-[#343541] overflow-hidden">
       {/* Force full viewport height behavior */}
       <style>{`
          :root.dark body { background-color: #343541 !important; color: #ececf1 !important; }
          body { background-color: #fff; }
       `}</style>
       {/* Hero Section */}
       <section className="relative flex flex-col items-center justify-center pt-20 pb-16 px-4">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"></div>
             <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]"></div>
          </div>

          <div className="relative z-10 flex max-w-4xl flex-col items-center text-center">
             <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {t.live}
             </div>

             <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-6xl md:text-7xl">
                <span className="block">{t.sloganPrefix}</span>
                <span className="text-primary">{t.sloganHighlight}</span>
             </h1>

             <p className="mb-10 max-w-2xl text-lg text-gray-600 dark:text-gray-400 sm:text-xl leading-relaxed">
                {t.description}
             </p>

             <div className="flex flex-col w-full sm:w-auto sm:flex-row items-center gap-4">
                <Link to="/chat" className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-bold text-white transition-all hover:scale-105 hover:bg-primary-hover shadow-lg shadow-primary/25">
                    <MessageSquare className="w-5 h-5" />
                    {t.startChat}
                </Link>
                {!user.isConnected ? (
                     <button 
                       onClick={handleConnect} 
                       disabled={isConnecting || isLoading}
                       className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-surface-border bg-white dark:bg-surface-dark px-8 text-base font-semibold text-gray-900 dark:text-white transition-all hover:bg-gray-50 dark:hover:bg-[#2f2f2f]"
                     >
                        {(isConnecting || isLoading) ? (
                          <>
                            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                            <span>{tStatus.connecting}</span>
                          </>
                        ) : (
                          <>
                            <Wallet className="w-5 h-5" />
                            {t.connectLaunch}
                          </>
                        )}
                    </button>
                ) : (
                     <div className="px-6 py-3 rounded-xl bg-green-500/10 text-green-600 font-semibold border border-green-500/20">
                         Wallet Connected
                     </div>
                )}
             </div>

             {error && (
                <div className="mt-6 flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                   <AlertTriangle className="w-4 h-4" />
                   <span>{error}</span>
                   <button onClick={() => setError(null)} className="ml-2 hover:text-red-400"><X className="w-4 h-4" /></button>
                </div>
             )}
          </div>
       </section>

       {/* Settings Section */}
       <section className="py-16 bg-gray-50 dark:bg-[#111111] border-t border-gray-200 dark:border-[#333]">
           <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-primary/10 rounded-lg">
                      <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configuration</h2>
              </div>

              {/* API Configuration */}
              <div className="bg-white dark:bg-[#212121] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-[#333] mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Access</h3>
                  <div className="space-y-4">
                      {/* Base URL (Hidden or purely informational text, removing input) */}
                      <p className="text-xs text-gray-400 dark:text-gray-500">Connected to: <span className="font-mono text-primary">{baseUrl.replace("https://", "").replace("/v1", "")}</span></p>
                      
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                          <div className="flex gap-2">
                            <input 
                                type="password" 
                                placeholder="sk-..." 
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-[#171717] text-gray-900 dark:text-white border border-gray-200 dark:border-[#424242] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                            <button 
                                onClick={saveSettings}
                                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-medium whitespace-nowrap"
                            >
                                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                {isSaved ? 'Saved' : 'Save'}
                            </button>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Model Management */}
              <div className="bg-white dark:bg-[#212121] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-[#333]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Model Selection</h3>
                        <p className="text-sm text-gray-500">Manage visible models in chat.</p>
                      </div>
                      <div className="flex gap-2">
                          <button 
                             onClick={() => fetchModels()} 
                             className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                             title="Refresh List"
                          >
                             <Search className="w-4 h-4" /> {/* Reusing Icon for Refresh visual */}
                          </button>
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input 
                                type="text" 
                                placeholder="Filter..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-[#2f2f2f] text-sm text-gray-900 dark:text-white border-transparent focus:bg-white dark:focus:bg-[#171717] focus:border-primary outline-none transition-all w-full sm:w-48"
                              />
                          </div>
                      </div>
                  </div>

                  {allModels.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {filteredModels.map((model) => (
                              <label 
                                key={model.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                    activeModelIds.includes(model.id)
                                    ? 'bg-primary/5 border-primary/30'
                                    : 'bg-gray-50 dark:bg-[#2f2f2f] border-transparent hover:bg-gray-100 dark:hover:bg-[#383838]'
                                }`}
                              >
                                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${
                                      activeModelIds.includes(model.id)
                                      ? 'bg-primary border-primary text-white'
                                      : 'bg-white dark:bg-[#171717] border-gray-300 dark:border-[#555]'
                                  }`}>
                                      {activeModelIds.includes(model.id) && <Check className="w-3.5 h-3.5" />}
                                  </div>
                                  <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={activeModelIds.includes(model.id)}
                                    onChange={() => toggleActiveModel(model.id)}
                                  />
                                  <div className="flex flex-col min-w-0 overflow-hidden">
                                      <span className={`text-sm font-medium truncate ${
                                          activeModelIds.includes(model.id) ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
                                      }`}>
                                          {model.name}
                                      </span>
                                      <span className="text-[10px] text-gray-400 truncate">{model.id}</span>
                                  </div>
                              </label>
                          ))}
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-100 dark:border-[#333] rounded-xl">
                          {apiKey ? (
                              <>
                                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                                  <p className="text-gray-500 font-medium">Fetching available models...</p>
                                  <p className="text-xs text-gray-400 mt-1">Checking api.hodlai.fun</p>
                                  <button onClick={() => fetchModels()} className="mt-4 text-xs text-primary hover:underline">Retry</button>
                              </>
                          ) : (
                              <>
                                  <div className="p-3 bg-gray-100 dark:bg-[#2f2f2f] rounded-full mb-3 text-gray-400">
                                      <Settings className="w-6 h-6" />
                                  </div>
                                  <p className="text-gray-600 dark:text-gray-300 font-medium">Enter API Key first</p>
                                  <p className="text-sm text-gray-500 mt-1">Models will load automatically</p>
                              </>
                          )}
                      </div>
                  )}
              </div>
           </div>
       </section>
    </div>
  );
};