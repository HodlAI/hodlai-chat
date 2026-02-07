// src/components/Pricing.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export const Pricing: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section id="pricing" className="py-20 bg-slate-950 relative overflow-hidden">
             <div className="absolute inset-0 bg-brand-900/5 radial-gradient opacity-20"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center mb-16">
                     <span className="px-3 py-1 bg-amber-950/30 border border-amber-500/20 text-amber-500 rounded-full text-xs font-semibold">
                        {t('price_badge')}
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mt-4 mb-3">
                        {t('price_title')}
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        {t('price_desc')}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-violet-950/20 to-slate-900/50 border border-violet-500/20 rounded-3xl p-8 max-w-4xl mx-auto backdrop-blur-sm">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                             <h3 className="text-xl font-bold text-violet-400 mb-2">{t('price_dynamic_title')}</h3>
                             <p className="text-sm text-slate-400 mb-6">{t('price_dynamic_sub')}</p>
                             
                             <div className="space-y-3">
                                <PriceRow tier="≤ $0.001" ratio="100%" example="$1.00" active />
                                <PriceRow tier="$0.002" ratio="96%" example="$0.96" />
                                <PriceRow tier="$0.005" ratio="82%" example="$0.82" />
                                <PriceRow tier="≥ $0.020" ratio="30%" example="$0.30" />
                             </div>
                        </div>
                        
                        <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800">
                            <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2">
                                <span>💎</span> {t('price_diamond_title')}
                            </h4>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li className="flex gap-3">
                                    <span className="text-amber-500 font-bold">1.</span>
                                    {t('price_diamond_1')}
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-amber-500 font-bold">2.</span>
                                    {t('price_diamond_2')}
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-amber-500 font-bold">3.</span>
                                    {t('price_diamond_3')}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-12">
                     <a href="https://pancakeswap.finance/swap?chain=bsc&outputCurrency=0x987e6269c6b7ea6898221882f11ea16f87b97777" target="_blank" className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-brand-600/20 flex items-center gap-2">
                        <span>🥞</span> Buy on PancakeSwap
                     </a>
                </div>
            </div>
        </section>
    );
};

const PriceRow = ({ tier, ratio, example, active }: { tier: string, ratio: string, example: string, active?: boolean }) => (
    <div className={`grid grid-cols-3 p-3 rounded-lg text-sm ${active ? 'bg-violet-500/10 border border-violet-500/30' : 'bg-white/5 border border-transparent'}`}>
        <span className={active ? 'text-violet-300 font-medium' : 'text-slate-500'}>{tier}</span>
        <span className={`text-center font-bold ${active ? 'text-white' : 'text-slate-400'}`}>{ratio}</span>
        <span className={`text-right ${active ? 'text-emerald-400' : 'text-slate-500'}`}>{example}</span>
    </div>
);
