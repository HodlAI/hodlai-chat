// src/components/Features.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Banknote, 
  Wallet, 
  Sparkles, 
  Terminal, 
  Cpu, 
  Link 
} from 'lucide-react';

export const Features: React.FC = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: <Banknote className="w-6 h-6 text-amber-500" />,
            title: t('feat_tax_title', 'Transaction Tax'),
            desc: t('feat_tax_desc', '3% tax sustains the API pool.'),
            color: 'amber'
        },
        {
            icon: <Wallet className="w-6 h-6 text-emerald-500" />,
            title: t('feat_asset_title', 'Assets in Wallet'),
            desc: t('feat_asset_desc', 'No deposit required. Hold to access.'),
            color: 'emerald'
        },
        {
            icon: <Sparkles className="w-6 h-6 text-violet-500" />,
            title: t('feat_diamond_title', 'Diamond Hands'),
            desc: t('feat_diamond_desc', 'Hold longer for 100% quota.'),
            color: 'violet'
        },
        {
            icon: <Terminal className="w-6 h-6 text-sky-500" />,
            title: t('feat_sdk_title', 'Full Compatibility'),
            desc: t('feat_sdk_desc', 'OpenAI + Claude format supported.'),
            color: 'sky'
        },
        {
            icon: <Cpu className="w-6 h-6 text-rose-500" />,
            title: t('feat_models_title', '200+ Models'),
            desc: t('feat_models_desc', 'GPT-5, Gemini, DeepSeek access.'),
            color: 'rose'
        },
        {
            icon: <Link className="w-6 h-6 text-slate-500" />,
            title: t('feat_chain_title', 'On-chain Verify'),
            desc: t('feat_chain_desc', 'Holdings verified on-chain.'),
            color: 'slate'
        }
    ];

    return (
        <section id="features" className="py-20 bg-slate-950 relative">
             <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                     <span className="px-3 py-1 bg-brand-900/30 border border-brand-500/20 text-brand-400 rounded-full text-xs font-semibold">
                        {t('feat_badge', 'Core Advantages')}
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mt-4 mb-3">
                        {t('feat_title', 'Web2 & Web3 Fusion')}
                    </h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feat, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={`glass-panel p-6 rounded-2xl border border-slate-800 hover:border-${feat.color}-500/30 transition-all group`}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-${feat.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                {feat.icon}
                            </div>
                            <h3 className="text-lg font-bold text-slate-200 mb-2 group-hover:text-white transition-colors">
                                {feat.title}
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {feat.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
