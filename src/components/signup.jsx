import React, { useState } from 'react';
import Titan from '../assets/titan-logo.png';
import './login.css';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      setIsLoading(false);
      return;
    }
    
    // Simulate signup process
    setTimeout(() => {
      setIsLoading(false);
      console.log('Signup attempted with:', formData);
      alert('Account created successfully! Please login.');
      navigate('/login');
    }, 2000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleInputFocus = (e) => {
    e.target.parentElement.style.transform = 'scale(1.02)';
  };

  const handleInputBlur = (e) => {
    e.target.parentElement.style.transform = 'scale(1)';
  };

  return (
    <div style={{
        marginTop: '-120px',
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        padding: "20px"
    }}>
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
      {/* Signup Section */}
      <div className="login-section">
        <div className="login-header">
          <h2 className="login-title">Create Account</h2>
          <p className="login-subtitle">Please fill in your details to sign up</p>
        </div>

        {/* Signup Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                className="form-input"
                placeholder=" "
              />
              <label htmlFor="firstName" className="form-label">First Name</label>
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                className="form-input"
                placeholder=" "
              />
              <label htmlFor="lastName" className="form-label">Last Name</label>
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                className="form-input"
                placeholder=" "
              />
              <label htmlFor="email" className="form-label">Email Address</label>
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                className="form-input"
                placeholder=" "
              />
              <label htmlFor="password" className="form-label">Password</label>
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                className="form-input"
                placeholder=" "
              />
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
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
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <div className="login-footer">
            <p>
              Already have an account?{' '}
              <span
                onClick={() => navigate('/login')}
                className="signup-link"
              >
                Sign in here
              </span>
            </p>
          </div>
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

export default Signup;