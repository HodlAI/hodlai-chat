// src/components/Models.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export const Models: React.FC = () => {
    const { t } = useTranslation();

    const models = [
        { name: 'GPT-5.2', provider: 'OpenAI', tag: 'Flagship', color: 'emerald' },
        { name: 'Claude 4.5 Opus', provider: 'Anthropic', tag: 'Best Value', color: 'orange' },
        { name: 'Gemini 3 Pro', provider: 'Google', tag: 'Next Gen', color: 'blue' },
        { name: 'DeepSeek R1', provider: 'DeepSeek', tag: 'Top Logic', color: 'indigo' },
        { name: 'Grok 4', provider: 'xAI', tag: 'Uncensored', color: 'slate' },
        { name: 'Kimi K2', provider: 'Moonshot', tag: 'MoE Arch', color: 'sky' },
        { name: 'Qwen3 Max', provider: 'Alibaba', tag: 'Top Open', color: 'purple' },
        { name: 'Sora 2', provider: 'OpenAI', tag: 'Video', color: 'pink' },
    ];

    return (
        <section id="models" className="py-20 bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                    <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-400 rounded-full text-xs font-semibold">
                        {t('model_badge')}
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mt-4 mb-3">
                        {t('model_title')}
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {models.map((model, idx) => (
                         <motion.div 
                            key={model.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-brand-500/30 transition-all group"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`w-2 h-2 rounded-full bg-${model.color}-500`}></span>
                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{model.provider}</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-200 group-hover:text-brand-400 transition-colors">{model.name}</h3>
                            <span className={`text-[10px] uppercase font-bold text-${model.color}-400 mt-2 block`}>
                                {model.tag}
                            </span>
                        </motion.div>
                    ))}
                </div>
                
                <div className="mt-12 text-center">
                    <a 
                        href="https://api.hodlai.fun/pricing" 
                        target="_blank" 
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-sm font-medium transition-colors"
                    >
                        {t('model_view_all')} <span>→</span>
                    </a>
                </div>
            </div>
        </section>
    );
};
