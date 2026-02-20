import React from "react";

const thStyle = {
  padding: "1rem",
  textAlign: "left",
  color: "#e2e8f0",
  fontWeight: "600",
  fontSize: "0.875rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

/**
 * Generic reports table.
 *
 * Props:
 *   columns  – array of { key, label, style? }
 *   rows     – array of report objects
 *   renderActions(report) – returns JSX for the actions cell
 *   renderCell(report, col) – optional custom cell renderer
 */
export default function ReportsTable({
  columns,
  rows,
  renderActions,
  renderCell,
}) {
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.2)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "rgba(0,0,0,0.3)" }}>
            {columns.map((col) => (
              <th key={col.key} style={{ ...thStyle, ...col.style }}>
                {col.label}
              </th>
            ))}
            {renderActions && (
              <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((report, index) => (
            <tr
              key={report.id || index}
              style={{
                borderTop: index > 0 ? "1px solid rgba(74,85,104,0.5)" : "none",
                transition: "background 0.2s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.02)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: "1rem",
                    color: "#e2e8f0",
                    ...col.cellStyle,
                  }}
                >
                  {renderCell ? renderCell(report, col) : report[col.key]}
                </td>
              ))}
              {renderActions && (
                <td style={{ padding: "1rem", textAlign: "center" }}>
                  {renderActions(report)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
