import React from "react";

export default function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div
      style={{
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        padding: "10px",
        borderRadius: "6px",
        marginBottom: "20px",
        fontSize: "14px",
        textAlign: "center",
        border: "1px solid #fecaca",
      }}
    >
      {message}
    </div>
  );
}
