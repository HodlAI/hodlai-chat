import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store';
import { translations } from '../lib/translations';

const data = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
];

export const Dashboard: React.FC = () => {
  const { language } = useStore();
  const t = translations[language].dashboard;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border p-6 rounded-xl relative overflow-hidden group shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-rounded text-[64px] text-primary">monitoring</span>
                </div>
                <p className="text-gray-500 dark:text-text-muted text-sm font-medium mb-1">{t.stats.credits}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">1,204,500</h3>
                <span className="text-primary text-xs font-bold">+12%</span>
            </div>
             <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border p-6 rounded-xl relative overflow-hidden group shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-rounded text-[64px] text-blue-500">smart_toy</span>
                </div>
                <p className="text-gray-500 dark:text-text-muted text-sm font-medium mb-1">{t.stats.activeAgents}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">5</h3>
                <span className="text-blue-500 text-xs font-bold">{t.stats.live}</span>
            </div>
             <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border p-6 rounded-xl relative overflow-hidden group shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-rounded text-[64px] text-purple-500">chat</span>
                </div>
                <p className="text-gray-500 dark:text-text-muted text-sm font-medium mb-1">{t.stats.interactions}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">8,942</h3>
                <span className="text-purple-500 text-xs font-bold">+543</span>
            </div>
             <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border p-6 rounded-xl relative overflow-hidden group shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-rounded text-[64px] text-yellow-500">token</span>
                </div>
                <p className="text-gray-500 dark:text-text-muted text-sm font-medium mb-1">{t.stats.earned}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">3.45 BNB</h3>
                <span className="text-yellow-500 text-xs font-bold">~$2,100</span>
            </div>
        </div>

        {/* Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t.chartTitle}</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0df269" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#0df269" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#28392f]" vertical={false} />
                            <XAxis dataKey="name" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'var(--tw-prose-body)', borderColor: 'var(--tw-prose-invert-body)', borderRadius: '0.5rem' }}
                                itemStyle={{ color: '#0df269' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#0df269" fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Rankings/Leaderboard */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.rankingTitle}</h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                            <span className={`text-sm font-bold w-4 ${item === 1 ? 'text-yellow-500' : item === 2 ? 'text-gray-400' : item === 3 ? 'text-amber-700' : 'text-gray-600'}`}>{item}</span>
                            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-surface-border flex items-center justify-center">
                                <span className="material-symbols-rounded text-gray-400">smart_toy</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Alpha Trader {item}</p>
                                <p className="text-xs text-gray-500 dark:text-text-muted">DeFi Strategy</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-primary">{1000 - (item * 50)} {translations[language].create.txs}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};