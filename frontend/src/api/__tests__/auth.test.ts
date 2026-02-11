import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '../auth';

// Mock client.ts to avoid import issues and control values
vi.mock('../client', () => ({
    API_URL: 'http://localhost:8000/api',
    getHeaders: () => ({ 'Authorization': 'Bearer fake-token' }),
}));

import { API_URL } from '../client';

// Mock global fetch
global.fetch = vi.fn();

describe('Auth API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('login calls correct endpoint and returns data on success', async () => {
    const mockResponse = { access_token: 'fake-token' };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await authApi.login('testuser', 'password', false);

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/users/login`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ username: 'testuser', password: 'password', stay_logged_in: false }),
    }));
    expect(result).toEqual(mockResponse);
  });

  it('login throws error on failure', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
    });

    await expect(authApi.login('testuser', 'wrongpass', false)).rejects.toThrow('Login failed');
  });

  it('register calls correct endpoint', async () => {
    const mockData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password',
        firstName: 'New',
        lastName: 'User',
        phone: '1234567890',
        playTutorial: false,
        gender: 'M',
        avatar_config: {},
        country: 'US',
        termsAccepted: true
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, ...mockData }),
    });

    await authApi.register(mockData);

    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/users/register`, expect.objectContaining({
      method: 'POST',
    }));
  });

  it('checkEmail returns availability', async () => {
    (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ available: true }),
    });

    const result = await authApi.checkEmail('test@example.com');
    expect(result).toEqual({ available: true });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/users/check-email?email='), expect.any(Object));
  });
});
