import React, { useState } from 'react';
import Titan from '../assets/titan-logo.png';
import './login.css';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('Login successful:', userCredential.user.uid);
      
      // Extract username from email (part before @) or use displayName if available
      const username = userCredential.user.displayName || 
                     userCredential.user.email.split('@')[0] || 
                     'User';
      
      // Store user info in sessionStorage for persistence across page refreshes
      sessionStorage.setItem('username', username);
      sessionStorage.setItem('userEmail', userCredential.user.email);
      sessionStorage.setItem('userId', userCredential.user.uid);
      
      console.log('Navigating to dashboard with username:', username);
      
      // Navigate to dashboard with state AND store in sessionStorage for backup
      navigate('/dashboard', { 
        state: { 
          username: username,
          email: userCredential.user.email,
          userId: userCredential.user.uid
        } 
      });
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address');
          break;
        case 'auth/invalid-credential':
          setError('Invalid email or password');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetEmailSent(true);
      setError('');
      alert('Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address');
          break;
        default:
          setError('Failed to send reset email. Please try again.');
      }
    }
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
    if (resetEmailSent) setResetEmailSent(false);
  };

  return (
    <div className="login-container">
      {/* Company Logo at Top */}
      <div className="company-logo">
        <img src={Titan} alt="Titan" className="titan-logo-img" />
        
        <h1 className="company-name">Titan</h1>
      </div>

      {/* Login Section */}
      <div className="login-section">
        <div className="login-header">
          <h2 className="login-title">Welcome Back!</h2>
          <p className="login-subtitle">Please sign in to your account</p>
        </div>

        {/* Success Message */}
        {resetEmailSent && (
          <div style={{
            backgroundColor: '#d1fae5',
            color: '#065f46',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center',
            border: '1px solid #a7f3d0'
          }}>
            Password reset email sent! Check your inbox.
          </div>
        )}

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
                type="email"
                id="email"
                value={email}
                onChange={handleInputChange(setEmail)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                className="form-input"
                placeholder=" "
                autoComplete="email"
              />
              <label htmlFor="email" className="form-label">Email Address</label>
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                value={password}
                onChange={handleInputChange(setPassword)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                className="form-input"
                placeholder=" "
                autoComplete="current-password"
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