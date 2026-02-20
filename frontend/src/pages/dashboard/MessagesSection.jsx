import React, { useEffect } from "react";
import { useMessages } from "../../hooks/useMessages";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

function formatTimestamp(ts) {
  if (!ts) return "N/A";
  try {
    const d = new Date(ts);
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

const thStyle = {
  padding: "1rem",
  textAlign: "left",
  color: "#e2e8f0",
  fontWeight: "600",
  fontSize: "0.875rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export default function MessagesSection() {
  const { messages, loading, fetchMessages } = useMessages();

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return (
    <div className="content-section">
      <h2 style={{ color: "#fff", marginBottom: "2rem", fontSize: "2rem" }}>
        Messages
      </h2>

      <div
        style={{
          background: "rgba(0,0,0,0.3)",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #4a5568",
          animation: "fadeIn 0.3s ease-in-out",
        }}
      >
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <LoadingSpinner />
            <p style={{ color: "#a0aec0", marginTop: "1rem" }}>
              Loading messages…
            </p>
          </div>
        ) : messages.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.4)" }}>
                <th style={thStyle}>Message</th>
                <th style={thStyle}>Sent By</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg, index) => (
                <tr
                  key={msg.id || index}
                  style={{
                    borderTop:
                      index > 0 ? "1px solid rgba(74,85,104,0.5)" : "none",
                    backgroundColor:
                      index % 2 === 0
                        ? "rgba(255,255,255,0.02)"
                        : "transparent",
                  }}
                >
                  <td
                    style={{
                      padding: "1rem",
                      color: "#e2e8f0",
                      fontSize: "0.875rem",
                    }}
                  >
                    <div style={{ maxWidth: "500px", wordWrap: "break-word" }}>
                      {msg.content || "No content"}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      color: "#e2e8f0",
                      fontSize: "0.875rem",
                    }}
                  >
                    {msg.senderUsername || "Unknown"}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      color: "#a0aec0",
                      fontSize: "0.875rem",
                    }}
                  >
                    {formatTimestamp(msg.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div
            style={{ padding: "2rem", textAlign: "center", color: "#a0aec0" }}
          >
            No messages found
          </div>
        )}
      </div>
    </div>
  );
}
