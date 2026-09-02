import { lazy, Suspense, type ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { RequireAuth, useAuth } from '@mfe/shared-auth';
import { Alert, Button, ErrorBoundary, Header, Spinner } from '@mfe/shared-ui';
const Products = lazy(() => import('products/Routes'));
const Orders = lazy(() => import('orders/Routes'));
function Remote({ name, children }: { name: string; children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <Alert tone="error">
          {name} is currently unavailable. The rest of the site still works.
        </Alert>
      }
    >
      <Suspense fallback={<Spinner label={`Loading ${name}…`} />}>{children}</Suspense>
    </ErrorBoundary>
  );
}
function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/products';
  async function signIn(email: string) {
    await auth.login(email);
    navigate(from, { replace: true });
  }
  if (auth.isAuthenticated) return <Navigate to="/products" replace />;
  return (
    <section>
      <h1>Sign in</h1>
      <p>
        This local identity provider models an OIDC PKCE/BFF session without external credentials.
      </p>
      <div className="row">
        <Button onClick={() => void signIn('viewer@example.com')}>Sign in as viewer</Button>
        <Button onClick={() => void signIn('admin@example.com')}>Sign in as admin</Button>
      </div>
    </section>
  );
}
export function App() {
  const auth = useAuth();
  return (
    <>
      <Header>
        <strong>Federated Shop</strong>
        <nav className="nav" aria-label="Primary">
          <Link to="/products">Products</Link>
          <Link to="/orders">Orders</Link>
          {auth.user ? (
            <>
              <span data-testid="shell-user">{auth.user.email}</span>
              <Button onClick={() => void auth.logout()}>Log out</Button>
            </>
          ) : (
            <Link to="/login">Log in</Link>
          )}
        </nav>
      </Header>
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/unauthorized"
            element={
              <Alert tone="error">
                <h1>Unauthorized</h1>
                <p>Your account does not have permission for that action.</p>
              </Alert>
            }
          />
          <Route
            path="/products/*"
            element={
              <RequireAuth>
                <Remote name="Products">
                  <Products />
                </Remote>
              </RequireAuth>
            }
          />
          <Route
            path="/orders/*"
            element={
              <RequireAuth>
                <Remote name="Orders">
                  <Orders />
                </Remote>
              </RequireAuth>
            }
          />
          <Route path="*" element={<h1>Page not found</h1>} />
        </Routes>
      </main>
    </>
  );
}
