import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, UserCheck } from 'lucide-react';

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
    <div className="max-w-md mx-auto my-12 glow-card rounded-2xl p-8">
      <div className="text-center space-y-2 mb-7">
        <div className="w-12 h-12 bg-blue-50 border border-blue-100 text-blue-800 rounded-xl flex items-center justify-center mx-auto font-bold text-sm">
          PEC
        </div>
        <h2 className="text-xl font-bold text-zinc-100">Sign in to your account</h2>
        <p className="text-sm text-zinc-400">
          Punjab Engineering College clearance services
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/30 text-xs font-mono-code text-rose-300 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block text-zinc-600 font-medium mb-1.5">
            Institutional Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@pec.edu.in"
            className="w-full rounded-lg p-3 text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <div>
          <label className="block text-zinc-600 font-medium mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg p-3 text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm rounded-lg transition flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>{loading ? 'Signing in…' : 'Sign in'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Demo Switcher Quick Buttons */}
      <div className="mt-8 pt-6 border-t border-white/[0.08]">
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3 flex items-center space-x-1.5">
          <UserCheck className="w-3.5 h-3.5 text-blue-700" />
          <span>Quick access for demonstration</span>
        </p>
        <div className="space-y-2">
          {DEMO_USERS.slice(0, 5).map((demo) => (
            <button
              key={demo.email}
              type="button"
              onClick={() => demoLogin(demo.email)}
              className="w-full text-left p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-sm flex justify-between items-center cursor-pointer"
            >
              <div className="truncate mr-2">
                <span className="font-semibold text-zinc-200 block truncate">{demo.label}</span>
                <span className="text-xs text-zinc-500 block truncate">{demo.desc}</span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 shrink-0">
                Open
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
