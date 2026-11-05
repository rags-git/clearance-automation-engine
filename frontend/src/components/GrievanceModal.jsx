import React, { useState } from 'react';
import { X, AlertTriangle, Clock, Send } from 'lucide-react';
import { api } from '../services/api';

const SLA_HOURS = {
  CRITICAL: 4,
  HIGH: 12,
  MEDIUM: 24,
  LOW: 48,
};

export const GrievanceModal = ({ isOpen, onClose, departments, activeRequestId, onGrievanceCreated }) => {
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 1);
  const [priority, setPriority] = useState('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.fileGrievance({
        department_id: Number(departmentId),
        clearance_request_id: activeRequestId,
        subject,
        description,
        priority,
      });
      onGrievanceCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to file grievance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono-code text-xs">
      <div className="glow-card rounded-2xl max-w-lg w-full p-6 border border-white/[0.12] bg-[#0d0e15] shadow-2xl">
        <div className="flex justify-between items-center pb-3 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-zinc-100">// FILE_GRIEVANCE_TICKET</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-[11px]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-zinc-400 uppercase tracking-wider mb-1 text-[10px]">
              Target Department Desk
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full bg-black/50 border border-white/[0.1] rounded-xl p-2.5 text-zinc-100 focus:outline-hidden focus:border-rose-500"
              required
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id} className="bg-zinc-900 text-zinc-100">
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 uppercase tracking-wider mb-1 text-[10px]">
              SLA Priority Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`p-2 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                    priority === p
                      ? p === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                        : 'bg-white text-zinc-950 border-white shadow-sm'
                      : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="font-bold">{p}</div>
                  <div className={`text-[9px] mt-0.5 ${priority === p ? 'text-zinc-700' : 'text-zinc-500'}`}>
                    {SLA_HOURS[p]}h SLA
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1.5 flex items-center space-x-1 font-sans">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span>
                Window: <strong className="text-zinc-300 font-mono-code">{SLA_HOURS[priority]}h</strong>. Auto-escalated to Dean (DAA) upon timer breach.
              </span>
            </p>
          </div>

          <div>
            <label className="block text-zinc-400 uppercase tracking-wider mb-1 text-[10px]">
              Subject / Dues Disputed
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Disputed Shivalik mess fee of ₹3,500 during 6-month internship"
              className="w-full bg-black/50 border border-white/[0.1] rounded-xl p-2.5 text-zinc-100 focus:outline-hidden focus:border-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-zinc-400 uppercase tracking-wider mb-1 text-[10px]">
              Detailed Description & Evidence
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain dates, DAA sanction letter, SBI Collect ref #, or equipment register details..."
              className="w-full bg-black/50 border border-white/[0.1] rounded-xl p-2.5 text-zinc-100 focus:outline-hidden focus:border-rose-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 font-bold text-zinc-950 bg-white hover:bg-zinc-200 rounded-xl transition shadow-md flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-rose-600" />
              <span>{loading ? 'Submitting...' : 'Submit Grievance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
