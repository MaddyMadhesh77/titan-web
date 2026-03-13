import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { uploadVersion } from "../services/api";
import BackgroundAnimation from "../components/ui/BackgroundAnimation";
import "../styles/createProject.css";

const UploadVersionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [form, setForm] = useState({ versionLabel: "", description: "" });
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); if (error) setError(""); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError("Please select a file."); return; }
    if (!form.versionLabel.trim()) { setError("Version label is required (e.g. v1)."); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("versionLabel", form.versionLabel.trim());
    fd.append("description", form.description.trim());
    fd.append("uploadedBy", user?.username || user?.email || "anonymous");
    try {
      await uploadVersion(id, fd, (e) => {
        setProgress(Math.round((e.loaded * 100) / e.total));
      });
      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally { setLoading(false); setProgress(0); }
  };

  const fmtSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="cp-root">
      <BackgroundAnimation />
      <div className="cp-card">
        <button className="explore-back-btn cp-back" onClick={() => navigate(`/projects/${id}`)}>
          ← Back to Project
        </button>

        <div className="cp-header">
          <div className="cp-header-icon">📤</div>
          <h1 className="cp-title">Upload New Version</h1>
          <p className="cp-subtitle">Add a versioned file to your project</p>
        </div>

        {error && <div className="cp-error">{error}</div>}

        <form className="cp-form" onSubmit={handleSubmit}>
          <div className="cp-field">
            <label className="cp-label">Version Label *</label>
            <input
              className="cp-input"
              name="versionLabel"
              value={form.versionLabel}
              onChange={handleChange}
              placeholder="e.g. v1, v2, Final"
              maxLength={20}
            />
          </div>

          <div className="cp-field">
            <label className="cp-label">Description</label>
            <textarea
              className="cp-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What changed in this version?"
              rows={3}
            />
          </div>

          <div className="cp-field">
            <label className="cp-label">File *</label>
            <div
              className={`cp-dropzone ${file ? "has-file" : ""}`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById("version-file-input").click()}
            >
              {file ? (
                <>
                  <div className="cp-file-icon">📄</div>
                  <p className="cp-file-name">{file.name}</p>
                  <p className="cp-file-size">{fmtSize(file.size)}</p>
                </>
              ) : (
                <>
                  <div className="cp-dropzone-icon">⬆️</div>
                  <p className="cp-dropzone-text">Drag & drop a file here, or <span>browse</span></p>
                  <p className="cp-dropzone-hint">PDF, XLSX, DOCX, PPT, ZIP…</p>
                </>
              )}
              <input
                id="version-file-input"
                type="file"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          </div>

          {loading && (
            <div className="cp-progress-wrap">
              <div className="cp-progress-bar">
                <div className="cp-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="cp-progress-txt">{progress}%</span>
            </div>
          )}

          <button type="submit" className="cp-submit-btn" disabled={loading}>
            {loading ? <div className="spinner" /> : "Upload Version"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadVersionPage;
