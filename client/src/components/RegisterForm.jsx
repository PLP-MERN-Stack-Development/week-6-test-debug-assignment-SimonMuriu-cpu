import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import './LoginForm.css'; // Reuse the same styles

const RegisterForm = ({ onSubmit, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({});
    // Don't send confirmPassword to server
    const { confirmPassword, ...submitData } = formData;
    onSubmit(submitData);
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="username" className="form-label">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={`form-input ${validationErrors.username ? 'form-input-error' : ''}`}
          placeholder="Enter your username"
          disabled={loading}
        />
        {validationErrors.username && (
          <span className="form-error" data-testid="username-error">
            {validationErrors.username}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`form-input ${validationErrors.email ? 'form-input-error' : ''}`}
          placeholder="Enter your email"
          disabled={loading}
        />
        {validationErrors.email && (
          <span className="form-error" data-testid="email-error">
            {validationErrors.email}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`form-input ${validationErrors.password ? 'form-input-error' : ''}`}
          placeholder="Enter your password"
          disabled={loading}
        />
        {validationErrors.password && (
          <span className="form-error" data-testid="password-error">
            {validationErrors.password}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`form-input ${validationErrors.confirmPassword ? 'form-input-error' : ''}`}
          placeholder="Confirm your password"
          disabled={loading}
        />
        {validationErrors.confirmPassword && (
          <span className="form-error" data-testid="confirm-password-error">
            {validationErrors.confirmPassword}
          </span>
        )}
      </div>

      {error && (
        <div className="form-error-message" data-testid="error-message">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={loading}
        className="login-button"
        data-testid="register-button"
      >
        {loading ? 'Creating Account...' : 'Sign Up'}
      </Button>
    </form>
  );
};

RegisterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default RegisterForm;