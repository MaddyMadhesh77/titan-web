import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Titan from "../assets/titan-logo.png";
import "../styles/auth.css";
import { loginUser } from "../services/api";
import { useAuthContext } from "../context/AuthContext";
import ErrorAlert from "../components/ui/ErrorAlert";
import BackgroundAnimation from "../components/ui/BackgroundAnimation";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthContext();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const clearError = () => {
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!emailOrUsername.trim() || !password.trim()) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await loginUser({
        emailOrUsername: emailOrUsername.trim(),
        password,
      });

      if (response.data.success) {
        const user = response.data.user;
        setUser(user);
        navigate("/dashboard", {
          state: {
            username: user.username,
            email: user.email,
            userId: user.id,
            name: user.name,
            role: user.role,
          },
        });
      } else {
        setError(response.data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email/username or password");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.request) {
        setError("Unable to connect to server. Please check your connection.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!emailOrUsername.trim()) {
      setError("Please enter your email address first");
      return;
    }
    alert(
      "Password reset functionality will be implemented soon. Please contact support for now.",
    );
  };

  const handleInputFocus = (e) => {
    e.target.parentElement.style.transform = "scale(1.02)";
  };
  const handleInputBlur = (e) => {
    e.target.parentElement.style.transform = "scale(1)";
  };

  return (
    <div className="login-container">
      <div className="company-logo">
        <img src={Titan} alt="Titan" className="titan-logo-img" />
      </div>

      <div className="login-section">
        <div className="login-header">
          <h2 className="login-title">Welcome!!!</h2>
          <p className="login-subtitle">Please sign in to your account</p>
        </div>

        <ErrorAlert message={error} />

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="text"
                id="emailOrUsername"
                value={emailOrUsername}
                onChange={(e) => {
                  setEmailOrUsername(e.target.value);
                  clearError();
                }}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                className="form-input"
                placeholder=" "
                autoComplete="username"
              />
              <label htmlFor="emailOrUsername" className="form-label">
                Email Id
              </label>
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                }}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                className="form-input password-input"
                placeholder=" "
                autoComplete="current-password"
              />
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`login-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? <div className="spinner" /> : "Sign In"}
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

        <div className="login-footer">
          <p>
            Don&apos;t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="signup-link"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/signup");
              }}
            >
              Sign up here
            </span>
          </p>
        </div>
      </div>

      <BackgroundAnimation />
    </div>
  );
};

export default LoginPage;
