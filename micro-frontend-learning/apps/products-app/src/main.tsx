import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@mfe/shared-auth';
import type { User } from '@mfe/shared-contracts';
import '@mfe/shared-ui/styles.css';
import Routes from './Routes';
const demo: User = {
  id: 'viewer',
  email: 'viewer@example.com',
  name: 'Demo Viewer',
  roles: ['viewer'],
};
const identityUrl = import.meta.env.VITE_IDENTITY_URL ?? 'http://localhost:4001';

async function startStandaloneHarness() {
  try {
    await fetch(`${identityUrl}/session/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: demo.email }),
    });
  } catch {
    console.warn('Mock identity provider is unavailable; API data may not load.');
  }

  createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <AuthProvider identityUrl={identityUrl} bootstrap={demo}>
        <main className="main">
          <p>Products standalone development harness</p>
          <Routes />
        </main>
      </AuthProvider>
    </BrowserRouter>,
  );
}

void startStandaloneHarness();
