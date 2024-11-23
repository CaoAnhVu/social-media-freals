import { Box, Flex, Spinner, useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import userAtom from "../atoms/userAtom";
import SuggestedUsers from "../components/SuggestedUsers";

const HomePage = () => {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(true);
  const { colorMode } = useColorMode();
  const showToast = useShowToast();
  const [user] = useRecoilState(userAtom);

  useEffect(() => {
    const getFeedPosts = async () => {
      if (!user || !user._id) {
        // Nếu không có user, chỉ hiển thị thông báo lỗi mà không chuyển hướng
        showToast("Error", "User not logged in or invalid user data", "error");
        setLoading(false);
        return;
      }

      setLoading(true);
      setPosts([]); // Clear posts before fetching new ones

      try {
        const res = await fetch("/api/posts/feed");
        if (!res.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await res.json();

        if (data.error) {
          showToast("Error", data.error, "error");
          setLoading(false);
          return;
        }

        const updatedPosts = Array.isArray(data)
          ? data.map((post) => {
              if (post.location?.coordinates?.length === 2) {
                post.location.coordinates = [post.location.coordinates[1], post.location.coordinates[0]];
              }
              return post;
            })
          : [];

        setPosts(updatedPosts);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    getFeedPosts();
  }, [user, showToast, setPosts]);

  return (
    <Flex mt={70} gap="10" alignItems={"flex-start"}>
      <Box flex={80}>
        {loading && (
          <Flex justify="center">
            <Spinner size="xl" />
          </Flex>
        )}

        {!loading && posts.length === 0 && (
          <h1>{user?.following?.length === 0 ? "You are not following anyone. Start following users to see their posts!" : "No posts available in your feed. Check back later!"}</h1>
        )}
        {!loading &&
          Array.isArray(posts) &&
          posts.map((post) => (
            <Box key={post._id} border="1px solid rgba(128, 128, 128, 0.5)" bg={colorMode === "dark" ? "#181818" : "white"} borderRadius="20px" p="4" mb="4">
              <Post post={post} postedBy={post.postedBy} />
            </Box>
          ))}
      </Box>

      <Box
        flex={30}
        display={{
          base: "none",
          md: "block",
        }}
      >
        <SuggestedUsers />
      </Box>
    </Flex>
  );
};

export default HomePage;
