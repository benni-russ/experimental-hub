import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App.js';
import '@fontsource-variable/inter';
import './design/tokens.css';
import './design/base.css';
import './design/components.css';
import { applyMode, storedMode } from './theme.js';

applyMode(storedMode());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* Letzte Stufe der BASE_PATH-Kette: Ohne basename zeigen alle internen
          Verweise auf / statt auf /hub/. */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
