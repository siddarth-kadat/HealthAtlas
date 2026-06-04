import React from 'react';
import { Sun, Moon, Bell, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-20 glass-nav fixed top-0 right-0 left-0 lg:left-64 z-40 px-5 md:px-8 flex items-center justify-between shrink-0 transition-all">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-[-0.04em] hidden md:block">Global Surveillance Dashboard</h1>
          <p className="hidden lg:block text-sm text-slate-500 -mt-0.5">Monitoring global health intelligence in real time</p>
        </div>
        <span className="px-3 py-1.5 bg-green-100 text-green-700 text-[11px] font-extrabold rounded-full uppercase tracking-tight flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          Live: Sync Stable
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-10 w-px bg-slate-200 mx-2 hidden sm:block"></div>

        <button 
          onClick={() => navigate('/settings')}
          className="w-11 h-11 flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-sm"
        >
          <SettingsIcon className="w-5 h-5 text-slate-500" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
