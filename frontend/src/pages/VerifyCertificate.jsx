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
      <div className="glow-card rounded-2xl p-6 sm:p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-xl flex items-center justify-center mx-auto font-mono-code font-bold text-sm">
          PEC
        </div>
        <div className="max-w-xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono-code">
            // PUBLIC_VERIFICATION_GATEWAY
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Punjab Engineering College: Validate cryptographic certificate hash digests & clearance credentials.
          </p>
        </div>

        <form onSubmit={handleVerify} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2 mt-4 font-mono-code text-xs">
          <input
            type="text"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            placeholder="Enter PEC Certificate Ref (e.g. PEC-CLR-2026-00042) or SHA-256 hash"
            className="flex-1 bg-black/50 text-zinc-100 text-xs px-4 py-3 rounded-xl border border-white/[0.1] focus:outline-hidden focus:border-rose-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-6 py-3 rounded-xl text-xs transition flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50 cursor-pointer shadow-md"
          >
            <Search className="w-4 h-4 text-rose-600" />
            <span>{loading ? 'Verifying...' : 'Verify Authenticity'}</span>
          </button>
        </form>
      </div>

      {/* Verification Result Display */}
      {searched && result && (
        <div className="space-y-6">
          {result.valid ? (
            <div className="glow-card rounded-2xl border border-emerald-500/30 p-6 sm:p-8 space-y-6 bg-[#0c0d14]">
              <div className="flex items-center space-x-3 pb-4 border-b border-white/[0.08]">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-100 font-mono-code">CERTIFICATE AUTHENTIC // VALIDATED</h3>
                  <span className="text-[10px] font-mono-code font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    STATUS: {result.verification_status}
                  </span>
                </div>
              </div>

              {/* Student Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-code bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
                <div>
                  <span className="text-zinc-500 uppercase text-[9px] block">Student Full Name:</span>
                  <span className="font-semibold text-zinc-200">{result.student.name}</span>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase text-[9px] block">Roll / Enrollment ID:</span>
                  <span className="font-bold text-rose-400">{result.student.roll_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase text-[9px] block">Academic Term:</span>
                  <span className="text-zinc-300">{result.clearance_details.academic_year} ({result.clearance_details.semester})</span>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase text-[9px] block">Purpose:</span>
                  <span className="text-zinc-300">{result.clearance_details.purpose}</span>
                </div>
              </div>

              {/* Hashes & Certificate Ref */}
              <div className="p-4 bg-black/50 text-zinc-300 rounded-xl space-y-2 text-xs font-mono-code border border-white/[0.06]">
                <div className="flex justify-between flex-wrap gap-1">
                  <span className="text-zinc-500">Certificate Reference:</span>
                  <span className="text-emerald-400 font-bold">{result.certificate_id}</span>
                </div>
                <div className="flex justify-between flex-wrap gap-1">
                  <span className="text-zinc-500">Cryptographic Hash:</span>
                  <span className="text-zinc-300 break-all text-[11px]">{result.cryptographic_hash}</span>
                </div>
              </div>

              {/* Departmental Signature Chain */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs font-mono-code text-zinc-300">
                  // INSTITUTIONAL_SIGNATURES ({result.department_signatures.length} GATES)
                </h4>
                <div className="divide-y divide-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden text-xs font-mono-code bg-white/[0.02]">
                  {result.department_signatures.map((sig, idx) => (
                    <div key={idx} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-semibold text-zinc-200">{sig.department}</span>
                        <span className="text-zinc-500 text-[10px] block mt-0.5">
                          Officer: {sig.signatory} • Gate 0{sig.gate}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono-code text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center space-x-1">
                          <KeyRound className="w-3 h-3 text-emerald-400" />
                          <span>{sig.digital_signature_seal?.substring(0, 18)}...</span>
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glow-card rounded-2xl border border-rose-500/30 p-8 text-center space-y-3 bg-[#0c0d14]">
              <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl flex items-center justify-center mx-auto">
                <XCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-zinc-100 font-mono-code">// CERTIFICATE_NOT_FOUND</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto font-mono-code">
                {result.message || 'No clearance record matched the provided certificate identification code or hash digest.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
