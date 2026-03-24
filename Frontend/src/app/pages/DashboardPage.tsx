import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Layers, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { WORKER_PROFILE, EMPLOYER_PROFILE, TASKS } from '../data/mockData';

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

      <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs opacity-45" style={{ color: '#3C3F20' }}>
            Progress
          </span>
          <span className="text-xs" style={{ color: '#3C3F20' }}>
            {task.completion}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#D0CBAF' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${task.completion}%`, backgroundColor: '#BFC897' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <img
          src={task.posterAvatar}
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
  const { role } = useAppContext();
  const navigate = useNavigate();
  const isWorker = role === 'worker';
  const profile = isWorker ? WORKER_PROFILE : EMPLOYER_PROFILE;

  const recentTasks = isWorker
    ? TASKS.filter((t) => t.worker === 'GON').slice(0, 4)
    : TASKS.filter((t) => t.poster === 'LEOREO').slice(0, 4);

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
              src={profile.avatar}
              alt={profile.name}
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
            <p className="text-xs opacity-55 mb-5 leading-relaxed px-2" style={{ color: '#3C3F20' }}>
              {profile.bio}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {isWorker ? (
                <>
                  <div className="rounded-xl p-3" style={{ backgroundColor: '#FDF9EB' }}>
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <CheckCircle2 size={14} style={{ color: '#BFC897' }} />
                      <span className="text-xl" style={{ color: '#3C3F20' }}>
                        {WORKER_PROFILE.tasksCompleted}
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
                        {WORKER_PROFILE.portfolioCount}
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
                        {EMPLOYER_PROFILE.tasksPosted}
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
                        {EMPLOYER_PROFILE.activeTasksCount}
                      </span>
                    </div>
                    <p className="text-xs opacity-50" style={{ color: '#3C3F20' }}>
                      Active
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
