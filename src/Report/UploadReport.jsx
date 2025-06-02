import React, { useState, useContext } from 'react';
import Header from '../dashboard/header';
import Sidebar from '../dashboard/sidebar';
import AuthContext from '../auth/AuthContext';
import { FaBars, FaCloudUploadAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './UploadReport.css';

const applications = [
  { id: 1, name: "Loan Application" },
  { id: 2, name: "Insurance Claim" }, 
  { id: 3, name: "Tax Filing" },
  { id: 4, name: "Employment Verification" },
  { id: 5, name: "Housing Application" }
];

const UploadReport = () => {
  const { currentUser } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [selectedApp, setSelectedApp] = useState('');
  const [reportName, setReportName] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedApp) {
      toast.error('Please select an application');
      return;
    }
    
    if (!reportName.trim()) {
      toast.error('Please enter a report name');
      return;
    }
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    try {
      setUploading(true);
      
      // In a real application, this would be an API call to upload the file
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Report uploaded successfully');
      setSelectedApp('');
      setReportName('');
      setFile(null);
    } catch (error) {
      toast.error('Failed to upload report');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <Header />
      
      <div className="menu-toggle" onClick={toggleSidebar}>
        <FaBars />
      </div>
      
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="upload-header animate-slide-up">
          <h1>Upload Report</h1>
          <p>Submit your documents for processing</p>
        </div>
        
        <div className="upload-form-container animate-slide-up">
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label htmlFor="application">Application</label>
              <select
                id="application"
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value)}
                disabled={uploading}
              >
                <option value="">Select an application</option>
                {applications.map(app => (
                  <option key={app.id} value={app.id}>{app.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="reportName">Report Name</label>
              <input
                type="text"
                id="reportName"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter a name for your report"
                disabled={uploading}
              />
            </div>
            
            <div className="form-group">
              <label>Document</label>
              <div className="file-upload-container">
                {file ? (
                  <div className="selected-file">
                    <p>{file.name}</p>
                    <button 
                      type="button" 
                      className="remove-file" 
                      onClick={() => setFile(null)}
                      disabled={uploading}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="file-upload-area">
                    <FaCloudUploadAlt className="upload-icon" />
                    <p>Drag & drop your files here or click to browse</p>
                    <input
                      type="file"
                      className="file-input"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </div>
                )}
              </div>
              <p className="file-help">Supported file formats: PDF, DOCX, JPG, PNG (Max size: 10MB)</p>
            </div>
            
            <div className="form-footer">
              <button 
                type="submit" 
                className={`upload-button ${uploading ? 'loading' : ''}`}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Report'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UploadReport;