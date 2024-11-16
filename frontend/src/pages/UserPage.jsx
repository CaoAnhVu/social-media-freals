import { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Flex, Spinner, Box } from "@chakra-ui/react";
import Post from "../components/Post";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";

const UserPage = () => {
  const { user, loading } = useGetUserProfile();
  const { username } = useParams();
  const showToast = useShowToast();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [fetchingPosts, setFetchingPosts] = useState(true);

  useEffect(() => {
    const getPosts = async () => {
      if (!username) return;
      setFetchingPosts(true);
      try {
        const res = await fetch(`/api/posts/user/${username}`);
        const data = await res.json();
        console.log(data);
        setPosts(Array.isArray(data) ? data : []); // Đảm bảo data là một mảng
      } catch (error) {
        showToast("Error", error.message, "error");
        setPosts([]);
      } finally {
        setFetchingPosts(false);
      }
    };

    getPosts();
  }, [username, showToast, setPosts, user]);

  if (!user && loading) {
    return (
      <Box mt={"350px"}>
        <Flex justifyContent={"center"}>
          <Spinner size={"xl"} />
        </Flex>
      </Box>
    );
  }

  if (!user && !loading)
    return (
      <Box mt={"350px"} textAlign={"center"} fontSize={"2xl"} fontWeight={"bold"} color="red.400">
        <h1>User not found!</h1>
      </Box>
    );

  return (
    <>
      <Box mt={16}>
        <UserHeader user={user} />
        {!fetchingPosts && (!posts || posts.length === 0) && <h1>User has not posts.</h1>}
        {fetchingPosts && (
          <Flex justifyContent={"center"} my={12}>
            <Spinner size={"xl"} />
          </Flex>
        )}

        {posts && posts.map((post) => <Post key={post._id} post={post} postedBy={post.postedBy} />)}
      </Box>
    </>
  );
};

export default UserPage;
