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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-950 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-red-900/80 px-3 py-1 rounded-full text-xs font-semibold text-amber-200 border border-red-800 mb-3">
            <span>PEC SID: {user.roll_number || 'Enrolled Student'}</span>
            <span>•</span>
            <span>{user.email}</span>
            <span>•</span>
            <span>PEC Chandigarh</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user.full_name}
          </h1>
          <p className="text-sm text-rose-100 mt-2 leading-relaxed">
            Punjab Engineering College Digital Clearance Engine: Track Dr. B.R. Ambedkar Central Library, Hostels, Gymkhana, Department Labs, and Accounts Branch clearances in real-time.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {!activeRequest ? (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold px-4 py-2.5 rounded-xl text-sm transition flex items-center space-x-2 shadow-sm"
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                <span>Apply for Clearance</span>
              </button>
            ) : activeRequest.overall_status === 'APPROVED' ? (
              <button
                onClick={() => setIsCertModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition flex items-center space-x-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>View & Download Certificate</span>
              </button>
            ) : (
              <button
                onClick={() => setIsGrievanceModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm transition flex items-center space-x-2 shadow-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>File Grievance / Dispute Dues</span>
              </button>
            )}

            <button
              onClick={() => setIsGrievanceModalOpen(true)}
              className="bg-indigo-800/80 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm border border-indigo-600 transition flex items-center space-x-2"
            >
              <HelpCircle className="w-4 h-4 text-indigo-300" />
              <span>Submit Grievance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Request Status Section */}
      {activeRequest ? (
        <div className="space-y-6">
          {/* Status Header Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Request #{activeRequest.id}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    activeRequest.overall_status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : activeRequest.overall_status === 'REJECTED'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {activeRequest.overall_status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {activeRequest.reason} ({activeRequest.academic_year} • {activeRequest.semester})
              </h2>
            </div>

            {activeRequest.overall_status === 'APPROVED' && (
              <button
                onClick={() => setIsCertModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Certificate Ref: {activeRequest.certificate_id}</span>
              </button>
            )}
          </div>

          {/* Interactive Pipeline Diagram */}
          <ClearancePipeline approvals={activeRequest.approvals} />
        </div>
      ) : (
        <div className="bg-white p-10 rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="font-bold text-slate-900 text-lg">No Active Clearance Request Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              You do not have a clearance process underway. Initiate a new clearance request to begin the verification chain across Library, Hostel, Sports, Research Labs, and Accounts.
            </p>
          </div>
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-xs inline-flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Initiate Clearance Request</span>
          </button>
        </div>
      )}

      {/* Student Grievance Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">Your Submitted Grievances</h3>
            <p className="text-xs text-slate-500">Track resolution progress and SLA escalation deadlines.</p>
          </div>
          <button
            onClick={() => setIsGrievanceModalOpen(true)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
          >
            + New Grievance
          </button>
        </div>

        {grievances.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No grievances filed. All good!</p>
        ) : (
          <div className="space-y-3">
            {grievances.map((g) => (
              <div
                key={g.id}
                className={`p-4 rounded-xl border transition ${
                  g.is_escalated
                    ? 'bg-red-50/50 border-red-200'
                    : g.status === 'RESOLVED'
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{g.subject}</span>
                    <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                      {g.department_name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {g.is_escalated ? (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 flex items-center space-x-1">
                        <ShieldAlert className="w-3 h-3 text-red-600" />
                        <span>SLA BREACH: ESCALATED TO DEAN</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {g.status}
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {g.priority} ({g.sla_hours}h SLA)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-2">{g.description}</p>

                {g.staff_response && (
                  <div className="mt-2 p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-800">Department Response: </span>
                    <span className="text-slate-600">{g.staff_response}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-lg text-slate-900 mb-4">Apply for Academic Clearance</h3>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={applyForm.academic_year}
                  onChange={(e) => setApplyForm({ ...applyForm, academic_year: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Semester
                </label>
                <input
                  type="text"
                  value={applyForm.semester}
                  onChange={(e) => setApplyForm({ ...applyForm, semester: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Purpose / Reason
                </label>
                <select
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500"
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
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
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
