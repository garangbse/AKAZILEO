import React, { useState, useEffect } from 'react';
import {
  Search,
  Briefcase,
  Code2,
  Megaphone,
  PenLine,
  Palette,
  ChevronDown,
  SlidersHorizontal,
  Calendar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import  { applyToTask, getUserApplications, getTasks } from '../../services/task';

type Task = {
  id: number;
  title: string;
  description: string;
  payment: number;
  status: string;
  due_date?: string | null;
  poster_id?: number;
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Design: <Palette size={13} />,
  Development: <Code2 size={13} />,
  Branding: <Briefcase size={13} />,
  Marketing: <Megaphone size={13} />,
  Copywriting: <PenLine size={13} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Design: '#BFC897',
  Development: '#7FB3D0',
  Branding: '#E8C86A',
  Marketing: '#E8986A',
  Copywriting: '#C8A0E8',
};

export function TaskMarketplacePage() {
  const navigate = useNavigate();
  const { role ,openModal, tasks, currentUser, setTasks } = useAppContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const [appliedTasks, setAppliedTasks] = useState<number[]>([]);

  // Fetch user's applied tasks on component mount
  useEffect(() => {
    const fetchAppliedTasks = async () => {
      const token = localStorage.getItem('token');
      if (!token || role !== 'worker') {
        setAppliedTasks([]);
        return;
      }
      
      try {
        const response = await getUserApplications(token);
        if (response.status === 'success' && response.data) {
          const appliedTaskIds = response.data.map((app: any) => app.task_id);
          setAppliedTasks(appliedTaskIds);
          console.log('[INIT DEBUG] Applied tasks loaded from backend:', appliedTaskIds);
        }
      } catch (error) {
        console.error('[INIT DEBUG] Failed to fetch applied tasks:', error);
      }
    };
    
    fetchAppliedTasks();
  }, [role]);

  // Real-time task polling - fetch tasks every 15 seconds
  useEffect(() => {
    const fetchTasksRealTime = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const response = await getTasks(token);
        if (response.status === 'success' && response.data) {
          setTasks(response.data);
          console.log('[POLLING] Tasks updated - new count:', response.data.length);
        }
      } catch (error) {
        console.error('[POLLING] Failed to fetch tasks:', error);
      }
    };

    // Initial fetch
    fetchTasksRealTime();

    // Poll every 15 seconds while on this page
    const interval = setInterval(fetchTasksRealTime, 15000);

    // Cleanup interval when component unmounts
    return () => clearInterval(interval);
  }, [setTasks]);

  // DEBUG: Log current user on component mount
  console.log('[MARKETPLACE DEBUG] Current User from Context:', currentUser);
  console.log('[MARKETPLACE DEBUG] Current User Role:', role);


  const filtered = tasks.filter((t) => {
    const matchesSearch =
      (t.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (t.description ?? "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

    // Apply "My Tasks" filter based on role
    let matchesMyTasks = true;
    if (myTasksOnly) {
      if (role === 'employer') {
        // Show only tasks posted by current user
        matchesMyTasks = t.poster_id === currentUser?.id;
      } else if (role === 'worker') {
        // Show only tasks the user has applied to
        matchesMyTasks = appliedTasks.includes(t.id);
      }
    }

    return matchesSearch && matchesStatus && matchesMyTasks;
  });

  // Helper function to check if user can access task details
  const canAccessTask = (task: Task): boolean => {
    if (role === 'employer') {
      // Employers can only access tasks they posted
      return task.poster_id === currentUser?.id;
    } else if (role === 'worker') {
      // Workers can only access tasks they have been accepted for
      return appliedTasks.includes(task.id);
    }
    return false;
  };

  // Helper function to handle unauthorized navigation attempt
  const handleUnauthorizedAccess = () => {
    const message =
      role === 'employer'
        ? 'You can only access tasks that you posted.'
        : 'You can only access tasks you have been accepted for.';
    openModal({
      type: 'apply-error',
      message: message,
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 style={{ color: '#3C3F20' }}>Task Marketplace</h1>
        <p className="text-sm opacity-55 mt-0.5" style={{ color: '#3C3F20' }}>
          Browse and apply to available tasks from employers
        </p>
      </div>

      {/* Filters bar */}
      <div
        className="flex flex-wrap gap-3 mb-6 p-4 rounded-2xl"
        style={{ backgroundColor: '#E8E3C8' }}
      >
        <div
          className="flex items-center gap-2 flex-1 min-w-44 rounded-xl px-3 py-2"
          style={{ backgroundColor: '#FDF9EB' }}
        >
          <Search size={14} style={{ color: '#3C3F20' }} className="opacity-50" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1"
            style={{ color: '#3C3F20' }}
          />
        </div>

        <div className="relative flex-shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-xl text-sm cursor-pointer outline-none h-full"
            style={{ backgroundColor: '#FDF9EB', color: '#3C3F20' }}
          >
            <option value="All">All Statuses</option>
            <option value="open">open</option>
            <option value="completed">completed</option>
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"
            style={{ color: '#3C3F20' }}
          />
        </div>

        <label
          className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer flex-shrink-0"
          style={{ backgroundColor: '#FDF9EB' }}
        >
          <button
            onClick={() => setMyTasksOnly(!myTasksOnly)}
            className="relative w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0"
            style={{ backgroundColor: myTasksOnly ? '#BFC897' : '#C5BDAA' }}
          >
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full shadow transition-all"
              style={{ backgroundColor: '#3C3F20', left: myTasksOnly ? '18px' : '2px' }}
            />
          </button>
          <span className="text-sm whitespace-nowrap" style={{ color: '#3C3F20' }}>
            {role === 'employer' ? 'My Posted Tasks' : 'My Applications'}
          </span>
        </label>

        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0"
          style={{ backgroundColor: '#FDF9EB' }}
        >
          <SlidersHorizontal size={13} style={{ color: '#3C3F20' }} className="opacity-50" />
          <span className="text-sm opacity-55" style={{ color: '#3C3F20' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      {/*create task*/}
      {role === 'employer' && (
        <div className="ml-auto mb-[30px]">
          <button
            onClick={() =>
            openModal({
              type: 'create-task',
              title: 'Create Task',
              onConfirm: (task) => {
                console.log('New task:', task);
              },
            })
          }
            className="px-3 py-2 rounded-xl text-sm transition-all hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: '#3C3F20', color: '#FDF9EB' }}
          >
            Create Task
          </button>
        </div>
      )}

      {/* Task grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((task) => (
          <div
            key={task.id}
            className="rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group border-2 border-transparent hover:border-[#BFC897] flex flex-col"
            style={{ backgroundColor: '#E8E3C8' }}
            onClick={() => {
              if (canAccessTask(task)) {
                navigate(`/tasks/${task.id}`);
              } else {
                handleUnauthorizedAccess();
              }
            }}
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-3">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: ( '#BFC897') + '30',
                  color: '#3C3F20',
                }}
              >
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

            <h3 className="text-sm mb-1.5" style={{ color: '#3C3F20' }}>
              {task.title}
            </h3>

            <p
              className="text-xs opacity-55 mb-3 line-clamp-2 leading-relaxed flex-1"
              style={{ color: '#3C3F20' }}
            >
              {task.description}
            </p>

            <div className="text-sm font-medium mb-3">
              Payment: ${task.payment}
            </div>

            {task.due_date && (
              <div className="flex items-center gap-1.5 mb-3">
                <Calendar size={11} style={{ color: '#3C3F20' }} className="opacity-40" />
                <p className="text-xs opacity-40" style={{ color: '#3C3F20' }}>
                  Due {task.due_date}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {role === 'worker' ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    const token = localStorage.getItem('token') ?? undefined;

                    // DEBUG: Log apply attempt
                    console.log('[APPLY DEBUG] Attempting to apply to task:', {
                      taskId: task.id,
                      taskTitle: task.title,
                      taskPosterId: task.poster_id,
                      currentUserId: currentUser?.id,
                      currentUserName: currentUser?.username,
                      token: token ? 'Token present' : 'No token'
                    });

                    applyToTask(task.id, token)
                      .then((res: any) => {
                        console.log('[APPLY DEBUG] Response from backend:', res);
                        
                        if (res.status === 'success') {
                          setAppliedTasks(prev => [...prev, task.id]);
                          openModal({ type: 'upload-success' });
                        } else if (res.status === 'error') {
                          const errorMessage = res.message || 'Unknown error';
                          let displayMessage = '';
                          
                          if (errorMessage.includes('Already applied')) {
                            displayMessage = 'You have already applied to this task.';
                          } else if (errorMessage.includes('cannot apply to your own task')) {
                            displayMessage = 'You cannot apply to your own task.';
                          } else {
                            displayMessage = errorMessage;
                          }
                          
                          openModal({ 
                            type: 'apply-error',
                            message: displayMessage 
                          });
                        }
                      })
                      .catch((err: any) => {
                        console.error('Apply error:', err);
                        openModal({ 
                          type: 'apply-error',
                          message: 'There was an error submitting your application. Please try again.'
                        });
                      });
                  }}
                  disabled={appliedTasks.includes(task.id)}
                  className="flex-1 py-2 rounded-xl text-xs transition-all cursor-pointer"
                  style={{
                    backgroundColor: appliedTasks.includes(task.id) ? '#D0CBAF' : '#3C3F20',
                    color: appliedTasks.includes(task.id) ? '#6B6B5C' : '#FDF9EB',
                    opacity: appliedTasks.includes(task.id) ? 0.7 : 1,
                    cursor: appliedTasks.includes(task.id) ? 'default' : 'pointer'
                  }}
                >
                  {appliedTasks.includes(task.id) ? 'Applied' : 'Apply'}
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canAccessTask(task)) {
                      navigate(`/tasks/${task.id}`);
                    } else {
                      handleUnauthorizedAccess();
                    }
                  }}
                  disabled={!canAccessTask(task)}
                  className="flex-1 py-2 rounded-xl text-xs text-white transition-all hover:opacity-90 cursor-pointer"
                  style={{
                    backgroundColor: canAccessTask(task) ? '#3C3F20' : '#C5BDAA',
                    cursor: canAccessTask(task) ? 'pointer' : 'not-allowed',
                    opacity: canAccessTask(task) ? 1 : 0.6,
                  }}
                >
                  Manage
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (canAccessTask(task)) {
                    navigate(`/tasks/${task.id}`);
                  } else {
                    handleUnauthorizedAccess();
                  }
                }}
                disabled={!canAccessTask(task)}
                className="px-3 py-2 rounded-xl text-xs transition-all hover:opacity-85 cursor-pointer"
                style={{
                  backgroundColor: canAccessTask(task) ? '#BFC897' : '#D0CBAF',
                  color: '#3C3F20',
                  cursor: canAccessTask(task) ? 'pointer' : 'not-allowed',
                  opacity: canAccessTask(task) ? 1 : 0.6,
                }}
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div
          className="rounded-2xl p-16 text-center mt-4"
          style={{ backgroundColor: '#E8E3C8' }}
        >
          <p className="opacity-50" style={{ color: '#3C3F20' }}>
            No tasks match your search. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>

    
  );
}
