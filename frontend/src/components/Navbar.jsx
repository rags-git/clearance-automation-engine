import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { ShieldCheck, UserCheck, LogOut, ChevronDown, GraduationCap } from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab }) => {
  const { user, logout, demoLogin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roleColors = {
    STUDENT: 'bg-red-100 text-red-700 border-red-300',
    STAFF: 'bg-amber-100 text-amber-800 border-amber-300',
    ADMIN: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top PEC Institutional Strip */}
      <div className="bg-gradient-to-r from-red-950 via-rose-900 to-red-900 text-amber-200 text-[11px] py-1 px-4 text-center font-medium tracking-wide">
        Punjab Engineering College (Deemed to be University), Sector 12, Chandigarh • Estd. 1921
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-800 to-amber-600 flex items-center justify-center text-white shadow-sm font-black text-lg">
              PEC
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">ClearanceEngine</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                  PEC Chandigarh
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Office of Dean Academic Affairs (DAA) • No-Dues Automation</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user && (
              <button
                onClick={() => setCurrentTab('home')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                  currentTab === 'home'
                    ? 'bg-red-50 text-red-800 font-semibold border border-red-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Dashboard
              </button>
            )}

            <button
              onClick={() => setCurrentTab('verify')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center space-x-1.5 ${
                currentTab === 'verify'
                  ? 'bg-red-50 text-red-800 font-semibold border border-red-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verify Certificate</span>
            </button>

            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-300 transition"
                title="Switch PEC persona for live evaluation"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden md:inline">PEC Demo Personas</span>
                <span className="md:hidden">Personas</span>
                <ChevronDown className="w-3 h-3 text-amber-700" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-88 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-left"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">PEC Chandigarh Evaluator Switcher</p>
                    <p className="text-[10px] text-slate-500">Switch role to inspect Dr. B.R. Ambedkar Library, Hostels, Gymkhana, Labs, or DAA.</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                    {DEMO_USERS.map((demo) => (
                      <button
                        key={demo.email}
                        onClick={async () => {
                          setDropdownOpen(false);
                          await demoLogin(demo.email);
                          setCurrentTab('home');
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 transition flex items-start space-x-2.5 ${
                          user?.email === demo.email ? 'bg-red-50/70 border-l-3 border-red-700' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${roleColors[demo.role]}`}>
                            {demo.role}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate">{demo.label}</p>
                          <p className="text-[11px] text-slate-500 truncate">{demo.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Logout */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{user.full_name}</p>
                  <p className="text-[10px] font-mono text-slate-500">{user.roll_number ? `SID: ${user.roll_number}` : user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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
