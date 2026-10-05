import React from "react";

export function GuillocheWaveBand({
  className = "",
  color = "#5144E8",
  opacity = 0.055,
  strokeWidth = 1,
  style = {},
}) {
  return (
    <div
      className={`w-full h-3 overflow-hidden pointer-events-none select-none ${className}`}
      style={style}
      aria-hidden="true"
    >
      <svg className="w-full h-full" fill="none">
        <defs>
          <pattern
            id="hero-guilloche-wave"
            width="48"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 0 6 Q 12 0 24 6 T 48 6"
              stroke={color}
              strokeOpacity={opacity}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <path
              d="M 0 6 Q 12 12 24 6 T 48 6"
              stroke={color}
              strokeOpacity={opacity}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <path
              d="M 6 6 Q 18 1 30 6 T 54 6"
              stroke={color}
              strokeOpacity={opacity * 0.75}
              strokeWidth={strokeWidth * 0.8}
              fill="none"
            />
          </pattern>
        </defs>
        <rect width="100%" height="12" fill="url(#hero-guilloche-wave)" />
      </svg>
    </div>
  );
}

export default GuillocheWaveBand;
