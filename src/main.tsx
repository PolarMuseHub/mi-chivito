import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from "@sentry/react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import App from './App.tsx';
import ResetPasswordPage from './components/ResetPasswordPage.tsx';
import PrivacyPolicy from './components/PrivacyPolicy.tsx';
import TermsAndConditions from './components/TermsAndConditions.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import { SubscriptionProvider } from './context/SubscriptionContext.tsx';
import './index.css';

// Initialize Sentry before everything else
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Opciones de privacidad importantes para una app de finanzas
      maskAllText: true, // Enmascara textos para no ver saldos reales en el "video"
      blockAllMedia: true, // No carga imágenes pesadas en la repetición
    }),
  ],
  // Tracing de rendimiento
  tracesSampleRate: 1.0,
  // Session Replay: 
  // 0.1 significa que graba el 10% de las sesiones normales
  replaysSessionSampleRate: 0.1, 
  // 1.0 significa que si ocurre un error, SIEMPRE guarda los últimos 60 segundos previos
  replaysOnErrorSampleRate: 1.0,
  // Enviar PII (IP, etc.) según tu configuración de privacidad
  sendDefaultPii: true,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
  release: import.meta.env.VITE_SENTRY_RELEASE,
});

// Initialize Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AppRouter = () => (
  <BrowserRouter>
    <SubscriptionProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </SubscriptionProvider>
  </BrowserRouter>
);

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New update available
                if (confirm('Nueva actualización disponible. ¿Deseas actualizar ahora?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);