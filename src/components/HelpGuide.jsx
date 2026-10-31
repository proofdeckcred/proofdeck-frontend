import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";

const CERTIFICATE_STEPS = {
  single: [
    { title: "Choose a template", desc: "Select a certificate template from the dropdown." },
    { title: "Enter recipient details", desc: "Fill in the recipient's name, email, course title, and issue date." },
    { title: "Review and issue", desc: "Check the preview on the right, then click Issue certificate." },
  ],
  bulk: [
    { title: "Select template", desc: "Pick the template for this issuance group." },
    { title: "Add recipients", desc: "Upload a CSV or Excel file, or enter recipient rows manually." },
    { title: "Review and issue", desc: "Check the summary and preview, then issue all certificates." },
  ],
};

export default function HelpGuide({ type = "certificates" }) {
  const [activeTab, setActiveTab] = useState("single");
  const steps = activeTab === "single" ? CERTIFICATE_STEPS.single : CERTIFICATE_STEPS.bulk;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          title="Guide"
        >
          <HelpCircle size={15} />
          <span className="sr-only">Guide</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-sm p-6 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full">
        <SheetHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <SheetTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Issuance guide
          </SheetTitle>
        </SheetHeader>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 my-4 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("single")}
            className={`pb-2 text-xs font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === "single"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Single issuance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bulk")}
            className={`pb-2 text-xs font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === "bulk"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Bulk issuance
          </button>
        </div>

        {/* Steps list */}
        <div className="space-y-4 pt-2 flex-1 overflow-y-auto">
          {steps.map((s, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {s.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
