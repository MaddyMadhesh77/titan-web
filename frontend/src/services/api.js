import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginUser = (payload) =>
  api.post('/api/users/login', payload);

export const signupUser = (payload) =>
  api.post('/api/users/signup', payload);

// ─── Reports ─────────────────────────────────────────────────────────────────

export const getReports = () =>
  api.get('/api/reports');

export const uploadReport = (formData, onUploadProgress) =>
  api.post('/api/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

export const updateReport = (id, formData) =>
  api.post(`/api/reports/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteReport = (id) =>
  api.delete(`/api/reports/delete/${id}`);

export const viewReport = (id) =>
  api.get(`/api/reports/view/${id}`, { responseType: 'blob' });

export const downloadReport = (id) =>
  api.get(`/api/reports/download/${id}`, { responseType: 'blob' });

// ─── Messages ─────────────────────────────────────────────────────────────────

export const getMessages = () =>
  fetch(`${BASE_URL}/api/messages/all`).then((r) => {
    if (!r.ok) throw new Error('Failed to fetch messages');
    return r.json();
  });

export const sendBroadcast = (payload) =>
  fetch(`${BASE_URL}/api/messages/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((r) => {
    if (!r.ok) throw new Error('Failed to send broadcast');
    return r.json();
  });
