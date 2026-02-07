// src/App.tsx
import { BrowserRouter as Router } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';
import { config } from './config/wagmi';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { AuthPanel } from './components/api/AuthPanel';
import { Models } from './components/Models';
import { Pricing } from './components/Pricing';
import './i18n';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider mode="dark" customTheme={{
          "--ck-font-family": '"Inter", sans-serif',
          "--ck-border-radius": "16px",
          "--ck-body-background": "#0f172a",
          "--ck-body-color": "#e2e8f0",
          "--ck-primary-button-background": "#3b82f6",
          "--ck-primary-button-hover-background": "#2563eb",
          "--ck-secondary-button-background": "#1e293b",
        }}>
          <Router>
            <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500/30">
              <Navbar />
              <main>
                <Hero />
                <AuthPanel />
                <Features />
                <Models />
                <Pricing />
              </main>
              
              <footer className="py-8 border-t border-slate-900 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} HodlAI. All rights reserved.</p>
                <div className="flex justify-center gap-4 mt-4">
                  <a href="#" className="hover:text-brand-400 transition-colors">Twitter</a>
                  <a href="#" className="hover:text-brand-400 transition-colors">Telegram</a>
                  <a href="#" className="hover:text-brand-400 transition-colors">Docs</a>
                </div>
              </footer>
            </div>
          </Router>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
