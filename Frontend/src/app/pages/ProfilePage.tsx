import React, { useState } from 'react';
import {
  Edit2,
  CheckCircle2,
  Layers,
  TrendingUp,
  Clock,
  ArrowRight,
  Save,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { WORKER_PROFILE, EMPLOYER_PROFILE, TASKS, PORTFOLIO_ITEMS } from '../data/mockData';

export function ProfilePage() {
  const { role } = useAppContext();
  const navigate = useNavigate();
  const isWorker = role === 'worker';
  const base = isWorker ? WORKER_PROFILE : EMPLOYER_PROFILE;

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(base.name);
  const [bio, setBio] = useState(base.bio);

  const workerTasks = TASKS.filter((t) => t.worker === 'GON');
  const employerTasks = TASKS.filter((t) => t.poster === 'LEOREO');

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
            <div className="relative inline-block mb-4">
              <img
                src={base.avatar}
                alt={name}
                className="w-24 h-24 rounded-full object-cover border-4"
                style={{ borderColor: '#BFC897' }}
              />
              <span
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
                style={{ backgroundColor: '#BFC897' }}
              >
                <span className="w-2 h-2 rounded-full bg-white" />
              </span>
            </div>

            {editing ? (
              <div className="space-y-3 text-left">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: '#FDF9EB', color: '#3C3F20' }}
                />
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
                  style={{ backgroundColor: '#FDF9EB', color: '#3C3F20' }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: '#3C3F20' }}
                  >
                    <Save size={13} /> Save
                  </button>
                  <button
                    onClick={() => {
                      setName(base.name);
                      setBio(base.bio);
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
                  {name}
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
                  {bio}
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
                        Tasks Completed
                      </span>
                    </div>
                    <span
                      className="text-sm px-2.5 py-0.5 rounded-lg"
                      style={{ backgroundColor: '#FDF9EB', color: '#3C3F20' }}
                    >
                      {WORKER_PROFILE.tasksCompleted}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers size={14} style={{ color: '#BFC897' }} />
                      <span className="text-sm" style={{ color: '#3C3F20' }}>
                        Portfolio Items
                      </span>
                    </div>
                    <span
                      className="text-sm px-2.5 py-0.5 rounded-lg"
                      style={{ backgroundColor: '#FDF9EB', color: '#3C3F20' }}
                    >
                      {PORTFOLIO_ITEMS.length}
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
                      {EMPLOYER_PROFILE.tasksPosted}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={14} style={{ color: '#BFC897' }} />
                      <span className="text-sm" style={{ color: '#3C3F20' }}>
                        Active Tasks
                      </span>
                    </div>
                    <span
                      className="text-sm px-2.5 py-0.5 rounded-lg"
                      style={{ backgroundColor: '#FDF9EB', color: '#3C3F20' }}
                    >
                      {EMPLOYER_PROFILE.activeTasksCount}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Skills (Worker only) */}
          {isWorker && (
            <div
              className="rounded-2xl p-5 shadow-sm"
              style={{ backgroundColor: '#E8E3C8' }}
            >
              <h4 className="mb-4 opacity-55" style={{ color: '#3C3F20' }}>
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {WORKER_PROFILE.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{ backgroundColor: '#BFC897' + '40', color: '#3C3F20' }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 space-y-5">
          {isWorker ? (
            <>
              {/* Portfolio preview */}
              <div
                className="rounded-2xl p-6 shadow-sm"
                style={{ backgroundColor: '#E8E3C8' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{ color: '#3C3F20' }}>Portfolio</h3>
                  <button
                    onClick={() => navigate('/portfolio')}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl transition-all hover:opacity-85 cursor-pointer"
                    style={{ backgroundColor: '#BFC897', color: '#3C3F20' }}
                  >
                    View All <ArrowRight size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {PORTFOLIO_ITEMS.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all group"
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="p-2.5" style={{ backgroundColor: '#FDF9EB' }}>
                        <p className="text-xs truncate" style={{ color: '#3C3F20' }}>
                          {item.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task history */}
              <div
                className="rounded-2xl p-6 shadow-sm"
                style={{ backgroundColor: '#E8E3C8' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{ color: '#3C3F20' }}>Task History</h3>
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl transition-all hover:opacity-85 cursor-pointer"
                    style={{ backgroundColor: '#BFC897', color: '#3C3F20' }}
                  >
                    Marketplace <ArrowRight size={12} />
                  </button>
                </div>
                <div className="space-y-2">
                  {workerTasks.map((task) => (
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
                          {task.status}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs" style={{ color: '#3C3F20' }}>
                          {task.completion}%
                        </p>
                        <div
                          className="w-16 h-1.5 rounded-full mt-1"
                          style={{ backgroundColor: '#D0CBAF' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${task.completion}%`, backgroundColor: '#BFC897' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                    Marketplace <ArrowRight size={12} />
                  </button>
                </div>
                <div className="space-y-2">
                  {employerTasks.map((task) => (
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
                          {task.worker ? `Assigned to ${task.worker}` : 'Unassigned'}
                        </p>
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
                  ))}
                </div>
              </div>

              {/* Submissions summary */}
              <div
                className="rounded-2xl p-6 shadow-sm"
                style={{ backgroundColor: '#E8E3C8' }}
              >
                <h3 className="mb-4" style={{ color: '#3C3F20' }}>
                  Recent Submissions
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      worker: 'GON',
                      task: 'Design a Landing Page',
                      status: 'Pending',
                      avatar:
                        'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100',
                    },
                    {
                      worker: 'KILUA',
                      task: 'Design a Landing Page',
                      status: 'Pending',
                      avatar:
                        'https://images.unsplash.com/photo-1740663173325-c3000e33c830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100',
                    },
                  ].map((sub, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ backgroundColor: '#FDF9EB' }}
                    >
                      <img
                        src={sub.avatar}
                        alt={sub.worker}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ color: '#3C3F20' }}>
                          {sub.worker}
                        </p>
                        <p className="text-xs opacity-40 truncate" style={{ color: '#3C3F20' }}>
                          {sub.task}
                        </p>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex-shrink-0">
                        {sub.status}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/tasks/1')}
                  className="mt-4 w-full py-2 rounded-xl text-sm transition-all hover:opacity-85 cursor-pointer"
                  style={{ backgroundColor: '#BFC897', color: '#3C3F20' }}
                >
                  Review Submissions
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
