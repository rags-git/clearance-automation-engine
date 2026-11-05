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
    <div className="space-y-8 font-mono-code">
      {/* Admin Header - Dark Living System Terminal Theme */}
      <div className="glow-card rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/[0.04] px-3 py-1 rounded-full text-xs text-purple-300 mb-3 border border-white/[0.08]">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>DAA OVERSIGHT // INSTITUTIONAL TELEMETRY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              dean academic affairs
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed font-sans">
              Punjab Engineering College (Sector 12, Chandigarh): Real-time bottleneck identification, multi-gate status tracking, SLA grievance escalation engine, and immutable audit logs.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleTriggerSla}
              disabled={triggeringSla}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              title="Scan active grievances and auto-escalate overdue tickets"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>{triggeringSla ? '// auditing_sla...' : '// run_sla_breach_audit'}</span>
            </button>
            <button
              onClick={loadData}
              className="bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 p-2.5 rounded-xl text-xs transition border border-white/[0.08] cursor-pointer"
              title="Refresh Analytics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex space-x-2 border-t border-white/[0.06] pt-4 overflow-x-auto">
          {[
            { id: 'analytics', label: '// telemetry_kpis', icon: BarChart3 },
            { id: 'requests', label: `// student_roster (${requests.length})`, icon: FileText },
            { id: 'audit', label: `// audit_trail (${auditLogs.length})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-white text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="glow-card p-4 rounded-xl">
          <span className="text-[10px] text-zinc-500 uppercase block">Total Enrolled</span>
          <p className="text-xl font-bold text-zinc-100 mt-1">{analytics.total_students}</p>
        </div>
        <div className="glow-card p-4 rounded-xl">
          <span className="text-[10px] text-zinc-500 uppercase block">Pipelines</span>
          <p className="text-xl font-bold text-zinc-100 mt-1">{analytics.total_requests}</p>
        </div>
        <div className="glow-card p-4 rounded-xl border-emerald-500/20 bg-emerald-950/10">
          <span className="text-[10px] text-emerald-400 uppercase block">Certified</span>
          <p className="text-xl font-bold text-emerald-400 mt-1">{analytics.approved_requests}</p>
        </div>
        <div className="glow-card p-4 rounded-xl border-amber-500/20 bg-amber-950/10">
          <span className="text-[10px] text-amber-400 uppercase block">In Flight</span>
          <p className="text-xl font-bold text-amber-300 mt-1">{analytics.in_progress_requests}</p>
        </div>
        <div className="glow-card p-4 rounded-xl border-rose-500/20 bg-rose-950/10">
          <span className="text-[10px] text-rose-400 uppercase block">Liabilities Blocked</span>
          <p className="text-xl font-bold text-rose-400 mt-1">{analytics.rejected_requests}</p>
        </div>
        <div className="glow-card p-4 rounded-xl border-purple-500/20 bg-purple-950/10">
          <span className="text-[10px] text-purple-400 uppercase block">SLA Breaches</span>
          <p className="text-xl font-bold text-purple-300 mt-1">{analytics.escalated_grievances}</p>
        </div>
      </div>

      {/* Tab Content: Bottleneck Analytics */}
      {activeTab === 'analytics' && (
        <div className="glow-card rounded-2xl p-5 sm:p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-sm text-zinc-100">
              DEPARTMENT VELOCITY & BACKLOG TELEMETRY
            </h3>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Identify approval delays and pending backlogs across all 5 verification gates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.department_metrics.map((dm) => (
              <div key={dm.department_code} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-xs text-zinc-200">{dm.department_name}</h4>
                    <span className="text-[10px] text-zinc-500 uppercase">Code: {dm.department_code}</span>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {dm.average_resolution_hours}h SLA
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-emerald-950/30 border border-emerald-500/20 p-2 rounded-lg">
                    <span className="text-[9px] text-emerald-400 uppercase block">Passed</span>
                    <span className="text-sm font-bold text-emerald-300">{dm.approved_count}</span>
                  </div>
                  <div className="bg-amber-950/30 border border-amber-500/20 p-2 rounded-lg">
                    <span className="text-[9px] text-amber-400 uppercase block">Pending</span>
                    <span className="text-sm font-bold text-amber-300">{dm.pending_count}</span>
                  </div>
                  <div className="bg-rose-950/30 border border-rose-500/20 p-2 rounded-lg">
                    <span className="text-[9px] text-rose-400 uppercase block">Disputed</span>
                    <span className="text-sm font-bold text-rose-300">{dm.rejected_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Student Roster */}
      {activeTab === 'requests' && (
        <div className="glow-card rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="font-semibold text-sm text-zinc-100">STUDENT CLEARANCE ROSTER</h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">Live gate status of all clearance requests.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search student or SID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-black/50 border border-white/[0.1] rounded-xl text-zinc-100 focus:outline-hidden focus:border-rose-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-zinc-500 uppercase tracking-wider text-[10px] border-y border-white/[0.06]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">SID</th>
                  <th className="py-3 px-4">Term</th>
                  <th className="py-3 px-4">Overall Status</th>
                  <th className="py-3 px-4">Gates</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4 font-semibold text-zinc-200">{r.student_name}</td>
                    <td className="py-3.5 px-4 text-rose-400 font-bold">{r.student_roll_no || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      {r.academic_year} ({r.semester})
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          r.overall_status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : r.overall_status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {r.overall_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex space-x-1.5">
                        {r.approvals.map((a) => (
                          <span
                            key={a.id}
                            title={`${a.department_code}: ${a.status}`}
                            className={`w-2.5 h-2.5 rounded-full ${
                              a.status === 'APPROVED'
                                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                                : a.status === 'REJECTED'
                                ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                                : a.status === 'WAITING_PREREQUISITE'
                                ? 'bg-zinc-700'
                                : 'bg-amber-400'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedRequest(selectedRequest?.id === r.id ? null : r)}
                        className="text-zinc-300 hover:text-white underline cursor-pointer"
                      >
                        {selectedRequest?.id === r.id ? 'hide' : 'inspect'}
                      </button>
                      {r.overall_status === 'APPROVED' && (
                        <button
                          onClick={() => {
                            setSelectedRequest(r);
                            setIsCertModalOpen(true);
                          }}
                          className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                        >
                          cert
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedRequest && !isCertModalOpen && (
            <div className="mt-4 p-4 border border-white/[0.08] rounded-xl bg-black/40">
              <h4 className="font-bold text-xs text-zinc-300 mb-3">
                // PIPELINE DETAILS: {selectedRequest.student_name}
              </h4>
              <ClearancePipeline approvals={selectedRequest.approvals} />
            </div>
          )}
        </div>
      )}

      {/* Tab Content: System Audit Trail */}
      {activeTab === 'audit' && (
        <div className="glow-card rounded-2xl p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-zinc-100">// IMMUTABLE_AUDIT_LOGS</h3>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Tamper-evident record of all approvals, rejections, digital signature mints, and SLA breach events.
            </p>
          </div>

          <div className="divide-y divide-white/[0.04] text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-zinc-300 text-[10px] bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.08]">
                      {log.action}
                    </span>
                    <span className="text-zinc-400 text-xs">{log.actor_name} ({log.actor_role})</span>
                  </div>
                  <p className="text-zinc-500 font-sans text-xs">{log.details}</p>
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0">
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
