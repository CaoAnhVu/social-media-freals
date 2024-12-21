import { VStack, Text, Flex, Box, Avatar, Spinner, Image } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useColorMode } from "@chakra-ui/color-mode";
import Actions from "./Actions";
import { useState, useEffect } from "react";
import useShowToast from "../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const UserReposts = ({ username }) => {
  const { colorMode } = useColorMode();
  const [reposts, setReposts] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();
  useEffect(() => {
    const fetchReposts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/posts/reposts/${username}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setReposts(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchReposts();
  }, [username, showToast]);
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
        Không có bài đăng lại nào
      </Text>
    );
  }
  return (
    <VStack gap={4} w={"full"}>
      {reposts.map((repost) => (
        <Flex key={repost._id} gap={3} w={"full"} _hover={{ bg: colorMode === "dark" ? "whiteAlpha.100" : "gray.100" }} borderRadius={6} p={2}>
          {/* Thông tin người repost */}
          <Link to={`/${repost.repostedBy.username}`}>
            <Avatar src={repost.repostedBy.profilePic} size="md" name={repost.repostedBy.username} />
          </Link>
          <Flex flex={1} flexDirection={"column"} gap={2}>
            <Flex justifyContent={"space-between"} w={"full"}>
              <Link to={`/${repost.repostedBy.username}`}>
                <Text fontSize={"sm"} fontWeight={"bold"}>
                  {repost.repostedBy.username}
                </Text>
              </Link>
              <Flex gap={2} alignItems={"center"}>
                <Text fontSize={"xs"} color={"gray.500"}>
                  {formatDistanceToNow(new Date(repost.repostedAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </Text>
                <Text fontSize={"xs"} color={"gray.500"}>
                  {new Date(repost.repostedAt).toLocaleString()}
                </Text>
              </Flex>
            </Flex>
            {/* Bài viết gốc */}
            <Box borderWidth={1} borderColor={colorMode === "dark" ? "gray.700" : "gray.200"} borderRadius={6} p={3}>
              <Flex gap={3}>
                <Link to={`/${repost.originalPost.postedBy.username}`}>
                  <Avatar src={repost.originalPost.postedBy.profilePic} size="sm" name={repost.originalPost.postedBy.username} />
                </Link>
                <Flex flex={1} flexDirection={"column"} gap={2}>
                  <Flex justifyContent={"space-between"}>
                    <Link to={`/${repost.originalPost.postedBy.username}`}>
                      <Text fontSize={"sm"} fontWeight={"bold"}>
                        {repost.originalPost.postedBy.username}
                      </Text>
                    </Link>
                    <Flex gap={2} alignItems={"center"}>
                      <Text fontSize={"xs"} color={"gray.500"}>
                        {formatDistanceToNow(new Date(repost.originalPost.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </Text>
                      <Text fontSize={"xs"} color={"gray.500"}>
                        {new Date(repost.originalPost.createdAt).toLocaleString()}
                      </Text>
                    </Flex>
                  </Flex>
                  <Text fontSize={"sm"}>{repost.originalPost.text}</Text>
                  {repost.originalPost.img && (
                    <Box borderRadius={6} overflow={"hidden"} border={"1px solid"} borderColor={"gray.light"}>
                      <Image src={repost.originalPost.img} w={"full"} />
                    </Box>
                  )}
                  {repost.originalPost.video && (
                    <Box borderRadius={6} overflow={"hidden"} border={"1px solid"} borderColor={"gray.light"}>
                      <video src={repost.originalPost.video} controls width="100%" />
                    </Box>
                  )}
                </Flex>
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
