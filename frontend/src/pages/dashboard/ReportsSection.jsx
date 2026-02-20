import React, { useState, useMemo } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ReportsTable from "../../components/ui/ReportsTable";

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
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
    return isNaN(d)
      ? "Invalid Date"
      : d.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
  } catch {
    return "N/A";
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

const BTN = {
  view: {
    bg: "linear-gradient(135deg,rgb(160,178,56) 0%,rgb(131,151,49) 100%)",
    label: "View",
  },
  download: {
    bg: "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)",
    label: "Download",
  },
  edit: {
    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    label: "Edit",
  },
  delete: {
    bg: "linear-gradient(135deg, #fc8181 0%, #f56565 100%)",
    label: "Delete",
  },
};

function ActionBtn({ type, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "rgba(255,255,255,0.2)" : BTN[type].bg,
        color: "white",
        border: "none",
        padding: "6px 10px",
        borderRadius: "4px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "0.8rem",
        fontWeight: "500",
        transition: "transform 0.2s ease",
      }}
      onMouseOver={(e) => {
        if (!disabled) e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseOut={(e) => {
        if (!disabled) e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {BTN[type].label}
    </button>
  );
}

const REPORT_COLS = [
  { key: "fileTitle", label: "File" },
  { key: "desc", label: "Description" },
  {
    key: "fileSize",
    label: "Size",
    cellStyle: { color: "#a0aec0", fontSize: "0.875rem" },
  },
  {
    key: "createdAt",
    label: "Date",
    cellStyle: { color: "#a0aec0", fontSize: "0.875rem" },
  },
  { key: "createdBy", label: "By" },
];

export default function ReportsSection({
  reports,
  status,
  onView,
  onDownload,
  onDelete,
  onUpdate,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [editForm, setEditForm] = useState({ desc: "", app: "", file: null });
  const [editLoading, setEditLoading] = useState(false);

  /* ── Derived data ───────────────────────────────────── */
  const appNames = useMemo(
    () => [...new Set(reports.map((r) => r.app))].sort(),
    [reports],
  );
  const filteredAppNames = useMemo(
    () =>
      searchQuery.trim()
        ? appNames.filter((n) =>
            n.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : appNames,
    [appNames, searchQuery],
  );

  const selectedReports = useMemo(
    () => (selectedApp ? reports.filter((r) => r.app === selectedApp) : []),
    [reports, selectedApp],
  );

  /* ── Handlers ───────────────────────────────────────── */
  const startEdit = (report) => {
    setEditingReport(report);
    setEditForm({ desc: report.desc || "", app: report.app || "", file: null });
  };
  const cancelEdit = () => {
    setEditingReport(null);
    setEditForm({ desc: "", app: "", file: null });
  };

  const submitEdit = async () => {
    setEditLoading(true);
    const ok = await onUpdate(editingReport.id, editForm);
    setEditLoading(false);
    if (ok) cancelEdit();
  };

  /* ── Cell renderer ──────────────────────────────────── */
  const renderCell = (report, col) => {
    if (col.key === "fileTitle") {
      const ext =
        (report.fileTitle || "").split(".").pop()?.toLowerCase() || "default";
      const icon = FILE_ICONS[ext] || FILE_ICONS.default;
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src={icon} alt={ext} style={{ width: "20px", height: "20px" }} />
          <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
            {report.fileTitle}
          </span>
        </div>
      );
    }
    if (col.key === "fileSize")
      return report.fileSize > 0 ? formatFileSize(report.fileSize) : "Unknown";
    if (col.key === "createdAt") return formatDate(report.createdAt);
    return report[col.key] || "—";
  };

  const renderActions = (report) => (
    <div
      style={{
        display: "flex",
        gap: "4px",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      <ActionBtn
        type="view"
        onClick={() => onView(report.id, report.fileTitle)}
      />
      <ActionBtn
        type="download"
        onClick={() => onDownload(report.id, report.fileTitle)}
      />
      <ActionBtn type="edit" onClick={() => startEdit(report)} />
      <ActionBtn
        type="delete"
        onClick={() => onDelete(report.id, report.fileTitle)}
      />
    </div>
  );

  /* ── Edit Modal ─────────────────────────────────────── */
  const EditModal = () => (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#2d3748",
          borderRadius: "12px",
          padding: "2rem",
          minWidth: "400px",
          maxWidth: "600px",
          width: "90%",
        }}
      >
        <h3
          style={{ color: "#fff", marginBottom: "1.5rem", fontSize: "1.5rem" }}
        >
          Edit Report
        </h3>

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              color: "#a0aec0",
              fontSize: "0.875rem",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Application Name
          </label>
          <input
            value={editForm.app}
            onChange={(e) =>
              setEditForm((p) => ({ ...p, app: e.target.value }))
            }
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid #4a5568",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "1rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              color: "#a0aec0",
              fontSize: "0.875rem",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Description
          </label>
          <textarea
            value={editForm.desc}
            onChange={(e) =>
              setEditForm((p) => ({ ...p, desc: e.target.value }))
            }
            rows={4}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid #4a5568",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "1rem",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              color: "#a0aec0",
              fontSize: "0.875rem",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Replace File (optional)
          </label>
          <input
            type="file"
            onChange={(e) =>
              setEditForm((p) => ({ ...p, file: e.target.files[0] || null }))
            }
            style={{ color: "#a0aec0" }}
          />
        </div>

        <div
          style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
        >
          <button
            onClick={cancelEdit}
            disabled={editLoading}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Cancel
          </button>
          <button
            onClick={submitEdit}
            disabled={
              editLoading || !editForm.desc.trim() || !editForm.app.trim()
            }
            style={{
              background:
                editLoading || !editForm.desc.trim() || !editForm.app.trim()
                  ? "rgba(255,255,255,0.2)"
                  : "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor:
                editLoading || !editForm.desc.trim() || !editForm.app.trim()
                  ? "not-allowed"
                  : "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            {editLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );

  /* ── App detail view ────────────────────────────────── */
  if (selectedApp) {
    return (
      <div className="content-section">
        {editingReport && <EditModal />}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <button
            onClick={() => setSelectedApp(null)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            ← Back
          </button>
          <h2 style={{ color: "#fff", margin: 0, fontSize: "2rem" }}>
            {selectedApp}
          </h2>
          <span
            style={{
              background: "rgba(102,126,234,0.2)",
              color: "#a0aec0",
              padding: "4px 12px",
              borderRadius: "25px",
              fontSize: "0.875rem",
            }}
          >
            {selectedReports.length} report
            {selectedReports.length !== 1 ? "s" : ""}
          </span>
        </div>
        {selectedReports.length > 0 ? (
          <ReportsTable
            columns={REPORT_COLS}
            rows={selectedReports}
            renderCell={renderCell}
            renderActions={renderActions}
          />
        ) : (
          <p style={{ color: "#a0aec0" }}>No reports for this application.</p>
        )}
      </div>
    );
  }

  /* ── App list view ──────────────────────────────────── */
  return (
    <div className="content-section">
      <h2 style={{ color: "#fff", marginBottom: "2rem", fontSize: "2rem" }}>
        View Reports
      </h2>

      {/* Search bar */}
      <div style={{ marginBottom: "1.5rem", position: "relative" }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search applications…"
          style={{
            width: "100%",
            padding: "0.875rem 1rem 0.875rem 3rem",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid #4a5568",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "1rem",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.3s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#667eea")}
          onBlur={(e) => (e.target.style.borderColor = "#4a5568")}
        />
        <svg
          style={{
            position: "absolute",
            left: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#718096",
          }}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      {/* Content */}
      {status === "loading" ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <LoadingSpinner />
          <p
            style={{ color: "#a0aec0", fontSize: "1.1rem", marginTop: "1rem" }}
          >
            Loading reports…
          </p>
        </div>
      ) : filteredAppNames.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "#a0aec0", fontSize: "1.1rem" }}>
            {searchQuery
              ? "No applications match your search."
              : "No reports available."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {filteredAppNames.map((appName) => {
            const count = reports.filter((r) => r.app === appName).length;
            return (
              <div
                key={appName}
                onClick={() => setSelectedApp(appName)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  border: "1px solid #4a5568",
                  padding: "1.5rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #a0aec0 0%, #718096 100%)",
                      }}
                    />
                    <h3
                      style={{
                        color: "#fff",
                        margin: 0,
                        fontSize: "1.5rem",
                        fontWeight: "700",
                      }}
                    >
                      {appName}
                    </h3>
                    <span
                      style={{
                        background: "rgba(102,126,234,0.2)",
                        color: "#a0aec0",
                        padding: "6px 16px",
                        borderRadius: "25px",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                      }}
                    >
                      {count} report{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <span
                    style={{
                      color: "#a0aec0",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                    }}
                  >
                    Click to view reports
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
