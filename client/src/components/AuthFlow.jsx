import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './AuthFlow.css';

const AuthFlow = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check for existing authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with server
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Invalid token');
      })
      .then(data => {
        setUser(data.user);
        navigate('/dashboard');
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
    }
  }, [navigate]);

  const handleLogin = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    }
  };

  // If user is authenticated, show dashboard
  if (user) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 data-testid="welcome-message">Welcome, {user.username}!</h1>
          <button 
            onClick={handleLogout}
            data-testid="logout-button"
            className="logout-btn"
          >
            Logout
          </button>
        </div>
        <div className="dashboard-content" data-testid="dashboard-content">
          <p>You are successfully logged in to the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-flow">
      <div className="auth-container">
        <div className="auth-header">
          <h1>{isLogin ? 'Sign In' : 'Sign Up'}</h1>
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="auth-switch-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              data-testid={isLogin ? "switch-to-register" : "switch-to-login"}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <div data-testid={isLogin ? "login-form" : "register-form"}>
          {isLogin ? (
            <LoginForm
              onSubmit={handleLogin}
              loading={loading}
              error={error}
            />
          ) : (
            <RegisterForm
              onSubmit={handleRegister}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;