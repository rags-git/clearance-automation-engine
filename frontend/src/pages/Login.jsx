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
    <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-xl">
      <div className="text-center space-y-2 mb-6">
        <div className="w-12 h-12 bg-red-900 text-amber-200 rounded-2xl flex items-center justify-center mx-auto shadow-md font-black text-xl">
          PEC
        </div>
        <h2 className="text-2xl font-black text-slate-900">Sign in to PEC Clearance Engine</h2>
        <p className="text-xs text-slate-500">
          Punjab Engineering College (Sector 12, Chandigarh) • Enter credentials or pick a demo evaluator persona.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Institutional Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. alice@university.edu"
            className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-xs flex items-center justify-center space-x-2"
        >
          <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Demo Switcher Quick Buttons */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1">
          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>One-Click Demo Personas (Evaluation)</span>
        </p>
        <div className="space-y-2">
          {DEMO_USERS.slice(0, 5).map((demo) => (
            <button
              key={demo.email}
              type="button"
              onClick={() => demoLogin(demo.email)}
              className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-xs flex justify-between items-center"
            >
              <div>
                <span className="font-bold text-slate-800 block">{demo.label}</span>
                <span className="text-[10px] text-slate-400">{demo.desc}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                Log in
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
