import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Layers, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { WORKER_PROFILE, EMPLOYER_PROFILE, TASKS } from '../data/mockData';
import { getAcceptedTasks, getTasksByPosterId } from '../../services/task';
import { api } from '../../services/api';

const CATEGORY_COLORS: Record<string, string> = {
  Design: '#BFC897',
  Development: '#7FB3D0',
  Branding: '#E8C86A',
  Marketing: '#E8986A',
  Copywriting: '#C8A0E8',
};

function TaskCard({ task, onClick }: { task: (typeof TASKS)[0]; onClick: () => void }) {
  return (
    <div
      className="rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-[#BFC897]"
      style={{ backgroundColor: '#E8E3C8' }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: (CATEGORY_COLORS[task.category] ?? '#BFC897') + '30',
            color: '#3C3F20',
          }}
        >
          <span>{task.category}</span>
        </div>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full flex-shrink-0 ${
            task.status === 'Open'
              ? 'bg-emerald-100 text-emerald-700'
              : task.status === 'In Progress'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {task.status}
        </span>
      </div>

      <h3 className="text-sm mb-1" style={{ color: '#3C3F20' }}>
        {task.title}
      </h3>
      <p className="text-xs opacity-55 mb-3 line-clamp-2 leading-relaxed" style={{ color: '#3C3F20' }}>
        {task.description}
      </p>

      <div className="flex items-center gap-1.5">
        <img
          src={
            task.posterAvatar
              ? task.posterAvatar.startsWith('data:') || task.posterAvatar.startsWith('http')
                ? task.posterAvatar
                : `data:image/png;base64,${task.posterAvatar}`
              : 'https://via.placeholder.com/40'
          }
          alt={task.poster}
          className="w-5 h-5 rounded-full object-cover"
        />
        <span className="text-xs opacity-55" style={{ color: '#3C3F20' }}>
          {task.poster}
        </span>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { role, currentUser } = useAppContext();
  const navigate = useNavigate();
  const isWorker = role === 'worker';
  const profile = isWorker ? WORKER_PROFILE : EMPLOYER_PROFILE;

  const [acceptedTasks, setAcceptedTasks] = useState<any[]>([]);
  const [postedTasks, setPostedTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(currentUser?.profile_picture || null);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [tasksPosted, setTasksPosted] = useState(0);
  const [openTasksCount, setOpenTasksCount] = useState(0);

  // Listen to context profilePicture changes and update local state
  useEffect(() => {
    if (currentUser?.profile_picture) {
      setProfilePicture(currentUser.profile_picture);
      console.log('[DASHBOARD] Profile picture updated from context');
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
          console.log('[DASHBOARD] Profile picture fetched');
        }
      } catch (error) {
        console.error('[DASHBOARD] Failed to fetch profile picture:', error);
      }
    };

    fetchProfilePicture();
  }, [currentUser?.id]);

  // Fetch tasks for both workers and employers
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        if (isWorker) {
          // Fetch accepted tasks for workers
          const response = await getAcceptedTasks(token);
          if (response.status === 'success' && response.data) {
            const transformedTasks = response.data.map((task: any) => ({
              id: task.id,
              title: task.title,
              description: task.description,
              category: 'Task',
              status: task.status === 'open' ? 'Open' : task.status === 'assigned' ? 'In Progress' : 'Completed',
              completion: task.status === 'completed' ? 100 : task.status === 'assigned' ? 50 : 0,
              poster: task.poster,
              posterAvatar: task.poster_avatar || 'https://via.placeholder.com/40',
              payment: task.payment,
              worker: null,
            }));
            setAcceptedTasks(transformedTasks.slice(0, 4));
          }
        } else {
          // Fetch tasks posted by current employer
          const response = await getTasksByPosterId(currentUser?.id, token);
          if (response.status === 'success' && response.data) {
            const transformedTasks = response.data.map((task: any) => ({
              id: task.id,
              title: task.title,
              description: task.description,
              category: 'Task',
              status: task.status === 'open' ? 'Open' : task.status === 'assigned' ? 'In Progress' : 'Completed',
              completion: task.status === 'completed' ? 100 : task.status === 'assigned' ? 50 : 0,
              poster: currentUser?.username || 'You',
              posterAvatar: currentUser?.profile_picture || 'https://via.placeholder.com/40',
              payment: task.payment,
              worker: null,
            }));
            setPostedTasks(transformedTasks.slice(0, 4));
            
            // Set employer stats
            setTasksPosted(response.data.length);
            const openCount = response.data.filter((task: any) => task.status === 'open').length;
            setOpenTasksCount(openCount);
            console.log('[DASHBOARD] Employer tasks posted:', response.data.length, 'Open:', openCount);
          }
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [isWorker, currentUser?.id]);

  // Fetch tasks completed (for workers) on mount
  useEffect(() => {
    if (!isWorker || !currentUser?.id) return;

    const fetchTasksCompleted = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await getAcceptedTasks(token);
        if (response.status === 'success' && response.data) {
          const completedCount = response.data.filter((task: any) => task.status === 'completed').length;
          setTasksCompleted(completedCount);
          console.log('[DASHBOARD] Tasks completed fetched:', completedCount);
        }
      } catch (error) {
        console.error('[DASHBOARD] Failed to fetch tasks completed:', error);
      }
    };

    fetchTasksCompleted();
  }, [isWorker, currentUser?.id]);

  // Fetch portfolio count (for workers) on mount
  useEffect(() => {
    if (!isWorker || !currentUser?.id) return;

    const fetchPortfolioItems = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await api(`/portfolio/${currentUser.id}`, 'GET', undefined, token);
        if (response.status === 'success' && response.data) {
          setPortfolioCount(response.data.length);
          console.log('[DASHBOARD] Portfolio items fetched:', response.data.length);
        }
      } catch (error) {
        console.error('[DASHBOARD] Failed to fetch portfolio items:', error);
      }
    };

    fetchPortfolioItems();
  }, [isWorker, currentUser?.id]);

  // Update posted tasks avatar when profile picture changes
  useEffect(() => {
    if (isWorker || postedTasks.length === 0) return;
    
    setPostedTasks((prevTasks) =>
      prevTasks.map((task) => ({
        ...task,
        posterAvatar: profilePicture || 'https://via.placeholder.com/40',
      }))
    );
    console.log('[DASHBOARD] Posted tasks avatars updated with profile picture');
  }, [profilePicture, isWorker]);

  const recentTasks = isWorker ? acceptedTasks : postedTasks;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-7">
        <h1 style={{ color: '#3C3F20' }}>Dashboard</h1>
        <p className="text-sm opacity-55 mt-0.5" style={{ color: '#3C3F20' }}>
          Welcome back, {profile.name.split(' ')[0]}! Here's what's happening.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Profile card ── */}
        <div className="lg:col-span-1 space-y-4">
          <div
            className="rounded-2xl p-6 shadow-sm text-center"
            style={{ backgroundColor: '#E8E3C8' }}
          >
            <img
              src={
                profilePicture
                  ? profilePicture.startsWith('data:')
                    ? profilePicture
                    : `data:image/png;base64,${profilePicture}`
                  : profile.avatar
              }
              alt={currentUser?.username || profile.name}
              className="w-24 h-24 rounded-full object-cover mx-auto border-4"
              style={{ borderColor: '#BFC897' }}
            />
            <h2 className="mt-4 mb-0.5" style={{ color: '#3C3F20' }}>
              {profile.name}
            </h2>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full inline-block mb-3 capitalize"
              style={{ backgroundColor: '#BFC897', color: '#3C3F20' }}
            >
              {role}
            </span>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {isWorker ? (
                <>
                  <div className="rounded-xl p-3" style={{ backgroundColor: '#FDF9EB' }}>
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <CheckCircle2 size={14} style={{ color: '#BFC897' }} />
                      <span className="text-xl" style={{ color: '#3C3F20' }}>
                        {tasksCompleted}
                      </span>
                    </div>
                    <p className="text-xs opacity-50" style={{ color: '#3C3F20' }}>
                      Tasks Done
                    </p>
                  </div>
                  <div className="rounded-xl p-3" style={{ backgroundColor: '#FDF9EB' }}>
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Layers size={14} style={{ color: '#BFC897' }} />
                      <span className="text-xl" style={{ color: '#3C3F20' }}>
                        {portfolioCount}
                      </span>
                    </div>
                    <p className="text-xs opacity-50" style={{ color: '#3C3F20' }}>
                      Portfolio
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl p-3" style={{ backgroundColor: '#FDF9EB' }}>
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <TrendingUp size={14} style={{ color: '#BFC897' }} />
                      <span className="text-xl" style={{ color: '#3C3F20' }}>
                        {tasksPosted}
                      </span>
                    </div>
                    <p className="text-xs opacity-50" style={{ color: '#3C3F20' }}>
                      Posted
                    </p>
                  </div>
                  <div className="rounded-xl p-3" style={{ backgroundColor: '#FDF9EB' }}>
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Clock size={14} style={{ color: '#BFC897' }} />
                      <span className="text-xl" style={{ color: '#3C3F20' }}>
                        {openTasksCount}
                      </span>
                    </div>
                    <p className="text-xs opacity-50" style={{ color: '#3C3F20' }}>
                      Open
                    </p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => navigate('/profile')}
              className="w-full py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: '#3C3F20' }}
            >
              View Profile
            </button>
          </div>
        </div>

        {/* ── Recent tasks ── */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ color: '#3C3F20' }}>
              {isWorker ? 'My Active Tasks' : 'Posted Tasks'}
            </h2>
            <button
              onClick={() => navigate('/marketplace')}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl transition-all hover:opacity-85 cursor-pointer"
              style={{ backgroundColor: '#BFC897', color: '#3C3F20' }}
            >
              View All
              <ArrowRight size={13} />
            </button>
          </div>

          {recentTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                />
              ))}
            </div>
          ) : (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ backgroundColor: '#E8E3C8' }}
            >
              <p className="opacity-50 mb-4" style={{ color: '#3C3F20' }}>
                No tasks yet. Browse the marketplace!
              </p>
              <button
                onClick={() => navigate('/marketplace')}
                className="px-5 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: '#3C3F20' }}
              >
                Browse Tasks
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
