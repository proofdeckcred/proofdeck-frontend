import React from "react";

export function Perforation({
  className = "",
  orientation = "horizontal",
  length = "100%",
  color = "currentColor",
  opacity = 0.35,
  style = {},
}) {
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      className={`pointer-events-none select-none relative flex items-center justify-center ${className}`}
      style={style}
      aria-hidden="true"
    >
      {isHorizontal ? (
        <svg
          width={length}
          height="12"
          viewBox="0 0 400 12"
          preserveAspectRatio="none"
          fill="none"
          className="w-full h-3 overflow-visible"
        >
          <line
            x1="0"
            y1="6"
            x2="400"
            y2="6"
            stroke={color}
            strokeOpacity={opacity}
            strokeWidth="1.5"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg
          width="12"
          height={length}
          viewBox="0 0 12 400"
          preserveAspectRatio="none"
          fill="none"
          className="h-full w-3 overflow-visible"
        >
          <line
            x1="6"
            y1="0"
            x2="6"
            y2="400"
            stroke={color}
            strokeOpacity={opacity}
            strokeWidth="1.5"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}

export default Perforation;
