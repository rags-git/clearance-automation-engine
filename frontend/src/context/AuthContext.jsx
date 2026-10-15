import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_USERS = [
  {
    role: 'STUDENT',
    label: 'Alice Sharma (B.Tech CSE - SID: 22103042)',
    email: 'alice@pec.edu.in',
    desc: 'B.Tech CSE (Batch 2022-26). All 5 gates approved. PEC certificate ready.',
  },
  {
    role: 'STUDENT',
    label: 'Bobdeep Singh (B.Tech ECE - SID: 22104018)',
    email: 'bob@pec.edu.in',
    desc: 'B.Tech ECE. Library & Kurukshetra Hostel cleared; Gymkhana ₹500 pending.',
  },
  {
    role: 'STUDENT',
    label: 'Charlie Verma (B.Tech Mech - SID: 22105029)',
    email: 'charlie@pec.edu.in',
    desc: 'B.Tech Mech. Shivalik mess fee (₹3,500) disputed; SLA breached & escalated to DAA.',
  },
  {
    role: 'STUDENT',
    label: 'Alex Grover (B.Tech CSE - SID: 22103001)',
    email: 'student@pec.edu.in',
    desc: 'B.Tech CSE student ready to submit new clearance for live demonstration.',
  },
  {
    role: 'STAFF',
    label: 'Librarian / Head, Central Library (Gate 1)',
    email: 'library@pec.edu.in',
    desc: 'Dr. B.R. Ambedkar Central Library, PEC Chandigarh',
  },
  {
    role: 'STAFF',
    label: 'Chief Warden (Hostels - Gate 1)',
    email: 'hostel@pec.edu.in',
    desc: 'Shivalik, Kurukshetra, Himalaya, Aravali, KCH Hostels',
  },
  {
    role: 'STAFF',
    label: 'President Gymkhana / Sports In-Charge (Gate 1)',
    email: 'sports@pec.edu.in',
    desc: 'PEC Gymkhana, Swimming Pool & Athletic Complex',
  },
  {
    role: 'STAFF',
    label: 'Head of Department (HOD) - Computing & Labs (Gate 2)',
    email: 'labs@pec.edu.in',
    desc: 'Departmental Computing & Research Labs (Gate 2 Dependency)',
  },
  {
    role: 'STAFF',
    label: 'Accounts Officer (Finance & Caution Money - Gate 3)',
    email: 'accounts@pec.edu.in',
    desc: 'Caution Money Security Refund & Final Financial Sign-off',
  },
  {
    role: 'ADMIN',
    label: 'Dean Academic Affairs (DAA) - Admin',
    email: 'admin@pec.edu.in',
    desc: 'Dean Academic Affairs (DAA), Punjab Engineering College',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch {
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const demoLogin = async (email) => {
    return await login(email, 'password123');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, demoLogin, logout, DEMO_USERS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
