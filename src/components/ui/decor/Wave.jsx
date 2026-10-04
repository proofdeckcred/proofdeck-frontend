import React from "react";

export function Wave({
  className = "",
  height = 48,
  fill = "currentColor",
  flip = false,
  style = {},
}) {
  return (
    <div
      className={`w-full overflow-hidden leading-none pointer-events-none select-none ${className}`}
      style={style}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className={`relative block w-full h-[${height}px]`}
        style={{
          height: `${height}px`,
          transform: flip ? "rotate(180deg)" : "none",
        }}
      >
        <path
          d="M0,0 C150,90 350,-40 500,50 C650,140 900,10 1200,40 L1200,120 L0,120 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

export default Wave;
