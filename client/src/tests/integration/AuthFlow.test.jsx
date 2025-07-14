import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AuthFlow from '../../components/AuthFlow';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('AuthFlow Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  it('completes successful login flow', async () => {
    const user = userEvent.setup();
    
    // Mock successful login response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Login successful',
        user: {
          _id: '123',
          username: 'testuser',
          email: 'test@example.com'
        },
        token: 'mock-jwt-token'
      })
    });

    render(<AuthFlow />);
    
    // Fill in login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);
    
    // Wait for API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
    });
    
    // Check that token is stored
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token');
    });
    
    // Check that user is redirected to dashboard
    await waitFor(() => {
      expect(screen.getByText(/welcome, testuser/i)).toBeInTheDocument();
    });
  });

  it('handles login failure with error message', async () => {
    const user = userEvent.setup();
    
    // Mock failed login response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Invalid credentials'
      })
    });

    render(<AuthFlow />);
    
    // Fill in login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(loginButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
    
    // Check that no token is stored
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it('switches between login and register modes', async () => {
    const user = userEvent.setup();
    render(<AuthFlow />);
    
    // Initially shows login form
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    
    // Click to switch to register
    const switchToRegister = screen.getByText(/don't have an account/i);
    await user.click(switchToRegister);
    
    // Now shows register form
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    
    // Switch back to login
    const switchToLogin = screen.getByText(/already have an account/i);
    await user.click(switchToLogin);
    
    // Back to login form
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('completes successful registration flow', async () => {
    const user = userEvent.setup();
    
    // Mock successful registration response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'User registered successfully',
        user: {
          _id: '123',
          username: 'newuser',
          email: 'new@example.com'
        },
        token: 'mock-jwt-token'
      })
    });

    render(<AuthFlow />);
    
    // Switch to register mode
    const switchToRegister = screen.getByText(/don't have an account/i);
    await user.click(switchToRegister);
    
    // Fill in registration form
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const registerButton = screen.getByRole('button', { name: /sign up/i });
    
    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'new@example.com');
    await user.type(passwordInput, 'Password123');
    await user.click(registerButton);
    
    // Wait for API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'newuser',
          email: 'new@example.com',
          password: 'Password123'
        })
      });
    });
    
    // Check that token is stored and user is logged in
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token');
      expect(screen.getByText(/welcome, newuser/i)).toBeInTheDocument();
    });
  });

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<AuthFlow />);
    
    // Fill in login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('persists authentication state on page reload', async () => {
    // Mock existing token in localStorage
    mockLocalStorage.getItem.mockReturnValue('existing-token');
    
    // Mock successful user info fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          _id: '123',
          username: 'existinguser',
          email: 'existing@example.com'
        }
      })
    });

    render(<AuthFlow />);
    
    // Should automatically fetch user info and show dashboard
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', {
        headers: {
          'Authorization': 'Bearer existing-token'
        }
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText(/welcome, existinguser/i)).toBeInTheDocument();
    });
  });

  it('handles logout flow', async () => {
    const user = userEvent.setup();
    
    // Start with authenticated state
    mockLocalStorage.getItem.mockReturnValue('existing-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          _id: '123',
          username: 'testuser',
          email: 'test@example.com'
        }
      })
    });

    render(<AuthFlow />);
    
    // Wait for authenticated state
    await waitFor(() => {
      expect(screen.getByText(/welcome, testuser/i)).toBeInTheDocument();
    });
    
    // Mock logout response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Logout successful' })
    });
    
    // Click logout button
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);
    
    // Check that token is removed and user is redirected to login
    await waitFor(() => {
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });
});