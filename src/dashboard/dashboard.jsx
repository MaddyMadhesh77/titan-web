import { useState, useContext } from 'react';
import Header from './header';
import Sidebar from './sidebar';
import AuthContext from './auth/AuthContext';
import { FaBars } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Sample data for dashboard content
  const reports = [
    { id: 1, title: 'Annual Financial Report', date: '2023-12-15' },
    { id: 2, title: 'Q1 Performance Analysis', date: '2024-03-21' },
    { id: 3, title: 'Market Research Results', date: '2024-04-10' }
  ];
  
  const images = [
    'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/3182750/pexels-photo-3182750.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1181622/pexels-photo-1181622.jpeg?auto=compress&cs=tinysrgb&w=600'
  ];

  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="menu-toggle" onClick={toggleSidebar}>
        <FaBars />
      </div>
      
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="dashboard-welcome animate-slide-up">
          <h1>Welcome back, {currentUser?.name || 'User'}!</h1>
          <p>Heres whats happening with your reports today</p>
        </div>
        
        <div className="dashboard-stats">
          <div className="stat-card animate-slide-up">
            <div className="stat-info">
              <h3>Total Reports</h3>
              <span className="stat-number">24</span>
            </div>
          </div>
          <div className="stat-card animate-slide-up">
            <div className="stat-info">
              <h3>Pending Reviews</h3>
              <span className="stat-number">7</span>
            </div>
          </div>
          <div className="stat-card animate-slide-up">
            <div className="stat-info">
              <h3>Approved</h3>
              <span className="stat-number">16</span>
            </div>
          </div>
        </div>
        
        <div className="dashboard-content">
          <div className="recent-reports animate-slide-up">
            <h2>Recent Reports</h2>
            <div className="reports-list">
              {reports.map(report => (
                <div key={report.id} className="report-card">
                  <div className="report-info">
                    <h3>{report.title}</h3>
                    <p>Uploaded on: {new Date(report.date).toLocaleDateString()}</p>
                  </div>
                  <button className="view-button">View</button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="info-section animate-slide-up">
            <h2>Document Management Tips</h2>
            <div className="info-cards">
              {images.map((image, index) => (
                <div key={index} className="info-card">
                  <img src={image} alt={`Information ${index + 1}`} />
                  <div className="info-text">
                    <h3>Best Practices {index + 1}</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;