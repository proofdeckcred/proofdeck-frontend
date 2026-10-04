import React from "react";

export function Seal({
  className = "",
  size = 180,
  style = {},
  color = "currentColor",
  withCheck = true,
  opacity = 0.2,
}) {
  // 16-point scalloped star/rosette
  const points = 16;
  const outerR = 90;
  const innerR = 78;
  const cx = 100;
  const cy = 100;

  const d = Array.from({ length: points * 2 }).reduce((acc, _, i) => {
    const angle = (i * Math.PI) / points;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.sin(angle);
    const y = cy - r * Math.cos(angle);
    return `${acc} ${i === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`;
  }, "") + " Z";

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
      <g stroke={color} strokeOpacity={opacity} fill="none">
        {/* Scalloped perimeter */}
        <path d={d} strokeWidth="2" strokeLinejoin="round" />
        {/* Inner concentric ring */}
        <circle cx={cx} cy={cy} r="64" strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx={cx} cy={cy} r="54" strokeWidth="1" />
        {withCheck && (
          <path
            d="M 85 100 L 96 111 L 118 89"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </g>
    </svg>
  );
}

export default Seal;
