import React from "react";

export default function AppTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex items-center gap-1 border-b border-slate-200 dark:border-zinc-800 mb-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`pb-2.5 px-3 text-sm font-medium transition-colors relative cursor-pointer ${
              isActive
                ? "text-slate-900 dark:text-zinc-100 font-semibold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5144E8]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
