import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { signupUser } from "../services/api";
import ErrorAlert from "../components/ui/ErrorAlert";
import BackgroundAnimation from "../components/ui/BackgroundAnimation";

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value || "" }));
    if (error) setError("");
  };
  const handleInputFocus = (e) => {
    e.target.parentElement.style.transform = "scale(1.02)";
  };
  const handleInputBlur = (e) => {
    e.target.parentElement.style.transform = "scale(1)";
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return false;
    }
    if (!formData.name.trim() || !formData.role.trim()) {
      setError("Please fill in all required fields");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await signupUser(formData);
      if (response.data.success) {
        navigate("/login");
      } else {
        setError(response.data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { id: "name", label: "Name", type: "text", autoComplete: "given-name" },
    { id: "role", label: "Role", type: "text", autoComplete: "role" },
    {
      id: "username",
      label: "Username",
      type: "text",
      autoComplete: "username",
    },
    {
      id: "email",
      label: "Email Address",
      type: "email",
      autoComplete: "email",
    },
    {
      id: "password",
      label: "Password",
      type: "password",
      autoComplete: "new-password",
      minLength: 6,
    },
    {
      id: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      autoComplete: "new-password",
      minLength: 6,
    },
  ];

  return (
    <div
      style={{
        marginTop: "-180px",
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        padding: "20px",
      }}
    >
      <div className="logo-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#457b9d" />
              <stop offset="100%" stopColor="#1d3557" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="24" r="20" fill="url(#gradient)" />
        </svg>
      </div>

      <div className="login-section">
        <div className="login-header">
          <h2 className="login-title">Create Account</h2>
          <p className="login-subtitle">
            Please fill in your details to sign up
          </p>
        </div>

        <ErrorAlert message={error} />

        <form className="login-form" onSubmit={handleSubmit}>
          {fields.map(({ id, label, type, autoComplete, minLength }) => (
            <div className="input-group" key={id}>
              <div className="input-wrapper">
                <input
                  type={type}
                  id={id}
                  name={id}
                  value={formData[id] || ""}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                  className="form-input"
                  placeholder=" "
                  autoComplete={autoComplete}
                  minLength={minLength}
                />
                <label htmlFor={id} className="form-label">
                  {label}
                </label>
              </div>
            </div>
          ))}

          <button
            type="submit"
            className={`login-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? <div className="spinner" /> : "Create Account"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="signup-link"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/login");
              }}
            >
              Sign in here
            </span>
          </p>
        </div>
      </div>

      <BackgroundAnimation />
    </div>
  );
};

export default SignupPage;
