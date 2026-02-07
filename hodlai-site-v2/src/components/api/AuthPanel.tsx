// src/components/api/AuthPanel.tsx
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useModal } from 'connectkit';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import clsx from 'clsx';
import { RefreshCw, Copy, Eye, EyeOff, Terminal, Zap } from 'lucide-react';

export const AuthPanel: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { setOpen } = useModal();
  const { t } = useTranslation();
  const { 
    apiKey, 
    isLoading, 
    regenerateKey, 
    dailyQuota, 
    remainQuota, 
    balance,
    quotaInfo,
    refreshUserData
  } = useAuth();
  
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="api-panel" className="py-12 relative z-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div 
          className="glass-panel rounded-3xl overflow-hidden shadow-2xl shadow-brand-900/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="gradient-brand p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                  <span className="text-3xl">
                    {quotaInfo?.isDiamondHands ? '💎' : (isConnected ? '🔑' : '🔒')}
                  </span>
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-0.5">
                    {isConnected ? t('panel_status_connected') : t('panel_status_connect')}
                  </p>
                  <p className="font-mono text-xl font-bold text-white tracking-tight">
                    {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : '0x...'}
                  </p>
                </div>
              </div>
              
              {isConnected && (
                <button 
                  onClick={refreshUserData}
                  disabled={isLoading}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm border border-white/10"
                >
                  <RefreshCw className={clsx("w-5 h-5 text-white", isLoading && "animate-spin")} />
                </button>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 relative">
            {!isConnected && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-6 shadow-2xl">
                  <span className="text-4xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{t('panel_connect_title')}</h3>
                <p className="text-slate-400 mb-8 max-w-md">
                  {t('panel_connect_desc')}
                </p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button 
                    onClick={() => setOpen(true)}
                    className="w-full px-8 py-3 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5 fill-current" />
                    {t('panel_connect_btn')}
                  </button>
                  <p className="text-xs text-slate-500 text-center">
                    {t('panel_secure_tip') || "Secure Signature • No Gas Fee"}
                  </p>
                </div>
              </div>
            )}

            {/* API Key Section */}
            <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> API KEY
                </h3>
                <button 
                  onClick={regenerateKey}
                  disabled={isLoading}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  {t('panel_regen')}
                </button>
              </div>

              <div className="relative group">
                <div className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-4 font-mono text-sm text-slate-300 break-all pr-32 min-h-[56px] flex items-center">
                  {apiKey ? (showKey ? apiKey : `${apiKey.slice(0, 8)}••••••••••••••••••••••••`) : 'sk-........................'}
                </div>
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 rounded-lg border border-brand-500/20 transition-all text-xs font-medium"
                  >
                    {copied ? <span className="text-emerald-400">Copied!</span> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>
              </div>
              
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Base URL</span>
                <span className="text-slate-400">https://api.hodlai.fun/v1</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox 
                label={t('panel_quota_today')} 
                value={`$${dailyQuota?.toFixed(2) || '0.00'}`} 
                color="text-emerald-400" 
                bgColor="bg-emerald-950/20" 
                borderColor="border-emerald-500/20"
              />
              <StatBox 
                label={t('panel_quota_remain')} 
                value={`$${remainQuota?.toFixed(2) || '0.00'}`} 
                color="text-brand-400"
                bgColor="bg-brand-900/20" 
                borderColor="border-brand-500/20"
              />
              <StatBox 
                label={t('panel_hold_balance')} 
                value={Number(balance).toLocaleString()} 
                sub="HODLAI"
                color="text-violet-400"
                bgColor="bg-violet-950/20" 
                borderColor="border-violet-500/20"
              />
               <StatBox 
                label={t('panel_quota_ratio')}
                value={`${Math.round((quotaInfo?.releasePercent || 0))}%`}
                color="text-amber-400"
                bgColor="bg-amber-950/20" 
                borderColor="border-amber-500/20"
              />
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StatBox = ({ label, value, sub, color, bgColor, borderColor }: any) => (
  <div className={clsx("p-4 rounded-xl border flex flex-col items-center justify-center text-center", bgColor, borderColor)}>
    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">{label}</span>
    <span className={clsx("text-xl sm:text-2xl font-bold", color)}>
      {value}
      {sub && <span className="text-xs ml-1 text-slate-500 font-normal">{sub}</span>}
    </span>
  </div>
);
