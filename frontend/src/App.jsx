import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './pages/StudentDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { VerifyCertificate } from './pages/VerifyCertificate';
import { Login } from './pages/Login';
import { ShieldCheck, Terminal, Cpu } from 'lucide-react';

function MainApp() {
  const { user, loading, demoLogin } = useAuth();
  const [currentTab, setCurrentTab] = useState('home'); // 'home', 'verify'
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
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

  // Smooth mouse-tracking ambient glow effect (Suyash Kansal design motif)
  useEffect(() => {
    let animationFrameId;
    const handleMouseMove = (e) => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
      {/* Dynamic Cursor Light Aura */}
      <div
        className="interactive-cursor-glow"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
        }}
      />

      {/* Background Matrix Grid & Vivid Ambient Aurora Orbs */}
      <div className="fixed inset-0 bg-radial-grid opacity-60 pointer-events-none" />
      <div className="fixed top-[-80px] left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-rose-500/25 via-purple-500/15 to-transparent blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="fixed top-[20%] left-[-150px] w-[500px] h-[500px] bg-cyan-500/15 blur-3xl pointer-events-none animate-float" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[650px] h-[550px] bg-emerald-500/15 blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Floating Animated Electric Accent Line */}
      <div className="circuit-line h-[2px] w-full bg-rose-500/20 fixed top-0 left-0 z-50 pointer-events-none" />

      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {renderContent()}
      </main>

      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-md py-6 text-xs text-[var(--text-secondary)] relative z-10 transition-colors duration-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[var(--text-primary)]">Punjab Engineering College (PEC Chandigarh)</span>
            <span className="text-zinc-400">•</span>
            <span className="font-mono-code text-[11px] text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/30 font-bold">
              CoR 3-Gate Engine v2.4.0
            </span>
          </div>
          <div className="flex items-center space-x-4 font-mono-code text-[11px] text-[var(--text-secondary)]">
            <span className="flex items-center space-x-1.5 text-emerald-500 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HMAC-SHA256 Seals</span>
            </span>
            <span className="text-zinc-400">•</span>
            <span className="flex items-center space-x-1 text-[var(--text-secondary)] font-bold">
              <Cpu className="w-3.5 h-3.5 text-cyan-500" />
              <span>SLA Escalation Engine</span>
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
