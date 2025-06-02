import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Mock user data - replace with actual user data from your auth context
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format'
  };

  const handleLogout = () => {
    // Add your logout logic here
    navigate('/login');
  };

  const handleInputFocus = (e) => {
    e.target.parentElement.style.transform = 'scale(1.02)';
  };

  const handleInputBlur = (e) => {
    e.target.parentElement.style.transform = 'scale(1)';
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const [applicationName, setapplicationName] = useState('');
  const [description, setDescription] = useState('');

  const renderContent = () => {
    switch (activeSection) {
      case 'upload':
        return (
          <div className="content-section">
            <h2>Upload Report</h2>
            <p style={{
              marginTop: '10px',
              marginBottom: '15px',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              color: '#FFF',
            }}>Application Name:</p>
            <div className='Application-name' style={{ marginBottom: '30px', position: 'relative' }}>
              <input
                type='text'
                id="applicationName"
                value={applicationName}
                onChange={(e) => setapplicationName(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                className="form-input"
                placeholder=" " // NOTE: single space is intentional
              />
              <label htmlFor="applicationName" className="form-label">Application Name</label>
            </div>
            <p style={{
              marginBottom: '15px',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              color: '#FFF',
            }}>Description:</p>
            <div className='Description-Name' style={{ marginBottom: '30px', position: 'relative' }}>
              <input
                type='text'
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                className="form-input"
                placeholder=" "
              />
              <label htmlFor="description" className="form-label">Description</label>
            </div>

            <p
              style={{
                marginBottom: '10px',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                color: '#FFF',
              }}
            >Doucument Upload:</p>
            <div className="upload-area">
              <div className="upload-box">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <p>Drag and drop your report here or click to browse</p>
                <button className="upload-btn">Choose File</button>
              </div>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="content-section">
            <h2>View Reports</h2>
            <div className="reports-grid">
              <div className="report-card">
                <h3>Monthly Report - May 2025</h3>
                <p>Uploaded on: May 15, 2025</p>
                <button className="view-btn">View Report</button>
              </div>
              <div className="report-card">
                <h3>Quarterly Analysis - Q1 2025</h3>
                <p>Uploaded on: April 10, 2025</p>
                <button className="view-btn">View Report</button>
              </div>
              <div className="report-card">
                <h3>Annual Summary - 2024</h3>
                <p>Uploaded on: March 5, 2025</p>
                <button className="view-btn">View Report</button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="content-section">
            <h1>Welcome to Titan Dashboard</h1>
            <div className="dashboard-content">
              <div className="floating-images">
                <div className="image-container img1">
                  <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=200&fit=crop&auto=format" alt="Analytics" />
                  <p className="floating-text">Real-time Analytics</p>
                </div>
                <div className="image-container img2">
                  <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop&auto=format" alt="Reports" />
                  <p className="floating-text">Comprehensive Reports</p>
                </div>
                <div className="image-container img3">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&auto=format" alt="Team" />
                  <p className="floating-text">Team Collaboration</p>
                </div>
                <div className="image-container img4">
                  <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop&auto=format" alt="Growth" />
                  <p className="floating-text">Business Growth</p>
                </div>
                <div className="image-container img5">
                  <img src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=300&h=200&fit=crop&auto=format" alt="Innovation" />
                  <p className="floating-text">Innovation Hub</p>
                </div>
              </div>
              <div className="welcome-message">
                <h2>Transform Your Business Intelligence</h2>
                <p>Harness the power of data-driven insights to propel your organization forward. Our comprehensive analytics platform provides real-time monitoring, detailed reporting, and collaborative tools to help you make informed decisions.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-section">
            <h2>Titan Dashboard</h2>
          </div>
        </div>
        <div className="header-right">
          <div className="profile-section">
            <div className="profile-info">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
            <div className="profile-avatar" onClick={toggleProfileDropdown}>
              <img src={user.avatar} alt="Profile" />
              <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </div>
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  Profile Settings
                </div>
                <div className="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                  </svg>
                  Settings
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                  Log Out
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <div 
              className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              Dashboard
            </div>
            <div 
              className={`nav-item ${activeSection === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveSection('upload')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              Upload Report
            </div>
            <div 
              className={`nav-item ${activeSection === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveSection('reports')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
              </svg>
              View Reports
            </div>
          </nav>
          
          {/* User info at bottom of sidebar */}
          <div className="sidebar-footer">
            <div className="user-info">
              <img src={user.avatar} alt="User" className="user-avatar" />
              <div className="user-details">
                <span className="username">{user.name}</span>
                <span className="user-status">Online</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="content">
          {renderContent()}
        </main>
      </div>

      {/* Background Animation */}
      <div className="background-animation">
        <div className="modern-shape"></div>
        <div className="modern-shape"></div>
        <div className="modern-shape"></div>
      </div>
    </div>
  );
};

export default Dashboard;