import React from "react";

export function Guilloche({
  className = "",
  size = 280,
  style = {},
  color = "currentColor",
  strokeWidth = 1,
  opacity = 0.14,
}) {
  // Generates concentric geometric rosettes characteristic of security banknote/certificate printing
  const paths = [
    "M 140,20 C 206,20 260,74 260,140 C 260,206 206,260 140,260 C 74,260 20,206 20,140 C 20,74 74,20 140,20 Z",
    "M 140,40 C 195,40 240,85 240,140 C 240,195 195,240 140,240 C 85,240 40,195 40,140 C 40,85 85,40 140,40 Z",
    "M 140,60 C 184,60 220,96 220,140 C 220,184 184,220 140,220 C 96,220 60,184 60,140 C 60,96 96,60 140,60 Z",
    "M 140,80 C 173,80 200,107 200,140 C 200,173 173,200 140,200 C 107,200 80,173 80,140 C 80,107 107,80 140,80 Z",
    // 8-lobed spirograph harmonic curves
    "M 140 30 Q 185 85 240 140 Q 185 195 140 250 Q 95 195 40 140 Q 95 85 140 30 Z",
    "M 62 62 Q 140 95 218 62 Q 185 140 218 218 Q 140 185 62 218 Q 95 140 62 62 Z",
    "M 140 50 Q 165 95 230 140 Q 165 185 140 230 Q 115 185 50 140 Q 115 95 140 50 Z",
    "M 76 76 Q 140 105 204 76 Q 175 140 204 204 Q 140 175 76 204 Q 105 140 76 76 Z"
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 280 280"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={style}
    >
      <g stroke={color} strokeWidth={strokeWidth} strokeOpacity={opacity} fill="none">
        {paths.map((d, idx) => (
          <path key={idx} d={d} />
        ))}
      </g>
    </svg>
  );
}

export default Guilloche;
