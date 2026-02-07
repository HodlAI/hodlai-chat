// src/components/Hero.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export const Hero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="pt-32 pb-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 hero-pattern opacity-30"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex flex-wrap justify-center items-center gap-3 mb-8"
          >
            <span className="px-4 py-1.5 bg-slate-900/50 border border-brand-500/30 text-brand-400 rounded-full text-sm font-medium backdrop-blur-md flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse shadow-[0_0_10px_#60a5fa]"></span>
              {t('hero_badge_web3')}
            </span>
            <span className="px-3 py-1 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-medium flex items-center gap-1.5">
              <span>🛡️</span>
              {t('hero_badge_transparency')}
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-bold text-slate-100 mb-6 leading-tight tracking-tight"
          >
            <span>{t('hero_title_prefix')}</span>
            <br />
            <span className="gradient-text drop-shadow-[0_0_40px_rgba(139,92,246,0.3)]">{t('hero_title_suffix')}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-2xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            {t('hero_desc')}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
          >
            <StatCard value="200+" label={t('hero_models_tag')} delay={0.4} />
            <StatCard value="$10 ≈ 2K" label={t('hero_cost_ratio')} sublabel="Tokens" delay={0.5} />
            <StatCard value="24h" label={t('hero_diamond_tag')} sublabel="100% Release" delay={0.6} />
            <StatCard value="∞" label={t('hero_hold_tag')} delay={0.7} />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {['GPT-5.2', 'Claude 4.5', 'Gemini 3', 'DeepSeek R1', 'Sora 2', 'Midjourney V7'].map((model) => (
              <span key={model} className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg text-xs font-medium hover:border-brand-500/30 hover:text-brand-400 transition-colors cursor-default">
                {model}
              </span>
            ))}
          </motion.div>

        </div>
      </div>
    </header>
  );
};

const StatCard = ({ value, label, sublabel, delay }: { value: string, label: string, sublabel?: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay }}
    className="glass-panel p-4 rounded-2xl hover:border-brand-500/30 transition-colors group"
  >
    <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 group-hover:from-brand-400 group-hover:to-violet-400 transition-all">{value}</p>
    <p className="text-sm text-slate-500 mt-1 font-medium">{label}</p>
    {sublabel && <p className="text-[10px] text-slate-600">{sublabel}</p>}
  </motion.div>
);
