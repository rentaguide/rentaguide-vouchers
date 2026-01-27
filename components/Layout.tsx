
import React from 'react';
import { ViewMode } from '../types';
import { supabase } from '../services/supabaseClient';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  const isCloud = !!supabase;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar - Hidden on print */}
      <aside className="no-print w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6 md:fixed md:w-64 h-full flex flex-col">
          {/* Sidebar Branding */}
          <div className="flex flex-col mb-10">
            <h1 className="text-2xl font-black tracking-tight leading-none text-white italic">
              Rent-a-Guide
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Professional Guide Services
            </p>
          </div>
          
          <nav className="space-y-2 flex-grow">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`w-full text-left flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${
                activeView === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <i className="fas fa-th-large"></i>
              <span className="font-bold">Dashboard</span>
            </button>
            <button
              onClick={() => onViewChange('create')}
              className={`w-full text-left flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${
                activeView === 'create' || activeView === 'edit' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <i className="fas fa-plus-circle"></i>
              <span className="font-bold">New Voucher</span>
            </button>
            <button
              onClick={() => onViewChange('manage')}
              className={`w-full text-left flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${
                activeView === 'manage' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <i className="fas fa-users-cog"></i>
              <span className="font-bold">Manage Lists</span>
            </button>
          </nav>

          {/* Sync Status Indicator */}
          <div className="mt-auto pt-6 border-t border-slate-800">
            <div className="flex items-center space-x-2 text-slate-400 text-[10px] uppercase font-black tracking-widest">
              <div className={`w-2 h-2 rounded-full ${isCloud ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]'}`}></div>
              <span>{isCloud ? 'Cloud Sync Active' : 'Local Storage Mode'}</span>
            </div>
            <p className="text-[9px] text-slate-600 mt-1 font-bold">
              {isCloud ? 'SUPABASE SECURE CONNECTION' : 'NO KEYS FOUND - SAVING LOCALLY'}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 md:p-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;
