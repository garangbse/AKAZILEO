import { Navigate, Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
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
import { api } from '../../services/api';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/marketplace', label: 'Task Marketplace', icon: ShoppingBag, end: false },
  { to: '/portfolio', label: 'Portfolio', icon: Briefcase, end: false, workerOnly: true },
  { to: '/feed', label: 'Posts / Feed', icon: Rss, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];


export function Layout() {
  const { role, setRole, roles, isAuthenticated, isSessionRestoring, currentUser } = useAppContext();
  console.log("GUARD AUTH",isAuthenticated)
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState<string | null>(currentUser?.profile_picture || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Listen to context profilePicture changes and update local state
  useEffect(() => {
    if (currentUser?.profile_picture) {
      setProfilePicture(currentUser.profile_picture);
      console.log('[LAYOUT] Profile picture updated from context');
    }
  }, [currentUser?.profile_picture]);

  // Fetch user profile picture from database on mount
  useEffect(() => {
    const fetchProfilePicture = async () => {
      const token = localStorage.getItem('token');
      if (!token || !currentUser?.id) return;

      try {
        const response = await api(`/users/${currentUser.id}`, 'GET', undefined, token);
        if (response.status === 'success' && response.data?.profile_picture) {
          setProfilePicture(response.data.profile_picture);
          console.log('[LAYOUT] Profile picture fetched');
        }
      } catch (error) {
        console.error('[LAYOUT] Failed to fetch profile picture:', error);
      }
    };

    fetchProfilePicture();
  }, [currentUser?.id]);

  // Handle search functionality
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api(`/users/search?q=${encodeURIComponent(query)}`, 'GET', undefined, token);
      if (response.status === 'success' && response.data) {
        setSearchResults(response.data);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleProfileSelect = (userId: number) => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    navigate(`/profile/${userId}`);
  };

  if (isSessionRestoring) {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ backgroundColor: '#FDF9EB' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border" style={{ borderColor: '#3C3F20' }} />
          <p className="mt-4" style={{ color: '#3C3F20' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const profile = role === 'worker' ? WORKER_PROFILE : EMPLOYER_PROFILE;

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

        

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems
            .filter((item) => !item.workerOnly || role === 'worker')
            .map((item) => (
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
            src={
              profilePicture
                ? profilePicture.startsWith('data:')
                  ? profilePicture
                  : `data:image/png;base64,${profilePicture}`
                : profile.avatar
            }
            alt={profile.name}
            className="w-9 h-9 rounded-full object-cover border-2 flex-shrink-0"
            style={{ borderColor: '#BFC897' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{currentUser?.username || profile.name}</p>
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
          <div className="relative flex-1 max-w-sm">
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ backgroundColor: '#E8E3C8' }}
            >
              <Search size={14} style={{ color: '#3C3F20' }} className="opacity-50 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                className="flex-1 bg-transparent outline-none text-sm placeholder-[#3C3F20]/40"
                style={{ color: '#3C3F20' }}
              />
            </div>
            {showResults && searchResults.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto"
                style={{ backgroundColor: '#FDF9EB', borderColor: '#E0DBC5', border: '1px solid #E0DBC5' }}
              >
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0"
                    onClick={() => handleProfileSelect(user.id)}
                  >
                    <img
                      src={
                        user.profile_picture
                          ? user.profile_picture.startsWith('data:')
                            ? user.profile_picture
                            : `data:image/png;base64,${user.profile_picture}`
                          : 'https://via.placeholder.com/40'
                      }
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: '#3C3F20' }}>
                        {user.username}
                      </p>
                      <p className="text-xs opacity-50" style={{ color: '#3C3F20' }}>
                        {user.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition-opacity"
            onClick={() => navigate('/profile')}
          >
            <img
              src={
                profilePicture
                  ? profilePicture.startsWith('data:')
                    ? profilePicture
                    : `data:image/png;base64,${profilePicture}`
                  : profile.avatar
              }
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover border-2"
              style={{ borderColor: '#BFC897' }}
            />
            <span className="text-sm hidden sm:block" style={{ color: '#3C3F20' }}>
              {currentUser?.username || profile.name}
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