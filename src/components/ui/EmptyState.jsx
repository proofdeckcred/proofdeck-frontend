import React from "react";

export default function EmptyState({ message, action }) {
  return (
    <div className="py-12 px-4 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/50">
      <p className="text-sm text-slate-500 dark:text-zinc-400 mb-4">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
