import { Navigate } from 'react-router';
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  ShoppingBag,
  Briefcase,
  Rss,
  Settings,
  Search,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { WORKER_PROFILE, EMPLOYER_PROFILE } from '../data/mockData';
import { AppModal } from './AppModal';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/marketplace', label: 'Task Marketplace', icon: ShoppingBag, end: false },
  { to: '/portfolio', label: 'Portfolio', icon: Briefcase, end: false },
  { to: '/feed', label: 'Posts / Feed', icon: Rss, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

const { isAuthenticated } = useAppContext();

if (!isAuthenticated) {
  return <Navigate to="/login" replace />;
}

export function Layout() {
  const { role, setRole } = useAppContext();
  const navigate = useNavigate();
  const profile = role === 'worker' ? WORKER_PROFILE : EMPLOYER_PROFILE;
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: '#FDF9EB' }}>
      {/* ── Sidebar ── */}
      <aside
        className="fixed left-0 top-0 h-full w-60 flex flex-col z-20 shadow-xl"
        style={{ backgroundColor: '#3C3F20' }}
      >
        {/* Logo */}
        <div className="flex items-center px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#BFC897' }}
            >
              <Zap size={14} style={{ color: '#3C3F20' }} />
            </div>
            <span className="text-white font-semibold tracking-wide text-lg">AKAZILEO</span>
          </div>
        </div>

        {/* Role toggle */}
        <div className="px-4 py-4 border-b border-white/10">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2 px-1">View as</p>
          <div
            className="flex rounded-xl overflow-hidden p-0.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <button
              onClick={() => setRole('worker')}
              className={`flex-1 py-1.5 text-sm rounded-lg transition-all cursor-pointer ${
                role === 'worker' ? 'font-medium' : 'text-white/50'
              }`}
              style={
                role === 'worker'
                  ? { backgroundColor: '#BFC897', color: '#3C3F20' }
                  : {}
              }
            >
              Worker
            </button>
            <button
              onClick={() => setRole('employer')}
              className={`flex-1 py-1.5 text-sm rounded-lg transition-all cursor-pointer ${
                role === 'employer' ? 'font-medium' : 'text-white/50'
              }`}
              style={
                role === 'employer'
                  ? { backgroundColor: '#BFC897', color: '#3C3F20' }
                  : {}
              }
            >
              Employer
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'font-medium'
                    : 'text-white/65 hover:text-white hover:bg-white/8'
                }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: '#BFC897', color: '#3C3F20' } : {}
              }
            >
              <item.icon size={17} />
              <span className="text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Profile */}
        <div
          className="px-4 py-4 border-t border-white/10 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-all"
          onClick={() => navigate('/profile')}
        >
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-9 h-9 rounded-full object-cover border-2 flex-shrink-0"
            style={{ borderColor: '#BFC897' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{profile.name}</p>
            <p className="text-white/40 text-xs capitalize">{role}</p>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col ml-60 min-h-0">
        {/* Header */}
        <header
          className="sticky top-0 z-10 flex items-center gap-4 px-6 h-14 border-b flex-shrink-0"
          style={{ backgroundColor: '#FDF9EB', borderColor: '#E0DBC5' }}
        >
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 max-w-sm"
            style={{ backgroundColor: '#E8E3C8' }}
          >
            <Search size={14} style={{ color: '#3C3F20' }} className="opacity-50 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search tasks, workers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm placeholder-[#3C3F20]/40"
              style={{ color: '#3C3F20' }}
            />
          </div>

          <div className="flex-1" />

          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition-opacity"
            onClick={() => navigate('/profile')}
          >
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover border-2"
              style={{ borderColor: '#BFC897' }}
            />
            <span className="text-sm hidden sm:block" style={{ color: '#3C3F20' }}>
              {profile.name}
            </span>
            <ChevronDown size={13} style={{ color: '#3C3F20' }} className="opacity-50" />
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <AppModal />
    </div>
  );
}