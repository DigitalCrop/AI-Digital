import { Component, type ButtonHTMLAttributes, type ErrorInfo, type ReactNode } from 'react';
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="button" {...props} />;
}
export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="card">
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}
export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="spinner" role="status">
      <span aria-hidden="true">◌</span> {label}
    </div>
  );
}
export function Alert({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'error' | 'success';
  children: ReactNode;
}) {
  return (
    <div className={`alert alert-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
export function Header({ children }: { children: ReactNode }) {
  return <header className="header">{children}</header>;
}
export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'render-failure',
        message: error.message,
        componentStack: info.componentStack,
      }),
    );
  }
  render() {
    return this.state.failed
      ? (this.props.fallback ?? (
          <Alert tone="error">Something unexpected happened. Please retry.</Alert>
        ))
      : this.props.children;
  }
}
