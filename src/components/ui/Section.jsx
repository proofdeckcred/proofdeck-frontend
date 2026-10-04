import React from "react";

const RADIUS_MAP = {
  none: "",
  md: "rounded-2xl",
  lg: "rounded-3xl",
  xl: "rounded-[32px]",
  "2xl": "rounded-[40px]",
};

export function Section({
  as: Component = "section",
  tone = "paper",
  decor,
  radius = "none",
  overflowHidden = true,
  className = "",
  containerClassName = "",
  style = {},
  children,
  id,
  ...props
}) {
  const radiusClass = RADIUS_MAP[radius] || "";
  const overflowClass = overflowHidden ? "overflow-hidden" : "";

  return (
    <Component
      id={id}
      data-tone={tone}
      className={`relative ${radiusClass} ${overflowClass} ${className}`}
      style={style}
      {...props}
    >
      {/* Decorative ambient background elements */}
      {decor && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
          aria-hidden="true"
        >
          {decor}
        </div>
      )}

      {/* Foreground Content */}
      <div className={`relative z-10 ${containerClassName}`}>{children}</div>
    </Component>
  );
}

export default Section;
