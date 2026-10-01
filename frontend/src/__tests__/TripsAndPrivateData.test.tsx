import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TripsPage from '../app/trips/page';
import TripDetailPage from '../app/trips/[id]/page';
import { api } from '../lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockUseAuth = jest.fn();
jest.mock('../lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useParams: () => ({ id: 'trip-123' }),
}));

jest.mock('../lib/api', () => ({
  api: {
    get: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

describe('Trips & Private Data Security', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReset();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it('1. TripsPage displays sign-in prompt when unauthenticated without accessing private trips', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TripsPage />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Sign In to View Your Trips')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/login');
    expect(api.get).not.toHaveBeenCalled();
  });

  it('2. TripDetailPage displays sign-in prompt when unauthenticated without accessing private trip', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TripDetailPage />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Sign In to View This Itinerary')).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalledWith('/api/v1/trips/trip-123');
  });

  it('3. Authenticated user can view saved trips', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'traveler@example.com', name: 'Alex' },
      isLoading: false,
    });

    (api.get as jest.Mock).mockResolvedValueOnce({
      items: [
        {
          _id: 'trip-123',
          destination: 'Kyoto',
          startDate: '2026-10-15',
          endDate: '2026-10-20',
          numberOfDays: 5,
          budget: 1500,
          currency: 'USD',
          status: 'planning',
          travelers: 1,
        },
      ],
      total: 1,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TripsPage />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Kyoto')).toBeInTheDocument();
      expect(screen.getByText('View Itinerary')).toBeInTheDocument();
    });
  });
});
