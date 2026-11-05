import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { ShieldCheck, UserCheck, LogOut, ChevronDown, Terminal, Sun, Moon } from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab, isDarkMode, setIsDarkMode }) => {
  const { user, logout, demoLogin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roleBadgeStyles = {
    STUDENT: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    STAFF: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    ADMIN: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  };

  return (
    <nav className="sticky top-0 z-40 bg-[var(--bg-surface)] backdrop-blur-2xl border-b border-[var(--border-subtle)] shadow-lg transition-colors duration-300">
      {/* Top Engineering Strip with Vivid Color Coding */}
      <div className="bg-gradient-to-r from-slate-950 via-rose-950/80 to-purple-950/60 border-b border-white/[0.08] text-zinc-300 font-mono-code text-[11px] py-1.5 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
          <span className="text-zinc-200 font-bold">SYSTEM STATUS // ONLINE</span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="text-zinc-400 hidden sm:inline">Punjab Engineering College (Deemed to be University)</span>
        </div>
        <div className="flex items-center space-x-3 text-zinc-400 text-[10px]">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
            GATEWAYS: 3 ACTIVE
          </span>
          <span>•</span>
          <span className="text-rose-400 font-bold">SHA-256 HMAC</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Platform Name */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setCurrentTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-950 p-[1px] shadow-lg shadow-rose-900/30">
              <div className="w-full h-full bg-[#0d0e15] rounded-[11px] flex items-center justify-center text-rose-200 font-mono-code font-bold text-sm tracking-tighter group-hover:text-white transition">
                PEC
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base text-[var(--text-primary)] tracking-tight font-mono-code">
                  clearance<span className="text-rose-500">.engine</span>
                </span>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] hidden sm:block font-mono-code">
                DAA Autonomous Clearance Architecture
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-xs font-mono-code transition border border-[var(--border-subtle)] hover:scale-105 active:scale-95 cursor-pointer flex items-center space-x-1 bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
              title={isDarkMode ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline text-[10px] text-amber-300 font-bold">bright</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline text-[10px] text-indigo-600 font-bold">dark</span>
                </>
              )}
            </button>

            {user && (
              <button
                onClick={() => setCurrentTab('home')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-code transition cursor-pointer ${
                  currentTab === 'home'
                    ? 'bg-rose-500/15 text-rose-500 dark:text-white border border-rose-500/30 shadow-sm font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                // dashboard
              </button>
            )}

            <button
              onClick={() => setCurrentTab('verify')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-code transition flex items-center space-x-1.5 cursor-pointer ${
                currentTab === 'verify'
                  ? 'bg-rose-500/15 text-rose-500 dark:text-white border border-rose-500/30 shadow-sm font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>// verify</span>
            </button>

            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 bg-gradient-to-r from-rose-500/15 to-purple-500/15 hover:from-rose-500/25 hover:to-purple-500/25 text-[var(--text-primary)] px-3 py-1.5 rounded-lg text-xs font-mono-code border border-rose-500/30 transition cursor-pointer shadow-sm"
                title="Switch persona for evaluation"
              >
                <Terminal className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden md:inline font-bold">personas</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-96 bg-[var(--bg-surface-hover)] backdrop-blur-2xl rounded-2xl shadow-2xl border border-[var(--border-subtle)] py-2 z-50 text-left overflow-hidden"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        PERSONA SELECTOR
                      </span>
                      <span className="text-[10px] font-mono-code text-rose-500 font-bold">8 PROFILES</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Toggle active identity across all clearance gates
                    </p>
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-[var(--border-subtle)]">
                    {DEMO_USERS.map((demo) => (
                      <button
                        key={demo.email}
                        onClick={async () => {
                          setDropdownOpen(false);
                          await demoLogin(demo.email);
                          setCurrentTab('home');
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-rose-500/10 transition flex items-start space-x-3 cursor-pointer ${
                          user?.email === demo.email ? 'bg-rose-500/15 border-l-2 border-rose-500' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          <span
                            className={`text-[9px] font-mono-code font-bold px-1.5 py-0.5 rounded border ${
                              roleBadgeStyles[demo.role]
                            }`}
                          >
                            {demo.role}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--text-primary)] truncate">{demo.label}</p>
                          <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">{demo.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Logout */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-[var(--border-subtle)]">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[140px]">
                    {user.full_name}
                  </p>
                  <p className="text-[10px] font-mono-code text-rose-500 font-bold">
                    {user.roll_number ? `SID: ${user.roll_number}` : user.email}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};
