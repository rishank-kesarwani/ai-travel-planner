import axios from 'axios';
import { api, refreshAccessToken } from '../lib/api';

jest.mock('axios', () => {
  const mockAxiosInstance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  };
  return {
    create: jest.fn(() => mockAxiosInstance),
    post: jest.fn(),
    isAxiosError: jest.fn(),
  };
});

describe('API Authorization & Refresh Interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('1. refreshAccessToken returns null when no refreshToken is in localStorage', async () => {
    const token = await refreshAccessToken();
    expect(token).toBeNull();
  });

  it('2. refreshAccessToken exchanges refreshToken for a new accessToken and stores it', async () => {
    localStorage.setItem('refreshToken', 'valid-refresh-token');

    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        data: {
          accessToken: 'new-fresh-access-token',
        },
      },
    });

    const token = await refreshAccessToken();
    expect(token).toBe('new-fresh-access-token');
    expect(localStorage.getItem('accessToken')).toBe('new-fresh-access-token');
  });

  it('3. refreshAccessToken cleans up localStorage on failure without throwing', async () => {
    localStorage.setItem('refreshToken', 'expired-refresh-token');
    localStorage.setItem('accessToken', 'expired-access-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Alex' }));

    (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Token expired'));

    const token = await refreshAccessToken();
    expect(token).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
