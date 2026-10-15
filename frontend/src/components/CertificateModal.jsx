import React from 'react';
import { X, Download, ShieldCheck, CheckCircle2, KeyRound } from 'lucide-react';
import { api } from '../services/api';

export const CertificateModal = ({ isOpen, onClose, request }) => {
  if (!isOpen || !request) return null;

  const downloadUrl = api.getCertificateDownloadUrl(request.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-lg text-slate-900">PEC No-Dues Clearance Certificate</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Sheet Preview */}
        <div className="mt-6 border-2 border-red-900/30 bg-amber-50/20 rounded-2xl p-6 relative">
          <div className="text-center space-y-1 mb-6">
            <div className="w-12 h-12 bg-red-900 text-amber-200 rounded-xl flex items-center justify-center mx-auto font-black text-xl shadow-xs">
              PEC
            </div>
            <h2 className="text-xl font-black text-red-950 uppercase tracking-tight mt-2">
              Punjab Engineering College
            </h2>
            <p className="text-xs font-bold text-red-800 uppercase tracking-wider">
              (Deemed to be University), Chandigarh
            </p>
            <p className="text-[11px] text-slate-500">Sector 12, Chandigarh - 160012 • Office of Dean Academic Affairs (DAA)</p>
            <div className="inline-block px-3 py-1 bg-red-100/80 border border-red-200 text-red-900 text-xs font-bold rounded-full mt-2">
              OFFICIAL NO-DUES & FINAL DEGREE CLEARANCE CERTIFICATE
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-200 mb-4 font-mono">
            <div>
              <span className="text-slate-400 font-sans block text-[10px] uppercase font-bold">PEC Certificate Ref:</span>
              <span className="text-red-900 font-bold">{request.certificate_id}</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans block text-[10px] uppercase font-bold">Cryptographic Digest:</span>
              <span className="text-slate-700 truncate block text-[11px]">{request.certificate_hash?.substring(0, 32)}...</span>
            </div>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-200 mb-4">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name:</span>
              <span className="font-bold text-slate-900 text-sm">{request.student_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">PEC SID (Student ID):</span>
              <span className="font-bold text-red-900 font-mono text-sm">{request.student_roll_no || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Term:</span>
              <span className="text-slate-700 font-medium">{request.academic_year} ({request.semester})</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Clearance Purpose:</span>
              <span className="text-slate-700 font-medium">{request.reason}</span>
            </div>
          </div>

          {/* Signatures Matrix */}
          <div className="space-y-2 mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              PEC Departmental Verification Chain (Chain of Responsibility)
            </h4>
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {request.approvals.map((appr) => (
                <div key={appr.id} className="p-2.5 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{appr.department_name}</span>
                    <span className="text-[10px] text-slate-400 ml-2">Gate {appr.clearance_gate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                      <KeyRound className="w-3 h-3 text-emerald-600" />
                      <span>{appr.digital_signature?.substring(0, 18)}...</span>
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-600 bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
            Certified that all laboratory equipment, Dr. B.R. Ambedkar Library books, PEC hostel keys, Gymkhana gear, and caution money liabilities are verified with zero pending dues. The student is cleared for B.Tech degree award / transcript issuance.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-slate-500 flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographically sealed under PEC Academic Authority</span>
          </span>
          <div className="flex space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Close
            </button>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-5 py-2 text-sm font-semibold text-white bg-red-800 hover:bg-red-700 rounded-xl transition shadow-xs flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PEC PDF</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
