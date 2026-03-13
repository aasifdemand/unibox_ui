import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Routes from './routes.jsx';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/query-client.js';
import { QueryClientProvider } from '@tanstack/react-query';
import './i18n';
import { registerSW } from 'virtual:pwa-register'
registerSW({
  immediate: true
})
/**
 * Handle "Failed to load module script" errors that happen after deployments.
 * When a new version is pushed, old hashed assets disappear. 
 * If the user has an old version open, we catch the failed import and reload.
 */
window.addEventListener('error', (e) => {
  const isChunkLoadFailed = e.message?.toLowerCase().includes('failed to fetch dynamically imported module') ||
    e.message?.toLowerCase().includes('loading chunk') ||
    e.target?.tagName === 'SCRIPT';

  if (isChunkLoadFailed) {
    console.warn('⚡ Module/Chunk load failed. Likely a new deployment. Auto-reloading...', e);
    // Add a small delay to prevent infinite loop if it's a real network error
    setTimeout(() => window.location.reload(), 1000);
  }
}, true); // Use capture to catch script tag errors


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes />
        <Toaster
          position="top-right"
          reverseOrder={false}
          containerStyle={{
            zIndex: 999999,
            top: 40,
            right: 40,
          }}
          toastOptions={{
            duration: 5000,
            style: {
              borderRadius: '2rem',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              color: '#0f172a',
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '20px 28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              minWidth: '320px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
              style: {
                borderBottom: '4px solid #10b981',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              style: {
                borderBottom: '4px solid #ef4444',
              },
            },
          }}
        />


      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
