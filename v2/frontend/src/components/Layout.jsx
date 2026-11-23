import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Truck } from 'lucide-react';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Bar */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30">
            {/* Speed trails behind truck */}
            <span className="absolute -left-1 top-2.5 w-2 h-0.5 bg-blue-300 rounded-full"></span>
            <span className="absolute -left-2 top-4 w-3 h-0.5 bg-blue-200 rounded-full"></span>
            <span className="absolute -left-1.5 top-5.5 w-2 h-0.5 bg-blue-300 rounded-full"></span>
            <Truck className="w-5 h-5 rotate-2" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black tracking-tight text-slate-900 font-sans">
              Ship<span className="text-blue-600 italic">Xpress</span>
            </span>
            <span className="hidden sm:inline-block text-[18px] italic font-medium text-slate-700 border-l border-slate-200 pl-2">
              Logistics & Dispatch Management
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block text-xs font-semibold text-slate-800">
              {user?.username || 'User'}
            </span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider">
              {user?.role || 'Guest'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs font-medium text-slate-600 hover:text-red-600 px-2.5 py-1.5 rounded border border-slate-200 hover:border-red-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Workspace Area */}
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
