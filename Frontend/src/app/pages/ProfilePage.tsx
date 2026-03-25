import React, { useState, useEffect, useRef } from 'react';
import {
  Edit2,
  CheckCircle2,
  Layers,
  TrendingUp,
  Clock,
  ArrowRight,
  Save,
  X,
  Camera,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getAcceptedTasks, getTasksByPosterId } from '../../services/task';
import { api, fileToBase64 } from '../../services/api';

export function ProfilePage() {
  const { role, currentUser, openModal, updateCurrentUser } = useAppContext();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isWorker = role === 'worker';

  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [profilePicture, setProfilePicture] = useState<string | null>(currentUser?.profile_picture || null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's tasks based on role
  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem('token');
      if (!token || !currentUser?.id) return;

      try {
        if (isWorker) {
          // Fetch accepted tasks for workers
          const response = await getAcceptedTasks(token);
          if (response.status === 'success' && response.data) {
            setUserTasks(response.data.slice(0, 5));
          }
        } else {
          // Fetch posted tasks for employers
          const response = await getTasksByPosterId(currentUser.id, token);
          if (response.status === 'success' && response.data) {
            setUserTasks(response.data.slice(0, 5));
          }
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        setUserTasks([]);
      }
    };

    fetchTasks();
  }, [isWorker, currentUser?.id]);

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
                profilePicture
                  ? profilePicture.startsWith('data:')
                    ? profilePicture
                    : `data:image/png;base64,${profilePicture}`
                  : 'https://via.placeholder.com/96'
              }
              alt={currentUser?.username}
              className="w-24 h-24 rounded-full object-cover border-4"
              style={{ borderColor: '#BFC897' }}
            />
            <span
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
              style={{ backgroundColor: '#BFC897' }}
            >
              <span className="w-2 h-2 rounded-full bg-white" />
            </span>
            {editing && (
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
                {currentUser?.username}
              </h2>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full inline-block mb-3 capitalize"
                style={{ backgroundColor: '#BFC897', color: '#3C3F20' }}
              >
                {role}
              </span>
              <p
                className="text-xs opacity-55 mb-5 leading-relaxed px-2"
                style={{ color: '#3C3F20' }}
              >
                {bio || 'No bio yet'}
              </p>
              <button
                onClick={() => setEditing(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: '#3C3F20' }}
              >
                <Edit2 size={13} />
                Edit Profile
              </button>
            </>
          )}
        </div>

          {/* Stats */}
          <div
            className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: '#E8E3C8' }}
          >
            <h4 className="mb-4 opacity-55" style={{ color: '#3C3F20' }}>
              Stats
            </h4>
            <div className="space-y-3">
              {isWorker ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} style={{ color: '#BFC897' }} />
                      <span className="text-sm" style={{ color: '#3C3F20' }}>
                        Active Tasks
                      </span>
                    </div>
                    <span
                      className="text-sm px-2.5 py-0.5 rounded-lg"
                      style={{ backgroundColor: '#FDF9EB', color: '#3C3F20' }}
                    >
                      {userTasks.length}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} style={{ color: '#BFC897' }} />
                      <span className="text-sm" style={{ color: '#3C3F20' }}>
                        Tasks Posted
                      </span>
                    </div>
                    <span
                      className="text-sm px-2.5 py-0.5 rounded-lg"
                      style={{ backgroundColor: '#FDF9EB', color: '#3C3F20' }}
                    >
                      {userTasks.length}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 space-y-5">
          {isWorker ? (
            <>
              {/* Task history */}
              <div
                className="rounded-2xl p-6 shadow-sm"
                style={{ backgroundColor: '#E8E3C8' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{ color: '#3C3F20' }}>Recent Tasks</h3>
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl transition-all hover:opacity-85 cursor-pointer"
                    style={{ backgroundColor: '#BFC897', color: '#3C3F20' }}
                  >
                    All Tasks <ArrowRight size={12} />
                  </button>
                </div>
                {userTasks.length > 0 ? (
                  <div className="space-y-2">
                    {userTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:border-[#BFC897] border-2 border-transparent transition-all"
                        style={{ backgroundColor: '#FDF9EB' }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate" style={{ color: '#3C3F20' }}>
                            {task.title}
                          </p>
                          <p className="text-xs opacity-40" style={{ color: '#3C3F20' }}>
                            {task.status || 'Open'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs opacity-50" style={{ color: '#3C3F20' }}>
                    No tasks yet
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Posted tasks */}
              <div
                className="rounded-2xl p-6 shadow-sm"
                style={{ backgroundColor: '#E8E3C8' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{ color: '#3C3F20' }}>Posted Tasks</h3>
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl transition-all hover:opacity-85 cursor-pointer"
                    style={{ backgroundColor: '#BFC897', color: '#3C3F20' }}
                  >
                    All Tasks <ArrowRight size={12} />
                  </button>
                </div>
                {userTasks.length > 0 ? (
                  <div className="space-y-2">
                    {userTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:border-[#BFC897] border-2 border-transparent transition-all"
                        style={{ backgroundColor: '#FDF9EB' }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate" style={{ color: '#3C3F20' }}>
                            {task.title}
                          </p>
                          <p className="text-xs opacity-40" style={{ color: '#3C3F20' }}>
                            {task.status || 'Open'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs opacity-50" style={{ color: '#3C3F20' }}>
                    No tasks posted yet
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
