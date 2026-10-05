import React from "react";

export function CertCorner({
  className = "",
  size,
  style = {},
  color = "#5144E8",
  strokeWidth = 1.2,
  opacity = 0.14,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={style}
    >
      <g stroke={color} strokeWidth={strokeWidth} strokeOpacity={opacity} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Outer bracket with smooth corner arc */}
        <path d="M 4 44 L 4 14 C 4 8.48 8.48 4 14 4 L 44 4" />
        {/* Inner parallel bracket */}
        <path d="M 10 38 L 10 16 C 10 12.69 12.69 10 16 10 L 38 10" strokeWidth={1} strokeOpacity={opacity * 0.9} />
        {/* Inner diploma curl / scroll flourish */}
        <path d="M 16 16 C 22 16 25 19 25 24 C 25 27 22.8 29.5 20 29.5 C 17.2 29.5 15 27.2 15 24.5 C 15 21 18.5 17.5 24 17.5" strokeWidth={1} strokeOpacity={opacity} />
        {/* Delicate accent dot */}
        <circle cx="20" cy="24.5" r="1.5" fill={color} fillOpacity={opacity} stroke="none" />
      </g>
    </svg>
  );
}

export default CertCorner;
