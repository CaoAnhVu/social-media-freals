import { VStack, Text, Flex, Box, Avatar, Spinner, Image, Skeleton } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { DeleteIcon } from "@chakra-ui/icons";
import { useColorMode } from "@chakra-ui/color-mode";
import Actions from "./Actions";
import Post from "./Post";
import { useState, useEffect } from "react";
import useShowToast from "../hooks/useShowToast";
import { MdOutlineCommentsDisabled } from "react-icons/md";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
const UserReposts = ({ username }) => {
  const { colorMode } = useColorMode();
  const [reposts, setReposts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const showToast = useShowToast();
  useEffect(() => {
    const fetchReposts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/posts/reposts/${username}`);
        const data = await res.json();
        // Log để debug
        console.log("Fetched reposts data:", data);
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setReposts(data);
      } catch (error) {
        console.error("Error fetching reposts:", error);
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchReposts();
  }, [username, showToast]);

  const handleDeleteRepost = async (postId) => {
    try {
      // Kiểm tra và log postId để debug
      console.log("Deleting repost with ID:", postId);
      const res = await fetch(`/api/posts/repost/${postId}/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      console.log("Delete response:", data);
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      // Xóa repost khỏi danh sách local
      setReposts(reposts.filter((repost) => repost.originalPost._id !== postId));
      showToast("Success", "Repost removed successfully", "success");
    } catch (error) {
      console.error("Error deleting repost:", error);
      showToast("Error", error.message, "error");
    }
  };
  if (loading) {
    return (
      <Flex justifyContent="center" w="full">
        <Spinner size="xl" />
      </Flex>
    );
  }
  if (!reposts?.length) {
    return (
      <Text textAlign={"center"} w={"full"}>
        There are no reposts!!
      </Text>
    );
  }
  return (
    <VStack gap={4} w={"full"}>
      {reposts.map((repost) => (
        <Flex key={repost._id} w={"full"} borderRadius={6} gap={3} mb={4} py={5}>
          {/* Thông tin người repost */}
          <Flex flexDirection={"column"} alignItems={"center"}>
            <Skeleton isLoaded={!loading} width="50px" height="50px">
              <Avatar
                size="md"
                name={repost.repostedBy.username}
                src={repost.repostedBy.profilePic}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/${repost.repostedBy.username}`);
                }}
                _hover={{ transform: "scale(1.1)" }}
                transition="all 0.3s"
              />
            </Skeleton>
            <Box w="1px" h={"full"} bg="gray.light" my={2}></Box>
            <Box position={"relative"} w={"full"}>
              {repost.replies.length === 0 && (
                <Text textAlign={"center"} ml={4} fontSize={"xl"}>
                  <MdOutlineCommentsDisabled />
                </Text>
              )}

              {repost.replies[0] && <Avatar size="xs" name="John doe" src={repost.replies[0].userProfilePic} position={"absolute"} top={"0px"} left="15px" padding={"2px"} />}

              {repost.replies[1] && <Avatar size="xs" name="John doe" src={repost.replies[1].userProfilePic} position={"absolute"} bottom={"0px"} right="-5px" padding={"2px"} />}

              {repost.replies[2] && <Avatar size="xs" name="John doe" src={repost.replies[2].userProfilePic} position={"absolute"} bottom={"0px"} left="4px" padding={"2px"} />}
            </Box>
          </Flex>
          <Flex flex={1} flexDirection={"column"} gap={2}>
            <Flex justifyContent={"space-between"} w={"full"}>
              <Flex align="center" gap={1} mt={2}>
                <Link to={`/${repost.repostedBy.username}`}>
                  <Text fontSize={"sm"} fontWeight={"bold"} _hover={{ color: "blue.400" }} cursor="pointer">
                    {repost.repostedBy.username}
                  </Text>
                </Link>
                <Image src="/verified.png" w={4} h={4} ml={1} _hover={{ transform: "scale(1.1)" }} transition="all 0.3s" />
              </Flex>
              <Flex gap={2} alignItems={"center"}>
                <Text fontSize={"sm"} color={"gray.light"}>
                  {new Intl.DateTimeFormat("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(repost.createdAt))}
                </Text>
                <Text fontSize="sm">•</Text>
                <Text fontSize={"sm"} color={"gray.light"}>
                  {new Intl.DateTimeFormat("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }).format(new Date(repost.createdAt))}
                </Text>
                <Text fontSize="sm">•</Text>
                <Text fontSize={"sm"} color={"gray.light"}>
                  {formatDistanceToNow(new Date(repost.repostedAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </Text>

                <DeleteIcon
                  size={20}
                  onClick={() => handleDeleteRepost(repost.originalPost._id)}
                  _hover={{
                    cursor: "pointer",
                    color: "red.500",
                  }}
                  transition="all 0.2s ease"
                />
              </Flex>
            </Flex>
            {/* Bài viết gốc */}
            <Box borderWidth={1} borderColor={colorMode === "dark" ? "gray.dark" : "gray.light"} borderRadius={6} p={3} mt={4}>
              <Flex gap={3}>
                {/* Truyền trực tiếp originalPost vào Post component */}
                <Post post={repost.originalPost} postedBy={repost.originalPost.postedBy.username} />
              </Flex>
            </Box>
            <Actions post={repost} />
          </Flex>
        </Flex>
      ))}
    </VStack>
  );
};
export default UserReposts;
