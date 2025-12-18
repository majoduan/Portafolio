import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppContextProvider } from './contexts/AppContext'
import { registerServiceWorker } from './utils/registerSW'
import { initTelemetry } from './utils/telemetry'
import ErrorBoundary from './components/ErrorBoundary'

// Registrar Service Worker para cache estratégico
registerServiceWorker();

// Inicializar telemetría (Web Vitals, errores, performance)
initTelemetry();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </ErrorBoundary>
  </StrictMode>,
)
