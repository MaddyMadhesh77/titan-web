import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPublicProjects } from "../services/api";
import ProjectCard from "../components/ui/ProjectCard";
import BackgroundAnimation from "../components/ui/BackgroundAnimation";
import "../styles/explore.css";

const CATEGORIES = ["All", "AI & ML", "Web Dev", "Data Science", "Research", "Other"];

const ExplorePage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchProjects = async (q = "") => {
    setLoading(true);
    try {
      const res = await getPublicProjects(q);
      setProjects(res.data || []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchProjects(search), 350);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="explore-root">
      <BackgroundAnimation />

      {/* Header */}
      <header className="explore-header">
        <button className="explore-back-btn" onClick={() => navigate("/dashboard")}>
          ← Back
        </button>
        <div className="explore-logo">
          <span className="explore-logo-icon">📚</span>
          <span className="explore-logo-text">ReportHub</span>
        </div>
        <button className="explore-new-btn" onClick={() => navigate("/projects/new")}>
          + New Project
        </button>
      </header>

      <main className="explore-main">
        {/* Hero */}
        <div className="explore-hero">
          <h1 className="explore-hero-title">Discover Projects</h1>
          <p className="explore-hero-sub">
            Explore research, reports, and documentation shared by the community
          </p>

          {/* Search bar */}
          <div className="explore-search-bar">
            <span className="explore-search-icon">🔍</span>
            <input
              type="text"
              className="explore-search-input"
              placeholder="Search projects by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="explore-search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="explore-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`explore-cat-pill ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="explore-loading">
            <div className="explore-spinner" />
            <p>Loading projects…</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="explore-empty">
            <div className="explore-empty-icon">🗂️</div>
            <h3>No projects found</h3>
            <p>Try a different search term or be the first to create a project!</p>
            <button className="explore-new-btn-big" onClick={() => navigate("/projects/new")}>
              Create Project
            </button>
          </div>
        ) : (
          <div className="explore-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onStarred={() => fetchProjects(search)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ExplorePage;
