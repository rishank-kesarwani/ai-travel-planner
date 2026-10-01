import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../app/login/page';
import RegisterPage from '../app/register/page';
import ForgotPasswordPage from '../app/forgot-password/page';
import ResetPasswordPage from '../app/reset-password/page';
import { api } from '../lib/api';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams('token=reset-12345'),
}));

const mockLogin = jest.fn();
const mockRegister = jest.fn();

jest.mock('../lib/auth-context', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    user: null,
    isLoading: false,
  }),
}));

jest.mock('../lib/api', () => ({
  api: {
    post: jest.fn(),
  },
}));

describe('Authentication Pages & Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. LoginPage allows submitting valid login form', async () => {
    mockLogin.mockResolvedValueOnce({ id: 'u1' });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('traveler@example.com'), {
      target: { value: 'traveler@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('traveler@example.com', 'password123');
    });
  });

  it('2. RegisterPage allows submitting new registration form', async () => {
    mockRegister.mockResolvedValueOnce({ id: 'u2' });

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText('Rishank K'), {
      target: { value: 'Alex Rivera' },
    });
    fireEvent.change(screen.getByPlaceholderText('traveler@example.com'), {
      target: { value: 'alex@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'Alex Rivera',
        'alex@example.com',
        'password123',
        expect.any(Object),
      );
    });
  });

  it('3. ForgotPasswordPage sends password reset request', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({ success: true });

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('traveler@example.com'), {
      target: { value: 'traveler@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/v1/auth/forgot-password', {
        email: 'traveler@example.com',
      });
    });
  });

  it('4. ResetPasswordPage allows resetting password with token', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({ success: true });

    render(<ResetPasswordPage />);

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'NewPassword123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'NewPassword123!' } });

    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/v1/auth/reset-password', {
        token: 'reset-12345',
        newPassword: 'NewPassword123!',
      });
    });
  });
});
