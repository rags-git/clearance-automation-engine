import React from 'react';
import { CheckCircle2, XCircle, Clock, Lock, ShieldCheck, KeyRound, ArrowRight, GitFork } from 'lucide-react';

export const ClearancePipeline = ({ approvals = [] }) => {
  // Sort approvals by clearance gate
  const gate1 = approvals.filter((a) => a.clearance_gate === 1);
  const gate2 = approvals.filter((a) => a.clearance_gate === 2);
  const gate3 = approvals.filter((a) => a.clearance_gate === 3);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>APPROVED</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>REJECTED</span>
          </span>
        );
      case 'WAITING_PREREQUISITE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>GATE LOCKED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>PENDING REVIEW</span>
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
        className={`rounded-xl p-4 transition border shadow-xs ${
          isApproved
            ? 'bg-emerald-50/40 border-emerald-200'
            : isRejected
            ? 'bg-red-50/40 border-red-200'
            : isLocked
            ? 'bg-slate-50/70 border-slate-200 opacity-75'
            : 'bg-white border-amber-200 ring-1 ring-amber-100'
        }`}
      >
        <div className="flex justify-between items-start gap-2 mb-2">
          <div>
            <h4 className="font-semibold text-sm text-slate-900">{appr.department_name}</h4>
            <span className="text-[11px] font-mono text-slate-500 tracking-wider uppercase">
              Dept Code: {appr.department_code}
            </span>
          </div>
          {getStatusBadge(appr.status)}
        </div>

        {/* Remarks / Dues */}
        <div className="text-xs text-slate-600 mb-2">
          {appr.remarks ? (
            <p className="italic bg-white/70 p-2 rounded-lg border border-slate-200/60">{appr.remarks}</p>
          ) : isLocked ? (
            <p className="text-slate-400">Waiting for all prerequisite departments to approve first.</p>
          ) : (
            <p className="text-slate-400">Under verification by departmental officials.</p>
          )}
        </div>

        {/* Dues Alert in INR */}
        {appr.due_amount > 0 && (
          <div className="text-xs font-semibold text-red-600 bg-red-100/70 px-2.5 py-1.5 rounded-md mb-2 flex items-center justify-between">
            <span>Outstanding Dues:</span>
            <span className="font-bold">₹{Number(appr.due_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        )}

        {/* Signatory & Digital Signature */}
        {isApproved && (
          <div className="pt-2 border-t border-emerald-200/60 mt-2 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Signatory:</span>
              <span className="font-medium text-slate-700">{appr.staff_name || 'Department Officer'}</span>
            </div>
            {appr.digital_signature && (
              <div className="flex items-center space-x-1.5 bg-emerald-100/80 px-2 py-1 rounded text-[10px] font-mono text-emerald-800">
                <KeyRound className="w-3 h-3 text-emerald-700 shrink-0" />
                <span className="truncate">{appr.digital_signature}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 mb-6 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-base text-slate-900">Multi-Department Clearance Pipeline</h3>
            <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
              Chain of Responsibility (3 Gates)
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Gate 1 operates in parallel; Gate 2 and Gate 3 enforce strict dependency resolution.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {/* Gate 1: Parallel */}
        <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <span className="font-bold text-sm text-slate-800">Gate 1: Parallel Clearance</span>
            </div>
            <span className="text-[10px] font-semibold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Concurrent
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Library, Hostel, and Sports Complex can review and approve independently.
          </p>
          <div className="space-y-3">
            {gate1.map(renderDepartmentCard)}
          </div>
        </div>

        {/* Gate 2: Sequential Lab Gate */}
        <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <span className="font-bold text-sm text-slate-800">Gate 2: Department Labs</span>
            </div>
            <span className="text-[10px] font-semibold uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Sequential
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Requires all Gate 1 clearances (Library, Hostel, Sports) to be APPROVED.
          </p>
          <div className="space-y-3">
            {gate2.map(renderDepartmentCard)}
          </div>
        </div>

        {/* Gate 3: Final Accounts Gate */}
        <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <span className="font-bold text-sm text-slate-800">Gate 3: Final Accounts</span>
            </div>
            <span className="text-[10px] font-semibold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Final Sign-off
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Final financial verification and caution deposit settlement. Mints certificate upon approval.
          </p>
          <div className="space-y-3">
            {gate3.map(renderDepartmentCard)}
          </div>
        </div>
      </div>
    </div>
  );
};
