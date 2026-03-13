import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { createProject } from "../services/api";
import BackgroundAnimation from "../components/ui/BackgroundAnimation";
import "../styles/createProject.css";

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [form, setForm] = useState({ name: "", description: "", visibility: "PUBLIC" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Project name is required."); return; }
    setLoading(true);
    try {
      const res = await createProject({
        ...form,
        ownerUsername: user?.username || user?.email,
      });
      navigate(`/projects/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project.");
    } finally { setLoading(false); }
  };

  return (
    <div className="cp-root">
      <BackgroundAnimation />
      <div className="cp-card">
        <button className="explore-back-btn cp-back" onClick={() => navigate(-1)}>← Back</button>

        <div className="cp-header">
          <div className="cp-header-icon">📁</div>
          <h1 className="cp-title">Create New Project</h1>
          <p className="cp-subtitle">Set up a version-controlled project space</p>
        </div>

        {error && <div className="cp-error">{error}</div>}

        <form className="cp-form" onSubmit={handleSubmit}>
          <div className="cp-field">
            <label className="cp-label">Project Name *</label>
            <input
              className="cp-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. AI Disaster Detection"
              maxLength={80}
            />
          </div>

          <div className="cp-field">
            <label className="cp-label">Description</label>
            <textarea
              className="cp-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Briefly describe the project goals…"
              rows={4}
              maxLength={500}
            />
            <span className="cp-char-count">{form.description.length}/500</span>
          </div>

          <div className="cp-field">
            <label className="cp-label">Visibility</label>
            <div className="cp-visibility-toggle">
              <button
                type="button"
                className={`cp-vis-btn ${form.visibility === "PUBLIC" ? "active" : ""}`}
                onClick={() => setForm((p) => ({ ...p, visibility: "PUBLIC" }))}
              >
                🌐 Public
                <span className="cp-vis-desc">Visible to everyone</span>
              </button>
              <button
                type="button"
                className={`cp-vis-btn ${form.visibility === "PRIVATE" ? "active" : ""}`}
                onClick={() => setForm((p) => ({ ...p, visibility: "PRIVATE" }))}
              >
                🔒 Private
                <span className="cp-vis-desc">Only you and collaborators</span>
              </button>
            </div>
          </div>

          <button type="submit" className="cp-submit-btn" disabled={loading}>
            {loading ? <div className="spinner" /> : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;
