import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  KeyRound,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';

export const StaffDashboard = ({ user }) => {
  const [approvals, setApprovals] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected approval for decision modal
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [decisionType, setDecisionType] = useState('APPROVED');
  const [remarks, setRemarks] = useState('');
  const [dueAmount, setDueAmount] = useState('0.00');
  const [processing, setProcessing] = useState(false);

  // Selected grievance for response modal
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [staffResponse, setStaffResponse] = useState('');
  const [resolvingGrievance, setResolvingGrievance] = useState(false);

  const loadData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [apprData, griData] = await Promise.all([
        api.getStaffQueue(),
        api.getGrievanceQueue(),
      ]);
      setApprovals(apprData);
      setGrievances(griData);
    } catch (err) {
      console.error('Failed to load staff queue', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => loadData(false), 8000); // Live sync every 8s
    const handleFocus = () => loadData(false);
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApproval) return;
    setProcessing(true);

    try {
      await api.makeStaffDecision(selectedApproval.id, {
        decision: decisionType,
        remarks: remarks || (decisionType === 'APPROVED' ? 'Cleared with no pending dues.' : 'Clearance blocked due to pending liability.'),
        due_amount: parseFloat(dueAmount) || 0.0,
      });
      setSelectedApproval(null);
      setRemarks('');
      setDueAmount('0.00');
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleGrievanceResolve = async (e) => {
    e.preventDefault();
    if (!selectedGrievance) return;
    setResolvingGrievance(true);

    try {
      await api.resolveGrievance(selectedGrievance.id, {
        staff_response: staffResponse,
        status: 'RESOLVED',
      });
      setSelectedGrievance(null);
      setStaffResponse('');
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setResolvingGrievance(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const lockedApprovals = approvals.filter((a) => a.status === 'WAITING_PREREQUISITE');

  return (
    <div className="space-y-8">
      {/* Staff Header - Dark Living System Theme */}
      <div className="glow-card rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="inline-flex items-center space-x-2 bg-white/[0.04] px-3 py-1 rounded-full text-xs font-mono-code text-amber-300 mb-3 border border-white/[0.08]">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>DEPARTMENT DESK // VERIFICATION TERMINAL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono-code">
          {user.full_name.toLowerCase()}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          Punjab Engineering College: Department clearance review console. Verify equipment returns, assess liability dues, and sign clearance records with HMAC-SHA256 seals.
        </p>
      </div>

      {/* Pending Approvals Table */}
      <div className="glow-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.06] gap-2">
          <div>
            <h3 className="font-semibold text-sm text-zinc-100 font-mono-code">
              ACTIVE QUEUE // AWAITING SIGNATURE
            </h3>
            <p className="text-xs text-zinc-400">Student requests ready for departmental review & digital signing.</p>
          </div>
          <span className="text-[10px] font-mono-code font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            {pendingApprovals.length} IN FLIGHT
          </span>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs font-mono-code">
            // QUEUE EMPTY. ALL PENDING SUBMISSIONS CLEARED.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-code">
              <thead className="bg-white/[0.02] text-zinc-500 uppercase tracking-wider text-[10px] border-y border-white/[0.06]">
                <tr>
                  <th className="py-3 px-4">Request Ref</th>
                  <th className="py-3 px-4">Department Gate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Liabilities</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {pendingApprovals.map((appr) => (
                  <tr key={appr.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4 font-bold text-zinc-200">
                      #{appr.request_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-zinc-200">{appr.department_name}</span>
                      <span className="text-[10px] text-zinc-500 block">Gate 0{appr.clearance_gate}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>PENDING</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {appr.due_amount > 0 ? (
                        <span className="font-bold text-rose-400">₹{Number(appr.due_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      ) : (
                        <span className="text-zinc-500">₹0.00</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedApproval(appr);
                          setDecisionType('APPROVED');
                          setRemarks('All books and dues verified with zero liabilities.');
                          setDueAmount('0.00');
                        }}
                        className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-3 py-1.5 rounded-lg transition text-xs cursor-pointer shadow-sm"
                      >
                        // review_and_sign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Locked / Prerequisite Blocked Queue */}
      {lockedApprovals.length > 0 && (
        <div className="glow-card rounded-2xl p-5 sm:p-6 space-y-3 bg-[#0a0b10]">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-zinc-500" />
            <h3 className="font-semibold text-xs text-zinc-300 font-mono-code">
              DOWNSTREAM BLOCKED (DEPENDENCY RESOLUTION) // {lockedApprovals.length}
            </h3>
          </div>
          <p className="text-xs text-zinc-500">
            Requests assigned to sequential gates (Department Labs / Accounts) blocked until upstream gates sign off.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lockedApprovals.map((appr) => (
              <div key={appr.id} className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.06] text-xs font-mono-code">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-zinc-300">Request #{appr.request_id}</span>
                  <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                    LOCKED
                  </span>
                </div>
                <p className="text-zinc-500 text-[11px]">Awaiting prerequisite department sign-offs.</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grievance Resolution Queue */}
      <div className="glow-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="font-semibold text-sm text-zinc-100 font-mono-code">
              GRIEVANCE ESCALATION PIPELINE // SLA WATCH
            </h3>
            <p className="text-xs text-zinc-400">Student appeals and disputes under active SLA timers.</p>
          </div>
        </div>

        {grievances.length === 0 ? (
          <p className="text-xs font-mono-code text-zinc-500 py-4 text-center">
            // NO ACTIVE GRIEVANCES FOR THIS DEPARTMENT DESK.
          </p>
        ) : (
          <div className="space-y-3 font-mono-code text-xs">
            {grievances.map((g) => (
              <div
                key={g.id}
                className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  g.is_escalated
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : g.status === 'RESOLVED'
                    ? 'bg-emerald-950/15 border-emerald-500/30'
                    : 'bg-white/[0.02] border-white/[0.06]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-zinc-200">{g.subject}</span>
                    <span className="text-[10px] bg-white/[0.05] text-zinc-400 px-2 py-0.5 rounded border border-white/[0.08]">
                      Student: {g.student_name}
                    </span>
                    {g.is_escalated && (
                      <span className="text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded">
                        ESCALATED TO DEAN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">{g.description}</p>
                  {g.staff_response && (
                    <p className="text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                      <strong>Resolution: </strong>{g.staff_response}
                    </p>
                  )}
                </div>

                {g.status !== 'RESOLVED' && (
                  <button
                    onClick={() => {
                      setSelectedGrievance(g);
                      setStaffResponse('');
                    }}
                    className="shrink-0 bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    // respond_and_resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono-code text-xs">
          <div className="glow-card rounded-2xl max-w-md w-full p-6 border border-white/[0.12] bg-[#0d0e15]">
            <h3 className="font-bold text-sm text-zinc-100 mb-1">
              // VERIFY_CLEARANCE: REQUEST #{selectedApproval.request_id}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Desk: <strong className="text-zinc-200">{selectedApproval.department_name}</strong> (Gate 0{selectedApproval.clearance_gate})
            </p>

            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1 text-[10px]">
                  Decision
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDecisionType('APPROVED');
                      setDueAmount('0.00');
                    }}
                    className={`p-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-2 transition cursor-pointer ${
                      decisionType === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-white/[0.02] text-zinc-400 border-white/[0.08] hover:bg-white/[0.04]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Approve & Sign</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionType('REJECTED')}
                    className={`p-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-2 transition cursor-pointer ${
                      decisionType === 'REJECTED'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                        : 'bg-white/[0.02] text-zinc-400 border-white/[0.08] hover:bg-white/[0.04]'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Reject / Block</span>
                  </button>
                </div>
              </div>

              {decisionType === 'REJECTED' && (
                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider mb-1 text-[10px]">
                    Outstanding Liability (₹ INR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dueAmount}
                    onChange={(e) => setDueAmount(e.target.value)}
                    className="w-full bg-black/50 border border-rose-500/40 rounded-xl p-2.5 text-rose-200 focus:outline-hidden"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1 text-[10px]">
                  Official Remarks / Justification
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-black/50 border border-white/[0.1] rounded-xl p-2.5 text-zinc-100 focus:outline-hidden focus:border-rose-500"
                  required
                />
              </div>

              <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.06] text-[11px] text-zinc-400 flex items-start space-x-2">
                <KeyRound className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Approval will generate an irreversible <strong className="text-zinc-200">HMAC-SHA256 Digital Signature</strong> attached to your officer record.
                </span>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedApproval(null)}
                  className="px-4 py-2 text-zinc-400 hover:text-white rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className={`px-5 py-2 font-bold rounded-xl transition cursor-pointer text-zinc-950 ${
                    decisionType === 'APPROVED'
                      ? 'bg-emerald-400 hover:bg-emerald-300'
                      : 'bg-rose-400 hover:bg-rose-300'
                  }`}
                >
                  {processing ? 'Signing...' : `Confirm ${decisionType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grievance Resolution Modal */}
      {selectedGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono-code text-xs">
          <div className="glow-card rounded-2xl max-w-md w-full p-6 border border-white/[0.12] bg-[#0d0e15]">
            <h3 className="font-bold text-sm text-zinc-100 mb-2">// RESOLVE GRIEVANCE #{selectedGrievance.id}</h3>
            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.06] text-zinc-300 mb-4">
              <p><strong className="text-zinc-400">Student:</strong> {selectedGrievance.student_name}</p>
              <p><strong className="text-zinc-400">Subject:</strong> {selectedGrievance.subject}</p>
              <p className="mt-1 text-zinc-500 text-[11px]">{selectedGrievance.description}</p>
            </div>

            <form onSubmit={handleGrievanceResolve} className="space-y-4">
              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1 text-[10px]">
                  Resolution Notes
                </label>
                <textarea
                  rows={4}
                  value={staffResponse}
                  onChange={(e) => setStaffResponse(e.target.value)}
                  placeholder="Explain whether dues are waived or updated..."
                  className="w-full bg-black/50 border border-white/[0.1] rounded-xl p-2.5 text-zinc-100 focus:outline-hidden focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedGrievance(null)}
                  className="px-4 py-2 text-zinc-400 hover:text-white rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolvingGrievance}
                  className="px-5 py-2 font-bold text-zinc-950 bg-white hover:bg-zinc-200 rounded-xl transition cursor-pointer"
                >
                  {resolvingGrievance ? 'Submitting...' : 'Mark as Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
