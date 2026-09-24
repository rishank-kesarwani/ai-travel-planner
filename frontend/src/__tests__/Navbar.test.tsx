import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Navbar } from '../components/Navbar';
import { AuthProvider } from '../lib/auth-context';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn() }),
}));

describe('Navbar Component', () => {
  it('renders the brand title and public links', () => {
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>,
    );

    expect(screen.getByText('NomadAI')).toBeInTheDocument();
    expect(screen.getByText('Destinations')).toBeInTheDocument();
    expect(screen.getByText('AI Planner')).toBeInTheDocument();
  });
});
