// hooks/useGroupPosts.js
import { useState, useEffect, useCallback } from "react";

export const useGroupPosts = (groupId) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Sửa lại URL endpoint
      const res = await fetch(`/api/groups/${groupId}/posts`);

      if (!res.ok) {
        throw new Error("Không thể tải bài viết");
      }

      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  const createPost = useCallback(
    async (postData) => {
      try {
        setLoading(true);
        setError(null);
        // Sửa lại URL endpoint
        const res = await fetch(`/api/groups/${groupId}/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        });

        if (!res.ok) {
          throw new Error("Không thể tạo bài viết");
        }

        const newPost = await res.json();
        setPosts((prevPosts) => [newPost, ...prevPosts]);
        return newPost;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [groupId]
  );

  const deletePost = useCallback(
    async (postId) => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/groups/posts/${groupId}/${postId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Không thể xóa bài viết");
        }

        setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [groupId]
  );

  const updatePost = useCallback(
    async (postId, updateData) => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/groups/posts/${groupId}/${postId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!res.ok) {
          throw new Error("Không thể cập nhật bài viết");
        }

        const updatedPost = await res.json();
        setPosts((prevPosts) => prevPosts.map((post) => (post._id === postId ? updatedPost : post)));
        return updatedPost;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [groupId]
  );

  return { posts, loading, error, refetchPosts: fetchPosts, createPost, deletePost, updatePost };
};
