import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
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

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('AuthFlow Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockedNavigate.mockClear();
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

    render(
      <Router>
        <AuthFlow />
      </Router>
    );
    
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
    
    // Check that navigation occurred
    expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
  });

  // Update all other tests to wrap AuthFlow with Router
  it('handles login failure with error message', async () => {
    const user = userEvent.setup();
    
    // Mock failed login response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Invalid credentials'
      })
    });

    render(
      <Router>
        <AuthFlow />
      </Router>
    );
    
    // ... rest of the test remains the same
  });

  // Update all other test cases similarly
  it('switches between login and register modes', async () => {
    const user = userEvent.setup();
    render(
      <Router>
        <AuthFlow />
      </Router>
    );
    // ... rest of the test
  });

  // Continue updating all test cases to wrap AuthFlow with Router
});