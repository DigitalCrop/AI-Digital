import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Alert, Button, Card } from '.';
describe('shared UI', () => {
  it('renders accessible components', () => {
    const click = vi.fn();
    render(
      <>
        <Alert tone="error">Problem</Alert>
        <Card title="A card">Content</Card>
        <Button onClick={click}>Continue</Button>
      </>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Problem');
    expect(screen.getByRole('heading', { name: 'A card' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(click).toHaveBeenCalledOnce();
  });
});
