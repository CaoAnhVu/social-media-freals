import { Avatar } from "@chakra-ui/avatar";
import { Image } from "@chakra-ui/image";
import { Box, Flex, Text, Skeleton, Spinner } from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import Actions from "./Actions";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postsAtom from "../atoms/postsAtom";

const Post = ({ post, postedBy }) => {
  const [user, setUser] = useState(null);
  const { colorMode } = useColorMode();
  const showToast = useShowToast();
  const currentUser = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = post.location && post.location.name ? post.location.name : null;
  const coordinates = post?.location?.coordinates?.length ? post.location.coordinates.join(", ") : "No coordinates available";

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/users/profile/" + postedBy);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          setError(data.error);
          return;
        }
        setUser(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [postedBy, showToast]);

  const handleDeletePost = async (e) => {
    try {
      e.preventDefault();
      if (!window.confirm("Are you sure you want to delete this post?")) return;
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("Error", data.message || "An error occurred", "error");
        return;
      }
      showToast("Success", "Post deleted", "success");
      setPosts(posts.filter((p) => p._id !== post._id));
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  if (!user) return null;

  return (
    <Link to={`/${user.username}/post/${post._id}`}>
      <Flex gap={3} mb={4} py={5}>
        <Flex flexDirection={"column"} alignItems={"center"}>
          <Skeleton isLoaded={!loading} width="50px" height="50px">
            <Avatar
              size="md"
              name={user.name}
              src={user?.profilePic}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/${user.username}`);
              }}
            />
          </Skeleton>
          <Box w="1px" h={"full"} bg="gray.light" my={2}></Box>
          <Box position={"relative"} w={"full"}>
            {post.replies.length === 0 && <Text textAlign={"center"}>🥱</Text>}
            {post.replies.slice(0, 3).map((reply, index) => (
              <Skeleton key={index} isLoaded={!loading} width="30px" height="30px">
                <Avatar
                  size="xs"
                  name={reply.userName || "John Doe"}
                  src={reply.userProfilePic}
                  position={"absolute"}
                  top={index === 0 ? "0px" : index === 1 ? "auto" : "auto"}
                  bottom={index === 1 ? "0px" : index === 2 ? "0px" : "auto"}
                  left={index === 2 ? "4px" : "auto"}
                  right={index === 1 ? "-5px" : "auto"}
                  padding={"2px"}
                />
              </Skeleton>
            ))}
          </Box>
        </Flex>
        <Flex flex={1} flexDirection={"column"} gap={2}>
          <Flex justifyContent={"space-between"} w={"full"}>
            <Flex w={"full"} alignItems={"center"}>
              <Skeleton isLoaded={!loading}>
                <Text
                  fontSize={"sm"}
                  fontWeight={"bold"}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/${user.username}`);
                  }}
                >
                  {user?.username}
                </Text>
              </Skeleton>
              <Image src="/verified.png" w={4} h={4} ml={1} />
            </Flex>
            <Flex gap={4} alignItems={"center"}>
              <Skeleton isLoaded={!loading}>
                <Text fontSize={"xs"} width={36} textAlign={"right"} color={"gray.light"}>
                  {formatDistanceToNow(new Date(post.createdAt))} ago
                </Text>
              </Skeleton>
              {currentUser && currentUser._id === user._id && <DeleteIcon size={20} onClick={handleDeletePost} />}
            </Flex>
          </Flex>

          <Skeleton isLoaded={!loading}>
            <Text fontSize={"sm"}>{post.text}</Text>
          </Skeleton>

          {/* Hiển thị hình ảnh */}
          {post.img && (
            <Box borderRadius={6} overflow={"hidden"} border={"1px solid"} borderColor={"gray.light"}>
              <Image src={post.img} w={"full"} />
            </Box>
          )}

          {/* Hiển thị video */}
          {post.video && (
            <Box borderRadius={6} overflow={"hidden"} border={"1px solid"} borderColor={"gray.light"}>
              <video width="100%" controls>
                <source src={post.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Box>
          )}

          {/* Hiển thị vị trí */}
          {location !== "No location specified" ? (
            <Text fontSize="sm" color={colorMode === "dark" ? "white" : "black"} mt={2}>
              <strong>Location:</strong> {location}
            </Text>
          ) : (
            <Text fontSize="sm" color={colorMode === "dark" ? "white" : "black"} mt={2}>
              {location}
            </Text>
          )}
          {/* Hiển thị toạ độ */}
          {coordinates && coordinates !== "No coordinates available" && (
            <Text fontSize="sm" color={colorMode === "dark" ? "white" : "black"} mt={2}>
              <strong>Coordinates:</strong> {coordinates}
            </Text>
          )}

          {/* Hiển thị thông tin repost */}
          {post.repostedBy && (
            <Text fontSize="sm" color={colorMode === "dark" ? "white" : "black"} mt={2}>
              <strong>Reposted by:</strong> {post.repostedBy.username}
            </Text>
          )}
          <Flex gap={3} my={1}>
            <Actions post={post} />
          </Flex>
        </Flex>
      </Flex>
    </Link>
  );
};

export default Post;
