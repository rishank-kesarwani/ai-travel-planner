import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthModal } from '../components/AuthModal';

const mockLogin = jest.fn();
const mockRegister = jest.fn();

jest.mock('../lib/auth-context', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
  }),
}));

describe('AuthModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and description when open', () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={jest.fn()}
        title="Sign in to save your itinerary"
        description="Please sign in to continue."
      />,
    );

    expect(screen.getByText('Sign in to save your itinerary')).toBeInTheDocument();
    expect(screen.getByText('Please sign in to continue.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('traveler@example.com')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <AuthModal
        isOpen={false}
        onClose={jest.fn()}
        title="Sign in"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('allows toggling between Sign In and Create Account tabs', () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={jest.fn()}
      />,
    );

    expect(screen.queryByPlaceholderText('Alex Rivera')).not.toBeInTheDocument();

    const createAccountTab = screen.getByRole('tab', { name: /Create Account/i });
    fireEvent.click(createAccountTab);

    expect(screen.getByPlaceholderText('Alex Rivera')).toBeInTheDocument();
  });

  it('submits login and calls onSuccess with authenticated user', async () => {
    const mockSuccess = jest.fn();
    const mockClose = jest.fn();
    const fakeUser = { id: 'u1', email: 'test@example.com', name: 'Alex' };
    mockLogin.mockResolvedValueOnce(fakeUser);

    render(
      <AuthModal
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('traveler@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByTestId('auth-submit-btn'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123', false);
      expect(mockSuccess).toHaveBeenCalledWith(fakeUser);
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it('calls onClose when Cancel button is clicked', () => {
    const mockClose = jest.fn();
    render(
      <AuthModal
        isOpen={true}
        onClose={mockClose}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockClose).toHaveBeenCalled();
  });
});
