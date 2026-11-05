import React from 'react';
import { CheckCircle2, XCircle, Clock, Lock, ShieldCheck, KeyRound, ArrowRight, GitBranch } from 'lucide-react';

export const ClearancePipeline = ({ approvals = [] }) => {
  const gate1 = approvals.filter((a) => a.clearance_gate === 1);
  const gate2 = approvals.filter((a) => a.clearance_gate === 2);
  const gate3 = approvals.filter((a) => a.clearance_gate === 3);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-mono-code font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-ping" />
            <span>CLEARED</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-mono-code font-bold bg-rose-500/20 text-rose-300 border border-rose-400/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>DISPUTED</span>
          </span>
        );
      case 'WAITING_PREREQUISITE':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-mono-code font-medium bg-zinc-800/90 text-zinc-400 border border-zinc-700">
            <Lock className="w-3 h-3 text-zinc-400" />
            <span>LOCKED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-mono-code font-medium bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
            <Clock className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>IN QUEUE</span>
          </span>
        );
    }
  };

  const renderDepartmentCard = (appr) => {
    const isApproved = appr.status === 'APPROVED';
    const isRejected = appr.status === 'REJECTED';
    const isLocked = appr.status === 'WAITING_PREREQUISITE';

    return (
      <div
        key={appr.id}
        className={`group relative rounded-xl p-4 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl border ${
          isApproved
            ? 'bg-gradient-to-br from-emerald-950/30 to-emerald-900/10 border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_20px_-3px_rgba(16,185,129,0.18)]'
            : isRejected
            ? 'bg-gradient-to-br from-rose-950/35 to-rose-900/15 border-rose-500/50 hover:border-rose-400 shadow-[0_0_20px_-3px_rgba(244,63,94,0.22)]'
            : isLocked
            ? 'bg-black/40 border-white/[0.06] opacity-60'
            : 'bg-gradient-to-br from-zinc-900/80 to-amber-950/20 border-amber-500/40 hover:border-amber-400 shadow-[0_0_20px_-3px_rgba(245,158,11,0.15)]'
        }`}
      >
        <div className="flex justify-between items-start gap-2 mb-2">
          <div>
            <h4 className="font-bold text-xs text-zinc-100 group-hover:text-white transition">{appr.department_name}</h4>
            <span className="text-[10px] font-mono-code text-zinc-400 tracking-wider">
              {appr.department_code}
            </span>
          </div>
          {getStatusBadge(appr.status)}
        </div>

        {/* Remarks / Dues */}
        <div className="text-[11px] text-zinc-400 mb-2">
          {appr.remarks ? (
            <p className="bg-black/40 p-2 rounded-lg border border-white/[0.05] font-mono-code text-[11px] text-zinc-300">
              "{appr.remarks}"
            </p>
          ) : isLocked ? (
            <p className="text-zinc-500 italic">Waiting for prerequisite gates to clear.</p>
          ) : (
            <p className="text-zinc-500 italic">Under review by assigned departmental desk.</p>
          )}
        </div>

        {/* Dues Alert in INR */}
        {appr.due_amount > 0 && (
          <div className="text-xs font-mono-code font-bold text-rose-300 bg-rose-950/50 border border-rose-500/30 px-2.5 py-1.5 rounded-lg mb-2 flex items-center justify-between">
            <span className="text-rose-400 text-[10px] uppercase">Pending Dues:</span>
            <span>₹{Number(appr.due_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        )}

        {/* Signatory & Digital Signature */}
        {isApproved && (
          <div className="pt-2 border-t border-emerald-500/20 mt-2 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono-code text-zinc-400">
              <span>OFFICER:</span>
              <span className="text-zinc-300">{appr.staff_name || 'Department Officer'}</span>
            </div>
            {appr.digital_signature && (
              <div className="flex items-center space-x-1.5 bg-black/60 px-2 py-1 rounded border border-emerald-500/20 text-[10px] font-mono-code text-emerald-400">
                <KeyRound className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{appr.digital_signature}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glow-card rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/[0.06] mb-6 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-rose-400" />
            <h3 className="font-semibold text-sm text-zinc-100 tracking-wide font-mono-code">
              MULTI-GATE PIPELINE // CoR PATTERN
            </h3>
            <span className="text-[10px] font-mono-code bg-white/[0.05] text-zinc-400 px-2 py-0.5 rounded border border-white/[0.08]">
              3 GATES
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Gate 1 concurrent validation; Gates 2 & 3 resolve sequentially upon cryptographic sign-off.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative">
        {/* Gate 1: Parallel */}
        <div className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono-code text-xs font-bold flex items-center justify-center">
                01
              </span>
              <span className="font-semibold text-xs text-zinc-200">Parallel Desks</span>
            </div>
            <span className="text-[9px] font-mono-code uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              CONCURRENT
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Dr. B.R. Ambedkar Library, Hostels, and Gymkhana verify records concurrently.
          </p>
          <div className="space-y-2.5">
            {gate1.map(renderDepartmentCard)}
          </div>
        </div>

        {/* Gate 2: Sequential Lab Gate */}
        <div className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono-code text-xs font-bold flex items-center justify-center">
                02
              </span>
              <span className="font-semibold text-xs text-zinc-200">Department Labs</span>
            </div>
            <span className="text-[9px] font-mono-code uppercase text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700/50">
              SEQUENTIAL
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Prerequisite: Requires all Gate 1 clearances to be officially approved first.
          </p>
          <div className="space-y-2.5">
            {gate2.map(renderDepartmentCard)}
          </div>
        </div>

        {/* Gate 3: Final Accounts Gate */}
        <div className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono-code text-xs font-bold flex items-center justify-center">
                03
              </span>
              <span className="font-semibold text-xs text-zinc-200">Accounts & Caution Money</span>
            </div>
            <span className="text-[9px] font-mono-code uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              FINAL SEAL
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Final security deposit settlement. Upon approval, mints official clearance credential.
          </p>
          <div className="space-y-2.5">
            {gate3.map(renderDepartmentCard)}
          </div>
        </div>
      </div>
    </div>
  );
};
