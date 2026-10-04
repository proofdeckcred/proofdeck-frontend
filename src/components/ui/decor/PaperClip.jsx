import React from "react";

export function PaperClip({
  className = "",
  size = 40,
  style = {},
  color = "#94A3B8",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={style}
    >
      <path
        d="M21 11 L12 20 C10 22 7 22 5 20 C3 18 3 15 5 13 L15 3 C18 0 23 0 26 3 C29 6 29 11 26 14 L16 24 C14 26 11 26 9 24 C7 22 7 19 9 17 L17 9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default PaperClip;
