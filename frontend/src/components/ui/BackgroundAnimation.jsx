import React from "react";

export default function BackgroundAnimation({ shapeCount = 6 }) {
  return (
    <div className="background-animation">
      {Array.from({ length: shapeCount }).map((_, i) => (
        <div key={i} className="modern-shape" />
      ))}
    </div>
  );
}
