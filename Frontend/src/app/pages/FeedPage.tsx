import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Image, Send, Trash2, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { api, fileToBase64 } from "../../services/api";

type FeedComment = {
  id: number;
  content: string;
  username: string;
  parent_id?: number;
  user_id?: number;
};

type FeedPost = {
  id: string | number;
  user_id: number;
  author?: string;
  authorAvatar?: string;
  role?: string;
  content: string;
  media_file: string | null;
  likes: number;
  comments: FeedComment[];
  timestamp?: string;
  liked?: boolean;
};

export function FeedPage() {
  const { role, currentUser, openModal } = useAppContext();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(currentUser?.profile_picture || null);
  const [posterProfilePictures, setPosterProfilePictures] = useState<Record<number, string>>({});

  // Listen to context profilePicture changes and update local state
  useEffect(() => {
    if (currentUser?.profile_picture && currentUser?.id) {
      setProfilePicture(currentUser.profile_picture);
      // Also update this user's profile picture in the feed if they appear as a poster
      setPosterProfilePictures((prev) => ({
        ...prev,
        [currentUser.id!]: currentUser.profile_picture!,
      }));
      console.log('[FEED] Profile picture updated from context');
    }
  }, [currentUser?.profile_picture, currentUser?.id]);

  // Fetch user profile picture from database on mount
  useEffect(() => {
    const fetchProfilePicture = async () => {
      const token = localStorage.getItem('token');
      if (!token || !currentUser?.id) return;

      try {
        const response = await api(`/users/${currentUser.id}`, 'GET', undefined, token);
        if (response.status === 'success' && response.data?.profile_picture) {
          setProfilePicture(response.data.profile_picture);
          console.log('[FEED] Profile picture fetched');
        }
      } catch (error) {
        console.error('[FEED] Failed to fetch profile picture:', error);
      }
    };

    fetchProfilePicture();
  }, [currentUser?.id]);

  // Fetch posts from API
  const fetchPosts = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api('/posts', 'GET', undefined, token);
      if (response.status === 'success' && response.data) {
        setPosts(response.data);

        // Fetch profile pictures for all unique posters
        const uniquePosterIds = [...new Set(response.data.map((post: FeedPost) => post.user_id))] as number[];
        const profilePicturesMap: Record<number, string> = {};

        for (const userId of uniquePosterIds) {
          try {
            const userResponse = await api(`/users/${userId}`, 'GET', undefined, token);
            if (userResponse.status === 'success' && userResponse.data?.profile_picture) {
              profilePicturesMap[userId] = userResponse.data.profile_picture;
              console.log(`[FEED] Fetched profile picture for user ${userId}`);
            }
          } catch (error) {
            console.error(`Failed to fetch profile picture for user ${userId}:`, error);
          }
        }

        setPosterProfilePictures(profilePicturesMap);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId: string | number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await api(`/posts/${postId}/like`, 'POST', {}, token);
      if (response.status === 'success') {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, liked: response.data.liked, likes: response.data.likes }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handlePost = async () => {
    if (!newPostText.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error('No authentication token');
      return;
    }

    try {
      let mediaBase64 = null;

      // Convert file to base64 if provided
      if (mediaFile) {
        mediaBase64 = await fileToBase64(mediaFile);
      }

      const res = await api(
        "/posts",
        "POST",
        {
          content: newPostText,
          media_file: mediaBase64
        },
        token
      );

      if (res.status === "success") {
        setNewPostText("");
        setMediaFile(null);
        setMediaPreview(null);
        await fetchPosts();
        openModal({ type: 'success', message: 'Post created successfully!' });
      }
    } catch (error) {
      console.error('Error posting:', error);
      openModal({ type: 'error', message: 'Failed to create post' });
    }
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeletePost = (postId: string | number) => {
    openModal({
      type: 'delete',
      onConfirm: async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
          const res = await api(`/posts/${postId}`, 'DELETE', undefined, token);
          if (res.status === 'success') {
            setPosts((prev) => prev.filter((p) => p.id !== postId));
            openModal({ type: 'success', message: 'Post deleted!' });
          } else {
            openModal({ type: 'error', message: res.message || 'Failed to delete post' });
          }
        } catch (error) {
          console.error('Error deleting post:', error);
          openModal({ type: 'error', message: 'Failed to delete post. You can only delete your own posts.' });
        }
      },
    });
  };

  const handleCommentSubmit = async (postId: string | number) => {
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await api(
        `/posts/${postId}/comment`,
        'POST',
        { content: commentText },
        token
      );

      if (res.status === 'success') {
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
        await fetchPosts();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      openModal({ type: 'error', message: 'Failed to post comment' });
    }
  };

  const handleDeleteComment = (commentId: number) => {
    openModal({
      type: 'delete',
      onConfirm: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
          const res = await api(`/comments/${commentId}`, 'DELETE', undefined, token);
          if (res.status === 'success') {
            await fetchPosts();
            openModal({ type: 'success', message: 'Comment deleted!' });
          }
        } catch (error) {
          console.error('Error deleting comment:', error);
          openModal({ type: 'error', message: 'Failed to delete comment' });
        }
      },
    });
  };

  const toggleComments = (id: string | number) => {
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
            src={
              profilePicture
                ? profilePicture.startsWith('data:')
                  ? profilePicture
                  : `data:image/png;base64,${profilePicture}`
                : 'https://via.placeholder.com/40'
            }
            alt={currentUser?.username}
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

            {/* Media preview */}
            {mediaPreview && (
              <div className="mt-3 rounded-xl overflow-hidden relative">
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="w-full max-h-48 object-cover"
                />
                <button
                  onClick={handleRemoveMedia}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center gap-1.5 text-sm opacity-45 hover:opacity-70 transition-opacity cursor-pointer" style={{ color: '#3C3F20' }}>
                <Image size={15} />
                <span>Photo</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleMediaSelect}
                  className="hidden"
                />
              </label>
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
            <div className="flex items-center justify-between p-5 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={
                    posterProfilePictures[post.user_id]
                      ? posterProfilePictures[post.user_id].startsWith('data:')
                        ? posterProfilePictures[post.user_id]
                        : `data:image/png;base64,${posterProfilePictures[post.user_id]}`
                      : post.authorAvatar || 'https://via.placeholder.com/40'
                  }
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
              {currentUser?.id === post.user_id && (
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} className="text-red-500" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="px-5 pb-3">
              <p className="text-sm leading-relaxed" style={{ color: '#3C3F20' }}>
                {post.content}
              </p>
            </div>

            {/* Media */}
            {post.media_file && (
              <div className="mx-5 mb-3 rounded-xl overflow-hidden">
                <img
                  src={
                    post.media_file.startsWith('data:')
                      ? post.media_file
                      : `data:image/png;base64,${post.media_file}`
                  }
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
                <span>{post.comments.length}</span>
              </button>

              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80 cursor-pointer ml-auto"
                style={{ color: '#3C3F20' }}
              >
                <Share2 size={14} />
                <span>Share</span>
              </button>
            </div>

            {/* Comments Section */}
            {openComments[post.id] && (
              <div
                className="px-5 py-4 border-t"
                style={{ borderColor: '#D0CBAF', backgroundColor: '#FDF9EB' }}
              >
                {/* Display existing comments */}
                {post.comments.length > 0 && (
                  <div className="mb-4 space-y-3">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <div className="flex-1 text-sm">
                          <p className="font-medium" style={{ color: '#3C3F20' }}>
                            {comment.username}
                          </p>
                          <p className="opacity-75" style={{ color: '#3C3F20' }}>
                            {comment.content}
                          </p>
                        </div>
                        {currentUser?.id === comment.user_id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 transition-colors cursor-pointer flex-shrink-0"
                          >
                            <Trash2 size={12} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment input */}
                <div className="flex gap-2">
                  <img
                    src={
                      profilePicture
                        ? profilePicture.startsWith('data:')
                          ? profilePicture
                          : `data:image/png;base64,${profilePicture}`
                        : 'https://via.placeholder.com/28'
                    }
                    alt={currentUser?.username}
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
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleCommentSubmit(post.id);
                        }
                      }}
                      className="flex-1 bg-transparent outline-none text-sm"
                      style={{ color: '#3C3F20' }}
                    />
                    <button
                      onClick={() => handleCommentSubmit(post.id)}
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
