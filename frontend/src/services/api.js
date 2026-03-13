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

// ─── Projects ─────────────────────────────────────────────────────────────────

export const createProject = (payload) =>
  api.post('/api/projects', payload);

export const getPublicProjects = (search = '') =>
  api.get('/api/projects', { params: search ? { search } : {} });

export const getMyProjects = (owner) =>
  api.get('/api/projects/mine', { params: { owner } });

export const getProject = (id) =>
  api.get(`/api/projects/${id}`);

export const updateProject = (id, payload) =>
  api.put(`/api/projects/${id}`, payload);

export const deleteProject = (id, currentUser) =>
  api.delete(`/api/projects/${id}`, { params: { currentUser } });

export const starProject = (id) =>
  api.post(`/api/projects/${id}/star`);

// Versions
export const getVersions = (projectId) =>
  api.get(`/api/projects/${projectId}/versions`);

export const uploadVersion = (projectId, formData, onUploadProgress) =>
  api.post(`/api/projects/${projectId}/versions`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

export const downloadVersion = (versionId) =>
  api.get(`/api/projects/versions/${versionId}/download`, { responseType: 'blob' });

export const viewVersion = (versionId) =>
  api.get(`/api/projects/versions/${versionId}/view`, { responseType: 'blob' });

// Collaborators
export const getCollaborators = (projectId) =>
  api.get(`/api/projects/${projectId}/collaborators`);

export const addCollaborator = (projectId, payload) =>
  api.post(`/api/projects/${projectId}/collaborators`, payload);

// Announcements
export const getAnnouncements = (projectId) =>
  api.get(`/api/projects/${projectId}/announcements`);

export const postAnnouncement = (projectId, payload) =>
  api.post(`/api/projects/${projectId}/announcements`, payload);

// Stats
export const getProjectStats = (username) =>
  api.get('/api/projects/stats', { params: { username } });

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
