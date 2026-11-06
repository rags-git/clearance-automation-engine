import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, UserCheck } from 'lucide-react';

export const Login = () => {
  const { login, demoLogin, DEMO_USERS } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 glow-card rounded-2xl border border-white/[0.1] p-8 shadow-2xl bg-[#0c0d14]">
      <div className="text-center space-y-2 mb-6">
        <div className="w-12 h-12 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-xl flex items-center justify-center mx-auto shadow-md font-mono-code font-bold text-sm">
          PEC
        </div>
        <h2 className="text-xl font-bold text-zinc-100 font-mono-code">// AUTHENTICATE_SESSION</h2>
        <p className="text-xs text-zinc-400 font-mono-code">
          Punjab Engineering College (Sector 12, Chandigarh) • Clearance Engine Access Portal
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/30 text-xs font-mono-code text-rose-300 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 font-mono-code text-xs">
        <div>
          <label className="block text-zinc-400 uppercase tracking-wider mb-1">
            Institutional Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. alice@pec.edu.in"
            className="w-full bg-black/50 border border-white/[0.1] rounded-xl p-2.5 text-zinc-100 focus:outline-hidden focus:border-rose-500"
            required
          />
        </div>
        <div>
          <label className="block text-zinc-400 uppercase tracking-wider mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-black/50 border border-white/[0.1] rounded-xl p-2.5 text-zinc-100 focus:outline-hidden focus:border-rose-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>{loading ? '// authenticating...' : '// sign_in'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Demo Switcher Quick Buttons */}
      <div className="mt-8 pt-6 border-t border-white/[0.08]">
        <p className="text-[10px] font-mono-code uppercase tracking-wider text-zinc-500 mb-3 flex items-center space-x-1.5">
          <UserCheck className="w-3.5 h-3.5 text-rose-400" />
          <span>DEMO QUICK ACCESS // PRE-SEEDED</span>
        </p>
        <div className="space-y-2">
          {DEMO_USERS.slice(0, 5).map((demo) => (
            <button
              key={demo.email}
              type="button"
              onClick={() => demoLogin(demo.email)}
              className="w-full text-left p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] transition text-xs font-mono-code flex justify-between items-center cursor-pointer"
            >
              <div className="truncate mr-2">
                <span className="font-semibold text-zinc-200 block truncate">{demo.label}</span>
                <span className="text-[10px] text-zinc-500 block truncate">{demo.desc}</span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 shrink-0">
                AUTH
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
