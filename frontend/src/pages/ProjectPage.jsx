import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import {
  getProject, getVersions, getCollaborators,
  getAnnouncements, postAnnouncement, addCollaborator,
  starProject, downloadVersion
} from "../services/api";
import BackgroundAnimation from "../components/ui/BackgroundAnimation";
import "../styles/projectPage.css";

const TABS = ["Versions", "Collaborators", "Announcements", "About"];

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [project, setProject] = useState(null);
  const [versions, setVersions] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState("Versions");
  const [loading, setLoading] = useState(true);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [newCollabUsername, setNewCollabUsername] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [projRes, verRes, collabRes, annRes] = await Promise.all([
        getProject(id),
        getVersions(id),
        getCollaborators(id),
        getAnnouncements(id),
      ]);
      setProject(projRes.data);
      setVersions(verRes.data || []);
      setCollaborators(collabRes.data || []);
      setAnnouncements(annRes.data || []);
    } catch {
      navigate("/explore");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStar = async () => {
    await starProject(id);
    setProject((p) => ({ ...p, stars: (p.stars || 0) + 1 }));
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    setPosting(true);
    try {
      await postAnnouncement(id, {
        message: newAnnouncement.trim(),
        postedBy: user?.username || "Anonymous",
      });
      setNewAnnouncement("");
      const res = await getAnnouncements(id);
      setAnnouncements(res.data || []);
    } finally { setPosting(false); }
  };

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    if (!newCollabUsername.trim()) return;
    try {
      await addCollaborator(id, { username: newCollabUsername.trim(), role: "VIEWER" });
      setNewCollabUsername("");
      const res = await getCollaborators(id);
      setCollaborators(res.data || []);
    } catch {}
  };

  const handleDownload = async (versionId, fileName) => {
    const res = await downloadVersion(versionId);
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "report";
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

  if (loading) return (
    <div className="pp-loading"><div className="explore-spinner" /><p>Loading project…</p></div>
  );

  if (!project) return null;

  return (
    <div className="pp-root">
      <BackgroundAnimation />

      {/* Top Bar */}
      <header className="pp-header">
        <button className="explore-back-btn" onClick={() => navigate("/explore")}>← Explore</button>
        <span className="explore-logo-text">ReportHub</span>
        {project.ownerUsername === user?.username && (
          <button className="pp-upload-btn" onClick={() => navigate(`/projects/${id}/upload`)}>
            + Upload Version
          </button>
        )}
      </header>

      {/* Project Hero */}
      <div className="pp-hero">
        <div className="pp-hero-icon">{project.name?.charAt(0).toUpperCase()}</div>
        <div className="pp-hero-text">
          <h1 className="pp-project-title">{project.name}</h1>
          <p className="pp-project-owner">by {project.ownerUsername}</p>
          <p className="pp-project-desc">{project.description}</p>
        </div>
        <div className="pp-hero-actions">
          <button className="pp-star-btn" onClick={handleStar}>⭐ Star {project.stars}</button>
          <span className={`project-badge ${project.visibility === "PRIVATE" ? "private" : "public"}`}>
            {project.visibility === "PRIVATE" ? "🔒 Private" : "🌐 Public"}
          </span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="pp-stats-bar">
        <div className="pp-stat"><span className="pp-stat-num">{versions.length}</span><span className="pp-stat-label">Versions</span></div>
        <div className="pp-stat"><span className="pp-stat-num">{collaborators.length}</span><span className="pp-stat-label">Collaborators</span></div>
        <div className="pp-stat"><span className="pp-stat-num">{announcements.length}</span><span className="pp-stat-label">Announcements</span></div>
        <div className="pp-stat"><span className="pp-stat-num">{project.stars}</span><span className="pp-stat-label">Stars</span></div>
      </div>

      {/* Tabs */}
      <div className="pp-tabs">
        {TABS.map((t) => (
          <button key={t} className={`pp-tab ${activeTab === t ? "active" : ""}`}
            onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      <div className="pp-tab-content">

        {/* Versions Tab */}
        {activeTab === "Versions" && (
          <div className="pp-versions">
            {versions.length === 0 ? (
              <div className="pp-empty">
                <div className="explore-empty-icon">📂</div>
                <p>No versions uploaded yet.</p>
                {project.ownerUsername === user?.username && (
                  <button className="pp-upload-btn" onClick={() => navigate(`/projects/${id}/upload`)}>
                    Upload First Version
                  </button>
                )}
              </div>
            ) : (
              <div className="pp-timeline">
                {versions.map((v, i) => (
                  <div key={v.id} className="pp-timeline-item">
                    <div className="pp-timeline-dot" />
                    {i < versions.length - 1 && <div className="pp-timeline-line" />}
                    <div className="pp-version-card">
                      <div className="pp-version-header">
                        <span className="pp-version-label">{v.versionLabel}</span>
                        <span className="pp-version-date">{fmt(v.uploadedAt)}</span>
                      </div>
                      <p className="pp-version-title">{v.fileTitle}</p>
                      <p className="pp-version-desc">{v.description}</p>
                      <div className="pp-version-footer">
                        <span className="pp-version-by">🧑 {v.uploadedBy}</span>
                        <button className="pp-download-btn"
                          onClick={() => handleDownload(v.id, v.fileTitle)}>
                          ⬇ Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Collaborators Tab */}
        {activeTab === "Collaborators" && (
          <div className="pp-collabs">
            {project.ownerUsername === user?.username && (
              <form className="pp-add-form" onSubmit={handleAddCollaborator}>
                <input className="pp-add-input" placeholder="Username to add…"
                  value={newCollabUsername} onChange={(e) => setNewCollabUsername(e.target.value)} />
                <button type="submit" className="pp-upload-btn">Add</button>
              </form>
            )}
            <div className="pp-collab-list">
              {collaborators.map((c) => (
                <div key={c.id} className="pp-collab-item">
                  <div className="pp-collab-avatar">{c.username?.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="pp-collab-name">{c.username}</p>
                    <span className={`pp-collab-role ${c.role.toLowerCase()}`}>{c.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "Announcements" && (
          <div className="pp-announcements">
            {project.ownerUsername === user?.username && (
              <form className="pp-announce-form" onSubmit={handlePostAnnouncement}>
                <textarea className="pp-announce-textarea"
                  placeholder="📢 Broadcast an announcement…"
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  rows={3}
                />
                <button type="submit" className="pp-upload-btn" disabled={posting}>
                  {posting ? "Posting…" : "Post Announcement"}
                </button>
              </form>
            )}
            <div className="pp-announce-list">
              {announcements.length === 0 ? (
                <p className="pp-empty-txt">No announcements yet.</p>
              ) : announcements.map((a) => (
                <div key={a.id} className="pp-announce-item">
                  <span className="pp-announce-icon">📢</span>
                  <div>
                    <p className="pp-announce-msg">{a.message}</p>
                    <span className="pp-announce-meta">by {a.postedBy} · {fmt(a.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === "About" && (
          <div className="pp-about">
            <div className="pp-about-card">
              <h3>Project Details</h3>
              <table className="pp-about-table">
                <tbody>
                  <tr><td>Name</td><td>{project.name}</td></tr>
                  <tr><td>Owner</td><td>{project.ownerUsername}</td></tr>
                  <tr><td>Visibility</td><td>{project.visibility}</td></tr>
                  <tr><td>Created</td><td>{fmt(project.createdAt)}</td></tr>
                  <tr><td>Last Updated</td><td>{fmt(project.updatedAt)}</td></tr>
                  <tr><td>Stars</td><td>⭐ {project.stars}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="pp-about-card">
              <h3>Description</h3>
              <p>{project.description || "No description provided."}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
