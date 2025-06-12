import React, { useState } from 'react';
import Titan from '../assets/titan-logo.png';
import './login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!emailOrUsername.trim() || !password.trim()) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/users/login', {
        emailOrUsername: emailOrUsername.trim(),
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('Login successful:', response.data.user);

        const user = response.data.user;

        // Store user info in sessionStorage
        sessionStorage.setItem('username', user.username);
        sessionStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('userId', user.id);
        sessionStorage.setItem('name', user.name);
        sessionStorage.setItem('role', user.role);

        // Navigate to dashboard
        navigate('/dashboard', {
          state: {
            username: user.username,
            email: user.email,
            userId: user.id,
            name: user.name,
            role: user.role
          }
        });
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }

    } catch (error) {
      console.error('Login error:', error);

      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          setError('Invalid email/username or password');
        } else if (error.response.data?.message) {
          setError(error.response.data.message);
        } else {
          setError('Login failed. Please try again.');
        }
      } else if (error.request) {
        // Network error
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // For now, just show an alert. You can implement password reset later
    if (!emailOrUsername.trim()) {
      setError('Please enter your email address first');
      return;
    }
    
    // You can implement password reset functionality later
    alert('Password reset functionality will be implemented soon. Please contact support for now.');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputFocus = (e) => {
    e.target.parentElement.style.transform = 'scale(1.02)';
  };

  const handleInputBlur = (e) => {
    e.target.parentElement.style.transform = 'scale(1)';
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className="login-container">
      {/* Company Logo at Top */}
      <div className="company-logo">
        <img src={Titan} alt="Titan" className="titan-logo-img" />
      </div>

      {/* Login Section */}
      <div className="login-section">
        <div className="login-header">
          <h2 className="login-title">Welcome!!!</h2>
          <p className="login-subtitle">Please sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="text"
                id="emailOrUsername"
                value={emailOrUsername}
                onChange={handleInputChange(setEmailOrUsername)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                className="form-input"
                placeholder=" "
                autoComplete="username"
              />
              <label htmlFor="emailOrUsername" className="form-label">Email or Username</label>
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={handleInputChange(setPassword)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                className="form-input password-input"
                placeholder=" "
                autoComplete="current-password"
              />
              <label htmlFor="password" className="form-label">Password</label>
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  // Eye slash icon (hide password)
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                    <line x1="2" y1="2" x2="22" y2="22"></line>
                  </svg>
                ) : (
                  // Eye icon (show password)
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              'Sign In'
            )}
          </button>

          <button
            type="button"
            className="forgot-password-button"
            onClick={handleForgotPassword}
            disabled={isLoading}
          >
            Forgot your password?
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <span
              onClick={() => navigate('/signup')}
              className="signup-link"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate('/signup');
                }
              }}
            >
              Sign up here
            </span>
          </p>
        </div>
      </div>

      {/* Background Animation */}
      <div className="background-animation">
        <div className="modern-shape"></div>
        <div className="modern-shape"></div>
        <div className="modern-shape"></div>
        <div className="modern-shape"></div>
        <div className="modern-shape"></div>
        <div className="modern-shape"></div>
      </div>
    </div>
  );
};

export default LoginPage;