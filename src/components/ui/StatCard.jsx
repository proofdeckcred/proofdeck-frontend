import React from "react";

export default function StatCard({ label, value, helper }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs">
      <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
        {value}
      </div>
      <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-1">
        {label}
      </div>
      {helper && (
        <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-2">
          {helper}
        </div>
      )}
    </div>
  );
}
