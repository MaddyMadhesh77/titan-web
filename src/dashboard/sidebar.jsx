import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { FaFileUpload, FaFileAlt, FaHome } from 'react-icons/fa';
import AuthContext from '../auth/AuthContext';
import './sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaHome className="sidebar-icon" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="/upload" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaFileUpload className="sidebar-icon" />
              <span>Upload Report</span>
            </NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaFileAlt className="sidebar-icon" />
              <span>View Reports</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <span className="user-name">{currentUser?.name || 'User'}</span>
          <span className="user-role">{currentUser?.role || 'Member'}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;