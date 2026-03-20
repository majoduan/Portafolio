'use client';

import ErrorBoundary from '../components/ErrorBoundary';
import { AppContextProvider } from '../contexts/AppContext';

export default function Providers({ children }) {
  return (
    <ErrorBoundary>
      <AppContextProvider>
        {children}
      </AppContextProvider>
    </ErrorBoundary>
  );
}
