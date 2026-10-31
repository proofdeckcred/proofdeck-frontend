import React, { useState, useRef, useEffect } from "react";
import { DotsThreeVertical } from "@phosphor-icons/react";

export default function KebabMenu({ items = [], align = "right" }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        aria-label="Actions"
      >
        <DotsThreeVertical size={18} weight="bold" />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1 w-44 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-lg py-1 text-xs font-medium text-slate-700 dark:text-zinc-200 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={index}
                  className="my-1 border-t border-slate-100 dark:border-zinc-800"
                />
              );
            }
            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (item.onClick) item.onClick();
                }}
                className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800/70 transition-colors ${
                  item.danger
                    ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    : ""
                }`}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
