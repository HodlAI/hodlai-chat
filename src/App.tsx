import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Chat } from './pages/Chat';
import TestPage from './pages/Test';
import { useStore } from './store';

const App: React.FC = () => {
  const { theme, checkConfiguration } = useStore();

  // 初始化检查配置状态并处理 URL 参数
  useEffect(() => {
    // 兼容标准 search 和 hash 中的 search
    const hash = window.location.hash;
    const searchFromHash = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(window.location.search || searchFromHash);
    
    const apiKey = params.get('api_key') || params.get('apikey');
    const baseUrl = params.get('base_url') || params.get('baseurl');

    let hasChanged = false;

    if (apiKey) {
      // 确保 API Key 有 sk- 前缀
      const normalizedKey = apiKey.startsWith('sk-') ? apiKey : `sk-${apiKey}`;
      localStorage.setItem('bsc_ai_hub_custom_key', normalizedKey);
      hasChanged = true;
    }
    if (baseUrl) {
      localStorage.setItem('bsc_ai_hub_custom_base', decodeURIComponent(baseUrl));
      hasChanged = true;
    }

    // 如果有参数，清理 URL 以保护隐私
    if (hasChanged) {
      const url = new URL(window.location.href);
      const searchParams = new URLSearchParams(url.search);
      searchParams.delete('api_key');
      searchParams.delete('apikey');
      searchParams.delete('base_url');
      searchParams.delete('baseurl');

      let newUrl = url.origin + url.pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');
      
      if (url.hash.includes('?')) {
        newUrl += url.hash.split('?')[0];
      } else {
        newUrl += url.hash;
      }

      window.history.replaceState({}, '', newUrl);
    }

    checkConfiguration();
  }, [checkConfiguration]);

  // 处理主题切换
  useEffect(() => {
    const applyTheme = () => {
      const isDark = 
        theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
        document.body.classList.add('dark'); 
        // Use CSS variable instead of hardcoded hex
        document.body.style.backgroundColor = 'var(--color-background-dark)'; 
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
        document.body.classList.remove('dark');
        document.body.style.backgroundColor = '#ffffff'; 
      }
    };

    applyTheme();

    // Listen for system changes if system is selected
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          {/* Debugging Route to isolate Layout/Chat Issues */}
          <Route path="/test" element={<TestPage />} />
          <Route path="/" element={<Chat />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;