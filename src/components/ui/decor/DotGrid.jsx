import React, { useId } from "react";

export function DotGrid({
  className = "",
  width = "100%",
  height = "100%",
  dotSize = 1.5,
  gap = 20,
  style = {},
  color = "currentColor",
  opacity = 0.4,
}) {
  const patternId = useId();

  return (
    <svg
      width={width}
      height={height}
      className={`pointer-events-none select-none ${className}`}
      style={style}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width={gap}
          height={gap}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={dotSize} cy={dotSize} r={dotSize} fill={color} fillOpacity={opacity} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

export default DotGrid;
