import React from "react";

export default function AppButton({
  children,
  variant = "secondary", // primary | secondary | danger | ghost
  size = "md", // sm | md | lg
  type = "button",
  onClick,
  disabled = false,
  className = "",
  icon,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center font-medium transition-colors rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-3.5 py-2 text-sm gap-2",
    lg: "px-4.5 py-2.5 text-base gap-2.5",
  };

  const variantClasses = {
    primary:
      "bg-[#5144E8] hover:bg-[#4336D0] text-white shadow-2xs border border-transparent font-semibold",
    secondary:
      "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:border-slate-300 shadow-2xs",
    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-2xs border border-transparent font-semibold",
    ghost:
      "bg-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.secondary
      } ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
