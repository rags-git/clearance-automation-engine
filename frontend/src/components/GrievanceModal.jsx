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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg text-slate-900">File Formal Grievance</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Target Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              required
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              SLA Priority Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`p-2 rounded-xl text-xs font-semibold border text-center transition ${
                    priority === p
                      ? p === 'CRITICAL'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>{p}</div>
                  <div className={`text-[10px] ${priority === p ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {SLA_HOURS[p]}h SLA
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>
                Selected response window: <strong>{SLA_HOURS[priority]} hours</strong>. Auto-escalated to Dean Academic Affairs (DAA) if breached.
              </span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Subject / Dues Disputed
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Disputed Shivalik mess fee of ₹3,500 during 6-month internship or library fine acknowledgment"
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description & Evidence
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain background dates, DAA sanction letter, SBI Collect ref #, or equipment register details..."
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit Grievance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
