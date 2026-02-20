import { useState, useCallback } from 'react';
import { uploadReport as apiUploadReport } from '../services/api';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export function useFileUpload() {
  const [files,          setFiles]          = useState([]);
  const [dragActive,     setDragActive]     = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus,   setUploadStatus]   = useState('idle'); // idle | uploading | success

  const addFiles = useCallback((newFiles) => {
    const valid  = [];
    const errors = [];
    newFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} exceeds 100 MB limit`);
      } else {
        valid.push({ file, id: Date.now() + Math.random(), progress: 0, status: 'pending' });
      }
    });
    if (errors.length) alert(`Some files were not added:\n${errors.join('\n')}`);
    setFiles((prev) => [...prev, ...valid]);
  }, []);

  const removeFile = useCallback((id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  }, [addFiles]);

  const uploadSingleFile = useCallback(async (fileItem, { applicationName, description, userName }) => {
    if (!applicationName.trim() || !description.trim()) {
      alert('Please fill in Application Name and Description');
      return false;
    }
    const formData = new FormData();
    formData.append('file',      fileItem.file);
    formData.append('app',       applicationName);
    formData.append('desc',      description);
    formData.append('createdBy', userName);

    try {
      await apiUploadReport(formData, (progressEvent) => {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress((prev) => ({ ...prev, [fileItem.id]: pct }));
      });
      setFiles((prev) =>
        prev.map((f) => (f.id === fileItem.id ? { ...f, status: 'success' } : f))
      );
      return true;
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileItem.id ? { ...f, status: 'error' } : f))
      );
      const msg = err.response?.data?.message || err.message || 'Upload failed';
      alert(`Failed to upload ${fileItem.file.name}: ${msg}`);
      return false;
    }
  }, []);

  const uploadAll = useCallback(async ({ applicationName, description, userName, onSuccess }) => {
    if (!files.length) return;
    if (!applicationName.trim() || !description.trim()) {
      alert('Please fill in Application Name and Description');
      return;
    }
    setUploadStatus('uploading');
    for (const fileItem of files) {
      if (fileItem.status === 'pending') {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileItem.id ? { ...f, status: 'uploading' } : f))
        );
        await uploadSingleFile(fileItem, { applicationName, description, userName });
      }
    }
    setUploadStatus('success');
    onSuccess?.();
    setTimeout(() => {
      setFiles([]);
      setUploadProgress({});
      setUploadStatus('idle');
    }, 6000);
  }, [files, uploadSingleFile]);

  const retryFile = useCallback(async (fileId, ctx) => {
    const fileItem = files.find((f) => f.id === fileId);
    if (!fileItem) return;
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: 'pending' } : f)));
    setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: 'uploading' } : f)));
    await uploadSingleFile(fileItem, ctx);
  }, [files, uploadSingleFile]);

  const triggerFileInput = useCallback(() => {
    document.getElementById('fileInput')?.click();
  }, []);

  return {
    files,
    dragActive,
    uploadProgress,
    uploadStatus,
    addFiles,
    removeFile,
    handleDrag,
    handleDrop,
    uploadAll,
    retryFile,
    triggerFileInput,
  };
}
