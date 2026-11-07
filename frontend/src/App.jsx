import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './pages/StudentDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { VerifyCertificate } from './pages/VerifyCertificate';
import { Login } from './pages/Login';
import { ShieldCheck, Cpu } from 'lucide-react';

function MainApp() {
  const { user, loading, demoLogin } = useAuth();
  const [currentTab, setCurrentTab] = useState('home'); // 'home', 'verify'
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Sync dark class on html root element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Auto-login as Raghav Bhardwaj (PEC CSE Student SID: 24106017) on initial load
  useEffect(() => {
    if (!user && !localStorage.getItem('token')) {
      demoLogin('raghav@pec.edu.in');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
          <span className="font-mono-code text-xs text-[var(--text-secondary)] tracking-wider">SYSTEM INITIALIZING...</span>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (currentTab === 'verify') {
      return <div className="animate-in-fade"><VerifyCertificate /></div>;
    }

    if (!user) {
      return <div className="animate-in-fade"><Login /></div>;
    }

    switch (user.role) {
      case 'STUDENT':
        return <div className="animate-in-fade"><StudentDashboard user={user} /></div>;
      case 'STAFF':
        return <div className="animate-in-fade"><StaffDashboard user={user} /></div>;
      case 'ADMIN':
        return <div className="animate-in-fade"><AdminDashboard user={user} /></div>;
      default:
        return <div className="animate-in-fade"><Login /></div>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col relative selection:bg-rose-500/40 selection:text-white overflow-hidden transition-colors duration-400">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {renderContent()}
      </main>

      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-5 text-xs text-[var(--text-secondary)] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[var(--text-primary)]">Punjab Engineering College (PEC Chandigarh)</span>
            <span className="text-zinc-400">•</span>
            <span className="font-mono-code text-[11px] text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/30 font-bold">
              Clearance platform
            </span>
          </div>
          <div className="flex items-center space-x-4 font-mono-code text-[11px] text-[var(--text-secondary)]">
            <span className="flex items-center space-x-1.5 text-emerald-500 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified approvals</span>
            </span>
            <span className="text-zinc-400">•</span>
            <span className="flex items-center space-x-1 text-[var(--text-secondary)] font-bold">
              <Cpu className="w-3.5 h-3.5 text-cyan-500" />
              <span>Grievance tracking</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
