import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Lock,
  Trash2,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getNotifications, markNotificationRead } from '../../services/task';
import { deleteUserAccount, changePassword } from '../../services/api';

type SettingGroup = {
  label: string;
  items: {
    icon: React.ReactNode;
    title: string;
    description: string;
    badge?: string;
  }[];
};

const SETTING_GROUPS: SettingGroup[] = [
  {
    label: 'Account',
    items: [
      {
        icon: <Bell size={16} />,
        title: 'Notifications',
        description: 'Manage email and in-app notification preferences',
        badge: '3 new',
      },
    ],
  },
  {
    label: 'Preferences',
    items: [
      {
        icon: <Lock size={16} />,
        title: 'Change Password',
        description: 'Update your login password',
      },
    ],
  },
  {
    label: 'Danger Zone',
    items: [
      {
        icon: <Trash2 size={16} />,
        title: 'Delete Account',
        description: 'Permanently delete your account and all data',
      },
    ],
  },
  {
    label: 'Session',
    items: [
      {
        icon: <LogOut size={16} />,
        title: 'Logout',
        description: 'End your current session',
      },
    ],
  },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAppContext();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (activeItem === 'Notifications') {
      setLoadingNotifications(true);
      setNotificationError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setNotificationError('Please log in to view notifications');
        setLoadingNotifications(false);
        return;
      }
      
      getNotifications(token)
        .then((response) => {
          if (response.status === 'success') {
            setNotifications(response.data);
          } else {
            setNotificationError('Failed to load notifications');
          }
        })
        .catch((error) => {
          console.error('Failed to fetch notifications:', error);
          setNotificationError('Failed to load notifications. Please try again.');
        })
        .finally(() => setLoadingNotifications(false));
    }
  }, [activeItem]);

  const handleNotificationRead = async (notificationId: number) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setNotificationError('Please log in to update notifications');
      return;
    }
    
    try {
      const response = await markNotificationRead(notificationId, token);
      if (response.status === 'success') {
        // Update local state to mark as read
        setNotifications(
          notifications.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
      } else {
        setNotificationError('Failed to update notification');
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      setNotificationError('Failed to update notification. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('token');
    if (!token || !currentUser?.id) return;

    setDeleteLoading(true);
    try {
      const response = await deleteUserAccount(currentUser.id, token);
      if (response.status === 'success') {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        
        // Logout from context
        logout();
        
        // Navigate to login page
        navigate('/login', { replace: true });
      } else {
        alert(response.message || 'Failed to delete account');
        setDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
      setDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation
    if (!currentPassword.trim()) {
      setPasswordError('Current password is required');
      return;
    }
    if (!newPassword.trim()) {
      setPasswordError('New password is required');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token || !currentUser?.id) {
      setPasswordError('Please log in to change password');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await changePassword(
        currentUser.id,
        currentPassword,
        newPassword,
        token
      );
      if (response.status === 'success') {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Reset success message after 3 seconds
        setTimeout(() => {
          setPasswordSuccess(false);
          setActiveItem(null);
        }, 3000);
      } else {
        setPasswordError(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Error changing password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    
    // Logout from context
    logout();
    
    // Navigate to login page
    navigate('/login', { replace: true });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-7">
        <h1 style={{ color: '#3C3F20' }}>Settings</h1>
        <p className="text-sm opacity-55 mt-0.5" style={{ color: '#3C3F20' }}>
          Manage your account and preferences
        </p>
      </div>

      <div className="space-y-6">
        {SETTING_GROUPS.map((group) => (
          <div key={group.label}>
            <p
              className="text-xs uppercase tracking-widest opacity-40 mb-3 px-1"
              style={{ color: '#3C3F20' }}
            >
              {group.label}
            </p>
            <div
              className="rounded-2xl overflow-hidden shadow-sm"
              style={{ backgroundColor: '#E8E3C8' }}
            >
              {group.items.map((item, idx) => {
                const isDanger = group.label === 'Danger Zone';
                return (
                  <button
                    key={item.title}
                    onClick={() =>
                      setActiveItem(activeItem === item.title ? null : item.title)
                    }
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all cursor-pointer hover:bg-black/5 ${
                      idx !== 0 ? 'border-t' : ''
                    }`}
                    style={{ borderColor: '#D0CBAF' }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: isDanger ? '#fee2e2' : '#FDF9EB',
                        color: isDanger ? '#ef4444' : '#3C3F20',
                      }}
                    >
                      {item.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm"
                        style={{ color: isDanger ? '#ef4444' : '#3C3F20' }}
                      >
                        {item.title}
                      </p>
                      <p
                        className="text-xs opacity-50 mt-0.5"
                        style={{ color: '#3C3F20' }}
                      >
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.badge && (
                        <span
                          className="text-xs px-2.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor:
                              item.badge === 'Coming soon' ? '#D0CBAF' : '#BFC897',
                            color: '#3C3F20',
                            opacity: item.badge === 'Coming soon' ? 0.7 : 1,
                          }}
                        >
                          {item.title === 'Notifications' && unreadCount > 0
                            ? `${unreadCount} new`
                            : item.badge}
                        </span>
                      )}
                      <ChevronRight
                        size={15}
                        className={`transition-transform ${
                          activeItem === item.title ? 'rotate-90' : ''
                        }`}
                        style={{ color: '#3C3F20', opacity: 0.35 }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Expanded placeholder panel */}
            {group.items.some((item) => activeItem === item.title) && (
              <div
                className="rounded-2xl p-6 mt-2 shadow-sm"
                style={{ backgroundColor: '#FDF9EB' }}
              >
                {activeItem === 'Notifications' ? (
                  <div>
                    {notificationError && (
                      <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#FEE2E2', borderLeft: '4px solid #EF4444' }}>
                        <p className="text-sm" style={{ color: '#991B1B' }}>
                          {notificationError}
                        </p>
                      </div>
                    )}
                    {loadingNotifications ? (
                      <p className="text-sm opacity-60 text-center" style={{ color: '#3C3F20' }}>
                        Loading notifications...
                      </p>
                    ) : notifications.length === 0 ? (
                      <p className="text-sm opacity-60 text-center" style={{ color: '#3C3F20' }}>
                        No notifications yet
                      </p>
                    ) : (
                      <div
                        className="space-y-3 pr-2"
                        style={{
                          maxHeight: '400px',
                          overflowY: 'auto',
                        }}
                      >
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 rounded-lg border ${
                              !notification.is_read
                                ? 'border-yellow-300 bg-yellow-50'
                                : 'border-gray-200 bg-white'
                            }`}
                            onClick={() => !notification.is_read && handleNotificationRead(notification.id)}
                            style={{
                              cursor: !notification.is_read ? 'pointer' : 'default',
                              borderColor: !notification.is_read ? '#FCD34D' : '#E5E7EB',
                              backgroundColor: !notification.is_read ? '#FEFCE8' : '#F9FAFB',
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium" style={{ color: '#3C3F20' }}>
                                  {notification.title}
                                </p>
                                <p className="text-xs opacity-60 mt-1" style={{ color: '#3C3F20' }}>
                                  {notification.message}
                                </p>
                                <p className="text-xs opacity-40 mt-2" style={{ color: '#3C3F20' }}>
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              {!notification.is_read && (
                                <div
                                  className="w-2 h-2 rounded-full flex-shrink-0 ml-3 mt-1"
                                  style={{ backgroundColor: '#3C3F20' }}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => setActiveItem(null)}
                        className="px-5 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
                        style={{ backgroundColor: '#3C3F20' }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : activeItem === 'Delete Account' ? (
                  <>
                    {!deleteConfirm ? (
                      <>
                        <p className="text-sm" style={{ color: '#3C3F20' }}>
                          Are you sure you want to delete your account? This action cannot be undone. All your data including tasks, submissions, portfolio items, and posts will be permanently deleted.
                        </p>
                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={() => setDeleteConfirm(true)}
                            className="flex-1 px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
                            style={{ backgroundColor: '#ef4444' }}
                          >
                            Yes, Delete My Account
                          </button>
                          <button
                            onClick={() => setActiveItem(null)}
                            className="flex-1 px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
                            style={{ backgroundColor: '#3C3F20' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium" style={{ color: '#ef4444' }}>
                          Type "DELETE" to confirm account deletion:
                        </p>
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleteLoading}
                            className="flex-1 px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#ef4444' }}
                          >
                            {deleteLoading ? 'Deleting...' : 'Permanently Delete Account'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(false)}
                            disabled={deleteLoading}
                            className="flex-1 px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#3C3F20' }}
                          >
                            Back
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : activeItem === 'Change Password' ? (
                  <div>
                    {passwordSuccess && (
                      <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#ECFDF5', borderLeft: '4px solid #10B981' }}>
                        <p className="text-sm font-medium" style={{ color: '#065F46' }}>
                          ✓ Password changed successfully!
                        </p>
                      </div>
                    )}
                    {passwordError && (
                      <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#FEE2E2', borderLeft: '4px solid #EF4444' }}>
                        <p className="text-sm" style={{ color: '#991B1B' }}>
                          {passwordError}
                        </p>
                      </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#3C3F20' }}>
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                          className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-colors"
                          style={{
                            borderColor: '#D0CBAF',
                            backgroundColor: '#FFFFFF',
                            color: '#3C3F20',
                          }}
                          disabled={passwordLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#3C3F20' }}>
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter your new password (min 6 characters)"
                          className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-colors"
                          style={{
                            borderColor: '#D0CBAF',
                            backgroundColor: '#FFFFFF',
                            color: '#3C3F20',
                          }}
                          disabled={passwordLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#3C3F20' }}>
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter your new password"
                          className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-colors"
                          style={{
                            borderColor: '#D0CBAF',
                            backgroundColor: '#FFFFFF',
                            color: '#3C3F20',
                          }}
                          disabled={passwordLoading}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleChangePassword}
                        disabled={passwordLoading}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#3C3F20' }}
                      >
                        {passwordLoading ? 'Changing...' : 'Change Password'}
                      </button>
                      <button
                        onClick={() => {
                          setActiveItem(null);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setPasswordError(null);
                          setPasswordSuccess(false);
                        }}
                        disabled={passwordLoading}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#D0CBAF', color: '#3C3F20' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : activeItem === 'Delete Account' ? (
                  <>
                    {!deleteConfirm ? (
                      <>
                        <p className="text-sm" style={{ color: '#3C3F20' }}>
                          Are you sure you want to delete your account? This action cannot be undone. All your data including tasks, submissions, portfolio items, and posts will be permanently deleted.
                        </p>
                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={() => setDeleteConfirm(true)}
                            className="flex-1 px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
                            style={{ backgroundColor: '#ef4444' }}
                          >
                            Yes, Delete My Account
                          </button>
                          <button
                            onClick={() => setActiveItem(null)}
                            className="flex-1 px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
                            style={{ backgroundColor: '#3C3F20' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium" style={{ color: '#ef4444' }}>
                          Type "DELETE" to confirm account deletion:
                        </p>
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleteLoading}
                            className="flex-1 px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#ef4444' }}
                          >
                            {deleteLoading ? 'Deleting...' : 'Permanently Delete Account'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(false)}
                            disabled={deleteLoading}
                            className="flex-1 px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#3C3F20' }}
                          >
                            Back
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : activeItem === 'Logout' ? (
                  <>
                    <p className="text-sm" style={{ color: '#3C3F20' }}>
                      Are you sure you want to logout? You'll need to login again to access your account.
                    </p>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleLogout}
                        className="flex-1 px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
                        style={{ backgroundColor: '#ef4444' }}
                      >
                        Yes, Logout
                      </button>
                      <button
                        onClick={() => setActiveItem(null)}
                        className="flex-1 px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
                        style={{ backgroundColor: '#3C3F20' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm opacity-60 text-center" style={{ color: '#3C3F20' }}>
                      This settings panel is reserved for future implementation. Check back soon!
                    </p>
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => setActiveItem(null)}
                        className="px-5 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
                        style={{ backgroundColor: '#3C3F20' }}
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
