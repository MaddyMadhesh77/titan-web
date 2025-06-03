import React, { useState } from 'react';
import Titan from '../assets/titan-logo.png';
import './login.css';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {

  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login attempted with:', { userName, password });
      navigate('/dashboard', { state: { userName } });
    }, 2000);
  };

  const handleForgotPassword = () => {
    alert('Forgot password functionality would be implemented here!');
    console.log('Forgot password clicked');
  };

  const handleInputFocus = (e) => {
    e.target.parentElement.style.transform = 'scale(1.02)';
  };

  const handleInputBlur = (e) => {
    e.target.parentElement.style.transform = 'scale(1)';
  };

  return (
    <div className="login-container">
      {/* Company Logo at Top */}
      <div className="company-logo">
        <img src={Titan} alt="Titan" className="titan-logo-img" />
        <div className="logo-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#457b9d" />
                <stop offset="100%" stopColor="#1d3557" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className="company-name">Titan</h1>
      </div>

      {/* Login Section */}
      <div className="login-section">
        <div className="login-header">
          <h2 className="login-title">Welcome!</h2>
          <p className="login-subtitle">Please sign in to your account</p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="userName"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                className="form-input"
                placeholder=" "
              />
              <label htmlFor="userName" className="form-label">User Name</label>
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                className="form-input"
                placeholder=" "
              />
              <label htmlFor="password" className="form-label">Password</label>
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