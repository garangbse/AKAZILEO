import React, { useState } from 'react';
import { ExternalLink, PlusCircle, Trash2, Calendar, Tag } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { PORTFOLIO_ITEMS, WORKER_PROFILE } from '../data/mockData';

type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  link: string;
  createdDate: string;
  category: string;
};

export function PortfolioPage() {
  const { role, openModal } = useAppContext();
  const isWorker = role === 'worker';

  const [items, setItems] = useState<PortfolioItem[]>(PORTFOLIO_ITEMS as PortfolioItem[]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    thumbnail: '',
    link: '',
    category: 'Design',
  });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    const newItem: PortfolioItem = {
      id: String(Date.now()),
      title: form.title,
      description: form.description,
      thumbnail:
        form.thumbnail ||
        '',
      link: form.link || 'https://example.com',
      createdDate: new Date().toISOString().split('T')[0],
      category: form.category,
    };
    setItems((prev) => [newItem, ...prev]);
    setForm({ title: '', description: '', thumbnail: '', link: '', category: 'Design' });
    setShowForm(false);
    openModal({ type: 'add-portfolio' });
  };

  const handleDelete = (id: string) => {
    openModal({
      type: 'delete',
      onConfirm: () => setItems((prev) => prev.filter((i) => i.id !== id)),
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 style={{ color: '#3C3F20' }}>
            {isWorker ? 'My Portfolio' : `${WORKER_PROFILE.name}'s Portfolio`}
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
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer"
                style={{ backgroundColor: '#FDF9EB', color: '#3C3F20' }}
              >
                {['Design', 'Development', 'Branding', 'Marketing', 'Copywriting', 'Web Design'].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  )
                )}
              </select>
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
            <div>
              <label className="block text-sm mb-1.5 opacity-65" style={{ color: '#3C3F20' }}>
                Project URL
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: '#FDF9EB', color: '#3C3F20' }}
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5 opacity-65" style={{ color: '#3C3F20' }}>
                Thumbnail URL
              </label>
              <input
                type="url"
                placeholder="Leave blank for default"
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: '#FDF9EB', color: '#3C3F20' }}
              />
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
      {items.length === 0 ? (
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
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                <a
                  href={item.link}
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
                <div className="flex items-center gap-1.5 mb-2">
                  <Tag size={10} style={{ color: '#3C3F20' }} className="opacity-40" />
                  <span className="text-xs opacity-40" style={{ color: '#3C3F20' }}>
                    {item.category}
                  </span>
                </div>
                <h4 className="mb-1 truncate" style={{ color: '#3C3F20' }}>
                  {item.title}
                </h4>
                <p
                  className="text-xs opacity-55 line-clamp-2 leading-relaxed mb-3"
                  style={{ color: '#3C3F20' }}
                >
                  {item.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Calendar size={10} style={{ color: '#3C3F20' }} className="opacity-35" />
                    <span className="text-xs opacity-35" style={{ color: '#3C3F20' }}>
                      {item.createdDate}
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
                      href={item.link}
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
