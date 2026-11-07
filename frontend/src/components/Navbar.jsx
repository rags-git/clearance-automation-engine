import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { ShieldCheck, LogOut, ChevronDown, Terminal, Sun, Moon } from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab, isDarkMode, setIsDarkMode }) => {
  const { user, logout, demoLogin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roleBadgeStyles = {
    STUDENT: 'bg-blue-50 text-blue-700 border-blue-200',
    STAFF: 'bg-amber-50 text-amber-700 border-amber-200',
    ADMIN: 'bg-violet-50 text-violet-700 border-violet-200',
  };

  return (
    <nav className="sticky top-0 z-40 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] shadow-sm">
      {/* Top Engineering Strip with Vivid Color Coding */}
      <div className="bg-slate-900 text-slate-200 text-[11px] py-2 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold">Punjab Engineering College</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-300 hidden sm:inline">Academic clearance portal</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-300 text-[10px]">
          <span className="text-emerald-300 font-semibold">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />System online
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Platform Name */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setCurrentTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-700 p-[1px]">
              <div className="w-full h-full bg-blue-700 rounded-[11px] flex items-center justify-center text-white font-bold text-sm tracking-tight">
                PEC
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base text-[var(--text-primary)] tracking-tight font-mono-code">
                  Clearance<span className="text-blue-700"> Portal</span>
                </span>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                  PEC
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] hidden sm:block font-mono-code">
                Student, staff and administration services
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
                  <span className="hidden sm:inline text-[10px] text-amber-300 font-semibold">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline text-[10px] text-indigo-600 font-semibold">Dark</span>
                </>
              )}
            </button>

            {user && (
              <button
                onClick={() => setCurrentTab('home')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-code transition cursor-pointer ${
                  currentTab === 'home'
                    ? 'bg-blue-700 text-white border border-blue-700 shadow-sm font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Dashboard
              </button>
            )}

            <button
              onClick={() => setCurrentTab('verify')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-code transition flex items-center space-x-1.5 cursor-pointer ${
                currentTab === 'verify'
                  ? 'bg-blue-700 text-white border border-blue-700 shadow-sm font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify certificate</span>
            </button>

            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg text-xs font-mono-code border border-[var(--border-subtle)] transition cursor-pointer"
                title="Switch persona for evaluation"
              >
                <Terminal className="w-3.5 h-3.5 text-blue-700" />
                <span className="hidden md:inline font-semibold">Demo accounts</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-96 bg-[var(--bg-surface-hover)] backdrop-blur-2xl rounded-2xl shadow-2xl border border-[var(--border-subtle)] py-2 z-50 text-left overflow-hidden"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        Choose a demo account
                      </span>
                      <span className="text-[10px] text-blue-700 font-semibold">8 accounts</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Choose a role to explore the portal
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
                  <p className="text-[10px] font-mono-code text-blue-700 font-semibold">
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
