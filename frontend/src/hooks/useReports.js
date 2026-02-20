import { useState, useCallback } from 'react';
import {
  getReports as apiGetReports,
  updateReport as apiUpdateReport,
  deleteReport as apiDeleteReport,
  viewReport   as apiViewReport,
  downloadReport as apiDownloadReport,
} from '../services/api';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

const FILE_TYPE_ICONS = {
  pdf:  'https://img.icons8.com/color/24/000000/pdf.png',
  docx: 'https://img.icons8.com/color/24/000000/microsoft-word-2019.png',
  doc:  'https://img.icons8.com/color/24/000000/microsoft-word-2019.png',
  txt:  'https://img.icons8.com/color/24/000000/txt.png',
  xlsx: 'https://img.icons8.com/color/24/000000/microsoft-excel-2019.png',
  xls:  'https://img.icons8.com/color/24/000000/microsoft-excel-2019.png',
  default: 'https://img.icons8.com/color/24/000000/file.png',
};

function normaliseReport(report, fallbackUser) {
  const fileSize = report.fileSize || report.file_size || report.size || report.length || 0;
  return {
    ...report,
    app:       report.application || report.app || report.applicationName || report.app_name || 'Unknown',
    desc:      report.description  || report.desc || 'No description',
    fileTitle: report.title || report.filename || report.fileName || report.file_name || report.file || report.name || 'No file',
    fileSize,
    id: report.id || report._id || report.reportId,
    createdAt:
      report.createdAt || report.created_at || report.uploadedAt || report.uploaded_at ||
      report.dateCreated || report.date_created || report.timestamp || report.created ||
      new Date().toISOString(),
    createdBy: report.createdBy || fallbackUser || 'Unknown',
  };
}

export function useReports() {
  const [reports, setReports] = useState([]);
  const [status,  setStatus]  = useState('idle'); // idle | loading | error

  const fetchReports = useCallback(async (fallbackUser) => {
    try {
      setStatus('loading');
      const res = await apiGetReports();
      setReports(res.data.map((r) => normaliseReport(r, fallbackUser)));
      setStatus('idle');
    } catch (err) {
      console.error('Error fetching reports:', err);
      setStatus('error');
    }
  }, []);

  const removeReportLocally = useCallback((id) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const patchReportLocally = useCallback((id, patch) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const handleViewReport = useCallback(async (id) => {
    try {
      const res = await apiViewReport(id);
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      window.open(window.URL.createObjectURL(blob), '_blank');
    } catch (err) {
      console.error('Error viewing report:', err);
      alert('Failed to view report. Please try again.');
    }
  }, []);

  const handleDownloadReport = useCallback(async (id, filename) => {
    try {
      const res = await apiDownloadReport(id);
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || `report_${id}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Failed to download report. Please try again.');
    }
  }, []);

  const handleDeleteReport = useCallback(async (id, filename) => {
    if (!window.confirm(`Delete "${filename}"? This cannot be undone.`)) return;
    try {
      await apiDeleteReport(id);
      removeReportLocally(id);
      alert('Report deleted successfully.');
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report. Please try again.');
    }
  }, [removeReportLocally]);

  const handleUpdateReport = useCallback(async (id, editForm) => {
    try {
      const formData = new FormData();
      formData.append('desc', editForm.desc);
      formData.append('app',  editForm.app);
      if (editForm.file) formData.append('file', editForm.file);
      await apiUpdateReport(id, formData);
      patchReportLocally(id, {
        desc: editForm.desc,
        app:  editForm.app,
        ...(editForm.file && { fileTitle: editForm.file.name }),
      });
      alert('Report updated successfully.');
      return true;
    } catch (err) {
      console.error('Error updating report:', err);
      alert('Failed to update report. Please try again.');
      return false;
    }
  }, [patchReportLocally]);

  return {
    reports,
    status,
    fetchReports,
    removeReportLocally,
    handleViewReport,
    handleDownloadReport,
    handleDeleteReport,
    handleUpdateReport,
    FILE_TYPE_ICONS,
  };
}
