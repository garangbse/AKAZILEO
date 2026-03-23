import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
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

export function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, openModal } = useAppContext();
  const [submissionNote, setSubmissionNote] = useState('');
  const [fileName, setFileName] = useState('');
  const [submissions, setSubmissions] = useState(SUBMISSIONS);

  const task = TASKS.find((t) => t.id === id) ?? TASKS[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      openModal({ type: 'upload-success' });
    }
  };

  const handleSubmit = () => {
    openModal({ type: 'confirm-submit' });
  };

  const handleApprove = (subId: string) => {
    openModal({
      type: 'approve',
      onConfirm: () =>
        setSubmissions((prev) =>
          prev.map((s) => (s.id === subId ? { ...s, status: 'Approved' } : s))
        ),
    });
  };

  const handleReject = (subId: string) => {
    openModal({
      type: 'reject',
      onConfirm: () =>
        setSubmissions((prev) =>
          prev.map((s) => (s.id === subId ? { ...s, status: 'Rejected' } : s))
        ),
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

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FDF9EB' }}
              >
                <User size={13} style={{ color: '#3C3F20' }} />
              </div>
              <div>
                <p className="text-xs opacity-45 mb-0.5" style={{ color: '#3C3F20' }}>
                  Posted by
                </p>
                <div className="flex items-center gap-1.5">
                  <img
                    src={task.posterAvatar}
                    alt={task.poster}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <p className="text-sm" style={{ color: '#3C3F20' }}>
                    {task.poster}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FDF9EB' }}
              >
                <Tag size={13} style={{ color: '#3C3F20' }} />
              </div>
              <div>
                <p className="text-xs opacity-45 mb-0.5" style={{ color: '#3C3F20' }}>
                  Category
                </p>
                <p className="text-sm" style={{ color: '#3C3F20' }}>
                  {task.category}
                </p>
              </div>
            </div>

            {task.dueDate && (
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
                    {task.dueDate}
                  </p>
                </div>
              </div>
            )}

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
            )}
          </div>

          {/* Progress */}
          <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: '#FDF9EB' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs opacity-50" style={{ color: '#3C3F20' }}>
                Completion
              </span>
              <span className="text-xs" style={{ color: '#3C3F20' }}>
                {task.completion}%
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#D0CBAF' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${task.completion}%`, backgroundColor: '#BFC897' }}
              />
            </div>
          </div>
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
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#E8E3C8' }}>
              <h2 className="mb-5" style={{ color: '#3C3F20' }}>
                Submissions ({submissions.length})
              </h2>

              {submissions.length === 0 ? (
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
                          src={sub.workerAvatar}
                          alt={sub.worker}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className="text-sm" style={{ color: '#3C3F20' }}>
                            {sub.worker}
                          </p>
                          <p className="text-xs opacity-45" style={{ color: '#3C3F20' }}>
                            {sub.timestamp}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                            sub.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : sub.status === 'Rejected'
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
                        {sub.note}
                      </p>

                      <div className="flex items-center gap-1.5 mb-3">
                        <Paperclip
                          size={11}
                          style={{ color: '#3C3F20' }}
                          className="opacity-45"
                        />
                        <span
                          className="text-xs underline opacity-55 cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ color: '#3C3F20' }}
                        >
                          {sub.fileLink}
                        </span>
                      </div>

                      {sub.status === 'Pending' && (
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
          )}
        </div>
      </div>
    </div>
  );
}
