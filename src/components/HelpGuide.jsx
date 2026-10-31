// frontend/src/components/HelpGuide.jsx

import React, { useState } from "react";
import { 
  Info, 
  HelpCircle, 
  Settings2, 
  FileBadge, 
  UserPlus, 
  CheckCircle2, 
  QrCode, 
  Mail, 
  FileText,
  MousePointerClick
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";

const HelpGuide = ({ type = "certificates", title, steps = [] }) => {
  const [activeTab, setActiveTab] = useState("single");

  // Certificate Specific Stepper Data
  const certificateSteps = {
    single: [
      {
        title: "1. Select Single Mode",
        desc: "Choose 'Single Recipient' at the top of the form controls.",
        icon: Settings2,
        color: "text-indigo-600 bg-indigo-50"
      },
      {
        title: "2. Choose Template",
        desc: "Select a custom visual template or classic theme from the template dropdown.",
        icon: FileBadge,
        color: "text-violet-600 bg-violet-50"
      },
      {
        title: "3. Input Recipient Details",
        desc: "Enter the recipient's full name, email, course title, date of issue, and authorized signatory.",
        icon: UserPlus,
        color: "text-purple-600 bg-purple-50"
      },
      {
        title: "4. Review & Issue",
        desc: "Check the real-time WYSIWYG preview card on the right. If it looks correct, click 'Issue Certificate'.",
        icon: CheckCircle2,
        color: "text-emerald-600 bg-emerald-50"
      }
    ],
    bulk: [
      {
        title: "1. Select Bulk Mode",
        desc: "Toggle 'Bulk Import (CSV)' to switch form controls to file upload mode.",
        icon: Settings2,
        color: "text-indigo-600 bg-indigo-50"
      },
      {
        title: "2. Assign Batch Group",
        desc: "Select an existing folder/batch or create a new cohort name to group the credentials.",
        icon: FileText,
        color: "text-amber-600 bg-amber-50"
      },
      {
        title: "3. Upload Guest CSV List",
        desc: "Drag and drop your parsed CSV spreadsheet containing column fields matching your template.",
        icon: MousePointerClick,
        color: "text-violet-600 bg-violet-50"
      },
      {
        title: "4. Bulk Generate",
        desc: "Verify the parsed column table preview and click 'Generate Bulk Documents' to issue all at once.",
        icon: CheckCircle2,
        color: "text-emerald-600 bg-emerald-50"
      }
    ]
  };

  // Invitation Specific Stepper Data
  const invitationSteps = {
    single: [
      {
        title: "1. Choose Guest Mode",
        desc: "Select 'Single Guest' mode to input individual guest RSVP details.",
        icon: Settings2,
        color: "text-rose-600 bg-rose-50"
      },
      {
        title: "2. Choose Invitation Template",
        desc: "Select your custom visual invitation design from the visual dropdown selector.",
        icon: Mail,
        color: "text-pink-600 bg-pink-50"
      },
      {
        title: "3. Fill RSVP Details",
        desc: "Input guest name, contact email, event name, venue address, date, and start time.",
        icon: UserPlus,
        color: "text-fuchsia-600 bg-fuchsia-50"
      },
      {
        title: "4. Send Invitation",
        desc: "Verify live card rendering. Click 'Send Invitation' to dispatch a secure verification ticket.",
        icon: CheckCircle2,
        color: "text-emerald-600 bg-emerald-50"
      }
    ],
    bulk: [
      {
        title: "1. Choose Bulk Mode",
        desc: "Toggle 'Bulk Import (CSV)' at the top tab pill.",
        icon: Settings2,
        color: "text-rose-600 bg-rose-50"
      },
      {
        title: "2. Create Event Batch",
        desc: "Assign guests to a specific event batch or cohort folder for organized guest list monitoring.",
        icon: FileText,
        color: "text-amber-600 bg-amber-50"
      },
      {
        title: "3. Upload Guest CSV Sheet",
        desc: "Drop your CSV guest list file. Columns will automatically map to your invitation placeholders.",
        icon: MousePointerClick,
        color: "text-pink-600 bg-pink-50"
      },
      {
        title: "4. Dispatch Event Tickets",
        desc: "Preview the guest grid details and click 'Generate & Send Bulk Invitations' to mail all invitations.",
        icon: CheckCircle2,
        color: "text-emerald-600 bg-emerald-50"
      }
    ]
  };

  // Fallback Steps
  const fallbackSteps = steps.map((s, idx) => ({
    title: `Step ${idx + 1}`,
    desc: s,
    icon: Info,
    color: "text-indigo-600 bg-indigo-50"
  }));

  const isCert = type === "certificates";
  const activeSteps = isCert 
    ? (activeTab === "single" ? certificateSteps.single : certificateSteps.bulk)
    : type === "invitations"
    ? (activeTab === "single" ? invitationSteps.single : invitationSteps.bulk)
    : fallbackSteps;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-8 w-8 rounded-full border border-slate-200/50 shadow-xs cursor-pointer transition-all ${
            isCert 
              ? "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50" 
              : "text-rose-500 hover:text-rose-700 hover:bg-rose-50"
          }`}
        >
          <HelpCircle size={18} />
          <span className="sr-only">Help Guide</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto scrollbar-thin bg-slate-50 flex flex-col h-full border-l border-slate-200/80">
        
        {/* Banner Header */}
        <div className={`p-6 text-white shrink-0 bg-gradient-to-r ${
          isCert ? "from-indigo-600 to-violet-600" : "from-rose-500 to-pink-600"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-white/90" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/80">
              ProofDeck Assistant
            </span>
          </div>
          <SheetTitle className="text-xl font-bold text-white mb-1">
            {isCert ? "Certificate Issuance Guide" : "Event Invitation Guide"}
          </SheetTitle>
          <p className="text-[11px] text-white/80 leading-relaxed font-medium">
            {isCert 
              ? "Step-by-step instructions on designing templates, generating credentials, and distributing verifications."
              : "Learn how to design customized invitation cards, import guests, and dispatch check-in codes."
            }
          </p>
        </div>

        {/* Tab Controls for Steppers (Only show if not fallback) */}
        {type !== "fallback" && (
          <div className="px-6 pt-4 pb-2 bg-white border-b border-slate-100 flex gap-2 shrink-0">
            <button
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                activeTab === "single"
                  ? (isCert ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-rose-50 border-rose-200 text-rose-700")
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
              }`}
            >
              Single Mode
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                activeTab === "bulk"
                  ? (isCert ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-rose-50 border-rose-200 text-rose-700")
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
              }`}
            >
              Bulk Mode (CSV)
            </button>
          </div>
        )}

        {/* Timeline Stepper Body */}
        <div className="flex-grow p-6 bg-white space-y-6">
          <div className="relative pl-6 space-y-6 border-l-2 border-slate-100 ml-3.5">
            {activeSteps.map((step, idx) => {
              const IconComp = step.icon;
              return (
                <div key={idx} className="relative group">
                  {/* Timeline bullet icon */}
                  <span className={`absolute -left-[37px] top-0.5 flex items-center justify-center w-7 h-7 rounded-full border border-white shadow-xs transition-transform group-hover:scale-105 ${step.color}`}>
                    <IconComp size={13} />
                  </span>
                  
                  {/* Step text content */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-0.5">
                      {step.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pro Tip Highlight Callout */}
        <div className="p-6 bg-slate-50 border-t border-slate-150 shrink-0">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex gap-3">
            <QrCode className={isCert ? "text-indigo-600" : "text-rose-500"} size={20} />
            <div className="space-y-1">
              <h6 className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">
                {isCert ? "Hardened Verification" : "Digital Gate Check-In"}
              </h6>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                {isCert 
                  ? "Configuring dynamic QR codes inside visual templates automatically embeds a signed link to the secure verification ledger, allowing anyone to verify credential integrity."
                  : "Invitations automatically embed check-in QR codes containing unique security tokens. Gate staff can scan the QR tickets to verify and check in guests instantly."
                }
              </p>
            </div>
          </div>
        </div>

      </SheetContent>
    </Sheet>
  );
};

export default HelpGuide;
