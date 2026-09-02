import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider, RequireAuth, RequireRole } from '.';
const viewer = { id: 'v', email: 'viewer@example.com', name: 'Viewer', roles: ['viewer'] as const };
describe('authentication guards', () => {
  it('redirects anonymous users to login', () => {
    render(
      <MemoryRouter initialEntries={['/products']}>
        <AuthProvider bootstrap={null}>
          <Routes>
            <Route
              path="/products"
              element={
                <RequireAuth>
                  <p>secret</p>
                </RequireAuth>
              }
            />
            <Route path="/login" element={<p>login page</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('login page')).toBeInTheDocument();
  });
  it('allows a matching role', () => {
    render(
      <MemoryRouter>
        <AuthProvider bootstrap={{ ...viewer, roles: [...viewer.roles] }}>
          <RequireRole roles={['viewer']}>
            <p>details</p>
          </RequireRole>
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('details')).toBeInTheDocument();
  });
  it('redirects a viewer from an admin action', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider bootstrap={{ ...viewer, roles: [...viewer.roles] }}>
          <Routes>
            <Route
              path="/admin"
              element={
                <RequireRole roles={['admin']}>
                  <p>admin</p>
                </RequireRole>
              }
            />
            <Route path="/unauthorized" element={<p>unauthorized</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('unauthorized')).toBeInTheDocument();
  });
});
