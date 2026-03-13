import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import "../../styles/dashboard.css";

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: (
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    ),
  },
  {
    key: "upload",
    label: "Upload Reports",
    icon: (
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
    ),
  },
  {
    key: "reports",
    label: "View Reports",
    icon: (
      <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z " />
    ),
  },
  {
    key: "Broadcasting",
    label: "Broadcasting",
    icon: (
      <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,4C16.42,4 20,7.58 20,12C20,16.42 16.42,20 12,20C7.58,20 4,16.42 4,12C4,7.58 7.58,4 12,4M12,6C9.79,6 8,7.79 8,10C8,12.21 9.79,14 12,14C14.21,14 16,12.21 16,10C" />
    ),
  },
  {
    key: "Messages",
    label: "Messages",
    icon: <path d="M4 4h16v2H4zm0 6h16v2H4zm0 6h10v2H4z" />,
  },
];

// ReportHub shortcut nav items (navigate-based, not section-based)
const REPORTHUB_NAV = [
  { key: "explore", label: "🔍 Explore Projects", path: "/explore" },
  { key: "new",     label: "➕ New Project",      path: "/projects/new" },
];

export default function DashboardLayout({
  activeSection,
  onSectionChange,
  children,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    alert("Logged out!");
    navigate("/login");
  };

  const avatarUrl =
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format";

  return (
    <div className="dashboard-container">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-section">
            <h2 style={{ color: "#FFF", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>📚 ReportHub</h2>
          </div>
        </div>

        <div className="header-right">
          <div className="profile-section">
            <div
              className={`profile-avatar ${showProfileDropdown ? "active" : ""}`}
              onClick={() => setShowProfileDropdown((v) => !v)}
            >
              <div className="user-info">
                <span className="user-name">{user.name || user.username}</span>
                <span className="user-email">{user.email}</span>
              </div>
              <img src={avatarUrl} alt="Profile" />
              <svg
                className="dropdown-arrow"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </div>

            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-item">
                  <span style={{ fontSize: "0.8rem", color: "#a0aec0" }}>
                    {user.email}
                  </span>
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                  </svg>
                  Log Out
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main layout ──────────────────────────────────────── */}
      <div className="dashboard-main">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {NAV_ITEMS.map(({ key, label, icon }) => (
              <div
                key={key}
                className={`nav-item ${activeSection === key ? "active" : ""}`}
                onClick={() => onSectionChange(key)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  {icon}
                </svg>
                {label}
              </div>
            ))}
          </nav>

          {/* ReportHub shortcuts */}
          <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "8px" }}>
            <p style={{ fontSize: "0.68rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px", marginBottom: "6px" }}>ReportHub</p>
            {REPORTHUB_NAV.map(({ key, label, path }) => (
              <div
                key={key}
                className="nav-item"
                onClick={() => navigate(path)}
                style={{ fontSize: "0.82rem" }}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="user-info">
              <img src={avatarUrl} alt="User" className="user-avatar" />
              <div className="user-details">
                <span className="username">{user.name || user.username}</span>
                <span className="user-status">Online</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="content">{children}</main>
      </div>

      {/* ── Background blobs ─────────────────────────────────── */}
      <div className="background-animation">
        <div className="modern-shape" />
        <div className="modern-shape" />
        <div className="modern-shape" />
      </div>
    </div>
  );
}
