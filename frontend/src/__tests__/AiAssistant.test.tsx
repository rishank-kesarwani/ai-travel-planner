import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AiAssistantPage from '../app/ai-assistant/page';
import * as authContext from '../lib/auth-context';

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: jest.fn() }),
}));

const mockUseAuth = jest.fn();

jest.mock('../lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('AiAssistantPage', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('renders Login Required state when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updatePreferences: jest.fn(),
    });

    render(<AiAssistantPage />);

    expect(screen.getByText('Login Required')).toBeInTheDocument();
    expect(
      screen.getByText(/Please log in to use the TravelPlanner AI Assistant/),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Log In/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /Get Started/i })).toHaveAttribute('href', '/register');
    expect(screen.queryByPlaceholderText(/Ask anything:/i)).not.toBeInTheDocument();
  });

  it('renders Chat Assistant interface when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'u123',
        email: 'traveler@example.com',
        name: 'Alex',
        role: 'user',
        createdAt: '2026-01-01',
      },
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updatePreferences: jest.fn(),
    });

    render(<AiAssistantPage />);

    expect(screen.getByText(/TravelPlanner AI Intelligence/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask anything:/i)).toBeInTheDocument();
    expect(screen.queryByText('Login Required')).not.toBeInTheDocument();
  });
});

