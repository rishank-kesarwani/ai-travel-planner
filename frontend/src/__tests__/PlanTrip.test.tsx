import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlanTripPage from '../app/plan-trip/page';
import { api } from '../lib/api';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockUseAuth = jest.fn();
jest.mock('../lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../lib/currency-context', () => ({
  useCurrency: () => ({
    currency: 'USD',
    currencyInfo: {
      code: 'USD',
      symbol: '$',
      defaultBudget: 1500,
      minBudget: 300,
      maxBudget: 10000,
      step: 100,
      rateFromUsd: 1,
    },
    setCurrency: jest.fn(),
    supportedCurrencies: {
      USD: { code: 'USD', symbol: '$', flag: '🇺🇸', defaultBudget: 1500 },
    },
    formatPrice: (p: number) => `$${p}`,
    convertPrice: (p: number) => p,
  }),
}));

jest.mock('../lib/api', () => ({
  api: {
    post: jest.fn(),
  },
}));

describe('PlanTripPage - Optional Authentication Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReset();
  });

  it('1. allows anonymous user to open the planning wizard without login modal', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
    });

    render(<PlanTripPage />);

    expect(screen.getByText('Craft Your Perfect Itinerary')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. Mussoorie, Goa, Phuket, Kyoto/i)).toBeInTheDocument();
    expect(screen.queryByText('Sign in to continue')).not.toBeInTheDocument();
  });

  it('2. allows anonymous user to enter destination and generate itinerary publicly', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
    });

    const mockPlan = {
      destination: 'Kyoto',
      destinationSlug: 'kyoto',
      startDate: '2026-10-15',
      endDate: '2026-10-20',
      numberOfDays: 5,
      budget: 1500,
      currency: 'USD',
      currencySymbol: '$',
      travelers: 1,
      totalEstimatedCost: 1400,
      isWithinBudget: true,
      itinerary: [
        {
          day: 1,
          theme: 'Iconic Landmarks',
          hotel: { name: 'Kyoto Heritage Resort', estimatedCost: 150 },
          transport: { mode: 'Private Cab', estimatedCost: 30 },
          activities: [{ title: 'Fushimi Inari Shrine', time: '09:00 AM', estimatedCost: 0 }],
        },
      ],
      recommendedHotels: [],
      recommendedActivities: [],
    };

    (api.post as jest.Mock).mockResolvedValueOnce(mockPlan);

    render(<PlanTripPage />);

    const destInput = screen.getByPlaceholderText(/e\.g\. Mussoorie, Goa, Phuket, Kyoto/i);
    fireEvent.change(destInput, { target: { value: 'Kyoto' } });

    const generateBtn = screen.getByRole('button', { name: /Generate AI Itinerary/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/v1/ai/trips/generate',
        expect.objectContaining({
          destination: 'Kyoto',
          budget: 1500,
        }),
      );
    });

    // Verify generated plan is displayed
    await waitFor(() => {
      expect(screen.getByText(/Kyoto \(5 Days\)/i)).toBeInTheDocument();
      expect(screen.getByText('Save to My Trips')).toBeInTheDocument();
    });
  });

  it('3. prompts contextual login modal when anonymous user clicks Save to My Trips, and auto-saves after login', async () => {
    let currentUser: any = null;
    const mockLogin = jest.fn().mockImplementation(async () => {
      currentUser = { id: 'u123', email: 'traveler@example.com', name: 'Alex' };
      return currentUser;
    });

    mockUseAuth.mockImplementation(() => ({
      user: currentUser,
      isLoading: false,
      login: mockLogin,
      register: jest.fn(),
    }));

    const mockPlan = {
      destination: 'Santorini',
      destinationSlug: 'santorini',
      startDate: '2026-10-15',
      endDate: '2026-10-20',
      numberOfDays: 5,
      budget: 2000,
      currency: 'USD',
      currencySymbol: '$',
      travelers: 2,
      totalEstimatedCost: 1800,
      itinerary: [{ day: 1, theme: 'Caldera Views' }],
      recommendedHotels: [],
      recommendedActivities: [],
    };

    (api.post as jest.Mock)
      .mockResolvedValueOnce(mockPlan) // generate call
      .mockResolvedValueOnce({ _id: 'trip_santorini_999' }); // save call

    render(<PlanTripPage />);

    const destInput = screen.getByPlaceholderText(/e\.g\. Mussoorie, Goa, Phuket, Kyoto/i);
    fireEvent.change(destInput, { target: { value: 'Santorini' } });

    const generateBtn = screen.getByRole('button', { name: /Generate AI Itinerary/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Santorini \(5 Days\)/i)).toBeInTheDocument();
    });

    // Anonymous user clicks Save
    const saveBtn = screen.getByRole('button', { name: /Save to My Trips/i });
    fireEvent.click(saveBtn);

    // Contextual Auth Modal appears
    expect(screen.getByText('Sign in to save your itinerary')).toBeInTheDocument();

    // Fill in sign in modal
    const emailInput = screen.getByPlaceholderText('traveler@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(emailInput, { target: { value: 'traveler@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitAuthBtn = screen.getByTestId('auth-submit-btn');
    fireEvent.click(submitAuthBtn);

    // Auto-continues save operation after authentication
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/v1/trips',
        expect.objectContaining({
          destination: 'Santorini',
          budget: 2000,
        }),
      );
      expect(mockPush).toHaveBeenCalledWith('/trips/trip_santorini_999');
    });
  });

  it('4. directly saves trip when authenticated user clicks Save to My Trips', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u123', email: 'traveler@example.com', name: 'Alex' },
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
    });

    const mockPlan = {
      destination: 'Tokyo',
      destinationSlug: 'tokyo',
      startDate: '2026-10-15',
      endDate: '2026-10-20',
      numberOfDays: 5,
      budget: 3000,
      currency: 'USD',
      travelers: 1,
      itinerary: [{ day: 1, theme: 'City Lights' }],
    };

    (api.post as jest.Mock)
      .mockResolvedValueOnce(mockPlan) // generate
      .mockResolvedValueOnce({ _id: 'trip_tokyo_777' }); // save

    render(<PlanTripPage />);

    const destInput = screen.getByPlaceholderText(/e\.g\. Mussoorie, Goa, Phuket, Kyoto/i);
    fireEvent.change(destInput, { target: { value: 'Tokyo' } });

    const generateBtn = screen.getByRole('button', { name: /Generate AI Itinerary/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Tokyo \(5 Days\)/i)).toBeInTheDocument();
    });

    const saveBtn = screen.getByRole('button', { name: /Save to My Trips/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/v1/trips',
        expect.objectContaining({
          destination: 'Tokyo',
        }),
      );
      expect(mockPush).toHaveBeenCalledWith('/trips/trip_tokyo_777');
    });
  });
});
