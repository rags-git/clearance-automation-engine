import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  FileText,
  ShieldAlert,
  History,
  RefreshCw,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import { ClearancePipeline } from '../components/ClearancePipeline';
import { CertificateModal } from '../components/CertificateModal';

export const AdminDashboard = ({ user }) => {
  const [analytics, setAnalytics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'requests', 'audit'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [triggeringSla, setTriggeringSla] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [analyticsData, requestsData, logsData] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAllRequests(),
        api.getAuditLogs(100),
      ]);
      setAnalytics(analyticsData);
      setRequests(requestsData);
      setAuditLogs(logsData);
    } catch (err) {
      if (isInitial) alert(err.message);
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

  const handleTriggerSla = async () => {
    setTriggeringSla(true);
    try {
      const res = await api.triggerSlaCheck();
      alert(`SLA Audit Completed: ${res.escalated_tickets} overdue grievances auto-escalated.`);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setTriggeringSla(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredRequests = requests.filter(
    (r) =>
      r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student_roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.overall_status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-red-950 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-red-900/80 px-3 py-1 rounded-full text-xs font-semibold text-amber-200 mb-3 border border-red-800">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Office of Dean Academic Affairs (DAA) • PEC Chandigarh</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Institutional Clearance & Bottleneck Analytics</h1>
            <p className="text-sm text-rose-100 mt-2 max-w-2xl">
              Punjab Engineering College (Sector 12, Chandigarh): Real-time bottleneck identification, multi-gate status tracking, SLA grievance escalation engine, and immutable audit logs.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleTriggerSla}
              disabled={triggeringSla}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition flex items-center space-x-2 shadow-sm disabled:opacity-50"
              title="Scan active grievances and auto-escalate overdue tickets"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{triggeringSla ? 'Evaluating SLA...' : 'Run SLA Breach Audit'}</span>
            </button>
            <button
              onClick={loadData}
              className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl text-xs transition border border-white/20"
              title="Refresh Analytics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex space-x-2 border-t border-purple-900/60 pt-4">
          {[
            { id: 'analytics', label: 'Department Bottlenecks & KPIs', icon: BarChart3 },
            { id: 'requests', label: `Student Roster (${requests.length})`, icon: FileText },
            { id: 'audit', label: `System Audit Trail (${auditLogs.length})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
                  isActive
                    ? 'bg-white text-purple-950 shadow-sm'
                    : 'text-purple-200 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Enrolled Students</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{analytics.total_students}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Requests</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{analytics.total_requests}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase">Cleared & Certified</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{analytics.approved_requests}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase">In Progress</span>
          <p className="text-2xl font-black text-amber-700 mt-1">{analytics.in_progress_requests}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-red-600 uppercase">Rejected / Blocked</span>
          <p className="text-2xl font-black text-red-700 mt-1">{analytics.rejected_requests}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-purple-600 uppercase">Escalated Grievances</span>
          <p className="text-2xl font-black text-purple-800 mt-1">{analytics.escalated_grievances}</p>
        </div>
      </div>

      {/* Tab Content: Bottleneck Analytics */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">Department Bottleneck & Velocity Analytics</h3>
            <p className="text-xs text-slate-500">
              Identify approval delays and pending backlogs across all 5 verification gates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.department_metrics.map((dm) => (
              <div key={dm.department_code} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{dm.department_name}</h4>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Code: {dm.department_code}</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {dm.average_resolution_hours}h Avg Time
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                    <span className="text-[10px] text-emerald-600 uppercase font-bold block">Approved</span>
                    <span className="text-base font-bold text-emerald-800">{dm.approved_count}</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg">
                    <span className="text-[10px] text-amber-600 uppercase font-bold block">Pending</span>
                    <span className="text-base font-bold text-amber-800">{dm.pending_count}</span>
                  </div>
                  <div className="bg-red-50 border border-red-200 p-2 rounded-lg">
                    <span className="text-[10px] text-red-600 uppercase font-bold block">Rejected</span>
                    <span className="text-base font-bold text-red-800">{dm.rejected_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Student Roster */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Student Clearance Roster</h3>
              <p className="text-xs text-slate-500">Live gate status of all clearance requests.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search student or roll no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Academic Session</th>
                  <th className="py-3 px-4">Overall Status</th>
                  <th className="py-3 px-4">Gate Breakdown</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{r.student_name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{r.student_roll_no || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {r.academic_year} ({r.semester})
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          r.overall_status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : r.overall_status === 'REJECTED'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {r.overall_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex space-x-1">
                        {r.approvals.map((a) => (
                          <span
                            key={a.id}
                            title={`${a.department_code}: ${a.status}`}
                            className={`w-2.5 h-2.5 rounded-full ${
                              a.status === 'APPROVED'
                                ? 'bg-emerald-500'
                                : a.status === 'REJECTED'
                                ? 'bg-red-500'
                                : a.status === 'WAITING_PREREQUISITE'
                                ? 'bg-slate-300'
                                : 'bg-amber-400'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedRequest(selectedRequest?.id === r.id ? null : r)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        {selectedRequest?.id === r.id ? 'Hide' : 'Inspect'}
                      </button>
                      {r.overall_status === 'APPROVED' && (
                        <button
                          onClick={() => {
                            setSelectedRequest(r);
                            setIsCertModalOpen(true);
                          }}
                          className="text-emerald-600 hover:text-emerald-800 font-semibold"
                        >
                          Certificate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedRequest && !isCertModalOpen && (
            <div className="mt-4 p-4 border border-indigo-200 rounded-2xl bg-indigo-50/20">
              <h4 className="font-bold text-sm text-slate-900 mb-3">
                Pipeline Details for {selectedRequest.student_name}
              </h4>
              <ClearancePipeline approvals={selectedRequest.approvals} />
            </div>
          )}
        </div>
      )}

      {/* Tab Content: System Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Immutable System Audit Log</h3>
            <p className="text-xs text-slate-500">
              Tamper-evident record of all approvals, rejections, digital signature mints, and SLA breach events.
            </p>
          </div>

          <div className="divide-y divide-slate-100 font-mono text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {log.action}
                    </span>
                    <span className="text-slate-600 text-xs">{log.actor_name} ({log.actor_role})</span>
                  </div>
                  <p className="text-slate-500 font-sans text-xs">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedRequest && (
        <CertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          request={selectedRequest}
        />
      )}
    </div>
  );
};
