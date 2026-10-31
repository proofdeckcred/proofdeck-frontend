import React from "react";
import { Link } from "react-router-dom";
import { CaretLeft } from "@phosphor-icons/react";

export default function PageHeader({ title, backTo, backLabel, action, secondaryAction }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3">
        {backTo && (
          <Link
            to={backTo}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title={backLabel || "Back"}
          >
            <CaretLeft size={20} weight="bold" />
          </Link>
        )}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
          {title}
        </h1>
      </div>

      {(action || secondaryAction) && (
        <div className="flex items-center gap-2.5">
          {secondaryAction}
          {action}
        </div>
      )}
    </div>
  );
}
