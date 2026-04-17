import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { ActionFeedbackProvider } from './components/feedback/ActionFeedbackProvider';
import { AuthProvider } from './features/auth/AuthProvider';
import { IAProvider } from './features/ia/IAProvider';
import { OnboardingProvider } from './features/onboarding/OnboardingProvider';
import { PwaProvider } from './features/pwa/PwaProvider';
import './styles/globals.css';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PwaProvider>
          <OnboardingProvider>
            <IAProvider>
              <ActionFeedbackProvider>
                <App />
              </ActionFeedbackProvider>
            </IAProvider>
          </OnboardingProvider>
        </PwaProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
