import React from "react";

export function Swirl({
  className = "",
  size = 240,
  strokeWidth = 24,
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
        d="M 40 160 C 40 80, 80 40, 140 40 C 180 40, 180 110, 130 130 C 80 150, 60 100, 90 80 C 120 60, 140 90, 120 110"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Swirl;
