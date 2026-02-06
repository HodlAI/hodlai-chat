import React, { useState } from 'react';
import { Step } from '../types';
import { useStore } from '../store';
import { translations } from '../lib/translations';

export const AgentCreate: React.FC = () => {
  const { language } = useStore();
  const t = translations[language].create;
  
  const [currentStep, setCurrentStep] = useState<Step>(Step.CORE_INFO);
  const [formData, setFormData] = useState({
    name: 'Nexus Trader Alpha',
    category: 'DeFi Trading',
    description: 'Expert market analyst specializing in finding arbitrage opportunities on BSC.',
    tags: ['Market Analysis', 'Trend Spotting'],
    visibility: 'Public'
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
             <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-2">{t.title}</h1>
             <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg">{t.subtitle}</p>
          </div>
          <div className="hidden md:block">
             <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Session ID: #8829-XJ</span>
          </div>
       </div>

       {/* Stepper */}
       <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-[600px] border-b border-gray-200 dark:border-[#28392f] flex">
             {[Step.CORE_INFO, Step.KNOWLEDGE_BASE, Step.LOGIC_CONFIG, Step.TOKENOMICS].map((step, idx) => (
                <div key={step} className={`flex-1 group cursor-pointer ${currentStep === step ? '' : 'opacity-50 hover:opacity-80'}`} onClick={() => setCurrentStep(step)}>
                    <div className={`flex items-center gap-3 py-3 px-2 ${currentStep === step ? 'border-b-2 border-primary' : 'border-b-2 border-transparent'}`}>
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${currentStep === step ? 'bg-primary text-background-dark' : 'bg-gray-200 dark:bg-[#28392f] text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600'}`}>
                            {idx + 1}
                        </span>
                        <span className={`${currentStep === step ? 'text-primary' : 'text-gray-500 dark:text-gray-400'} font-bold text-sm uppercase tracking-wide`}>
                            {step === 1 ? t.steps.core : step === 2 ? t.steps.kb : step === 3 ? t.steps.logic : t.steps.token}
                        </span>
                    </div>
                </div>
             ))}
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Form Side */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
             <section className="bg-white dark:bg-surface-dark/60 backdrop-blur-md border border-gray-200 dark:border-[#28392f] p-6 rounded-xl space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-rounded text-primary">face</span>
                      {t.visualIdentity}
                   </h3>
                   <span className="text-xs text-gray-500 bg-gray-100 dark:bg-[#1a2c22] px-2 py-1 rounded border border-gray-200 dark:border-[#28392f]">{t.required}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                   <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#0d1a12] flex flex-col items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-all cursor-pointer">
                       <span className="material-symbols-rounded text-3xl mb-1">add_a_photo</span>
                       <span className="text-xs font-medium text-center px-1">{t.uploadAvatar}</span>
                   </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t.coverLabel}</label>
                        <div className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#0d1a12] flex flex-col items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-all cursor-pointer">
                            <span className="material-symbols-rounded text-3xl mb-1">image</span>
                            <span className="text-xs font-medium">{t.uploadBanner}</span>
                        </div>
                    </div>
                </div>
             </section>

             <section className="bg-white dark:bg-surface-dark/60 backdrop-blur-md border border-gray-200 dark:border-[#28392f] p-6 rounded-xl space-y-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-rounded text-primary">fingerprint</span>
                      {t.coreDetails}
                   </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.agentName}</label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-50 dark:bg-[#0d1a12] border border-gray-300 dark:border-[#28392f] rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder={t.agentNamePlaceholder}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.category}</label>
                        <select 
                            className="w-full bg-gray-50 dark:bg-[#0d1a12] border border-gray-300 dark:border-[#28392f] rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="DeFi Trading">{t.categories.defi}</option>
                            <option value="Content Generation">{t.categories.content}</option>
                            <option value="Research Assistant">{t.categories.research}</option>
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.visibility}</label>
                        <div className="flex gap-2 bg-gray-50 dark:bg-[#0d1a12] p-1 rounded-lg border border-gray-300 dark:border-[#28392f]">
                           <button className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${formData.visibility === 'Public' ? 'bg-gray-200 dark:bg-[#28392f] text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setFormData({...formData, visibility: 'Public'})}>{t.public}</button>
                           <button className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${formData.visibility === 'Private' ? 'bg-gray-200 dark:bg-[#28392f] text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setFormData({...formData, visibility: 'Private'})}>{t.private}</button>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.bio}</label>
                        <textarea 
                            rows={6}
                            className="w-full bg-gray-50 dark:bg-[#0d1a12] border border-gray-300 dark:border-[#28392f] rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-y text-sm leading-relaxed"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder={t.descPlaceholder}
                        />
                         <div className="flex justify-between mt-2">
                            <p className="text-xs text-primary/70 flex items-center gap-1">
                                <span className="material-symbols-rounded text-[14px]">auto_awesome</span>
                                {t.suggestion}
                            </p>
                            <span className="text-xs text-gray-600">0/500 {t.words}</span>
                        </div>
                    </div>
                </div>
             </section>
             
             <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-[#28392f]">
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium px-6 py-3 rounded-lg border border-transparent hover:border-gray-300 dark:hover:border-gray-700 transition-all flex items-center gap-2">
                    <span className="material-symbols-rounded">save</span>
                    {t.saveDraft}
                </button>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500 hidden sm:inline-block">{t.estFee} <span className="text-gray-900 dark:text-white font-mono">0.002 BNB</span></span>
                    <button className="bg-primary hover:bg-[#0bc957] text-[#111814] font-bold px-8 py-3 rounded-lg shadow-[0_4px_15px_rgba(13,242,105,0.2)] dark:shadow-[0_0_20px_rgba(13,242,105,0.2)] hover:shadow-[0_0_25px_rgba(13,242,105,0.4)] transition-all flex items-center gap-2">
                        {t.next}
                        <span className="material-symbols-rounded">arrow_forward</span>
                    </button>
                </div>
             </div>
          </div>

          {/* Preview Side */}
          <div className="lg:col-span-5 xl:col-span-4 relative">
             <div className="sticky top-24">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      {t.preview}
                   </h3>
                   <span className="text-xs text-gray-500 font-mono">NFT #{t.pending}</span>
                </div>
                
                <div className="relative group perspective-1000">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-white dark:bg-[#1a2c22] rounded-2xl overflow-hidden border border-gray-200 dark:border-[#28392f] shadow-2xl flex flex-col h-full">
                        <div className="h-64 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#1a2c22] to-transparent"></div>
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                                <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    <span className="text-[10px] text-white font-bold tracking-wider">{t.level} 1</span>
                                </div>
                                <div className="bg-black/50 backdrop-blur-sm p-1.5 rounded-full border border-white/10 text-white">
                                    <span className="material-symbols-rounded text-[18px] block">favorite</span>
                                </div>
                            </div>
                            <div className="absolute -bottom-6 left-6">
                                <div className="h-20 w-20 rounded-xl bg-slate-300 dark:bg-slate-900 border-4 border-white dark:border-[#1a2c22] overflow-hidden flex items-center justify-center">
                                    <span className="material-symbols-rounded text-4xl text-gray-500 dark:text-gray-600">smart_toy</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 pt-10 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{formData.name || 'Agent Name'}</h2>
                                    <p className="text-primary text-sm font-medium">@{formData.name.toLowerCase().replace(/\s+/g, '_')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{t.type}</p>
                                    <p className="text-xs text-gray-900 dark:text-white font-bold bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded mt-1">{formData.category}</p>
                                </div>
                            </div>
                            <div className="mt-4 space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                    {formData.description || 'Agent description goes here...'}
                                </p>
                                <div className="grid grid-cols-3 gap-2 py-4 border-y border-gray-200 dark:border-[#28392f]">
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-500 uppercase">{t.txs}</p>
                                        <p className="text-gray-900 dark:text-white font-bold font-mono">0</p>
                                    </div>
                                    <div className="text-center border-l border-gray-200 dark:border-[#28392f]">
                                        <p className="text-[10px] text-gray-500 uppercase">{t.winRate}</p>
                                        <p className="text-gray-900 dark:text-white font-bold font-mono">--%</p>
                                    </div>
                                    <div className="text-center border-l border-gray-200 dark:border-[#28392f]">
                                        <p className="text-[10px] text-gray-500 uppercase">{t.earned}</p>
                                        <p className="text-gray-900 dark:text-white font-bold font-mono">0 BNB</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map(tag => (
                                         <span key={tag} className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-[#0d1a12] border border-gray-200 dark:border-[#28392f] rounded text-gray-600 dark:text-gray-400">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};