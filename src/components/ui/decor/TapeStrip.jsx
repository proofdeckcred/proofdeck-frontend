import React from "react";

export function TapeStrip({
  className = "",
  width = 72,
  height = 24,
  style = {},
  color = "rgba(255, 255, 255, 0.75)",
  tilt = -6,
}) {
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: color,
        transform: `rotate(${tilt}deg)`,
        backdropFilter: "blur(2px)",
        borderLeft: "2px dashed rgba(0,0,0,0.06)",
        borderRight: "2px dashed rgba(0,0,0,0.06)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export default TapeStrip;
