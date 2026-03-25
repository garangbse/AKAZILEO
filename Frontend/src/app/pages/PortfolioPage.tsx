import React, { useState, useEffect } from 'react';
import { ExternalLink, PlusCircle, Trash2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { createPortfolioItem, getUserPortfolio, deletePortfolioItem } from '../../services/portfolio';

type PortfolioItem = {
  id: number;
  title: string;
  description: string;
  media_file: string | null;
  project_link: string;
  created_at?: string;
};

export function PortfolioPage() {
  const { role, openModal, currentUser } = useAppContext();
  const navigate = useNavigate();
  const isWorker = role === 'worker';

  // Restrict access to workers only
  if (!isWorker) {
    return (
      <div className="max-w-6xl mx-auto text-center mt-10">
        <div
          className="rounded-2xl p-8 inline-block"
          style={{ backgroundColor: '#E8E3C8' }}
        >
          <XCircle size={48} style={{ color: '#E8986A' }} className="mx-auto mb-4" />
          <p style={{ color: '#3C3F20' }} className="text-lg font-medium mb-4">
            Portfolio - Workers Only
          </p>
          <p style={{ color: '#3C3F20' }} className="opacity-55 mb-6">
            Portfolio functionality is only available for workers. Employers can view workers' portfolios through their profiles.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: '#3C3F20' }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    project_link: '',
  });

  // Fetch portfolio items on mount
  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      const token = localStorage.getItem('token') ?? undefined;
      if (!token || !currentUser?.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await getUserPortfolio(currentUser.id, token);
        if (res.status === 'success') {
          setItems(res.data || []);
        }
      } catch (err) {
        console.error('Error fetching portfolio:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [currentUser?.id]);

  const handleAdd = async () => {
    if (!form.title.trim() || !form.project_link.trim()) {
      openModal({ type: 'error', message: 'Title and URL are required' });
      return;
    }

    const token = localStorage.getItem('token') ?? undefined;
    if (!token) {
      openModal({ type: 'error', message: 'Not authenticated' });
      return;
    }

    openModal({
      type: 'confirm-submit',
      title: 'Add Portfolio Item',
      message: 'Are you sure you want to add this to your portfolio?',
      onConfirm: async () => {
        try {
          const res = await createPortfolioItem(
            {
              title: form.title,
              description: form.description,
              project_link: form.project_link,
              media_file: mediaFile,
            },
            token
          );

          if (res.status === 'success') {
            openModal({ type: 'success', message: 'Portfolio item added successfully!' });
            setForm({ title: '', description: '', project_link: '' });
            setMediaFile(null);
            setShowForm(false);

            // Refresh portfolio items
            const updatedRes = await getUserPortfolio(currentUser?.id || 0, token);
            if (updatedRes.status === 'success') {
              setItems(updatedRes.data || []);
            }
          } else {
            openModal({ type: 'error', message: res.message || 'Failed to add portfolio item' });
          }
        } catch (err: any) {
          console.error('Error adding portfolio item:', err);
          openModal({ type: 'error', message: 'Error adding portfolio item. Please try again.' });
        }
      },
    });
  };

  const handleDelete = (itemId: number) => {
    openModal({
      type: 'delete',
      onConfirm: async () => {
        const token = localStorage.getItem('token') ?? undefined;
        if (!token) {
          openModal({ type: 'error', message: 'Not authenticated' });
          return;
        }

        try {
          const res = await deletePortfolioItem(itemId, token);
          if (res.status === 'success') {
            openModal({ type: 'success', message: 'Portfolio item deleted!' });
            setItems((prev) => prev.filter((i) => i.id !== itemId));
          } else {
            openModal({ type: 'error', message: 'Failed to delete portfolio item' });
          }
        } catch (err: any) {
          console.error('Error deleting portfolio item:', err);
          openModal({ type: 'error', message: 'Error deleting portfolio item. Please try again.' });
        }
      },
    });
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      openModal({ type: 'success', message: `File ${file.name} attached!` });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 style={{ color: '#3C3F20' }}>
            {isWorker ? 'My Portfolio' : `${currentUser?.username}'s Portfolio`}
          </h1>
          <p className="text-sm opacity-55 mt-0.5" style={{ color: '#3C3F20' }}>
            {isWorker
              ? 'Showcase your best work to potential employers'
              : "Browse this worker's completed projects"}
          </p>
        </div>
        {isWorker && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer flex-shrink-0"
            style={{ backgroundColor: '#3C3F20' }}
          >
            <PlusCircle size={15} />
            Add Item
          </button>
        )}
      </div>

      {/* Add form */}
      {isWorker && showForm && (
        <div
          className="rounded-2xl p-6 mb-6 shadow-sm"
          style={{ backgroundColor: '#E8E3C8' }}
        >
          <h2 className="mb-5" style={{ color: '#3C3F20' }}>
            New Portfolio Item
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm mb-1.5 opacity-65" style={{ color: '#3C3F20' }}>
                Title *
              </label>
              <input
                type="text"
                placeholder="Project title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: '#FDF9EB', color: '#3C3F20' }}
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5 opacity-65" style={{ color: '#3C3F20' }}>
                Project URL *
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={form.project_link}
                onChange={(e) => setForm({ ...form, project_link: e.target.value })}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: '#FDF9EB', color: '#3C3F20' }}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1.5 opacity-65" style={{ color: '#3C3F20' }}>
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe this project..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                style={{ backgroundColor: '#FDF9EB', color: '#3C3F20' }}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1.5 opacity-65" style={{ color: '#3C3F20' }}>
                Preview Image
              </label>
              <label
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 border-dashed cursor-pointer hover:border-[#BFC897] transition-colors"
                style={{ borderColor: '#C5BDAA' }}
              >
                <span className="text-sm opacity-55" style={{ color: '#3C3F20' }}>
                  {mediaFile?.name || 'Click to upload an image'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleMediaChange} />
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="px-5 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: '#3C3F20' }}
            >
              Save Item
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl text-sm border transition-all hover:bg-black/5 cursor-pointer"
              style={{ borderColor: '#3C3F20', color: '#3C3F20' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div
          className="rounded-2xl p-16 text-center"
          style={{ backgroundColor: '#E8E3C8' }}
        >
          <p className="opacity-50" style={{ color: '#3C3F20' }}>
            Loading portfolio...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div
          className="rounded-2xl p-16 text-center"
          style={{ backgroundColor: '#E8E3C8' }}
        >
          <p className="opacity-50 mb-4" style={{ color: '#3C3F20' }}>
            No portfolio items yet.
          </p>
          {isWorker && (
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: '#3C3F20' }}
            >
              Add Your First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group border-2 border-transparent hover:border-[#BFC897]"
              style={{ backgroundColor: '#E8E3C8' }}
            >
              {/* Thumbnail */}
              <div className="relative overflow-hidden h-40">
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
              <div className="p-4">
                <h4 className="mb-1 truncate" style={{ color: '#3C3F20' }}>
                  {item.title}
                </h4>
                <p
                  className="text-xs opacity-55 line-clamp-2 leading-relaxed mb-3"
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

                  {isWorker ? (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} className="text-red-500" />
                    </button>
                  ) : (
                    <a
                      href={item.project_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1 rounded-lg transition-all hover:opacity-80 cursor-pointer"
                      style={{ backgroundColor: '#BFC897', color: '#3C3F20' }}
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
