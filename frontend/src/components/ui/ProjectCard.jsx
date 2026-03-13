import React from "react";
import { useNavigate } from "react-router-dom";
import { starProject } from "../../services/api";
import "../../styles/projectCard.css";

const ProjectCard = ({ project, onStarred }) => {
  const navigate = useNavigate();

  const handleStar = async (e) => {
    e.stopPropagation();
    try {
      await starProject(project.id);
      if (onStarred) onStarred();
    } catch {}
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="project-card" onClick={() => navigate(`/projects/${project.id}`)}>
      <div className="project-card-header">
        <div className="project-card-icon">
          {project.name?.charAt(0).toUpperCase()}
        </div>
        <div className="project-card-meta">
          <h3 className="project-card-title">{project.name}</h3>
          <span className="project-card-owner">by {project.ownerUsername}</span>
        </div>
        <span className={`project-badge ${project.visibility === "PRIVATE" ? "private" : "public"}`}>
          {project.visibility === "PRIVATE" ? "🔒 Private" : "🌐 Public"}
        </span>
      </div>

      <p className="project-card-desc">
        {project.description || "No description provided."}
      </p>

      <div className="project-card-footer">
        <span className="project-card-date">Updated {timeAgo(project.updatedAt)}</span>
        <button className="project-star-btn" onClick={handleStar}>
          <span>⭐</span> {project.stars || 0}
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
