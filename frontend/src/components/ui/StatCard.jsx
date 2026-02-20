import React from "react";

export default function StatCard({ label, value, gradient }) {
  return (
    <div
      style={{
        background: gradient,
        padding: "1.5rem",
        borderRadius: "12px",
        color: "white",
      }}
    >
      <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem", opacity: 0.9 }}>
        {label}
      </h3>
      <p style={{ margin: 0, fontSize: "2rem", fontWeight: "bold" }}>{value}</p>
    </div>
  );
}
