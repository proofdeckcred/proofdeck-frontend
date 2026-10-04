import React from "react";

const TAG_TONES = {
  indigo: {
    bg: "bg-[#E9E7FD]",
    text: "text-[#5144E8]",
    border: "border-[#5144E8]/20",
    dot: "bg-[#5144E8]",
  },
  sky: {
    bg: "bg-[#DDF1FD]",
    text: "text-[#0A9AF5]",
    border: "border-[#0A9AF5]/20",
    dot: "bg-[#0A9AF5]",
  },
  sun: {
    bg: "bg-[#FEF8D6]",
    text: "text-[#713F12]",
    border: "border-[#E3CE5B]/40",
    dot: "bg-[#E3CE5B]",
  },
  orange: {
    bg: "bg-[#FFE3CC]",
    text: "text-[#C2410C]",
    border: "border-[#F97316]/20",
    dot: "bg-[#F97316]",
  },
  green: {
    bg: "bg-[#DDF5E6]",
    text: "text-[#15803D]",
    border: "border-[#16A34A]/20",
    dot: "bg-[#16A34A]",
  },
  ink: {
    bg: "bg-[#0B0B14]",
    text: "text-white",
    border: "border-white/10",
    dot: "bg-[#5144E8]",
  },
  paper: {
    bg: "bg-white",
    text: "text-[#6B6B7C]",
    border: "border-[#E7E5F0]",
    dot: "bg-[#5144E8]",
  },
};

export function Tag({
  children,
  tone = "paper",
  icon: Icon,
  dot = false,
  tilt = 0,
  size = "md",
  className = "",
  style = {},
}) {
  const toneConfig = TAG_TONES[tone] || TAG_TONES.paper;
  const tiltStyle = tilt !== 0 ? { transform: `rotate(${tilt}deg)`, ...style } : style;

  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2.5 py-0.5 gap-1.5"
      : "text-xs px-3.5 py-1 gap-2";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${toneConfig.bg} ${toneConfig.text} ${toneConfig.border} transition-colors ${className}`}
      style={tiltStyle}
    >
      {Icon && <Icon size={size === "sm" ? 12 : 14} weight="bold" className="shrink-0" />}
      {dot && !Icon && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${toneConfig.dot}`} />
      )}
      <span>{children}</span>
    </span>
  );
}

export default Tag;
