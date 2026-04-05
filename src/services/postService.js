import { API_BASE_URL } from '../config';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// ---- Posts ----

export const getPosts = async (page = 1, limit = 10) => {
  const res = await fetch(`${API_BASE_URL}/posts?page=${page}&limit=${limit}`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
};

export const createPost = async ({ content, privacy, imageUrl }) => {
  const res = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, privacy, imageUrl })
  });
  if (!res.ok) throw new Error('Failed to create post');
  return res.json();
};

export const likePost = async (postId) => {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
    method: 'PUT',
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to toggle like');
  return res.json();
};

export const updatePostPrivacy = async (postId, privacy) => {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/privacy`, {
    method: 'PUT',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ privacy })
  });
  if (!res.ok) throw new Error('Failed to update privacy');
  return res.json();
};

export const getPostLikers = async (postId) => {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/likes`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch likers');
  return res.json();
};

// ---- Comments ----

export const getComments = async (postId, page = 1, limit = 10) => {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/comments?page=${page}&limit=${limit}`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
};

export const createComment = async (postId, content) => {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  if (!res.ok) throw new Error('Failed to create comment');
  return res.json();
};

export const likeComment = async (postId, commentId) => {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/like`, {
    method: 'PUT',
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to toggle comment like');
  return res.json();
};

// ---- Replies ----

export const getReplies = async (postId, commentId) => {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/replies`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch replies');
  return res.json();
};

export const createReply = async (postId, commentId, content) => {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/replies`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  if (!res.ok) throw new Error('Failed to create reply');
  return res.json();
};

export const likeReply = async (postId, commentId, replyId) => {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/replies/${replyId}/like`, {
    method: 'PUT',
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to toggle reply like');
  return res.json();
};
