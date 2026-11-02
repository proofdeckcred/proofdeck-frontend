import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CaretLeft,
  CaretRight,
  Check,
  Sparkle
} from "@phosphor-icons/react";
import { useTour } from "../context/TourContext";
import { useTheme } from "../context/ThemeContext";

const PADDING = 8;
const POPOVER_MARGIN = 14;

export default function ProductTour() {
  const {
    isActive,
    steps,
    pageName,
    currentStepIndex,
    currentStep,
    stopTour,
    nextStep,
    prevStep,
    goToStep,
  } = useTour();

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [targetRect, setTargetRect] = useState(null);
  const [popoverStyle, setPopoverStyle] = useState({ top: 0, left: 0, opacity: 0 });
  const popoverRef = useRef(null);

  const updatePositions = useCallback(() => {
    if (!isActive || !currentStep) return;

    const el = currentStep.target ? document.querySelector(currentStep.target) : null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (!el) {
      setTargetRect(null);
      const cardW = Math.min(360, vw - 24);
      const cardH = popoverRef.current?.offsetHeight || 200;
      setPopoverStyle({
        top: Math.max(16, (vh - cardH) / 2),
        left: Math.max(12, (vw - cardW) / 2),
        opacity: 1,
      });
      return;
    }

    const rawRect = el.getBoundingClientRect();
    // Clamp highlight rect to reasonable viewport bounds if the element is huge (e.g. long table/grid)
    const clampedTop = Math.max(8, rawRect.top - PADDING);
    const clampedBottom = Math.min(vh - 8, rawRect.bottom + PADDING);
    const clampedLeft = Math.max(8, rawRect.left - PADDING);
    const clampedRight = Math.min(vw - 8, rawRect.right + PADDING);

    const rect = {
      top: clampedTop,
      left: clampedLeft,
      width: Math.max(24, clampedRight - clampedLeft),
      height: Math.max(24, clampedBottom - clampedTop),
      bottom: clampedBottom,
      right: clampedRight,
    };

    setTargetRect(rect);

    const cardW = Math.min(360, vw - 24);
    const cardH = popoverRef.current?.offsetHeight || 205;

    const spaceBottom = vh - rect.bottom;
    const spaceTop = rect.top;
    const spaceRight = vw - rect.right;
    const spaceLeft = rect.left;

    let top = 0;
    let left = 0;

    if (spaceBottom >= cardH + POPOVER_MARGIN + 12) {
      // Place below target
      top = rect.bottom + POPOVER_MARGIN;
      left = rect.left + rect.width / 2 - cardW / 2;
    } else if (spaceTop >= cardH + POPOVER_MARGIN + 12) {
      // Place above target
      top = rect.top - cardH - POPOVER_MARGIN;
      left = rect.left + rect.width / 2 - cardW / 2;
    } else if (spaceRight >= cardW + POPOVER_MARGIN + 12) {
      // Place to the right of target
      top = Math.max(16, rect.top + Math.min(40, rect.height / 4));
      left = rect.right + POPOVER_MARGIN;
    } else if (spaceLeft >= cardW + POPOVER_MARGIN + 12) {
      // Place to the left of target
      top = Math.max(16, rect.top + Math.min(40, rect.height / 4));
      left = rect.left - cardW - POPOVER_MARGIN;
    } else {
      // Fallback: place in the most visible corner/bottom area
      top = Math.max(16, vh - cardH - 20);
      left = (vw - cardW) / 2;
    }

    // Clamp strictly within viewport
    left = Math.max(12, Math.min(left, vw - cardW - 12));
    top = Math.max(12, Math.min(top, vh - cardH - 12));

    setPopoverStyle({ top, left, opacity: 1 });
  }, [isActive, currentStep]);

  // Scroll target into view when step changes
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const el = currentStep.target ? document.querySelector(currentStep.target) : null;
    if (el) {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const isOffscreen = r.top < 64 || r.bottom > vh - 60;
      if (isOffscreen) {
        el.scrollIntoView({
          behavior: "smooth",
          block: r.height > vh * 0.65 ? "start" : "center",
          inline: "nearest",
        });
      }
    }

    updatePositions();
    const t1 = setTimeout(updatePositions, 120);
    const t2 = setTimeout(updatePositions, 350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isActive, currentStepIndex, currentStep, updatePositions]);

  // Reposition on window resize or any scroll inside the dashboard
  useEffect(() => {
    if (!isActive) return;

    const handleUpdate = () => {
      requestAnimationFrame(updatePositions);
    };

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [isActive, updatePositions]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        stopTour(true);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextStep();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, stopTour, nextStep, prevStep]);

  if (!isActive || !currentStep || typeof document === "undefined") {
    return null;
  }

  const isLastStep = currentStepIndex === steps.length - 1;

  return createPortal(
    <div
      data-theme-ignore="true"
      className="fixed inset-0 z-[9998] pointer-events-none select-none font-sans"
      aria-live="polite"
    >
      {/* SVG Spotlight Mask Backdrop */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-auto"
        onClick={() => stopTour(true)}
      >
        <defs>
          <mask id="pd-tour-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="12"
                ry="12"
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={isDark ? "rgba(9, 9, 11, 0.72)" : "rgba(15, 23, 42, 0.52)"}
          mask="url(#pd-tour-spotlight-mask)"
        />
      </svg>

      {/* Glowing Highlight Frame Around Target */}
      {targetRect && (
        <div
          style={{
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
          }}
          className="fixed rounded-xl border-2 border-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.22)] transition-all duration-300 ease-out pointer-events-none z-[9999]"
        />
      )}

      {/* Tour Tooltip Card */}
      <div
        ref={popoverRef}
        style={{
          top: `${popoverStyle.top}px`,
          left: `${popoverStyle.left}px`,
          opacity: popoverStyle.opacity,
          backgroundColor: isDark ? "#18181b" : "#ffffff",
          borderColor: isDark ? "#2b2b31" : "#e2e8f0",
          color: isDark ? "#f4f4f5" : "#0f172a",
        }}
        onClick={(e) => e.stopPropagation()}
        className="fixed z-[10000] w-[340px] sm:w-[360px] max-w-[calc(100vw-24px)] rounded-2xl border shadow-2xl p-4 sm:p-5 transition-all duration-200 ease-out pointer-events-auto"
      >
        {/* Top Row: Badge + Step Counter + Close */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span
              style={{
                backgroundColor: isDark ? "rgba(99, 102, 241, 0.18)" : "#eef2ff",
                color: isDark ? "#a5b4fc" : "#4f46e5",
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            >
              <Sparkle size={11} weight="fill" />
              <span>{pageName || "Page Tour"}</span>
            </span>
            <span
              style={{ color: isDark ? "#a1a1aa" : "#64748b" }}
              className="text-[11px] font-bold"
            >
              {currentStepIndex + 1} of {steps.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => stopTour(true)}
            style={{ color: isDark ? "#a1a1aa" : "#94a3b8" }}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close tour"
            title="Skip tour (Esc)"
          >
            <X size={15} weight="bold" />
          </button>
        </div>

        {/* Step Title & Actionable Description */}
        <h4
          style={{ color: isDark ? "#ffffff" : "#0f172a" }}
          className="text-sm font-extrabold tracking-tight mb-1.5"
        >
          {currentStep.title}
        </h4>
        <p
          style={{ color: isDark ? "#d4d4d8" : "#475569" }}
          className="text-xs leading-relaxed font-medium mb-4"
        >
          {currentStep.description}
        </p>

        {/* Bottom Controls: Step Dots + Back / Skip / Next */}
        <div
          style={{ borderColor: isDark ? "#27272a" : "#f1f5f9" }}
          className="pt-3 border-t flex items-center justify-between gap-2"
        >
          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((s, idx) => {
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={s.id || idx}
                  type="button"
                  onClick={() => goToStep(idx)}
                  aria-label={`Go to step ${idx + 1}`}
                  style={{
                    backgroundColor: isCurrent
                      ? "#4f46e5"
                      : isDark
                      ? "#3f3f46"
                      : "#cbd5e1",
                    width: isCurrent ? "18px" : "6px",
                  }}
                  className="h-1.5 rounded-full transition-all duration-200 cursor-pointer"
                />
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {currentStepIndex === 0 ? (
              <button
                type="button"
                onClick={() => stopTour(true)}
                style={{ color: isDark ? "#a1a1aa" : "#64748b" }}
                className="px-2.5 py-1.5 text-xs font-semibold hover:underline cursor-pointer"
              >
                Skip
              </button>
            ) : (
              <button
                type="button"
                onClick={prevStep}
                style={{
                  backgroundColor: isDark ? "#27272a" : "#f8fafc",
                  borderColor: isDark ? "#3f3f46" : "#e2e8f0",
                  color: isDark ? "#e4e4e7" : "#334155",
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer"
              >
                <CaretLeft size={12} weight="bold" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={nextStep}
              style={{
                backgroundColor: "#4f46e5",
                color: "#ffffff",
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-95 shadow-xs transition-all cursor-pointer"
            >
              <span>{isLastStep ? "Done" : "Next"}</span>
              {isLastStep ? (
                <Check size={12} weight="bold" />
              ) : (
                <CaretRight size={12} weight="bold" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
