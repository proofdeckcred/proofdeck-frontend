import React from "react";
import { Check } from "@phosphor-icons/react";

const TONE_BG = {
  indigo: "bg-[#5144E8] text-white",
  sky: "bg-[#0A9AF5] text-white",
  green: "bg-[#16A34A] text-white",
  orange: "bg-[#F97316] text-white",
  sun: "bg-[#FDEC8C] text-[#0B0B14]",
  ink: "bg-[#0B0B14] text-white",
};

export function CheckBadge({
  tone = "indigo",
  size = 20,
  className = "",
  style = {},
}) {
  const toneClasses = TONE_BG[tone] || TONE_BG.indigo;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full shrink-0 ${toneClasses} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        ...style,
      }}
      aria-hidden="true"
    >
      <Check size={size <= 20 ? 11 : 13} weight="bold" />
    </div>
  );
}

export default CheckBadge;
