import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Paperclip,
  CheckCircle,
  XCircle,
  Upload,
  Clock,
} from 'lucide-react';
import { TASKS, SUBMISSIONS } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { getTaskApplications, acceptApplication, rejectApplication, getUserApplications, submitTask, getTaskSubmissions, approveSubmission, rejectSubmission, updateTaskStatus } from '../../services/task';

export function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, openModal, tasks, currentUser } = useAppContext();
  const [submissionNote, setSubmissionNote] = useState('');
  const [fileName, setFileName] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [completeTaskLoading, setCompleteTaskLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  // Check access permission and fetch applications
  useEffect(() => {
    const checkAccess = async () => {
      const task = tasks.find((t) => t.id === Number(id));
      if (!task) return;

      const token = localStorage.getItem('token') ?? undefined;
      if (!token) {
        setAccessDenied(true);
        return;
      }

      // Employers can only access tasks they posted
      if (role === 'employer') {
        if (task.poster_id !== currentUser?.id) {
          setAccessDenied(true);
          return;
        }
        // Fetch applications for this task
        setLoadingApplications(true);
        try {
          const res = await getTaskApplications(Number(id), token);
          if (res.status === 'success') {
            setApplications(res.data || []);
          }
        } catch (err) {
          console.error('Error fetching applications:', err);
        } finally {
          setLoadingApplications(false);
        }

        // Fetch submissions for this task
        setLoadingSubmissions(true);
        try {
          const res = await getTaskSubmissions(Number(id), token);
          if (res.status === 'success') {
            setSubmissions(res.data || []);
          }
        } catch (err) {
          console.error('Error fetching submissions:', err);
        } finally {
          setLoadingSubmissions(false);
        }
      }
      // Workers can only access tasks they have been accepted for
      else if (role === 'worker') {
        try {
          const res = await getUserApplications(token);
          if (res.status === 'success' && res.data) {
            const hasAcceptedApplication = res.data.some(
              (app: any) => app.task_id === Number(id) && app.status === 'accepted'
            );
            if (!hasAcceptedApplication) {
              setAccessDenied(true);
            }
          } else {
            setAccessDenied(true);
          }
        } catch (err) {
          console.error('Error checking worker access:', err);
          setAccessDenied(true);
        }
      }
    };

    checkAccess();
  }, [id, role, tasks, currentUser?.id]);

  const task = tasks.find((t) => t.id === Number(id));

  // Show access denied message
  if (accessDenied) {
    return (
      <div className="max-w-5xl mx-auto text-center mt-10">
        <div
          className="rounded-2xl p-8 inline-block"
          style={{ backgroundColor: '#E8E3C8' }}
        >
          <XCircle size={48} style={{ color: '#E8986A' }} className="mx-auto mb-4" />
          <p style={{ color: '#3C3F20' }} className="text-lg font-medium mb-4">
            Access Denied
          </p>
          <p style={{ color: '#3C3F20' }} className="opacity-55 mb-6">
            {role === 'employer'
              ? 'You can only view tasks that you posted.'
              : 'You can only view tasks that have been accepted by the employer.'}
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-5 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: '#3C3F20' }}
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-5xl mx-auto text-center mt-10">
        <p style={{ color: '#3C3F20' }}>Task not found</p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setSubmissionFile(file);
      openModal({ type: 'upload-success' });
    }
  };

  const handleSubmit = async () => {
    if (!submissionNote.trim()) {
      openModal({ type: 'error', message: 'Please add a description of your work' });
      return;
    }

    const token = localStorage.getItem('token') ?? undefined;
    if (!token) {
      openModal({ type: 'error', message: 'Not authenticated' });
      return;
    }

    openModal({
      type: 'confirm-submit',
      onConfirm: async () => {
        try {
          const res = await submitTask(
            Number(id),
            {
              submission_text: submissionNote,
              submission_file: submissionFile,
            },
            token
          );

          if (res.status === 'success') {
            openModal({ type: 'success', message: 'Work submitted successfully!' });
            setSubmissionNote('');
            setFileName('');
            setSubmissionFile(null);
          } else {
            openModal({ type: 'error', message: res.message || 'Failed to submit work' });
          }
        } catch (err: any) {
          console.error('Error submitting work:', err);
          openModal({ type: 'error', message: 'Error submitting work. Please try again.' });
        }
      },
    });
  };

  const handleApprove = (subId: number) => {
    openModal({
      type: 'approve',
      onConfirm: async () => {
        const token = localStorage.getItem('token') ?? undefined;
        if (!token) {
          openModal({ type: 'error', message: 'Not authenticated' });
          return;
        }

        try {
          const res = await approveSubmission(Number(id), subId, token);
          if (res.status === 'success') {
            setSubmissions((prev) =>
              prev.map((s) => (s.id === subId ? { ...s, status: 'approved' } : s))
            );
            openModal({ type: 'success', message: 'Submission approved!' });
          } else {
            openModal({ type: 'error', message: 'Failed to approve submission' });
          }
        } catch (err: any) {
          console.error('Error approving submission:', err);
          openModal({ type: 'error', message: 'Error approving submission. Please try again.' });
        }
      },
    });
  };

  const handleReject = (subId: number) => {
    openModal({
      type: 'reject',
      onConfirm: async () => {
        const token = localStorage.getItem('token') ?? undefined;
        if (!token) {
          openModal({ type: 'error', message: 'Not authenticated' });
          return;
        }

        try {
          const res = await rejectSubmission(Number(id), subId, token);
          if (res.status === 'success') {
            setSubmissions((prev) =>
              prev.map((s) => (s.id === subId ? { ...s, status: 'rejected' } : s))
            );
            openModal({ type: 'success', message: 'Submission rejected!' });
          } else {
            openModal({ type: 'error', message: 'Failed to reject submission' });
          }
        } catch (err: any) {
          console.error('Error rejecting submission:', err);
          openModal({ type: 'error', message: 'Error rejecting submission. Please try again.' });
        }
      },
    });
  };

  const handleAcceptApplication = (appId: number) => {
    openModal({
      type: 'approve-application',
      onConfirm: () => {
        const token = localStorage.getItem('token') ?? undefined;
        if (token) {
          acceptApplication(appId, token)
            .then((res: any) => {
              if (res.status === 'success') {
                setApplications((prev) =>
                  prev.map((app) =>
                    app.id === appId ? { ...app, status: 'accepted' } : app
                  )
                );
              }
            })
            .catch((err: any) => {
              console.error('Error accepting application:', err);
            });
        }
      },
    });
  };

  const handleRejectApplication = (appId: number) => {
    openModal({
      type: 'reject-application',
      onConfirm: () => {
        const token = localStorage.getItem('token') ?? undefined;
        if (token) {
          rejectApplication(appId, token)
            .then((res) => {
              if (res.status === 'success') {
                setApplications((prev) =>
                  prev.map((app) =>
                    app.id === appId ? { ...app, status: 'rejected' } : app
                  )
                );
              }
            })
            .catch((err) => {
              console.error('Error rejecting application:', err);
            });
        }
      },
    });
  };

  const handleCompleteTask = () => {
    openModal({
      type: 'confirm-submit',
      title: 'Complete Task',
      message: 'Are you sure you want to mark this task as completed?',
      onConfirm: async () => {
        const token = localStorage.getItem('token') ?? undefined;
        if (!token) {
          openModal({ type: 'error', message: 'Not authenticated' });
          return;
        }

        setCompleteTaskLoading(true);
        try {
          const res = await updateTaskStatus(Number(id), 'completed', token);
          if (res.status === 'success') {
            openModal({ type: 'success', message: 'Task marked as completed!' });
            // Redirect to dashboard (root path)
            setTimeout(() => {
              navigate('/');
            }, 1500);
          } else {
            openModal({ type: 'error', message: res.message || 'Failed to complete task' });
          }
        } catch (err: any) {
          console.error('Error completing task:', err);
          openModal({ type: 'error', message: 'Error completing task. Please try again.' });
        } finally {
          setCompleteTaskLoading(false);
        }
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-sm hover:opacity-65 transition-opacity cursor-pointer"
        style={{ color: '#3C3F20' }}
      >
        <ArrowLeft size={15} />
        Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Task info ── */}
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#E8E3C8' }}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <h1 style={{ color: '#3C3F20' }}>{task.title}</h1>
            <span
              className={`text-xs px-3 py-1 rounded-full flex-shrink-0 mt-1 ${
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

          <p
            className="text-sm opacity-65 mb-6 leading-relaxed"
            style={{ color: '#3C3F20' }}
          >
            {task.description}
          </p>

            {task.due_date && (
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#FDF9EB' }}
                >
                  <Calendar size={13} style={{ color: '#3C3F20' }} />
                </div>
                <div>
                  <p className="text-xs opacity-45 mb-0.5" style={{ color: '#3C3F20' }}>
                    Due Date
                  </p>
                  <p className="text-sm" style={{ color: '#3C3F20' }}>
                    {task.due_date}
                  </p>
                </div>
              </div>
            )}
{/* 
            {task.worker && (
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#FDF9EB' }}
                >
                  <Clock size={13} style={{ color: '#3C3F20' }} />
                </div>
                <div>
                  <p className="text-xs opacity-45 mb-0.5" style={{ color: '#3C3F20' }}>
                    Assigned to
                  </p>
                  <p className="text-sm" style={{ color: '#3C3F20' }}>
                    {task.worker}
                  </p>
                </div>
              </div>
            )} */}

            {role === 'employer' && task.status !== 'Completed' && (
              <button
                onClick={handleCompleteTask}
                disabled={completeTaskLoading}
                className="w-full mt-6 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#3C3F20' }}
              >
                <CheckCircle size={14} />
                {completeTaskLoading ? 'Completing...' : 'Mark as Completed'}
              </button>
            )}
          </div>

          

        {/* ── Right: Submission / Review ── */}
        <div>
          {role === 'worker' ? (
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#E8E3C8' }}>
              <h2 className="mb-5" style={{ color: '#3C3F20' }}>
                Submit Your Work
              </h2>

              <div className="mb-4">
                <label
                  className="block text-sm mb-2 opacity-65"
                  style={{ color: '#3C3F20' }}
                >
                  Notes / Description
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe your work, include links, or add notes for the employer..."
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  style={{ backgroundColor: '#FDF9EB', color: '#3C3F20' }}
                />
              </div>

              <div className="mb-6">
                <label
                  className="block text-sm mb-2 opacity-65"
                  style={{ color: '#3C3F20' }}
                >
                  Attach File
                </label>
                <label
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-dashed cursor-pointer hover:border-[#BFC897] transition-colors"
                  style={{ borderColor: '#C5BDAA' }}
                >
                  <Paperclip size={15} style={{ color: '#3C3F20' }} className="opacity-50" />
                  <span className="text-sm opacity-55" style={{ color: '#3C3F20' }}>
                    {fileName || 'Click to upload a file'}
                  </span>
                  <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
                style={{ backgroundColor: '#3C3F20' }}
              >
                <Upload size={14} />
                Submit Work
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ── Applications Section ── */}
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#E8E3C8' }}>
                <h2 className="mb-5" style={{ color: '#3C3F20' }}>
                  Applications ({applications.length})
                </h2>

                {loadingApplications ? (
                  <div className="py-12 text-center">
                    <p className="text-sm opacity-45" style={{ color: '#3C3F20' }}>
                      Loading applications...
                    </p>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm opacity-45" style={{ color: '#3C3F20' }}>
                      No applications yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="rounded-xl p-4"
                        style={{ backgroundColor: '#FDF9EB' }}
                      >
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="flex-1">
                            <p className="text-sm" style={{ color: '#3C3F20' }}>
                              {app.username}
                            </p>
                            <p className="text-xs opacity-45" style={{ color: '#3C3F20' }}>
                              Worker ID: {app.worker_id}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                              app.status === 'accepted'
                                ? 'bg-emerald-100 text-emerald-700'
                                : app.status === 'rejected'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </div>

                        {app.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptApplication(app.id)}
                              className="flex-1 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all hover:opacity-85 cursor-pointer"
                              style={{ backgroundColor: '#BFC897', color: '#3C3F20' }}
                            >
                              <CheckCircle size={13} />
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectApplication(app.id)}
                              className="flex-1 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 bg-red-100 text-red-600 transition-all hover:opacity-85 cursor-pointer"
                            >
                              <XCircle size={13} />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Submissions Section ── */}
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#E8E3C8' }}>
                <h2 className="mb-5" style={{ color: '#3C3F20' }}>
                  Submissions ({submissions.length})
                </h2>

                {loadingSubmissions ? (
                  <div className="py-12 text-center">
                    <p className="text-sm opacity-45" style={{ color: '#3C3F20' }}>
                      Loading submissions...
                    </p>
                  </div>
                ) : submissions.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm opacity-45" style={{ color: '#3C3F20' }}>
                    No submissions yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="rounded-xl p-4"
                      style={{ backgroundColor: '#FDF9EB' }}
                    >
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <img
                          src={'https://via.placeholder.com/32'}
                          alt={sub.worker_username || `Worker ${sub.worker_id}`}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className="text-sm" style={{ color: '#3C3F20' }}>
                            {sub.worker_username || `Worker ${sub.worker_id}`}
                          </p>
                          <p className="text-xs opacity-45" style={{ color: '#3C3F20' }}>
                            {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'Just now'}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full flex-shrink-0 capitalize ${
                            sub.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : sub.status === 'rejected'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <p
                        className="text-xs opacity-60 leading-relaxed mb-3"
                        style={{ color: '#3C3F20' }}
                      >
                        {sub.submission_text}
                      </p>

                      {sub.submission_file && (
                        <div className="mb-3 rounded-xl overflow-hidden">
                          <img
                            src={`data:image/png;base64,${sub.submission_file.base64}`}
                            alt="Submission file"
                            className="w-full max-h-64 object-cover rounded-xl"
                          />
                        </div>
                      )}

                      {sub.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(sub.id)}
                            className="flex-1 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all hover:opacity-85 cursor-pointer"
                            style={{ backgroundColor: '#BFC897', color: '#3C3F20' }}
                          >
                            <CheckCircle size={13} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(sub.id)}
                            className="flex-1 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 bg-red-100 text-red-600 transition-all hover:opacity-85 cursor-pointer"
                          >
                            <XCircle size={13} />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
