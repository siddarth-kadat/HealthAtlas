import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Map as MapIcon, 
  LayoutDashboard, 
  Settings, 
  Users, 
  AlertTriangle, 
  BookOpen, 
  TrendingUp,
  LogOut,
  Activity,
  Trophy,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Health Scorecard', icon: Trophy, path: '/scorecard' },
    { name: 'Global Rankings', icon: BarChart3, path: '/rankings' },
    { name: 'Predictions', icon: TrendingUp, path: '/predictions' },
    { name: 'Alerts', icon: AlertTriangle, path: '/alerts' },
    { name: 'Map View', icon: MapIcon, path: '/map' },
    { name: 'Story Mode', icon: BookOpen, path: '/stories' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const adminItems = [
    { name: 'Engine Console', icon: Activity, path: '/admin' },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-slate-900 text-white rounded-md shadow-lg"
      >
        <LayoutDashboard className="w-6 h-6" />
      </button>

      <div className={`
        w-64 h-screen sidebar-glass flex flex-col fixed left-0 top-0 overflow-y-auto z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      <div className="px-6 py-7 flex items-center gap-3 border-b border-slate-100">
        <div className="w-11 h-11 bg-gradient-to-br from-[#2196F3] to-[#4F46E5] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Plus className="w-7 h-7 text-white" strokeWidth={2.6} />
        </div>
        <span className="text-[1.35rem] font-extrabold text-slate-900 tracking-tight">HealthAtlas</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-5">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-none text-[15px] font-semibold transition-all overflow-hidden ${
                isActive 
                  ? 'bg-blue-50 text-[#2196F3]' 
                  : 'text-slate-400 hover:text-[#2196F3] hover:bg-slate-50'
              }`}
            >
              {isActive && <span className="absolute right-0 top-0 h-full w-1 bg-[#2196F3] rounded-l-full"></span>}
              <item.icon className="w-4 h-4" strokeWidth={isActive ? 2.6 : 2} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {user?.role === 'admin' && (
          <>
            <div className="pt-4 pb-2 px-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Admin</p>
            </div>
            {adminItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center gap-3 px-4 py-3 text-[15px] font-semibold transition-all overflow-hidden ${
                    isActive 
                      ? 'bg-blue-50 text-[#2196F3]' 
                      : 'text-slate-400 hover:text-[#2196F3] hover:bg-slate-50'
                  }`}
                >
                  {isActive && <span className="absolute right-0 top-0 h-full w-1 bg-[#2196F3] rounded-l-full"></span>}
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-5 mt-auto border-t border-slate-100">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2196F3] to-[#4F46E5] flex-shrink-0 flex items-center justify-center text-white text-sm font-bold uppercase shadow-md shadow-blue-500/20">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <Link 
            to="/login"
            className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-[#2196F3] hover:bg-blue-50 rounded-2xl transition-colors text-sm font-semibold"
          >
            <Users className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
      </div>
    </>
  );
};

export default Sidebar;
