import React from "react";

export function QrFragment({
  className = "",
  size = 180,
  style = {},
  color = "currentColor",
  opacity = 0.16,
}) {
  // Deterministic 8x8 QR-like grid with finder-like corner
  const cells = [
    // Top-left finder pattern 3x3
    [0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2],
    // QR data bits
    [0, 4], [0, 6], [1, 5], [1, 7],
    [3, 0], [3, 2], [3, 4], [3, 6],
    [4, 1], [4, 3], [4, 5], [4, 7],
    [5, 0], [5, 2], [5, 4],
    [6, 1], [6, 3], [6, 6],
    [7, 0], [7, 2], [7, 5], [7, 7],
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={style}
    >
      <g fill={color} fillOpacity={opacity}>
        {cells.map(([r, c], i) => (
          <rect key={i} x={c * 20} y={r * 20} width={18} height={18} rx={3} />
        ))}
      </g>
    </svg>
  );
}

export default QrFragment;
