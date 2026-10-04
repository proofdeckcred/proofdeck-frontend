import React from "react";

export function Blob({
  className = "",
  size = 260,
  style = {},
  color = "currentColor",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={style}
    >
      <path
        d="M 45 60 C 20 100, 30 150, 75 175 C 120 200, 175 180, 185 130 C 195 80, 160 30, 115 25 C 70 20, 70 20, 45 60 Z"
        fill={color}
      />
    </svg>
  );
}

export default Blob;
