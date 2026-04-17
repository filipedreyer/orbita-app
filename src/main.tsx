import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { AuthProvider } from './features/auth/AuthProvider';
import { IAProvider } from './features/ia/IAProvider';
import './styles/globals.css';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <IAProvider>
          <App />
        </IAProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
