import React, { useState, useRef, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { transferQuota } from "../api";
import {
  Building2,
  User,
  ChevronDown,
  Check,
  ArrowRightLeft,
  ShieldCheck,
  PlusCircle,
  Coins,
  X,
  Loader2,
} from "lucide-react";

const WorkspaceSwitcher = ({ isCollapsed }) => {
  const { user, workspace, switchWorkspace, fetchUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState("");
  const [selectedTargetTenant, setSelectedTargetTenant] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ownedWorkspaces =
    user?.workspaces?.filter((ws) => ws.role?.toLowerCase() === "owner") || [];

  useEffect(() => {
    if (ownedWorkspaces.length > 0 && !selectedTargetTenant) {
      setSelectedTargetTenant(ownedWorkspaces[0].id);
    }
  }, [user, ownedWorkspaces, selectedTargetTenant]);

  if (!user) return null;

  const personalQuota = user.personal_cert_quota ?? user.cert_quota ?? 0;
  const activeWsObj =
    workspace === "personal"
      ? null
      : user.workspaces?.find((ws) => String(ws.id) === String(workspace));

  const isOwnerOfActiveTeam =
    workspace !== "personal" && activeWsObj?.role?.toLowerCase() === "owner";

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferError("");
    setTransferSuccess("");

    const amountNum = parseInt(transferAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      setTransferError("Please enter a valid transfer amount.");
      return;
    }

    if (amountNum > personalQuota) {
      setTransferError(`Cannot transfer more than your available personal balance (${personalQuota} credits).`);
      return;
    }

    if (!selectedTargetTenant) {
      setTransferError("Please select a target team workspace.");
      return;
    }

    setTransferring(true);
    try {
      const res = await transferQuota({
        tenant_id: selectedTargetTenant,
        amount: amountNum,
      });
      setTransferSuccess(res.data.msg || "Quota transferred successfully!");
      setTransferAmount("");
      if (fetchUser) await fetchUser();
      setTimeout(() => {
        setShowTransferModal(false);
        setTransferSuccess("");
      }, 1500);
    } catch (err) {
      setTransferError(
        err.response?.data?.msg || "Failed to transfer quota. Please try again."
      );
    } finally {
      setTransferring(false);
    }
  };

  const currentDisplayName =
    workspace === "personal"
      ? "Personal Workspace"
      : activeWsObj
      ? activeWsObj.name
      : user.company?.name || "Team Workspace";

  const currentCreditCount =
    workspace === "personal"
      ? personalQuota
      : activeWsObj?.cert_quota ?? user.cert_quota ?? 0;

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* --- SIDEBAR BUTTON TRIGGER --- */}
      {isCollapsed ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border shadow-2xs ${
            workspace === "personal"
              ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
              : "bg-slate-900 border-slate-800 text-white hover:bg-slate-800"
          }`}
          title={`Current: ${currentDisplayName}`}
        >
          {workspace === "personal" ? (
            <User size={18} />
          ) : (
            <Building2 size={18} />
          )}
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-100/80 transition-all text-left cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
                workspace === "personal"
                  ? "bg-indigo-650 text-white"
                  : "bg-slate-900 text-white"
              }`}
            >
              {workspace === "personal" ? (
                <User size={16} />
              ) : (
                <Building2 size={16} />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 truncate">
                  {currentDisplayName}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                {currentCreditCount} Credits Available
              </span>
            </div>
          </div>
          <ChevronDown
            size={14}
            className={`text-slate-400 group-hover:text-slate-600 transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {/* --- POPOVER DROPDOWN MENU --- */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-150 ${
            isCollapsed ? "left-12 top-0 w-64" : "left-0 right-0 w-full min-w-[240px]"
          }`}
        >
          {/* Header */}
          <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              Workspaces
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
              Active: {workspace === "personal" ? "Personal" : "Team"}
            </span>
          </div>

          <div className="p-1.5 space-y-1 max-h-64 overflow-y-auto">
            {/* Section 1: Personal Workspace */}
            <button
              onClick={() => {
                switchWorkspace("personal");
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer border ${
                workspace === "personal"
                  ? "bg-indigo-50/70 border-indigo-200/80 text-indigo-950"
                  : "bg-transparent border-transparent hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <User size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Personal Workspace</p>
                  <p className="text-[10px] text-slate-500">{personalQuota} credits</p>
                </div>
              </div>
              {workspace === "personal" && (
                <Check size={14} className="text-indigo-600 shrink-0" />
              )}
            </button>

            {/* Section 2: Team Workspaces */}
            {user.workspaces && user.workspaces.length > 0 && (
              <div className="pt-1 border-t border-slate-100">
                <p className="px-2 py-1 text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Team Workspaces
                </p>
                {user.workspaces.map((ws) => {
                  const isSelected = String(workspace) === String(ws.id);
                  const isOwner = ws.role?.toLowerCase() === "owner";
                  return (
                    <button
                      key={ws.id}
                      onClick={() => {
                        switchWorkspace(String(ws.id));
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer border mt-0.5 ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-transparent border-transparent hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-white/10 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <Building2 size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold truncate">{ws.name}</p>
                            <span
                              className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : isOwner
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {ws.role}
                            </span>
                          </div>
                          <p
                            className={`text-[10px] ${
                              isSelected ? "text-slate-300" : "text-slate-500"
                            }`}
                          >
                            {ws.cert_quota ?? 0} credits
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check size={14} className="text-white shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Quota Transfer Actions */}
          {ownedWorkspaces.length > 0 && (
            <div className="p-1.5 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowTransferModal(true);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 border border-indigo-100/80 transition-colors cursor-pointer"
              >
                <ArrowRightLeft size={13} />
                <span>Transfer Personal Quota</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- QUOTA TRANSFER MODAL --- */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setShowTransferModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Coins size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Transfer Quota to Team
                </h3>
                <p className="text-xs text-slate-500">
                  Move unused credits from Personal to Team Workspace
                </p>
              </div>
            </div>

            {transferError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-100">
                {transferError}
              </div>
            )}

            {transferSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                {transferSuccess}
              </div>
            )}

            <form onSubmit={handleTransfer} className="space-y-4">
              {/* Personal Balance Display */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Available Personal Quota
                  </p>
                  <p className="text-lg font-black text-slate-800">
                    {personalQuota} Credits
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold">
                  Personal
                </div>
              </div>

              {/* Target Workspace Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target Team Workspace
                </label>
                <select
                  value={selectedTargetTenant}
                  onChange={(e) => setSelectedTargetTenant(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-800 py-2.5 px-3 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {ownedWorkspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name} (Current: {ws.cert_quota ?? 0} credits)
                    </option>
                  ))}
                </select>
              </div>

              {/* Transfer Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Credits to Transfer
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={personalQuota}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-800 py-2.5 px-3 rounded-xl focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setTransferAmount(String(personalQuota))}
                    className="absolute right-2.5 top-2 text-[10px] font-extrabold uppercase px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                  >
                    Max
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-[11px] text-amber-800 leading-snug">
                <span className="font-bold">Note:</span> Only workspace owners can transfer quota. Quota transferred to Team Workspaces cannot be moved back to Personal accounts.
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferring || personalQuota === 0}
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-650 text-white font-bold text-xs hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {transferring ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Transferring...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft size={14} />
                      <span>Confirm Transfer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
