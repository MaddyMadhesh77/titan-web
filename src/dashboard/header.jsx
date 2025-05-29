import { useState, useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/titan-logo.png';
import AuthContext from '../auth/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import './header.css';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="header-logo">
          <Logo />
        </Link>
      </div>
      
      <div className="header-right">
        <div className="profile-container" ref={dropdownRef}>
          <div className="profile-info" onClick={toggleDropdown}>
            {currentUser?.profilePic ? (
              <img 
                src={currentUser.profilePic} 
                alt={`${currentUser.name}'s profile`} 
                className="profile-image"
              />
            ) : (
              <FaUserCircle className="profile-icon" />
            )}
            <span className="profile-name">{currentUser?.name || 'User'}</span>
          </div>
          
          {showDropdown && (
            <div className="profile-dropdown animate-fade-in">
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  <span className="dropdown-name">{currentUser?.name}</span>
                  <span className="dropdown-email">{currentUser?.email}</span>
                  <span className="dropdown-role">{currentUser?.role}</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <ul className="dropdown-menu">
                <li className="dropdown-item">
                  <Link to="/profile">Profile Settings</Link>
                </li>
                <li className="dropdown-item">
                  <button className="logout-button" onClick={logout}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;