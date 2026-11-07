import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  FileText,
  AlertTriangle,
  Download,
  PlusCircle,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { ClearancePipeline } from '../components/ClearancePipeline';
import { GrievanceModal } from '../components/GrievanceModal';
import { CertificateModal } from '../components/CertificateModal';

export const StudentDashboard = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isGrievanceModalOpen, setIsGrievanceModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    academic_year: '2025-2026',
    semester: 'Semester 8',
    reason: 'Graduation Clearance & Degree Award',
  });
  const [applying, setApplying] = useState(false);

  const activeRequest = requests[0]; // Most recent request

  const loadData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [reqData, deptData, griData] = await Promise.all([
        api.getMyRequests(),
        api.getDepartments(),
        api.getMyGrievances(),
      ]);
      setRequests(reqData);
      setDepartments(deptData);
      setGrievances(griData);

      // Trigger confetti if active request is fully approved
      if (reqData[0]?.overall_status === 'APPROVED') {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
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

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await api.applyClearance(applyForm);
      setIsApplyModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Loading student clearance record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="glow-card p-6 sm:p-8 relative">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-[var(--bg-surface-hover)] px-3.5 py-1.5 rounded-full text-xs font-mono-code border border-rose-500/40 mb-3 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block mr-1 animate-pulse" />
            <span className="font-semibold text-blue-700 dark:text-blue-300">Student ID: {user.roll_number || 'Enrolled student'}</span>
            <span className="text-zinc-400">•</span>
            <span className="text-[var(--text-primary)] font-medium">{user.email}</span>
            <span className="text-zinc-400">•</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">PEC SEC-12</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Welcome, <span className="text-blue-700 dark:text-blue-300">{user.full_name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2.5 leading-relaxed font-sans">
            View your clearance progress, follow departmental approvals, and contact a department if you need help.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            {!activeRequest ? (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white hover:scale-105 active:scale-95 font-bold px-5 py-2.5 rounded-xl transition duration-200 flex items-center space-x-2 shadow-lg shadow-rose-500/20 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-white" />
                <span>Apply for clearance</span>
              </button>
            ) : activeRequest.overall_status === 'APPROVED' ? (
              <button
                onClick={() => setIsCertModalOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 hover:scale-105 active:scale-95 text-white font-extrabold px-6 py-2.5 rounded-xl transition duration-300 flex items-center space-x-2 shadow-xl shadow-emerald-500/30 cursor-pointer animate-glow-pulse"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Download certificate</span>
              </button>
            ) : (
              <button
                onClick={() => setIsGrievanceModalOpen(true)}
                className="bg-amber-500/20 hover:bg-amber-500/30 hover:scale-105 text-amber-700 dark:text-amber-200 border border-amber-500/50 font-bold px-5 py-2.5 rounded-xl transition duration-200 flex items-center space-x-2 cursor-pointer shadow-md shadow-amber-500/10"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Review a clearance issue</span>
              </button>
            )}

            <button
              onClick={() => setIsGrievanceModalOpen(true)}
              className="bg-[var(--bg-surface-hover)] hover:bg-rose-500/10 hover:scale-105 active:scale-95 text-[var(--text-primary)] font-medium px-5 py-2.5 rounded-xl border border-[var(--border-subtle)] transition duration-200 flex items-center space-x-2 cursor-pointer shadow-sm"
            >
              <HelpCircle className="w-4 h-4 text-rose-500" />
              <span>Submit a grievance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Request Status Section */}
      {activeRequest ? (
        <div className="space-y-6">
          {/* Status Header Bar */}
          <div className="glow-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono-code text-zinc-500 uppercase tracking-wider">
                  Request #{activeRequest.id}
                </span>
                <span
                  className={`text-[10px] font-mono-code font-bold px-2.5 py-0.5 rounded-full border ${
                    activeRequest.overall_status === 'APPROVED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : activeRequest.overall_status === 'REJECTED'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {activeRequest.overall_status.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 mt-1.5 font-mono-code">
                {activeRequest.reason}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono-code">
                {activeRequest.academic_year} • {activeRequest.semester}
              </p>
            </div>

            {activeRequest.overall_status === 'APPROVED' && (
              <button
                onClick={() => setIsCertModalOpen(true)}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono-code font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>REF: {activeRequest.certificate_id}</span>
              </button>
            )}
          </div>

          {/* Interactive Pipeline Diagram */}
          <ClearancePipeline approvals={activeRequest.approvals} />
        </div>
      ) : (
        <div className="glow-card p-10 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 bg-white/[0.04] border border-white/[0.08] text-zinc-400 rounded-xl flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6 text-rose-400" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="font-bold text-zinc-200 text-base font-mono-code">// NO ACTIVE CLEARANCE</h3>
            <p className="text-xs text-zinc-400 mt-1">
              No clearance pipeline active. Initiate a new clearance request to trigger the multi-gate CoR chain.
            </p>
          </div>
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold px-5 py-2.5 rounded-xl text-xs font-mono-code transition inline-flex items-center space-x-2 cursor-pointer shadow-md"
          >
            <PlusCircle className="w-4 h-4 text-rose-600" />
            <span>// initiate_clearance</span>
          </button>
        </div>
      )}

      {/* Student Grievance Tracker */}
      <div className="glow-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="font-semibold text-sm text-zinc-100 font-mono-code">
              GRIEVANCE TICKETS // SLA RUNTIME
            </h3>
            <p className="text-xs text-zinc-400">Track resolution progress and SLA escalation deadlines.</p>
          </div>
          <button
            onClick={() => setIsGrievanceModalOpen(true)}
            className="text-xs font-mono-code text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            + file_ticket
          </button>
        </div>

        {grievances.length === 0 ? (
          <p className="text-xs font-mono-code text-zinc-500 py-6 text-center">
            // NO ACTIVE GRIEVANCES FOUND. ALL CLEAR.
          </p>
        ) : (
          <div className="space-y-3">
            {grievances.map((g) => (
              <div
                key={g.id}
                className={`p-4 rounded-xl border transition ${
                  g.is_escalated
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : g.status === 'RESOLVED'
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-white/[0.02] border-white/[0.06]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-zinc-100 font-mono-code">{g.subject}</span>
                    <span className="text-[10px] font-mono-code bg-white/[0.05] text-zinc-400 px-2 py-0.5 rounded border border-white/[0.08]">
                      {g.department_name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {g.is_escalated ? (
                      <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center space-x-1">
                        <ShieldAlert className="w-3 h-3 text-rose-400" />
                        <span>SLA BREACH: ESCALATED TO DEAN</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                        {g.status}
                      </span>
                    )}
                    <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {g.priority} ({g.sla_hours}h SLA)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 mb-2">{g.description}</p>

                {g.staff_response && (
                  <div className="mt-2 p-2.5 bg-black/40 rounded-lg border border-white/[0.06] text-xs font-mono-code">
                    <span className="text-zinc-500 block text-[10px] uppercase">DEPARTMENT RESPONSE:</span>
                    <span className="text-zinc-300">{g.staff_response}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glow-card rounded-2xl max-w-md w-full p-6 border border-white/[0.12] bg-[#0d0e15]">
            <h3 className="font-bold text-base text-zinc-100 font-mono-code mb-4">// APPLY FOR CLEARANCE</h3>
            <form onSubmit={handleApply} className="space-y-4 text-xs font-mono-code">
              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={applyForm.academic_year}
                  onChange={(e) => setApplyForm({ ...applyForm, academic_year: e.target.value })}
                  className="w-full bg-black/50 border border-white/[0.1] rounded-xl p-2.5 text-zinc-100 focus:outline-hidden focus:border-rose-500"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                  Semester
                </label>
                <input
                  type="text"
                  value={applyForm.semester}
                  onChange={(e) => setApplyForm({ ...applyForm, semester: e.target.value })}
                  className="w-full bg-black/50 border border-white/[0.1] rounded-xl p-2.5 text-zinc-100 focus:outline-hidden focus:border-rose-500"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                  Purpose / Reason
                </label>
                <select
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  className="w-full bg-black/50 border border-white/[0.1] rounded-xl p-2.5 text-zinc-100 focus:outline-hidden focus:border-rose-500"
                >
                  <option value="B.Tech Final Degree & Transcript Release (Batch 2022-26)">B.Tech Final Degree & Transcript Release (Batch 2022-26)</option>
                  <option value="Mandatory 6-Month Industrial Internship Clearance (Semester 7/8)">Mandatory 6-Month Industrial Internship Clearance (Semester 7/8)</option>
                  <option value="Semester Registration & Fee Clearance">Semester Registration & Fee Clearance</option>
                  <option value="Hostel Caution Money & Mess Reconciliation">Hostel Caution Money & Mess Reconciliation</option>
                  <option value="Caution Money Security Deposit Refund Release">Caution Money Security Deposit Refund Release</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-5 py-2 font-bold text-zinc-950 bg-white hover:bg-zinc-200 rounded-xl transition cursor-pointer"
                >
                  {applying ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grievance Modal */}
      <GrievanceModal
        isOpen={isGrievanceModalOpen}
        onClose={() => setIsGrievanceModalOpen(false)}
        departments={departments}
        activeRequestId={activeRequest?.id}
        onGrievanceCreated={loadData}
      />

      {/* Certificate Modal */}
      {activeRequest && (
        <CertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          request={activeRequest}
        />
      )}
    </div>
  );
};
