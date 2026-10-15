import React, { useState } from 'react';
import { ShieldCheck, Search, CheckCircle2, XCircle, KeyRound, Award, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const VerifyCertificate = () => {
  const [certId, setCertId] = useState('PEC-CLR-2026-00042');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setSearched(true);
    setResult(null);

    try {
      const isHash = certId.length === 64 && !certId.includes('-');
      const data = await api.verifyCertificate(
        isHash ? null : certId.trim(),
        isHash ? certId.trim() : null
      );
      setResult(data);
    } catch (err) {
      setResult({ valid: false, message: err.message || 'Verification failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Search Banner */}
      <div className="bg-gradient-to-r from-red-950 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg text-center space-y-4">
        <div className="w-12 h-12 bg-red-800 text-amber-200 rounded-2xl flex items-center justify-center mx-auto border border-red-700 font-black text-xl">
          PEC
        </div>
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">PEC Certificate Verification</h1>
          <p className="text-xs sm:text-sm text-rose-200 mt-1">
            Punjab Engineering College (Sector 12, Chandigarh): Validate the cryptographic authenticity of an official No-Dues Clearance Certificate.
          </p>
        </div>

        <form onSubmit={handleVerify} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2 mt-4">
          <input
            type="text"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            placeholder="Enter PEC Certificate Ref (e.g. PEC-CLR-2026-00042) or SHA-256 hash"
            className="flex-1 bg-white text-slate-900 text-xs sm:text-sm px-4 py-3 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-400 border border-slate-300"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Verifying...' : 'Verify Authenticity'}</span>
          </button>
        </form>
      </div>

      {/* Verification Result Display */}
      {searched && result && (
        <div className="space-y-6">
          {result.valid ? (
            <div className="bg-white rounded-3xl border-2 border-emerald-400 p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Certificate Confirmed Authentic</h3>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    STATUS: {result.verification_status}
                  </span>
                </div>
              </div>

              {/* Student Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Student Full Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{result.student.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Roll / Enrollment ID:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{result.student.roll_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Academic Term:</span>
                  <span className="font-medium text-slate-700">{result.clearance_details.academic_year} ({result.clearance_details.semester})</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Clearance Purpose:</span>
                  <span className="font-medium text-slate-700">{result.clearance_details.purpose}</span>
                </div>
              </div>

              {/* Hashes & Certificate Ref */}
              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2 text-xs font-mono">
                <div className="flex justify-between flex-wrap gap-1">
                  <span className="text-slate-400">Certificate Reference:</span>
                  <span className="text-emerald-400 font-bold">{result.certificate_id}</span>
                </div>
                <div className="flex justify-between flex-wrap gap-1">
                  <span className="text-slate-400">Cryptographic Hash:</span>
                  <span className="text-slate-300 break-all">{result.cryptographic_hash}</span>
                </div>
              </div>

              {/* Departmental Signature Chain */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-800">
                  Institutional Verification Signatures ({result.department_signatures.length} Gates)
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {result.department_signatures.map((sig, idx) => (
                    <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white">
                      <div>
                        <span className="font-bold text-slate-900">{sig.department}</span>
                        <span className="text-slate-500 text-[11px] block">
                          Signed by: <strong>{sig.signatory}</strong> • Gate {sig.gate}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center space-x-1">
                          <KeyRound className="w-3 h-3 text-emerald-600" />
                          <span>{sig.digital_signature_seal}</span>
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-red-300 p-8 text-center space-y-3 shadow-md">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Certificate Invalid or Not Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {result.message || 'No clearance record matched the provided certificate identification code or hash digest.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
