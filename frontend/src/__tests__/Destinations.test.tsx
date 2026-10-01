import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DestinationsPage from '../app/destinations/page';
import { api } from '../lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockUseAuth = jest.fn();
jest.mock('../lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../lib/currency-context', () => ({
  useCurrency: () => ({
    currency: 'USD',
    formatPrice: (p: number) => `$${p}`,
    convertPrice: (p: number) => p,
  }),
}));

jest.mock('../lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('DestinationsPage - Public Browsing & Contextual Favorite Auth', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReset();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it('1. allows anonymous users to browse destinations catalog without logging in', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
    });

    (api.get as jest.Mock).mockResolvedValueOnce({
      items: [
        {
          _id: 'dest-1',
          name: 'Kyoto, Japan',
          slug: 'kyoto',
          category: 'cultural',
          averageDailyCost: 140,
          rating: 4.9,
          imageUrl: 'https://example.com/kyoto.jpg',
          country: 'Japan',
          description: 'Historic city of temples and shrines.',
        },
      ],
      total: 1,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DestinationsPage />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Explore World Destinations')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Kyoto, Japan')).toBeInTheDocument();
      expect(screen.getByText('Plan Trip')).toBeInTheDocument();
    });
  });

  it('2. prompts contextual login modal when anonymous user clicks to save favorite', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
    });

    (api.get as jest.Mock).mockResolvedValueOnce({
      items: [
        {
          _id: 'dest-1',
          name: 'Kyoto, Japan',
          slug: 'kyoto',
          category: 'cultural',
          averageDailyCost: 140,
          rating: 4.9,
          imageUrl: 'https://example.com/kyoto.jpg',
          country: 'Japan',
          description: 'Historic city of temples and shrines.',
        },
      ],
      total: 1,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DestinationsPage />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Kyoto, Japan')).toBeInTheDocument();
    });

    const favButton = screen.getByLabelText(/Save to favorites/i);
    fireEvent.click(favButton);

    expect(screen.getByText('Sign in to save favorite destinations')).toBeInTheDocument();
  });
});
