import React, { useState } from "react";
import { useMessages } from "../../hooks/useMessages";
import { useAuthContext } from "../../context/AuthContext";

export default function BroadcastSection() {
  const { user } = useAuthContext();
  const { loading, broadcastMessage } = useMessages();
  const [messageInput, setMessageInput] = useState("");

  const handleSend = async () => {
    if (!messageInput.trim()) return;
    await broadcastMessage({
      content: messageInput.trim(),
      senderUsername: user.username || user.name,
    });
    setMessageInput("");
  };

  const handleInputFocus = (e) => {
    e.target.parentElement.style.transform = "scale(1.02)";
  };
  const handleInputBlur = (e) => {
    e.target.parentElement.style.transform = "scale(1)";
  };

  return (
    <div className="content-section">
      <h2 style={{ color: "#fff", marginBottom: "2rem", fontSize: "2rem" }}>
        Broadcasting
      </h2>

      {user.role !== "Admin" ? (
        <p style={{ color: "#f56565", fontSize: "1.1rem" }}>
          Only Admins can send broadcast messages.
        </p>
      ) : (
        <>
          <h3
            style={{ color: "#fff", marginBottom: "1rem", fontSize: "1.5rem" }}
          >
            Message:
          </h3>

          <div style={{ marginBottom: "1.5rem", position: "relative" }}>
            <textarea
              id="message"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              required
              rows={10}
              className="form-input"
              placeholder=" "
              disabled={loading}
            />
            <label htmlFor="message" className="form-label">
              Message
            </label>
          </div>

          <button
            onClick={handleSend}
            disabled={!messageInput.trim() || loading}
            style={{
              background:
                !messageInput.trim() || loading
                  ? "rgba(255,255,255,0.2)"
                  : "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor:
                !messageInput.trim() || loading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "transform 0.2s ease",
            }}
            onMouseOver={(e) => {
              if (!e.target.disabled)
                e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              if (!e.target.disabled)
                e.target.style.transform = "translateY(0)";
            }}
          >
            {loading ? "Sending…" : "Send Broadcast"}
          </button>
        </>
      )}
    </div>
  );
}
