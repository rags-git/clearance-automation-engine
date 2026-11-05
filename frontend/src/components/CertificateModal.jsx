import React, { useState } from 'react';
import { X, Download, ShieldCheck, CheckCircle2, KeyRound } from 'lucide-react';
import { api } from '../services/api';

export const CertificateModal = ({ isOpen, onClose, request }) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !request) return null;

  const handleDownload = async (e) => {
    e.preventDefault();
    setDownloading(true);
    try {
      const blob = await api.downloadCertificate(request.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Clearance_Certificate_${request.student_roll_no || request.student_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Certificate download failed: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glow-card rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-white/[0.12] my-8 bg-[#0d0e15] shadow-2xl">
        <div className="flex justify-between items-center pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-zinc-100 font-mono-code tracking-wide">
              // OFFICIAL CLEARANCE CREDENTIAL
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Sheet Preview - Dark Holographic Styling */}
        <div className="mt-6 border border-white/[0.08] bg-black/40 rounded-xl p-6 relative overflow-hidden">
          <div className="text-center space-y-1 mb-6">
            <div className="w-12 h-12 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-xl flex items-center justify-center mx-auto font-mono-code font-bold text-sm shadow-md">
              PEC
            </div>
            <h2 className="text-lg font-bold text-zinc-100 uppercase tracking-tight mt-2 font-mono-code">
              Punjab Engineering College
            </h2>
            <p className="text-[11px] font-mono-code text-rose-400 tracking-wider">
              (DEEMED TO BE UNIVERSITY) // CHANDIGARH
            </p>
            <p className="text-[10px] text-zinc-500 font-mono-code">Sector 12, Chandigarh - 160012 • Office of Dean Academic Affairs (DAA)</p>
            <div className="inline-block px-3 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-mono-code font-semibold rounded-full mt-2">
              CRYPTOGRAPHIC NO-DUES & FINAL DEGREE RELEASE SEAL
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/[0.06] mb-3 font-mono-code">
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase">Certificate Ref:</span>
              <span className="text-rose-300 font-bold">{request.certificate_id}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase">Cryptographic Digest:</span>
              <span className="text-zinc-400 truncate block text-[10px]">{request.certificate_hash?.substring(0, 32)}...</span>
            </div>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/[0.06] mb-3 font-mono-code">
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase">Student Name:</span>
              <span className="font-medium text-zinc-200">{request.student_name}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase">PEC SID:</span>
              <span className="font-bold text-rose-400">{request.student_roll_no || 'N/A'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase">Academic Term:</span>
              <span className="text-zinc-300">{request.academic_year} ({request.semester})</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase">Purpose:</span>
              <span className="text-zinc-300 truncate block">{request.reason}</span>
            </div>
          </div>

          {/* Signatures Matrix */}
          <div className="space-y-2 mb-3">
            <h4 className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-zinc-400">
              Departmental Verification Chain (HMAC-SHA256)
            </h4>
            <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
              {request.approvals.map((appr) => (
                <div key={appr.id} className="p-2.5 text-xs flex items-center justify-between font-mono-code">
                  <div>
                    <span className="text-zinc-200 text-[11px] font-medium">{appr.department_name}</span>
                    <span className="text-[10px] text-zinc-500 ml-2">Gate 0{appr.clearance_gate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center space-x-1">
                      <KeyRound className="w-3 h-3 text-emerald-400" />
                      <span>{appr.digital_signature?.substring(0, 16)}...</span>
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] font-mono-code text-zinc-400 bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-xl text-center">
            CERTIFIED: Library books, PEC hostels, Gymkhana gear, research hardware & caution money verified zero dues.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 font-mono-code text-xs">
          <span className="text-[11px] text-zinc-500 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographically sealed under PEC Authority</span>
          </span>
          <div className="flex space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 sm:flex-initial px-5 py-2 font-bold text-zinc-950 bg-white hover:bg-zinc-200 disabled:opacity-50 rounded-xl transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Preparing PDF...' : 'Download Official PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
