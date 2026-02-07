// src/components/layout/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useModal } from 'connectkit';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { address, isConnected } = useAccount();
  const { setOpen } = useModal();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className={clsx(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
      isScrolled ? "bg-slate-950/80 backdrop-blur-md border-slate-800" : "bg-transparent border-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://hodlai.fun/logo.jpg" 
              alt="HodlAI Logo" 
              className="w-10 h-10 rounded-xl shadow-lg shadow-brand-500/20"
            />
            <div>
              <h1 className="font-bold text-slate-100 text-lg tracking-tight">HodlAI</h1>
              <p className="text-[10px] text-slate-400 hidden sm:block font-medium tracking-wide">WEB3 AI INFRA</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <NavItem href="#api-panel" label="API Key" />
            <NavItem href="#features" label={t('nav_features')} />
            <a href="#transparency" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              {t('nav_transparency')}
            </a>
            <NavItem href="#models" label={t('nav_models')} />
            <NavItem href="#pricing" label={t('nav_pricing')} />
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleLanguage}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {i18n.language === 'zh' ? 'EN' : '中'}
            </button>
            
            {isConnected ? (
              <div className="flex items-center gap-2">
                 <button 
                  onClick={() => setOpen(true)}
                  className="hidden sm:block px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setOpen(true)}
                className="px-5 py-2 gradient-brand text-white rounded-xl hover:opacity-90 transition-all font-medium text-sm shadow-lg shadow-brand-500/20 flex items-center gap-2"
              >
                <span>🚀</span>
                {t('nav_connect')}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ href, label }: { href: string, label: string }) => (
  <a 
    href={href} 
    className="text-sm text-slate-400 hover:text-brand-400 transition-colors font-medium"
  >
    {label}
  </a>
);
