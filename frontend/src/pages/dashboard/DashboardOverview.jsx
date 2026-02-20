import React from "react";
import StatCard from "../../components/ui/StatCard";
import ReportsTable from "../../components/ui/ReportsTable";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const STATS_GRADIENT = {
  apps: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
  reports: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  size: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
};

function formatFileSize(bytes) {
  if (typeof bytes !== "number" || isNaN(bytes) || bytes < 0)
    return "Invalid size";
  if (bytes === 0) return "0 Bytes";
  const k = 1024,
    sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1,
  );
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDate(date) {
  if (!date) return "N/A";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "Invalid Date";
  }
}

const FILE_ICONS = {
  pdf: "https://img.icons8.com/color/24/000000/pdf.png",
  docx: "https://img.icons8.com/color/24/000000/microsoft-word-2019.png",
  doc: "https://img.icons8.com/color/24/000000/microsoft-word-2019.png",
  txt: "https://img.icons8.com/color/24/000000/txt.png",
  xlsx: "https://img.icons8.com/color/24/000000/microsoft-excel-2019.png",
  xls: "https://img.icons8.com/color/24/000000/microsoft-excel-2019.png",
  default: "https://img.icons8.com/color/24/000000/file.png",
};

const RECENT_COLS = [
  { key: "fileTitle", label: "File" },
  { key: "app", label: "Application" },
  {
    key: "fileSize",
    label: "Size",
    cellStyle: { color: "#a0aec0", fontSize: "0.875rem" },
  },
  {
    key: "createdAt",
    label: "Uploaded At",
    cellStyle: { color: "#a0aec0", fontSize: "0.875rem" },
  },
  { key: "createdBy", label: "Created By" },
];

export default function DashboardOverview({
  reports,
  status,
  onRefresh,
  onViewReport,
}) {
  const recentReports = reports
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);
  const totalSize = reports.reduce((t, r) => t + (r.fileSize || 0), 0);
  const appCount = new Set(reports.map((r) => r.app)).size;

  const renderCell = (report, col) => {
    if (col.key === "fileTitle") {
      const ext =
        (report.fileTitle || "").split(".").pop()?.toLowerCase() || "default";
      const icon = FILE_ICONS[ext] || FILE_ICONS.default;
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img
            src={icon}
            alt={`${ext} icon`}
            style={{ width: "20px", height: "20px" }}
          />
          <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
            {report.fileTitle}
          </span>
        </div>
      );
    }
    if (col.key === "fileSize")
      return report.fileSize > 0
        ? formatFileSize(report.fileSize)
        : "Unknown size";
    if (col.key === "createdAt") return formatDate(report.createdAt);
    return report[col.key] || "—";
  };

  const renderActions = (report) => (
    <button
      onClick={() => onViewReport(report.id, report.fileTitle)}
      style={{
        background:
          "linear-gradient(135deg,rgb(160,178,56) 0%,rgb(131,151,49) 100%)",
        color: "white",
        border: "none",
        padding: "6px 12px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "0.875rem",
        fontWeight: "500",
        transition: "transform 0.2s ease",
      }}
      onMouseOver={(e) => (e.target.style.transform = "translateY(-1px)")}
      onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
    >
      View
    </button>
  );

  return (
    <div className="content-section">
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ color: "#fff", margin: 0, fontSize: "2rem" }}>
          Dashboard Overview
        </h2>
        <button
          onClick={onRefresh}
          style={{
            background: "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "transform 0.2s ease",
          }}
          onMouseOver={(e) => (e.target.style.transform = "translateY(-1px)")}
          onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          label="Applications"
          value={appCount}
          gradient={STATS_GRADIENT.apps}
        />
        <StatCard
          label="Total Reports"
          value={reports.length}
          gradient={STATS_GRADIENT.reports}
        />
        <StatCard
          label="Total Size"
          value={formatFileSize(totalSize)}
          gradient={STATS_GRADIENT.size}
        />
      </div>

      {/* Recent reports */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: "12px",
          border: "1px solid #4a5568",
          padding: "1.5rem",
        }}
      >
        <h3
          style={{
            color: "#fff",
            marginBottom: "1.5rem",
            fontSize: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ color: "#667eea" }}
          >
            <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z" />
          </svg>
          Recent Reports
        </h3>

        {status === "loading" ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <LoadingSpinner />
          </div>
        ) : recentReports.length > 0 ? (
          <ReportsTable
            columns={RECENT_COLS}
            rows={recentReports}
            renderCell={renderCell}
            renderActions={renderActions}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ color: "#a0aec0", fontSize: "1.1rem" }}>
              No reports available yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
