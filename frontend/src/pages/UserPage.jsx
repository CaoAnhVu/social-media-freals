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
  const { user, loading: userLoading } = useGetUserProfile();
  const { username } = useParams();
  const { colorMode } = useColorMode();
  const showToast = useShowToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [fetchingPosts, setFetchingPosts] = useState(true);

  useEffect(() => {
    const getPosts = async () => {
      if (!user) return;
      setFetchingPosts(true);
      try {
        const res = await fetch("/api/posts/user/" + username);
        const data = await res.json();
        // Kiểm tra xem data có phải là mảng không
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error("Data không phải là mảng:", data);
          setPosts([]); // Set một mảng rỗng nếu data không phải là mảng
        }
      } catch (error) {
        showToast("Error", error.message, "error");
        setPosts([]);
      } finally {
        setFetchingPosts(false);
      }
    };

    if (user) {
      getPosts();
    }
  }, [username, showToast, setPosts, user]);

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
          onClick={() => navigate(-1)}
          color={colorMode === "dark" ? "white" : "black"}
          _hover={{ bg: "gray.600" }}
          _active={{ bg: "gray.500" }}
          isRound
        />

        <Box
          bg={colorMode === "dark" ? "#181818" : "white"}
          w={{ base: "660px", md: "900px", lg: "660px" }}
          mx="auto"
          border="1px solid rgba(128, 128, 128, 0.5)"
          borderRadius="20px"
          p="4"
          mb="4"
          mt={"120px"}
        >
          <UserHeader user={user} />

          {!fetchingPosts && (!posts || !Array.isArray(posts) || posts.length === 0) && <h1>User has no posts.</h1>}

          {fetchingPosts && (
            <Flex justifyContent={"center"} my={12}>
              <Spinner size={"xl"} />
            </Flex>
          )}

          {Array.isArray(posts) && posts.map((post) => <Post key={post._id} post={post} postedBy={post.postedBy} />)}
        </Box>
      </Box>
    </>
  );
};

export default UserPage;
