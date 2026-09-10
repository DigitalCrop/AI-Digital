import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '@mfe/shared-auth';
function Shell() {
  const auth = useAuth();
  return (
    <>
      <button onClick={() => void auth.login('viewer@example.com')}>Login viewer</button>
      <button onClick={() => void auth.logout()}>Logout anywhere</button>
      <output data-testid="shell">{auth.user?.email ?? 'anonymous'}</output>
    </>
  );
}
function ProductsRemote() {
  const auth = useAuth();
  return <output data-testid="products">{auth.user?.email ?? 'anonymous'}</output>;
}
function OrdersRemote() {
  const auth = useAuth();
  return (
    <>
      <output data-testid="orders">{auth.user?.email ?? 'anonymous'}</output>
      <button disabled={!auth.user?.roles.includes('admin')}>Create order</button>
    </>
  );
}
describe('shell-owned shared session', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('updates every micro frontend and denies viewer admin actions', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL, init?: RequestInit) => {
        if (String(input).endsWith('/session/login'))
          return new Response(
            JSON.stringify({
              user: { id: 'v', email: 'viewer@example.com', name: 'Viewer', roles: ['viewer'] },
            }),
            { status: 200 },
          );
        if (init?.method === 'POST') return new Response(null, { status: 204 });
        return new Response(null, { status: 401 });
      }),
    );
    render(
      <MemoryRouter>
        <AuthProvider bootstrap={null}>
          <Shell />
          <ProductsRemote />
          <OrdersRemote />
        </AuthProvider>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Login viewer' }));
    await waitFor(() =>
      expect(screen.getByTestId('products')).toHaveTextContent('viewer@example.com'),
    );
    expect(screen.getByTestId('orders')).toHaveTextContent('viewer@example.com');
    expect(screen.getByRole('button', { name: 'Create order' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Logout anywhere' }));
    await waitFor(() => expect(screen.getByTestId('shell')).toHaveTextContent('anonymous'));
    expect(screen.getByTestId('products')).toHaveTextContent('anonymous');
    expect(screen.getByTestId('orders')).toHaveTextContent('anonymous');
  });
});
