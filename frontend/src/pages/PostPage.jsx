import { Avatar, Box, Button, Divider, Flex, Image, Spinner, Text, IconButton, useColorMode } from "@chakra-ui/react";
import Actions from "../components/Actions";
import { useEffect } from "react";
import Comment from "../components/Comment";
import useGetUserProfile from "../hooks/useGetUserProfile";
import useShowToast from "../hooks/useShowToast";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { DeleteIcon, ArrowBackIcon } from "@chakra-ui/icons";
import postsAtom from "../atoms/postsAtom";

const PostPage = () => {
  const { user, loading } = useGetUserProfile();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const { colorMode } = useColorMode();
  const showToast = useShowToast();
  const { pid } = useParams();
  const currentUser = useRecoilValue(userAtom);
  const navigate = useNavigate();

  const currentPost = posts[0];
  const location = currentPost?.location && currentPost.location.name ? currentPost.location.name : null;

  useEffect(() => {
    const getPost = async () => {
      try {
        const res = await fetch(`/api/posts/${pid}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error("Failed to fetch post");
        }
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        // Thay đổi cách cập nhật posts
        setPosts((prevPosts) => {
          // Kiểm tra xem post đã tồn tại trong state chưa
          const existingPostIndex = prevPosts.findIndex((p) => p._id === data._id);
          if (existingPostIndex !== -1) {
            // Nếu đã tồn tại, cập nhật post đó
            const updatedPosts = [...prevPosts];
            updatedPosts[existingPostIndex] = data;
            return updatedPosts;
          }
          // Nếu chưa tồn tại, thêm vào đầu danh sách
          return [data, ...prevPosts];
        });
      } catch (error) {
        showToast("Error", error.message, "error");
      }
    };
    getPost();
  }, [showToast, pid, setPosts]);

  const handleDeletePost = async () => {
    try {
      if (!window.confirm("Are you sure you want to delete this post?")) return;

      const res = await fetch(`/api/posts/${currentPost._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Post deleted", "success");
      navigate(`/${user.username}`);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  if (loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"} />
      </Flex>
    );
  }

  if (!user || !currentPost) {
    return null;
  }

  return (
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
        w={{ base: "640px", md: "900px", lg: "640px" }}
        mx="auto"
        border="1px solid rgba(128, 128, 128, 0.5)"
        borderRadius="20px"
        p="8"
        mb="6"
        mt={"120px"}
      >
        <Flex>
          <Flex w={"full"} alignItems={"center"} gap={3}>
            <Avatar src={user.profilePic} size={"md"} name="profilePic" />
            <Flex>
              <Text fontSize={"sm"} fontWeight={"bold"}>
                {user.username}
              </Text>
              <Image src="/verified.png" w="4" h={4} ml={1} />
            </Flex>
          </Flex>
          <Flex gap={4} alignItems={"center"}>
            <Text fontSize={"xs"} width={36} textAlign={"right"} color={"gray.light"}>
              {currentPost.createdAt ? formatDistanceToNow(new Date(currentPost.createdAt)) : "Unknown"} ago
            </Text>

            {currentUser?._id === user?._id && <DeleteIcon size={20} cursor={"pointer"} onClick={handleDeletePost} />}
          </Flex>
        </Flex>

        <Text my={3}>{currentPost.text}</Text>

        {currentPost.img && (
          <Box borderRadius={6} overflow={"hidden"} border={"1px solid"} borderColor={"gray.light"} mb={2}>
            <Image src={currentPost.img} w={"full"} />
          </Box>
        )}

        {currentPost.video && (
          <Box borderRadius={6} overflow={"hidden"} border={"1px solid"} borderColor={"gray.light"}>
            <video width="100%" controls>
              <source src={currentPost.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
        )}
        {location && (
          <Text fontSize="sm" color={colorMode === "dark" ? "white" : "black"} mt={2}>
            <strong>Location:</strong> {location}
          </Text>
        )}
        <Flex gap={3} my={1}>
          <Actions post={currentPost} showReplies={true} />
        </Flex>

        <Divider my={4} />

        {currentPost.replies?.map((reply, index) => (
          <Comment key={reply._id || `reply-${index}`} reply={reply} lastReply={index === currentPost.replies.length - 1} />
        ))}

        <Divider my={4} />
        <Flex justifyContent={"space-between"}>
          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"2xl"}>👋</Text>
            <Text color={"gray.light"}>Get the app to like, reply and post.</Text>
          </Flex>
          <Button>Get</Button>
        </Flex>
      </Box>
    </Box>
  );
};
export default PostPage;
