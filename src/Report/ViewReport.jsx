import React, { useState, useContext } from 'react';
import Header from '../dashboard/header';
import Sidebar from '../dashboard/sidebar';
import AuthContext from '../auth/AuthContext';
import { FaBars, FaFileDownload, FaSearch } from 'react-icons/fa';
import './ViewReport.css';

// Mock data for reports
const mockApplications = [
  { id: 1, name: "Loan Application", count: 8 },
  { id: 2, name: "Insurance Claim", count: 5 },
  { id: 3, name: "Tax Filing", count: 12 },
  { id: 4, name: "Employment Verification", count: 3 },
  { id: 5, name: "Housing Application", count: 6 }
];

const mockReports = {
  1: [
    { id: 101, name: "2023 Annual Loan Report.pdf", date: "2023-12-20", size: "2.4 MB" },
    { id: 102, name: "Q1 2024 Loan Performance.docx", date: "2024-03-15", size: "1.8 MB" },
    { id: 103, name: "Loan Application Stats.pdf", date: "2024-04-02", size: "3.2 MB" }
  ],
  2: [
    { id: 201, name: "Health Insurance Claims.pdf", date: "2024-01-10", size: "4.1 MB" },
    { id: 202, name: "Auto Insurance Analysis.docx", date: "2024-02-18", size: "1.5 MB" }
  ],
  3: [
    { id: 301, name: "2023 Tax Filing Documentation.pdf", date: "2023-12-05", size: "5.2 MB" },
    { id: 302, name: "Q1 2024 Tax Report.pdf", date: "2024-03-10", size: "2.7 MB" }
  ],
  4: [
    { id: 401, name: "Employment Verification Form.pdf", date: "2024-01-25", size: "1.1 MB" }
  ],
  5: [
    { id: 501, name: "Housing Application Review.pdf", date: "2024-02-08", size: "2.9 MB" },
    { id: 502, name: "Rental Agreement Analysis.docx", date: "2024-03-22", size: "1.7 MB" }
  ]
};

const ViewReports = () => {
  const { currentUser } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloading, setDownloading] = useState(null);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAppSelect = (appId) => {
    setSelectedApp(appId);
  };

  const handleDownload = (reportId) => {
    setDownloading(reportId);
    
    // Simulate download delay
    setTimeout(() => {
      setDownloading(null);
      // In a real app, this would trigger an actual file download
    }, 1500);
  };

  // Filter reports based on search term
  const filteredReports = selectedApp && mockReports[selectedApp]
    ? mockReports[selectedApp].filter(
        report => report.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="view-reports-container">
      <Header />
      
      <div className="menu-toggle" onClick={toggleSidebar}>
        <FaBars />
      </div>
      
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="reports-header animate-slide-up">
          <h1>View Reports</h1>
          <p>Access and download your submitted reports</p>
        </div>
        
        <div className="reports-container">
          <div className="applications-list animate-slide-up">
            <h2>Applications</h2>
            <ul className="app-list">
              {mockApplications.map(app => (
                <li 
                  key={app.id} 
                  className={`app-item ${selectedApp === app.id ? 'active' : ''}`}
                  onClick={() => handleAppSelect(app.id)}
                >
                  <span className="app-name">{app.name}</span>
                  <span className="app-count">{app.count}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="reports-list-container animate-slide-up">
            {selectedApp ? (
              <>
                <div className="reports-toolbar">
                  <h2>{mockApplications.find(a => a.id === selectedApp)?.name} Reports</h2>
                  <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                {filteredReports.length > 0 ? (
                  <div className="reports-table-container">
                    <table className="reports-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Date Uploaded</th>
                          <th>Size</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReports.map(report => (
                          <tr key={report.id} className="report-row">
                            <td className="report-name">{report.name}</td>
                            <td>{new Date(report.date).toLocaleDateString()}</td>
                            <td>{report.size}</td>
                            <td>
                              <button
                                className={`download-button ${downloading === report.id ? 'loading' : ''}`}
                                onClick={() => handleDownload(report.id)}
                                disabled={downloading === report.id}
                              >
                                {downloading === report.id ? 'Downloading...' : (
                                  <>
                                    <FaFileDownload className="download-icon" />
                                    Download
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-reports">
                    <p>No reports found matching your search.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="no-app-selected">
                <p>Select an application from the list to view reports.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewReports;