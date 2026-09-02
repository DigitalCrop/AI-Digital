import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@mfe/shared-auth';
import '@mfe/shared-ui/styles.css';
import { App } from './App';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider identityUrl={import.meta.env.VITE_IDENTITY_URL}>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
