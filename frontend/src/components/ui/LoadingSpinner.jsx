import React from "react";

export default function LoadingSpinner({ size = 40, color = "#667eea" }) {
  return (
    <div
      style={{
        display: "inline-block",
        width: `${size}px`,
        height: `${size}px`,
        border: `4px solid #4a5568`,
        borderTop: `4px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
  );
}
