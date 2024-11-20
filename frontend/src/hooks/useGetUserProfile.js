import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useShowToast from "./useShowToast";

const useGetUserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { username } = useParams(); // Lấy giá trị từ URL
  const showToast = useShowToast();

  useEffect(() => {
    const getUser = async () => {
      // Kiểm tra nếu username không tồn tại hoặc không hợp lệ
      if (!username || typeof username !== "string" || username.trim() === "") {
        showToast("Error", "Username is required and must be valid", "error");
        setLoading(false); // Đảm bảo loading sẽ dừng
        return; // Không gọi API nếu username không hợp lệ
      }

      try {
        const res = await fetch(`/api/users/profile/${username}`);
        console.log("Profile URL:", `/api/users/profile/${username}`);

        if (!res.ok) {
          const errorData = await res.json();
          showToast("Error", errorData.error || "Failed to fetch user data", "error");
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [username, showToast]);

  return { loading, user };
};

export default useGetUserProfile;
