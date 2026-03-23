import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Image, Send } from 'lucide-react';
import { FEED_POSTS, WORKER_PROFILE } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { api } from "../../services/api";

type FeedPost = {
  id: string;
  author: string;
  authorAvatar: string;
  role: string;
  content: string;
  media: string | null;
  likes: number;
  comments: number;
  timestamp: string;
  liked: boolean;
};

export function FeedPage() {
  const { role } = useAppContext();
  const profile =
    role === 'worker'
      ? WORKER_PROFILE
      : {
          name: 'LEOREO',
          avatar:
            'https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100',
        };

  const [posts, setPosts] = useState<FeedPost[]>(FEED_POSTS as FeedPost[]);
  const [newPostText, setNewPostText] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  };

  const handlePost = async () => {
    if (!newPostText.trim()) return;

    const token = localStorage.getItem("token");

    const res = await api(
      "/posts", // or /posts depending on your backend route
      "POST",
      {
        user_id: 1, // replace this with the logged-in user id from auth
        content: newPostText,
        media_file: null
      },
      token || undefined
    );

    if (res.status === "success") {
      localStorage.setItem("token", res.data.token);
      setPosts((prev) => [res.data, ...prev]);
      setNewPostText("");
    } else {
      console.log(res);
    }
  };

  const toggleComments = (id: string) => {
    setOpenComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 style={{ color: '#3C3F20' }}>Posts & Feed</h1>
        <p className="text-sm opacity-55 mt-0.5" style={{ color: '#3C3F20' }}>
          Stay updated with the community
        </p>
      </div>

      {/* Compose */}
      <div
        className="rounded-2xl p-5 mb-6 shadow-sm"
        style={{ backgroundColor: '#E8E3C8' }}
      >
        <div className="flex gap-3">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2"
            style={{ borderColor: '#BFC897' }}
          />
          <div className="flex-1">
            <textarea
              rows={3}
              placeholder="Share something with the community..."
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
              style={{ backgroundColor: '#FDF9EB', color: '#3C3F20' }}
            />
            <div className="flex items-center justify-between mt-3">
              <button
                className="flex items-center gap-1.5 text-sm opacity-45 hover:opacity-70 transition-opacity cursor-pointer"
                style={{ color: '#3C3F20' }}
              >
                <Image size={15} />
                <span>Photo</span>
              </button>
              <button
                onClick={handlePost}
                disabled={!newPostText.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#3C3F20' }}
              >
                <Send size={13} />
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-[#BFC897]"
            style={{ backgroundColor: '#E8E3C8' }}
          >
            {/* Author row */}
            <div className="flex items-center gap-3 p-5 pb-3">
              <img
                src={post.authorAvatar}
                alt={post.author}
                className="w-10 h-10 rounded-full object-cover border-2 flex-shrink-0"
                style={{ borderColor: '#BFC897' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: '#3C3F20' }}>
                  {post.author}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full capitalize"
                    style={{ backgroundColor: '#BFC897' + '40', color: '#3C3F20' }}
                  >
                    {post.role}
                  </span>
                  <span className="text-xs opacity-40" style={{ color: '#3C3F20' }}>
                    {post.timestamp}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 pb-3">
              <p className="text-sm leading-relaxed" style={{ color: '#3C3F20' }}>
                {post.content}
              </p>
            </div>

            {/* Media */}
            {post.media && (
              <div className="mx-5 mb-3 rounded-xl overflow-hidden">
                <img
                  src={post.media}
                  alt="Post media"
                  className="w-full max-h-72 object-cover"
                />
              </div>
            )}

            {/* Actions */}
            <div
              className="flex items-center gap-1 px-5 py-3 border-t"
              style={{ borderColor: '#D0CBAF' }}
            >
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80 cursor-pointer"
                style={{
                  backgroundColor: post.liked ? '#3C3F20' : 'transparent',
                  color: post.liked ? '#FDF9EB' : '#3C3F20',
                }}
              >
                <Heart size={14} fill={post.liked ? 'currentColor' : 'none'} />
                <span>{post.likes}</span>
              </button>

              <button
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80 cursor-pointer"
                style={{ color: '#3C3F20' }}
              >
                <MessageCircle size={14} />
                <span>{post.comments}</span>
              </button>

              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80 cursor-pointer ml-auto"
                style={{ color: '#3C3F20' }}
              >
                <Share2 size={14} />
                <span>Share</span>
              </button>
            </div>

            {/* Comment input */}
            {openComments[post.id] && (
              <div
                className="px-5 py-3 border-t"
                style={{ borderColor: '#D0CBAF', backgroundColor: '#FDF9EB' }}
              >
                <div className="flex gap-2">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                  <div
                    className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2"
                    style={{ backgroundColor: '#E8E3C8' }}
                  >
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentInputs[post.id] ?? ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      className="flex-1 bg-transparent outline-none text-sm"
                      style={{ color: '#3C3F20' }}
                    />
                    <button
                      onClick={() => {
                        if (!commentInputs[post.id]?.trim()) return;
                        setPosts((prev) =>
                          prev.map((p) =>
                            p.id === post.id ? { ...p, comments: p.comments + 1 } : p
                          )
                        );
                        setCommentInputs((prev) => ({ ...prev, [post.id]: '' }));
                      }}
                      className="flex-shrink-0 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <Send size={13} style={{ color: '#3C3F20' }} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
