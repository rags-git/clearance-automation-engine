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
      {/* Staff Header */}
      <div className="bg-gradient-to-r from-red-950 via-amber-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="inline-flex items-center space-x-2 bg-red-900/80 px-3 py-1 rounded-full text-xs font-semibold text-amber-200 mb-3 border border-red-800">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>PEC Department Staff Verification Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{user.full_name}</h1>
        <p className="text-sm text-amber-100 mt-2 max-w-2xl">
          Punjab Engineering College (Sector 12, Chandigarh): Review student clearance requests, inspect records, generate tamper-evident HMAC digital signatures upon approval, or flag liabilities.
        </p>
      </div>

      {/* Pending Approvals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900">Active Clearance Queue</h3>
            <p className="text-xs text-slate-500">Student requests ready for departmental review & digital signing.</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {pendingApprovals.length} Requests Awaiting Sign-off
          </span>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No pending clearance requests requiring immediate action.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Request Ref</th>
                  <th className="py-3 px-4">Department Gate</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Outstanding Dues</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingApprovals.map((appr) => (
                  <tr key={appr.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      Request #{appr.request_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{appr.department_name}</span>
                      <span className="text-[10px] text-slate-400 block">Gate {appr.clearance_gate}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        <span>PENDING</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {appr.due_amount > 0 ? (
                        <span className="font-bold text-red-600">₹{Number(appr.due_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      ) : (
                        <span className="text-slate-400">₹0.00</span>
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
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg transition shadow-xs"
                      >
                        Review & Sign
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
        <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-6 space-y-3">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-sm text-slate-800">
              Downstream Dependent Requests ({lockedApprovals.length})
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            These requests belong to sequential gates (Department Labs / Accounts) and are blocked by the Chain of Responsibility until all prior gates are fully approved.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lockedApprovals.map((appr) => (
              <div key={appr.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">Request #{appr.request_id}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                    GATE LOCKED
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">Awaiting prerequisite department sign-offs.</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grievance Resolution Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">Department Grievances & SLA Queue</h3>
            <p className="text-xs text-slate-500">Student appeals and disputes under active SLA timers.</p>
          </div>
        </div>

        {grievances.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No open grievances for this department.</p>
        ) : (
          <div className="space-y-3">
            {grievances.map((g) => (
              <div
                key={g.id}
                className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  g.is_escalated
                    ? 'bg-red-50/70 border-red-200'
                    : g.status === 'RESOLVED'
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-amber-50/50 border-amber-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{g.subject}</span>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                      Student: {g.student_name}
                    </span>
                    {g.is_escalated && (
                      <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded">
                        ESCALATED TO DEAN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{g.description}</p>
                  {g.staff_response && (
                    <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
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
                    className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-xl text-xs transition"
                  >
                    Respond & Resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-lg text-slate-900 mb-1">
              Verify Clearance: Request #{selectedApproval.request_id}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Department: <strong>{selectedApproval.department_name}</strong> (Gate {selectedApproval.clearance_gate})
            </p>

            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Decision
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDecisionType('APPROVED');
                      setDueAmount('0.00');
                    }}
                    className={`p-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-2 transition ${
                      decisionType === 'APPROVED'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Sign</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionType('REJECTED')}
                    className={`p-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-2 transition ${
                      decisionType === 'REJECTED'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject / Block</span>
                  </button>
                </div>
              </div>

              {decisionType === 'REJECTED' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Outstanding Due Amount (₹ INR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dueAmount}
                    onChange={(e) => setDueAmount(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Official Remarks / Justification
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start space-x-2">
                <KeyRound className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Approval will generate an irreversible <strong>HMAC-SHA256 Digital Signature Seal</strong> tied to your officer identity and the clearance record.
                </span>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedApproval(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className={`px-5 py-2 text-sm font-semibold text-white rounded-xl transition ${
                    decisionType === 'APPROVED'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-lg text-slate-900 mb-2">Resolve Grievance #{selectedGrievance.id}</h3>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 mb-4">
              <p><strong>Student:</strong> {selectedGrievance.student_name}</p>
              <p><strong>Subject:</strong> {selectedGrievance.subject}</p>
              <p className="mt-1 text-slate-500">{selectedGrievance.description}</p>
            </div>

            <form onSubmit={handleGrievanceResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Department Resolution Details
                </label>
                <textarea
                  rows={4}
                  value={staffResponse}
                  onChange={(e) => setStaffResponse(e.target.value)}
                  placeholder="Explain whether dues are waived, records updated, or what steps student must follow..."
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedGrievance(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolvingGrievance}
                  className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition"
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
