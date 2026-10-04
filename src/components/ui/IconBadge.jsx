import React from "react";

const SIZE_MAP = {
  sm: {
    box: "w-7 h-7 min-w-[28px]",
    icon: 14,
    rounded: "rounded-lg",
  },
  md: {
    box: "w-10 h-10 min-w-[40px]",
    icon: 20,
    rounded: "rounded-xl",
  },
  lg: {
    box: "w-12 h-12 min-w-[48px]",
    icon: 26,
    rounded: "rounded-2xl",
  },
  xl: {
    box: "w-16 h-16 min-w-[64px]",
    icon: 34,
    rounded: "rounded-[22px]",
  },
};

const TONE_CLASSES = {
  indigo: {
    bg: "bg-[#5144E8]",
    text: "text-white",
    innerRing: "ring-2 ring-inset ring-[#3B2FC9]/25",
  },
  sky: {
    bg: "bg-[#0A9AF5]",
    text: "text-white",
    innerRing: "ring-2 ring-inset ring-[#0880CC]/25",
  },
  sun: {
    bg: "bg-[#FDEC8C]",
    text: "text-[#0B0B14]",
    innerRing: "ring-2 ring-inset ring-[#E3CE5B]/35",
  },
  orange: {
    bg: "bg-[#F97316]",
    text: "text-white",
    innerRing: "ring-2 ring-inset ring-[#D95D08]/25",
  },
  green: {
    bg: "bg-[#16A34A]",
    text: "text-white",
    innerRing: "ring-2 ring-inset ring-[#12823B]/25",
  },
  ink: {
    bg: "bg-[#0B0B14]",
    text: "text-white",
    innerRing: "ring-2 ring-inset ring-white/10",
  },
  "indigo-tint": {
    bg: "bg-[#E9E7FD]",
    text: "text-[#5144E8]",
    innerRing: "ring-2 ring-inset ring-[#5144E8]/15",
  },
  "sky-tint": {
    bg: "bg-[#DDF1FD]",
    text: "text-[#0A9AF5]",
    innerRing: "ring-2 ring-inset ring-[#0A9AF5]/15",
  },
  "sun-tint": {
    bg: "bg-[#FEF8D6]",
    text: "text-[#713F12]",
    innerRing: "ring-2 ring-inset ring-[#E3CE5B]/25",
  },
  "orange-tint": {
    bg: "bg-[#FFE3CC]",
    text: "text-[#F97316]",
    innerRing: "ring-2 ring-inset ring-[#F97316]/15",
  },
  "green-tint": {
    bg: "bg-[#DDF5E6]",
    text: "text-[#16A34A]",
    innerRing: "ring-2 ring-inset ring-[#16A34A]/15",
  },
  white: {
    bg: "bg-white",
    text: "text-[#0B0B14]",
    innerRing: "ring-1 ring-inset ring-black/5",
  },
  paper: {
    bg: "bg-[#F7F7F8]",
    text: "text-[#0B0B14]",
    innerRing: "ring-1 ring-inset ring-black/5",
  },
};

export function IconBadge({
  icon: Icon,
  children,
  tone = "indigo",
  size = "md",
  shape = "squircle",
  tilt = 0,
  innerRing = true,
  weight = "duotone",
  className = "",
  style = {},
  ariaLabel,
}) {
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const toneConfig = TONE_CLASSES[tone] || TONE_CLASSES.indigo;
  const shapeClass = shape === "circle" ? "rounded-full" : sizeConfig.rounded;

  const tiltStyle = tilt !== 0 ? { transform: `rotate(${tilt}deg)`, ...style } : style;

  const renderIcon = () => {
    const target = children || Icon;
    if (!target) return null;
    if (React.isValidElement(target)) {
      return React.cloneElement(target, {
        size: target.props.size || sizeConfig.icon,
        weight: target.props.weight || weight,
        className: `${target.props.className || ""} shrink-0`.trim(),
      });
    }
    if (typeof target === "function" || typeof target === "object") {
      const TargetComponent = target;
      return <TargetComponent size={sizeConfig.icon} weight={weight} className="shrink-0" />;
    }
    return target;
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 transition-transform ${sizeConfig.box} ${shapeClass} ${toneConfig.bg} ${toneConfig.text} ${innerRing ? toneConfig.innerRing : ""} ${className}`}
      style={tiltStyle}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      aria-hidden={!ariaLabel}
    >
      {renderIcon()}
    </div>
  );
}

export default IconBadge;
