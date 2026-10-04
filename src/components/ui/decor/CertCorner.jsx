import React from "react";

export function CertCorner({
  className = "",
  size = 64,
  style = {},
  color = "currentColor",
  strokeWidth = 1.5,
  opacity = 0.35,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={style}
    >
      <g stroke={color} strokeWidth={strokeWidth} strokeOpacity={opacity} fill="none">
        {/* Outer corner */}
        <path d="M 4 44 L 4 12 C 4 7.57 7.57 4 12 4 L 44 4" strokeLinecap="round" />
        {/* Inner parallel accent */}
        <path d="M 12 40 L 12 18 C 12 14.68 14.68 12 18 12 L 40 12" strokeLinecap="round" />
        {/* Corner flourish ornament */}
        <circle cx="24" cy="24" r="2.5" fill={color} fillOpacity={opacity} stroke="none" />
        <path d="M 4 4 L 10 10" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default CertCorner;
