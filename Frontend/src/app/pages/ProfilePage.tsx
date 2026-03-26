import React, { useState, useEffect, useRef } from 'react';
import {
  Edit2,
  Save,
  X,
  Camera,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { api, fileToBase64 } from '../../services/api';
import { getUserPortfolio } from '../../services/portfolio';

export function ProfilePage() {
  const { role, currentUser, openModal, updateCurrentUser } = useAppContext();
  const navigate = useNavigate();
  const { userId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isWorker = role === 'worker';
  
  // Determine if viewing own profile or another user's profile
  const viewingOwnProfile = !userId || parseInt(userId) === currentUser?.id;
  const targetUserId = userId ? parseInt(userId) : currentUser?.id;

  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [profilePicture, setProfilePicture] = useState<string | null>(currentUser?.profile_picture || null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewedUserData, setViewedUserData] = useState<any>(null);
  const [viewedUserRole, setViewedUserRole] = useState<string | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  // Fetch user profile including profile picture on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token || !targetUserId) return;

      try {
        const response = await api(`/users/${targetUserId}`, 'GET', undefined, token);
        if (response.status === 'success' && response.data) {
          const { bio: fetchedBio, profile_picture: fetchedProfilePicture, role: fetchedRole, username } = response.data;
          
          if (viewingOwnProfile) {
            // Edit own profile
            if (fetchedBio) setBio(fetchedBio);
            if (fetchedProfilePicture) {
              setProfilePicture(fetchedProfilePicture);
            }
          } else {
            // View another user's profile (read-only)
            setViewedUserData({
              username: username,
              bio: fetchedBio,
              profile_picture: fetchedProfilePicture,
            });
            setViewedUserRole(fetchedRole);
          }
          
          console.log('[PROFILE] User profile fetched:', { bio: fetchedBio, hasPicture: !!fetchedProfilePicture, isOwn: viewingOwnProfile });
        }
      } catch (error) {
        console.error('[PROFILE] Failed to fetch user profile:', error);
      }
    };

    fetchUserProfile();
  }, [targetUserId, viewingOwnProfile]);

  // Fetch portfolio items when viewing another user's profile
  useEffect(() => {
    const fetchPortfolio = async () => {
      // Only fetch if viewing another user's profile and they are a worker
      if (viewingOwnProfile) {
        setPortfolioItems([]);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token || !targetUserId) return;

      try {
        setPortfolioLoading(true);
        const res = await getUserPortfolio(targetUserId, token);
        if (res.status === 'success') {
          setPortfolioItems(res.data || []);
        }
      } catch (err) {
        console.error('[PROFILE] Error fetching portfolio:', err);
        setPortfolioItems([]);
      } finally {
        setPortfolioLoading(false);
      }
    };

    fetchPortfolio();
  }, [targetUserId, viewingOwnProfile]);

  const handleProfilePictureSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token || !currentUser?.id) return;

    setLoading(true);
    try {
      let pictureBase64 = null;

      // Convert file to base64 if a new picture was selected
      if (profilePictureFile) {
        pictureBase64 = await fileToBase64(profilePictureFile);
      }

      const res = await api(
        `/users/${currentUser.id}`,
        'PUT',
        {
          bio: bio,
          profile_picture: pictureBase64 || profilePicture,
        },
        token
      );

      if (res.status === 'success') {
        // Update context with new bio and profile picture so it persists
        updateCurrentUser({
          bio: bio,
          profile_picture: (pictureBase64 || profilePicture) || undefined,
        });
        openModal({ type: 'success', message: 'Profile updated successfully!' });
        setProfilePictureFile(null);
        setEditing(false);
      } else {
        openModal({ type: 'error', message: res.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      openModal({ type: 'error', message: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-7">
        <h1 style={{ color: '#3C3F20' }}>Profile</h1>
        <p className="text-sm opacity-55 mt-0.5" style={{ color: '#3C3F20' }}>
          Your public profile and activity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="space-y-4">
          {/* Profile card */}
          <div
            className="rounded-2xl p-6 shadow-sm text-center"
            style={{ backgroundColor: '#E8E3C8' }}
          >
          {/* Profile picture with edit overlay */}
          <div className="relative inline-block mb-4 group">
            <img
              src={
                viewingOwnProfile
                  ? profilePicture
                    ? profilePicture.startsWith('data:')
                      ? profilePicture
                      : `data:image/png;base64,${profilePicture}`
                    : 'https://via.placeholder.com/96'
                  : viewedUserData?.profile_picture
                    ? viewedUserData.profile_picture.startsWith('data:')
                      ? viewedUserData.profile_picture
                      : `data:image/png;base64,${viewedUserData.profile_picture}`
                    : 'https://via.placeholder.com/96'
              }
              alt={viewingOwnProfile ? currentUser?.username : viewedUserData?.username}
              className="w-24 h-24 rounded-full object-cover border-4"
              style={{ borderColor: '#BFC897' }}
            />
            <span
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
              style={{ backgroundColor: '#BFC897' }}
            >
              <span className="w-2 h-2 rounded-full bg-white" />
            </span>
            {editing && viewingOwnProfile && (
              <label
                className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera size={20} className="text-white" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {editing ? (
            <div className="space-y-3 text-left">
              <div>
                <label className="text-xs opacity-60" style={{ color: '#3C3F20' }}>
                  Profile Picture
                </label>
                <label className="block w-full rounded-xl px-4 py-2 text-sm border-2 border-dashed text-center cursor-pointer hover:bg-opacity-50 transition-all mt-2"
                  style={{ borderColor: '#BFC897', backgroundColor: '#FDF9EB', color: '#3C3F20' }}>
                  {profilePictureFile ? profilePictureFile.name : 'Click to upload a photo'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureSelect}
                    className="hidden"
                  />
                </label>
              </div>
              <textarea
                rows={3}
                placeholder="Add a bio..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
                style={{ backgroundColor: '#FDF9EB', color: '#3C3F20' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer disabled:opacity-40"
                  style={{ backgroundColor: '#3C3F20' }}
                >
                  <Save size={13} /> Save
                </button>
                <button
                  onClick={() => {
                    setBio(currentUser?.bio || '');
                    setProfilePicture(currentUser?.profile_picture || null);
                    setProfilePictureFile(null);
                    setEditing(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm border transition-all hover:bg-black/5 cursor-pointer"
                  style={{ borderColor: '#3C3F20', color: '#3C3F20' }}
                >
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="mb-0.5" style={{ color: '#3C3F20' }}>
                {viewingOwnProfile ? currentUser?.username : viewedUserData?.username}
              </h2>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full inline-block mb-3 capitalize"
                style={{ backgroundColor: '#BFC897', color: '#3C3F20' }}
              >
                {viewingOwnProfile ? role : viewedUserRole}
              </span>
              <p
                className="text-xs opacity-55 mb-5 leading-relaxed px-2"
                style={{ color: '#3C3F20' }}
              >
                {viewingOwnProfile ? (bio || 'No bio yet') : (viewedUserData?.bio || 'No bio yet')}
              </p>
              {viewingOwnProfile && (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: '#3C3F20' }}
                >
                  <Edit2 size={13} />
                  Edit Profile
                </button>
              )}
            </>
          )}
        </div>
      </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Portfolio Section - Only show when viewing another user's profile */}
          {!viewingOwnProfile && viewedUserRole === 'worker' && (
            <div>
              <h3 className="mb-4 font-semibold" style={{ color: '#3C3F20' }}>
                Portfolio
              </h3>
              {portfolioLoading ? (
                <div
                  className="rounded-2xl p-8 text-center"
                  style={{ backgroundColor: '#E8E3C8' }}
                >
                  <p className="opacity-50" style={{ color: '#3C3F20' }}>
                    Loading portfolio...
                  </p>
                </div>
              ) : portfolioItems.length === 0 ? (
                <div
                  className="rounded-2xl p-8 text-center"
                  style={{ backgroundColor: '#E8E3C8' }}
                >
                  <p className="opacity-50" style={{ color: '#3C3F20' }}>
                    No portfolio items yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {portfolioItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group border-2 border-transparent hover:border-[#BFC897]"
                      style={{ backgroundColor: '#E8E3C8' }}
                    >
                      {/* Thumbnail */}
                      <div className="relative overflow-hidden h-32">
                        <img
                          src={
                            item.media_file
                              ? `data:image/png;base64,${item.media_file}`
                              : 'https://via.placeholder.com/300x200?text=No+Image'
                          }
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                        <a
                          href={item.project_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: '#BFC897' }}
                        >
                          <ExternalLink size={13} style={{ color: '#3C3F20' }} />
                        </a>
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        <h4 className="mb-1 truncate text-sm" style={{ color: '#3C3F20' }}>
                          {item.title}
                        </h4>
                        <p
                          className="text-xs opacity-55 line-clamp-2 leading-relaxed mb-2"
                          style={{ color: '#3C3F20' }}
                        >
                          {item.description || 'No description'}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Calendar size={10} style={{ color: '#3C3F20' }} className="opacity-35" />
                            <span className="text-xs opacity-35" style={{ color: '#3C3F20' }}>
                              {item.created_at
                                ? new Date(item.created_at).toLocaleDateString()
                                : 'Just now'}
                            </span>
                          </div>
                          <a
                            href={item.project_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2.5 py-1 rounded-lg transition-all hover:opacity-80 cursor-pointer"
                            style={{ backgroundColor: '#BFC897', color: '#3C3F20' }}
                          >
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
