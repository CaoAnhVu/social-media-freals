import { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { useParams, useNavigate } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Flex, Spinner, Box, IconButton, useColorMode } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import Post from "../components/Post";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";

const UserPage = () => {
  const { user, loading: userLoading } = useGetUserProfile(); // Adjusted to fetch user
  const { username } = useParams();
  const { colorMode } = useColorMode();
  const showToast = useShowToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [fetchingPosts, setFetchingPosts] = useState(true);

  useEffect(() => {
    const getPosts = async () => {
      if (!user) return; // Ensure user data is loaded
      setFetchingPosts(true); // Begin fetching posts
      try {
        const res = await fetch(`/api/posts/user/${username}`);
        const data = await res.json();
        console.log("Fetched posts:", data); // For debugging
        setPosts(data); // Update state with posts data
      } catch (error) {
        showToast("Error", error.message, "error");
        setPosts([]); // If error, set posts to empty
      } finally {
        setFetchingPosts(false); // End fetching state
      }
    };

    if (user) {
      getPosts(); // Only fetch posts if user is available
    }
  }, [username, showToast, setPosts, user]); // Trigger when username or user changes

  if (userLoading) {
    return (
      <Box mt={"350px"}>
        <Flex justifyContent={"center"}>
          <Spinner size={"xl"} />
        </Flex>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box mt={"350px"} textAlign={"center"} fontSize={"2xl"} fontWeight={"bold"} color="red.400">
        <h1>User not found!</h1>
      </Box>
    );
  }

  return (
    <>
      <Box position="relative">
        <IconButton
          icon={<ArrowBackIcon />}
          aria-label="Go Back"
          position="absolute"
          top="-40px"
          left="10px"
          size="sm"
          onClick={() => navigate(-1)} // Điều hướng quay lại trang trước
          color={colorMode === "dark" ? "white" : "black"}
          _hover={{ bg: "gray.600" }}
          _active={{ bg: "gray.500" }}
          isRound
        />

        <Box
          bg={colorMode === "dark" ? "#181818" : "white"}
          w={{ base: "640px", md: "900px", lg: "640px" }}
          mx="auto"
          border="1px solid rgba(128, 128, 128, 0.5)"
          borderRadius="20px"
          p="4"
          mb="4"
          mt={"120px"}
        >
          <UserHeader user={user} />
          {/* If posts are still loading or empty */}
          {fetchingPosts && (
            <Flex justifyContent={"center"} my={12}>
              <Spinner size={"xl"} />
            </Flex>
          )}

          {!fetchingPosts && (!posts || posts.length === 0) && <h1>User has no posts.</h1>}

          {/* Render posts if available */}
          {posts && posts.length > 0 && posts.map((post) => <Post key={post._id} post={post} postedBy={post.postedBy} />)}
        </Box>
      </Box>
    </>
  );
};

export default UserPage;
