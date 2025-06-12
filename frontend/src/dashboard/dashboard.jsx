  import React, { useState, useEffect, useMemo } from 'react';
  import { useNavigate, useLocation } from 'react-router-dom';
  import './dashboard.css';
  import axios from 'axios';

  const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [files, setFiles] = useState([]);
    const [status, setStatus] = useState('idle');
    const [uploadProgress, setUploadProgress] = useState({}); 
    const [applicationName, setApplicationName] = useState(sessionStorage.getItem('applicationName') || '');
    const [description, setDescription] = useState(sessionStorage.getItem('description') || '');
    const [activeSection, setActiveSection] = useState(sessionStorage.getItem('activeSection') || 'dashboard');
    const [expandedApp, setExpandedApp] = useState(sessionStorage.getItem('expandedApp') || null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [reports, setReports] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchStatus, setSearchStatus] = useState('idle');
    const [editingReport, setEditingReport] = useState(null);
    const [editForm, setEditForm] = useState({ desc: '', app: '' });
    const [selectedApp, setSelectedApp] = useState(null);

    // Maximum file size (100MB)
    const MAX_FILE_SIZE = 100 * 1024 * 1024;

    // File type icon mapping
    const fileTypeIcons = {
      pdf: 'https://img.icons8.com/color/24/000000/pdf.png',
      docx: 'https://img.icons8.com/color/24/000000/microsoft-word-2019.png',
      doc: 'https://img.icons8.com/color/24/000000/microsoft-word-2019.png',
      txt: 'https://img.icons8.com/color/24/000000/txt.png',
      xlsx: 'https://img.icons8.com/color/24/000000/microsoft-excel-2019.png',
      xls: 'https://img.icons8.com/color/24/000000/microsoft-excel-2019.png',
      default: 'https://img.icons8.com/color/24/000000/file.png',
    };

    useEffect(() => {
      const usernameFromState = location.state?.username;
      const emailFromState = location.state?.email;
      const usernameFromSession = sessionStorage.getItem('username');
      const emailFromSession = sessionStorage.getItem('userEmail');

      setUserName(usernameFromState || usernameFromSession || 'User');
      setUserEmail(emailFromState || emailFromSession || '');

      const finalUserName = usernameFromState || usernameFromSession || 'User';

      // Fetch reports whenever activeSection changes to reports OR dashboard
      if (activeSection === 'reports' || activeSection === 'dashboard') {
        fetchReports(finalUserName);
      }
    }, [location.state, activeSection]);

    useEffect(() => {
      if ((activeSection === 'reports' || activeSection === 'dashboard') && userName) {
        fetchReports(userName);
      }
    }, [activeSection, userName]);

    useEffect(() => {
      // Fetch reports when component first loads
      fetchReports();
    }, []);

    useEffect(() => {
      sessionStorage.setItem('applicationName', applicationName);
    }, [applicationName]);

    useEffect(() => {
      sessionStorage.setItem('description', description);
    }, [description]);

    useEffect(() => {
      sessionStorage.setItem('activeSection', activeSection);
    }, [activeSection]);

    useEffect(() => {
      if (expandedApp) {
        sessionStorage.setItem('expandedApp', expandedApp);
      } else {
        sessionStorage.removeItem('expandedApp');
      }
    }, [expandedApp]);

    const getFrequentReports = () => {
      return reports
        .slice()
        .sort((a, b) => {
          // Sort by createdAt, with fallback handling
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA; // Most recent first
        })
        .slice(0, 5); // Show top 5 recent reports
    };

    const handleRefresh = async () => {
      await fetchReports();
    };

    const fetchReports = async (userName) => {
      try {
        console.log(userName);
        setStatus('loading');
        const response = await axios.get('http://localhost:8080/api/reports');
        console.log('Raw reports data:', response.data);

        const normalizedReports = response.data.map(report => {
        const fileSize = report.fileSize || report.file_size || report.size || report.length || 0;
        return {
          ...report,
          app: report.application || report.app || report.applicationName || report.app_name || 'Unknown',
          desc: report.description || report.desc || 'No description',
          fileTitle: report.title || report.filename || report.fileName || report.file_name || report.file || report.name || 'No file',
          fileSize: fileSize, // Standardized field
          id: report.id || report._id || report.reportId,
          createdAt: report.createdAt || report.created_at || report.uploadedAt || report.uploaded_at || report.dateCreated || report.date_created || report.timestamp || report.created || new Date().toISOString(),
          createdBy: userName || 'Unknown'
        };
      });
              console.log('Normalized reports:', normalizedReports);
              setReports(normalizedReports);
              setStatus('idle');
            } catch (error) {
              console.error('Error fetching reports:', error);
              setStatus('error');
              alert('Failed to fetch reports. Please try again later.');
            }
          };

    // Filter applications based on search query
    const filteredAppNames = useMemo(() => {
      const allAppNames = [...new Set(reports.map(report => report.app || report.application || report.applicationName || 'Unknown'))];

      if (!searchQuery.trim()) return allAppNames;

      return allAppNames.filter(appName => 
        appName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [reports, searchQuery]);


    // Get reports for a specific application
    const getReportsForApp = (appName) => {
      return reports.filter(report => 
        (report.app || report.applicationName || report.application || 'Unknown') === appName
      );
    };

    // Handle file selection
    const handleFileChange = (event) => {
      const selectedFiles = Array.from(event.target.files);
      addFiles(selectedFiles);
    };

    // Add files with validation
    const addFiles = (newFiles) => {
      const validFiles = [];
      const errors = [];

      newFiles.forEach((file) => {
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name} exceeds 100MB limit`);
        } else {
          validFiles.push({
            file,
            id: Date.now() + Math.random(),
            progress: 0,
            status: 'pending',
          });
        }
      });

      if (errors.length > 0) {
        alert(`Some files were not added:\n${errors.join('\n')}`);
      }

      setFiles((prev) => [...prev, ...validFiles]);
    };

    // Drag and drop handlers
    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
      }
    };

    const triggerFileInput = () => {
      document.getElementById('fileInput').click();
    };

    // Remove file from list
    const removeFile = (fileId) => {
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    };

    // Upload single file
    // Upload single file - Updated to include createdBy
    const uploadSingleFile = async (fileItem) => {
      if (!applicationName.trim() || !description.trim()) {
        alert('Please fill in Application Name and Description');
        return false;
      }

      // Ensure we have a valid user for createdBy
      const createdByUser = userName || userEmail || 'Anonymous';
      console.log('Created By User:', createdByUser);
      
      const formData = new FormData();
      formData.append('file', fileItem.file);
      formData.append('app', applicationName);
      formData.append('desc', description);
      formData.append('createdBy', userName);

      try {
        const response = await axios.post('http://localhost:8080/api/reports/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress((prev) => ({
              ...prev,
              [fileItem.id]: percentCompleted,
            }));
          },
        });

        setFiles((prev) =>
          prev.map((f) => (f.id === fileItem.id ? { ...f, status: 'success' } : f))
        );

        console.log('File uploaded successfully by:', createdByUser, response.data);
        if (activeSection === 'reports') {
          fetchReports(createdByUser);
        }
        return true;
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileItem.id ? { ...f, status: 'error' } : f))
        );
        const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
        alert(`Failed to upload ${fileItem.file.name}: ${errorMessage}`);
        return false;
      }
    };

     // Upload all files
    const handleFileUpload = async () => {
      if (files.length === 0) return;
      if (!applicationName.trim() || !description.trim()) {
        alert('Please fill in Application Name and Description');
        return;
      }

      setStatus('uploading');
      for (const fileItem of files) {
        if (fileItem.status === 'pending') {
          setFiles((prev) =>
            prev.map((f) => (f.id === fileItem.id ? { ...f, status: 'uploading' } : f))
          );
          await uploadSingleFile(fileItem);
        }
      }

      setStatus('success');
      setTimeout(() => {
        setFiles([]);
        setApplicationName('');
        setDescription('');
        setUploadProgress({});
        setStatus('idle');
      }, 6000);
    };

    const handleViewReport = async (id) => {
      try {
        const response = await axios.get(`http://localhost:8080/api/reports/view/${id}`, {
          responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank'); // Open in new tab
      } catch (error) {
        console.error('Error viewing report:', error);
        alert('Failed to view report. Please try again.');
      }
    };




    // Download report
    const handleDownloadReport = async (id, filename) => {
      try {
        const response = await axios.get(`http://localhost:8080/api/reports/download/${id}`, {
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename || `report_${id}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading report:', error);
        alert('Failed to download report. Please try again.');
      }
    };

    // Delete report with confirmation
    const handleDeleteReport = (id, filename) => {
      if (window.confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
        deleteReport(id);
      }
    };

    const deleteReport = async (id) => {
      try {
        await axios.delete(`http://localhost:8080/api/reports/delete/${id}`);
        setReports((prev) => prev.filter((report) => report.id !== id));
        alert('Report deleted successfully.');
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Failed to delete report. Please try again.');
      }
    };

    // Update report
    const handleEditReport = (report) => {
      setEditingReport(report.id);
      setEditForm({
        desc: report.desc || report.description || '',
        app: report.app || report.application || report.applicationName || '',
        file: report.file || report.fileTitle || '',
      });
    };

    const handleUpdateReport = async (id) => {
      try {
        const formData = new FormData();
        formData.append('desc', editForm.desc);
        formData.append('app', editForm.app);
        
        // Only append file if a new file was selected
        if (editForm.file) {
          formData.append('file', editForm.file);
        }

        const response = await axios.post(`http://localhost:8080/api/reports/update/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Report updated:', response.data);
        
        // Update the local state with the new data
        setReports((prev) =>
          prev.map((report) =>
            report.id === id
              ? { 
                  ...report, 
                  desc: editForm.desc, 
                  app: editForm.app,
                  // Update fileTitle if a new file was uploaded
                  ...(editForm.file && { fileTitle: editForm.file.name })
                }
              : report
          )
        );
        
        setEditingReport(null);
        setEditForm({ desc: '', app: '', file: null });
        alert('Report updated successfully.');
      } catch (error) {
        console.error('Error updating report:', error);
        alert('Failed to update report. Please try again.');
      }
    };

    const formatDate = (date) => {
      if (!date) return 'N/A';
      try {
        const dateObj = new Date(date);
        // Check if the date is valid
        if (isNaN(dateObj.getTime())) {
          return 'Invalid Date';
        }
        return dateObj.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }); // e.g., "Jun 10, 2025, 2:34 PM"
      } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid Date';
      }
    };

    const cancelEdit = () => {
      setEditingReport(null);
      setEditForm({ desc: '', app: '', file: null });
    };

    let user = {
      name: userName,
      email: userEmail,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format',
    };

    const handleLogout = () => {
      sessionStorage.clear();
      alert('Logged out!');
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

    // Format file size
      const formatFileSize = (bytes) => {
        if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) {
          return 'Invalid size';
        }
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        let i = Math.floor(Math.log(bytes) / Math.log(k));
        if (i >= sizes.length) {
          i = sizes.length - 1;
        }
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };

      useEffect(() => {
        sessionStorage.setItem('username', userName);
      }, [userName]);

      useEffect(() => {
        sessionStorage.setItem('userEmail', userEmail);
      }, [userEmail]);
    
    console.log(formatFileSize(reports.reduce((total, report) => total + (report.fileSize || 0), 0)));


    useEffect(() => {
      if (applicationName !== null && applicationName !== undefined) {
        sessionStorage.setItem('applicationName', applicationName);
      }
    }, [applicationName]);

    useEffect(() => {
      if (description !== null && description !== undefined) {
        sessionStorage.setItem('description', description);
      }
    }, [description]);

    // Debounce search input
    useEffect(() => {
      const handler = setTimeout(() => {
        setSearchStatus('idle');
      }, 500);
      return () => clearTimeout(handler);
    }, [searchQuery]);

    // Auto-expand first matching application when searching
    useEffect(() => {
      if (searchQuery && filteredAppNames.length > 0) {
        setExpandedApp(filteredAppNames[0]);
      }
    }, [searchQuery, filteredAppNames]);

    const retryFileUpload = async (fileId) => {
      const fileItem = files.find(f => f.id === fileId);
      if (!fileItem) return;

      // Reset file status to pending and clear any previous progress
      setFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'pending' } 
            : f
        )
      );
      
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: 0
      }));

      // Upload the specific file
      setFiles(prev =>
        prev.map(f => (f.id === fileId ? { ...f, status: 'uploading' } : f))
      );
      
      await uploadSingleFile(fileItem);
    };

    const renderContent = () => {
      switch (activeSection) {
        case 'dashboard':
          return (
            <div className="content-section">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '2rem' 
              }}>
                <h2 style={{ color: '#fff', margin: 0, fontSize: '2rem' }}>
                  Dashboard Overview
                </h2>
                <button
                  onClick={handleRefresh}
                  style={{
                    background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
                  </svg>
                  Refresh
                </button>
              </div>
              
              {/* Stats Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem', 
                marginBottom: '2rem' 
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  color: 'white'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', opacity: 0.9 }}>Applications</h3>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                    {[...new Set(reports.map(report => report.app))].length}
                  </p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  color: 'white'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', opacity: 0.9 }}>Total Reports</h3>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{reports.length}</p>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  color: 'white'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', opacity: 0.9 }}>Total Size</h3>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                    {formatFileSize(reports.reduce((total, report) => total + (report.fileSize || 0), 0))}
                  </p>
                </div>
              </div>

              {/* Frequent Reports Section */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                border: '1px solid #4a5568',
                padding: '1.5rem'
              }}>
                <h3 style={{ 
                  color: '#fff', 
                  marginBottom: '1.5rem', 
                  fontSize: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#667eea' }}>
                    <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
                  </svg>
                  Recent Reports
                </h3>
                
                {status === 'loading' ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: '#a0aec0', fontSize: '1.1rem' }}>Loading reports...</p>
                  </div>
                ) : getFrequentReports().length > 0 ? (
                  <div style={{ 
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse'
                    }}>
                      <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                          <th style={{ 
                            padding: '1rem', 
                            textAlign: 'left', 
                            color: '#e2e8f0',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            File
                          </th>
                          <th style={{ 
                            padding: '1rem', 
                            textAlign: 'left', 
                            color: '#e2e8f0',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Application
                          </th>
                          <th style={{ 
                            padding: '1rem', 
                            textAlign: 'left', 
                            color: '#e2e8f0',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Size
                          </th>
                          <th style={{ 
                            padding: '1rem', 
                            textAlign: 'left', 
                            color: '#e2e8f0',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Uploaded At
                          </th>
                          <th style={{ 
                            padding: '1rem', 
                            textAlign: 'left', 
                            color: '#e2e8f0',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Created By
                          </th>
                          <th style={{ 
                            padding: '1rem', 
                            textAlign: 'center', 
                            color: '#e2e8f0',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFrequentReports().map((report, index) => {
                          const fileName = report.fileTitle || 'No file';
                          const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'default';
                          const iconSrc = fileTypeIcons[fileExtension] || fileTypeIcons.default;
                          
                          return (
                            <tr 
                              key={report.id}
                              style={{
                                borderTop: index > 0 ? '1px solid rgba(74, 85, 104, 0.5)' : 'none',
                                transition: 'background 0.2s ease'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <td style={{ padding: '1rem', color: '#e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <img
                                    src={iconSrc}
                                    alt={`${fileExtension} icon`}
                                    style={{ width: '20px', height: '20px' }}
                                  />
                                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                    {fileName}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: '1rem', color: '#e2e8f0' }}>
                                {report.app || 'No application'}
                              </td>
                              <td style={{ padding: '1rem', color: '#a0aec0', fontSize: '0.875rem' }}>
                                {report.fileSize && report.fileSize > 0 ? formatFileSize(report.fileSize) : 'Unknown size'}
                              </td>
                              <td style={{ padding: '1rem', color: '#a0aec0', fontSize: '0.875rem' }}>
                                {formatDate(report.createdAt)}
                              </td>
                              <td style={{ padding: '1rem', color: '#e2e8f0', fontSize: '0.875rem' }}>
                                {report.createdBy || 'Unknown'}
                              </td>
                              <td style={{ padding: '1rem', textAlign: 'center' }}>
                                <button
                                        onClick={() => handleViewReport(report.id, report.fileTitle)}
                                        style={{
                                          background: 'linear-gradient(135deg,rgb(160, 178, 56) 0%,rgb(131, 151, 49) 100%)',
                                          color: 'white',
                                          border: 'none',
                                          padding: '6px 12px',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '0.875rem',
                                          fontWeight: '500',
                                          transition: 'transform 0.2s ease',
                                        }}
                                        onMouseOver={(e) => (e.target.style.transform = 'translateY(-1px)')}
                                        onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
                                      >
                                        View
                                      </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <svg
                      style={{ width: '64px', height: '64px', color: '#4a5568', marginBottom: '1rem' }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    <p style={{ color: '#a0aec0', fontSize: '1.1rem' }}>
                      No reports available yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );

        case 'upload':
          return (
            <div className="content-section">
              <h2 style={{ color: '#fff', marginBottom: '2rem', fontSize: '2rem' }}>Upload Reports</h2>
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ marginBottom: '0.9rem', fontWeight: 'bold', fontSize: '1.2rem', color: '#FFF' }}>
                  Application Name:
                </p>
                <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                  <input
                    type="text"
                    id="applicationName"
                    value={applicationName}
                    onChange={(e) => setApplicationName(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    required
                    className="form-input"
                    placeholder=" "
                  />
                  <label htmlFor="applicationName" className="form-label">Application Name</label>
                </div>
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ marginBottom: '0.9rem', fontWeight: 'bold', fontSize: '1.2rem', color: '#FFF' }}>
                  Description:
                </p>
                <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    required
                    rows={4}
                    className="form-input"
                    placeholder=" "
                  />
                  <label htmlFor="description" className="form-label">Description</label>
                </div>
              </div>
              <div>
                <p style={{ marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.2rem', color: '#FFF' }}>
                  Document Upload:
                </p>
                <div
                  style={{
                    border: `2px dashed ${dragActive ? '#667eea' : '#4a5568'}`,
                    borderRadius: '12px',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    background: dragActive ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255,255,255,0.05)',
                    transition: 'all 0.3s ease',
                  }}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: '#a0aec0', marginBottom: '1rem' }}
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <p style={{ color: '#a0aec0', marginBottom: '1rem', fontSize: '1.1rem' }}>
                    Drag and drop your reports here or click to browse
                  </p>
                  <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Maximum file size: 100MB | All file types supported
                  </p>
                  {files.length > 0 && (
                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem', textAlign: 'left' }}>
                      {files.map((fileItem) => (
                        <div
                          key={fileItem.id}
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '0.5rem',
                            color: '#fff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}>
                              <strong>{fileItem.file.name}</strong>
                            </p>
                            <p style={{ margin: '0', fontSize: '0.9rem', color: '#a0aec0' }}>
                              {formatFileSize(fileItem.file.size)} • {fileItem.file.type || 'Unknown type'}
                            </p>
                            {fileItem.status === 'uploading' && (
                              <div
                                style={{
                                  width: '100%',
                                  height: '4px',
                                  background: 'rgba(255,255,255,0.2)',
                                  borderRadius: '2px',
                                  marginTop: '0.5rem',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    width: `${uploadProgress[fileItem.id] || 0}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #667eea, #764ba2)',
                                    transition: 'width 0.3s ease',
                                  }}
                                />
                              </div>
                            )}
                            {fileItem.status === 'success' && (
                              <p style={{ color: '#48bb78', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                                ✓ Uploaded successfully
                              </p>
                            )}
                            {fileItem.status === 'error' && (
                              <p style={{ color: '#f56565', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                                ✗ Upload failed - Check your connection and try again
                              </p>
                            )}
                            {fileItem.status === 'uploading' && (
                              <p style={{ color: '#fbbf24', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                                Uploading... {uploadProgress[fileItem.id] || 0}%
                              </p>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                            {/* Retry button for failed uploads */}
                            {fileItem.status === 'error' && (
                              <button
                                onClick={() => retryFileUpload(fileItem.id)}
                                disabled={!applicationName.trim() || !description.trim()}
                                style={{
                                  background: !applicationName.trim() || !description.trim()
                                    ? 'rgba(255,255,255,0.2)'
                                    : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  cursor: !applicationName.trim() || !description.trim() ? 'not-allowed' : 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                onMouseOver={(e) => {
                                  if (!e.target.disabled) {
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 8px rgba(251, 191, 36, 0.3)';
                                  }
                                }}
                                onMouseOut={(e) => {
                                  if (!e.target.disabled) {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                  }
                                }}
                                title={!applicationName.trim() || !description.trim() 
                                  ? 'Please fill in Application Name and Description to retry' 
                                  : 'Retry upload'
                                }
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="23 4 23 10 17 10"></polyline>
                                  <polyline points="1 20 1 14 7 14"></polyline>
                                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                                </svg>
                                Retry
                              </button>
                            )}
                            {/* Remove button for pending files */}
                            {fileItem.status === 'pending' && (
                              <button
                                onClick={() => removeFile(fileItem.id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#f56565',
                                  cursor: 'pointer',
                                  fontSize: '1.2rem',
                                  padding: '0 6px',
                                  borderRadius: '4px',
                                  transition: 'background 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.background = 'rgba(245, 101, 101, 0.1)';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.background = 'transparent';
                                }}
                                title="Remove file"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={triggerFileInput}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      transition: 'transform 0.2s ease',
                      marginRight: files.length > 0 ? '1rem' : '0',
                    }}
                    onMouseOver={(e) => (e.target.style.transform = 'translateY(-2px)')}
                    onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
                    aria-label="Choose files to upload"
                  >
                    Choose Files
                  </button>
                  {files.length > 0 && status !== 'uploading' && (
                    <button
                      onClick={handleFileUpload}
                      disabled={!applicationName.trim() || !description.trim()}
                      style={{
                        background: !applicationName.trim() || !description.trim()
                          ? 'rgba(255,255,255,0.2)'
                          : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        cursor: !applicationName.trim() || !description.trim() ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        transition: 'transform 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        if (!e.target.disabled) e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        if (!e.target.disabled) e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Upload All ({files.filter((f) => f.status === 'pending').length})
                    </button>
                  )}
                  {status === 'uploading' && (
                    <p style={{ color: '#fbbf24', fontSize: '1.1rem', fontWeight: 'bold' }}>
                      Uploading files...
                    </p>
                  )}
                  {status === 'success' && (
                    <p style={{ color: '#48bb78', fontSize: '1.1rem', fontWeight: 'bold' }}>
                      All files uploaded successfully!
                    </p>
                  )}
                  <input
                    type="file"
                    id="fileInput"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    multiple
                    accept="*/*"
                  />
                </div>
              </div>
            </div>
          );

        case 'reports':
          return (
            <div className="content-section">
              {/* Conditionally render based on whether an application is selected */}
              {selectedApp ? (
                <div>
                  {/* Header with Application Name on the left, Back Button on the right */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '2rem',
                    }}
                  >
                    <h2
                      style={{
                        color: '#fff',
                        margin: 0,
                        fontSize: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginLeft: '0.5rem',
                      }}
                    >
                      {selectedApp}
                    </h2>

                    <button
                      onClick={() => {
                        setSelectedApp(null);
                        setSearchQuery('');
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'transform 0.2s ease',
                        marginRight: '1rem',
                      }}
                      onMouseOver={(e) => (e.target.style.transform = 'translateY(-2px)')}
                      onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
                    >
                      Back to Applications
                    </button>
                  </div>


                  {/* Reports Table for Selected Application */}
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid #4a5568',
                      animation: 'fadeIn 0.3s ease-in-out',
                    }}
                  >
                    {getReportsForApp(selectedApp).length > 0 ? (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'rgba(0,0,0,0.4)' }}>
                            <th
                              style={{
                                padding: '1rem',
                                textAlign: 'left',
                                color: '#e2e8f0',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              Application
                            </th>
                            <th
                              style={{
                                padding: '1rem',
                                textAlign: 'left',
                                color: '#e2e8f0',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              Description
                            </th>
                            <th
                              style={{
                                padding: '1rem',
                                textAlign: 'left',
                                color: '#e2e8f0',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              Size
                            </th>
                            <th
                              style={{
                                padding: '1rem',
                                textAlign: 'left',
                                color: '#e2e8f0',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              File
                            </th>
                            <th
                              style={{
                                padding: '1rem',
                                textAlign: 'left',
                                color: '#e2e8f0',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              Uploaded At
                            </th>
                            <th
                              style={{
                                padding: '1rem',
                                textAlign: 'left',
                                color: '#e2e8f0',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              Created By
                            </th>
                            <th
                              style={{
                                padding: '1rem',
                                textAlign: 'center',
                                color: '#e2e8f0',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {getReportsForApp(selectedApp).map((report, index) => {
                            const fileName = report.filename || report.fileName || report.file_name || report.file || '';
                            const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'default';
                            const iconSrc = fileTypeIcons[fileExtension] || fileTypeIcons.default;
                            const isEditing = editingReport === report.id;

                            return (
                              <tr
                                key={report.id}
                                style={{
                                  borderTop: index > 0 ? '1px solid rgba(74, 85, 104, 0.5)' : 'none',
                                  transition: 'background 0.2s ease',
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                              >
                                {/* Application Column */}
                                <td style={{ padding: '1rem', color: '#e2e8f0' }}>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={editForm.app}
                                      onChange={(e) => setEditForm({ ...editForm, app: e.target.value })}
                                      placeholder="Application Name"
                                      style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #4a5568',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: '#fff',
                                        fontSize: '0.875rem',
                                      }}
                                    />
                                  ) : (
                                    report.app || 'No application'
                                  )}
                                </td>

                                {/* Description Column */}
                                <td style={{ padding: '1rem', color: '#e2e8f0' }}>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={editForm.desc}
                                      onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })}
                                      placeholder="Description"
                                      style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #4a5568',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: '#fff',
                                        fontSize: '0.875rem',
                                      }}
                                    />
                                  ) : (
                                    report.desc || 'No description'
                                  )}
                                </td>

                                {/* Size Column */}
                                <td style={{ padding: '1rem', color: '#a0aec0', fontSize: '0.875rem' }}>
                                  {report.fileSize && report.fileSize > 0
                                    ? formatFileSize(report.fileSize)
                                    : report.file_size && report.file_size > 0
                                    ? formatFileSize(report.file_size)
                                    : report.size && report.size > 0
                                    ? formatFileSize(report.size)
                                    : 'Unknown size'}
                                </td>

                                {/* File Column */}
                                <td style={{ padding: '1rem', color: '#e2e8f0' }}>
                                  {isEditing ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      <input
                                        type="file"
                                        onChange={(e) => setEditForm({ ...editForm, file: e.target.files[0] })}
                                        accept="*/*"
                                        style={{
                                          width: '100%',
                                          padding: '8px',
                                          borderRadius: '4px',
                                          border: '1px solid #4a5568',
                                          background: 'rgba(255,255,255,0.05)',
                                          color: '#fff',
                                          fontSize: '0.875rem',
                                        }}
                                      />
                                      {editForm.file && (
                                        <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>
                                          New file: {editForm.file.name}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <img
                                        src={iconSrc}
                                        alt={`${fileExtension} icon`}
                                        style={{ width: '20px', height: '20px' }}
                                      />
                                      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                        {report.fileTitle || 'No file'}
                                      </span>
                                    </div>
                                  )}
                                </td>

                                <td style={{ padding: '1rem', color: '#a0aec0', fontSize: '0.875rem' }}>
                                  {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'N/A'}
                                </td>
                                <td style={{ padding: '1rem', color: '#e2e8f0', fontSize: '0.875rem' }}>
                                  {report.createdBy || 'Unknown'}
                                </td>

                                {/* Actions Column */}
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                  {isEditing ? (
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                      <button
                                        onClick={() => handleUpdateReport(report.id)}
                                        style={{
                                          background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                          color: 'white',
                                          border: 'none',
                                          padding: '6px 12px',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '0.875rem',
                                          fontWeight: '500',
                                          transition: 'transform 0.2s ease',
                                        }}
                                        onMouseOver={(e) => (e.target.style.transform = 'translateY(-1px)')}
                                        onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
                                      >
                                        Update
                                      </button>
                                      <button
                                        onClick={cancelEdit}
                                        style={{
                                          background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                                          color: 'white',
                                          border: 'none',
                                          padding: '6px 12px',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '0.875rem',
                                          fontWeight: '500',
                                          transition: 'transform 0.2s ease',
                                        }}
                                        onMouseOver={(e) => (e.target.style.transform = 'translateY(-1px)')}
                                        onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                      <button
                                        onClick={() => handleEditReport(report)}
                                        style={{
                                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                          color: 'white',
                                          border: 'none',
                                          padding: '6px 12px',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '0.875rem',
                                          fontWeight: '500',
                                          transition: 'transform 0.2s ease',
                                        }}
                                        onMouseOver={(e) => (e.target.style.transform = 'translateY(-1px)')}
                                        onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
                                      >
                                        Update
                                      </button>
                                      <button
                                        onClick={() => handleDeleteReport(report.id, report.fileTitle)}
                                        style={{
                                          background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                                          color: 'white',
                                          border: 'none',
                                          padding: '6px 12px',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '0.875rem',
                                          fontWeight: '500',
                                          transition: 'transform 0.2s ease',
                                        }}
                                        onMouseOver={(e) => (e.target.style.transform = 'translateY(-1px)')}
                                        onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
                                      >
                                        Delete
                                      </button>
                                      <button
                                        onClick={() => handleDownloadReport(report.id, report.fileTitle)}
                                        style={{
                                          background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
                                          color: 'white',
                                          border: 'none',
                                          padding: '6px 12px',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '0.875rem',
                                          fontWeight: '500',
                                          transition: 'transform 0.2s ease',
                                        }}
                                        onMouseOver={(e) => (e.target.style.transform = 'translateY(-1px)')}
                                        onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
                                      >
                                        Download
                                      </button>
                                      <button
                                        onClick={() => handleViewReport(report.id, report.fileTitle)}
                                        style={{
                                          background: 'linear-gradient(135deg,rgb(160, 178, 56) 0%,rgb(131, 151, 49) 100%)',
                                          color: 'white',
                                          border: 'none',
                                          padding: '6px 12px',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '0.875rem',
                                          fontWeight: '500',
                                          transition: 'transform 0.2s ease',
                                        }}
                                        onMouseOver={(e) => (e.target.style.transform = 'translateY(-1px)')}
                                        onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
                                      >
                                        View
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <svg
                          style={{ width: '48px', height: '48px', color: '#4a5568', marginBottom: '1rem' }}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                        <p style={{ color: '#a0aec0', fontSize: '1rem', margin: 0 }}>
                          No reports found for this application.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  {/* Original Header and Search Bar */}
                  <h2 style={{ color: '#fff', marginBottom: '2rem', fontSize: '2rem' }}>
                    View Reports
                  </h2>

                  {/* Search Bar */}
                  <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setSearchStatus('searching');
                        }}
                        placeholder="Search applications..."
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 40px',
                          borderRadius: '8px',
                          border: '1px solid #4a5568',
                          background: 'rgba(255,255,255,0.05)',
                          color: '#fff',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                        onBlur={(e) => (e.target.style.borderColor = '#4a5568')}
                      />
                      <svg
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '20px',
                          height: '20px',
                          color: '#a0aec0',
                        }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                      </svg>
                    </div>

                    <button
                      onClick={() => {
                        setSearchQuery('');
                        fetchReports();
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        transition: 'transform 0.2s ease',
                      }}
                      onMouseOver={(e) => (e.target.style.transform = 'translateY(-2px)')}
                      onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
                    >
                      Clear Search
                    </button>
                  </div>

                  {/* Loading States */}
                  {status === 'loading' ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <div
                        style={{
                          display: 'inline-block',
                          width: '40px',
                          height: '40px',
                          border: '4px solid #4a5568',
                          borderTop: '4px solid #667eea',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          marginBottom: '1rem',
                        }}
                      ></div>
                      <p style={{ color: '#a0aec0', fontSize: '1.1rem' }}>Loading reports...</p>
                    </div>
                  ) : searchStatus === 'searching' ? (
                    <p style={{ color: '#a0aec0', fontSize: '1.1rem' }}>Searching...</p>
                  ) : filteredAppNames.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                      <svg
                        style={{ width: '64px', height: '64px', color: '#4a5568', marginBottom: '1rem' }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                      <p style={{ color: '#a0aec0', fontSize: '1.1rem' }}>
                        {searchQuery ? 'No applications match your search.' : 'No reports available.'}
                      </p>
                    </div>
                  ) : (
                    /* Applications List as Cards */
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      {filteredAppNames.map((appName) => {
                        const appReports = getReportsForApp(appName);

                        return (
                          <div key={appName}>
                            {/* Application Card */}
                            <div
                              onClick={() => setSelectedApp(appName)}
                              style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                border: '1px solid #4a5568',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                transform: 'translateY(0)',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <div
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      borderRadius: '50%',
                                      background: 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)',
                                    }}
                                  />
                                  <h3
                                    style={{
                                      color: '#fff',
                                      margin: 0,
                                      fontSize: '1.5rem',
                                      fontWeight: '700',
                                    }}
                                  >
                                    {appName}
                                  </h3>
                                  <span
                                    style={{
                                      background: 'rgba(102, 126, 234, 0.2)',
                                      color: '#a0aec0',
                                      padding: '6px 16px',
                                      borderRadius: '25px',
                                      fontSize: '0.875rem',
                                      fontWeight: '600',
                                    }}
                                  >
                                    {appReports.length} report{appReports.length !== 1 ? 's' : ''}
                                  </span>
                                </div>

                                <div
                                  style={{
                                    color: '#a0aec0',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                  }}
                                >
                                  Click to view reports
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }
      };

    return (  
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-left">
            <div className="logo-section">
              <h2 style={{
                color: '#FFF',
              }}>Titan Dashboard</h2>
            </div>
          </div>
          <div className="header-right">
            <div className="profile-section">
              <div className={`profile-avatar ${showProfileDropdown ? 'active' : ''}`} onClick={toggleProfileDropdown}>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-email">{user.email}</span>
                </div>
                <img src={user.avatar} alt="Profile" />
                <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </div>
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <div className="dropdown-item">
                    <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>{user.email}</span>
                  </div>
                  {/* <div className="dropdown-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    Profile Settings
                  </div> */}
                  {/* <div className="dropdown-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                    </svg>
                    Settings
                  </div> */}
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
        <div className="dashboard-main">
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
                Upload Reports
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
              <div className={`nav-item ${activeSection === 'Broadcasting' ? 'active' : ''}`}
                   onClick={() => setActiveSection('Broadcasting')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,4C16.42,4 20,7.58 20,12C20,16.42 16.42,20 12,20C7.58,20 4,16.42 4,12C4,7.58 7.58,4 12,4M12,6C9.79,6 8,7.79 8,10C8,12.21 9.79,14 12,14C14.21,14 16,12.21 16,10C"/></svg>
                Broadcasting
              </div>
            </nav>
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
        <main className="content">{renderContent()}</main>
        </div>
        <div className="background-animation">
          <div className="modern-shape"></div>
          <div className="modern-shape"></div>
          <div className="modern-shape"></div>
        </div>
      </div>
      
    );
  };

export default Dashboard;