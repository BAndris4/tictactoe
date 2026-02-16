import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { authApi } from '../../api/auth';
// Mock authApi
vi.mock('../../api/auth', () => ({
  authApi: {
    login: vi.fn(),
    getMe: vi.fn(), 
  }
}));

// Mock client to avoid import errors (env vars etc)
vi.mock('../../api/client', () => ({
    API_URL: 'http://localhost:8000/api',
    getHeaders: () => ({}),
    getAuthToken: () => null,
}));

// Mock useNavigate
const { navigate } = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

describe('Login View', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (authApi.getMe as any).mockResolvedValue(null); // Default: not logged in
  });

  it('renders login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls login API and redirects on success', async () => {
    (authApi.login as any).mockResolvedValue({ access_token: 'fake' });
    (authApi.getMe as any).mockResolvedValue({ username: 'testuser', first_name: 'Test' });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith('testuser', 'password', true);
    });
    
    // Check for redirection (might need to wait for useAuth to update state)
    await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays error on login failure', async () => {
    (authApi.login as any).mockRejectedValue(new Error('Invalid credentials'));

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });
    
    expect(navigate).not.toHaveBeenCalled();
  });
});
