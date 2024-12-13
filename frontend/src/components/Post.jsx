import { Avatar } from "@chakra-ui/avatar";
import { Image } from "@chakra-ui/image";
import { Box, Flex, Text, Skeleton, Spinner, Divider } from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import Actions from "./Actions";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons";
import { MdOutlineCommentsDisabled } from "react-icons/md";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postsAtom from "../atoms/postsAtom";
// import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
// import { IconButton } from "@chakra-ui/react";

const Post = ({ post, postedBy }) => {
  const [user, setUser] = useState(null);
  const { colorMode } = useColorMode();
  const showToast = useShowToast();
  const currentUser = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const location = post.location && post.location.name ? post.location.name : null;
  const coordinates = post?.location?.coordinates?.length ? post.location.coordinates.join(", ") : "No coordinates available";

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/profile/${postedBy}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setUser(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setUser(null);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [postedBy, showToast]);

  useEffect(() => {
    const handleScroll = (e) => {
      const container = e.target;
      const scrollPosition = container.scrollLeft;
      const imageWidth = container.offsetWidth;
      const newIndex = Math.round(scrollPosition / imageWidth);
      setCurrentImageIndex(newIndex);
    };

    const imageContainer = document.querySelector(".image-container");
    if (imageContainer) {
      imageContainer.addEventListener("scroll", handleScroll);
      return () => imageContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

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
  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justifyContent="center" alignItems="center" height="200px">
        <Text color="red.500">{error}</Text>
      </Flex>
    );
  }
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
            {post.replies.length === 0 && (
              <Text textAlign={"center"} ml={4} fontSize={"xl"}>
                <MdOutlineCommentsDisabled />
              </Text>
            )}

            {post.replies[0] && <Avatar size="xs" name="John doe" src={post.replies[0].userProfilePic} position={"absolute"} top={"0px"} left="15px" padding={"2px"} />}

            {post.replies[1] && <Avatar size="xs" name="John doe" src={post.replies[1].userProfilePic} position={"absolute"} bottom={"0px"} right="-5px" padding={"2px"} />}

            {post.replies[2] && <Avatar size="xs" name="John doe" src={post.replies[2].userProfilePic} position={"absolute"} bottom={"0px"} left="4px" padding={"2px"} />}
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
                <Text fontSize={"sm"} width={36} textAlign={"right"} color={"gray.light"}>
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
            <Box borderRadius={12} overflow="hidden" border={"1px solid"} borderColor={"gray.light"} position="relative" display="inline-block">
              <Flex
                className="image-container"
                position="relative"
                overflowX="auto"
                scrollBehavior="smooth"
                css={{
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  scrollSnapType: "x mandatory",
                  cursor: "grab",
                  "&:active": {
                    cursor: "grabbing",
                  },
                }}
                onMouseDown={(e) => {
                  const ele = e.currentTarget;
                  const startX = e.pageX - ele.offsetLeft;
                  const scrollLeft = ele.scrollLeft;

                  const handleMouseMove = (e) => {
                    const x = e.pageX - ele.offsetLeft;
                    const walk = (x - startX) * 2;
                    ele.scrollLeft = scrollLeft - walk;
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);
                    ele.style.cursor = "grab";
                  };

                  document.addEventListener("mousemove", handleMouseMove);
                  document.addEventListener("mouseup", handleMouseUp);
                  ele.style.cursor = "grabbing";
                }}
                onScroll={(e) => {
                  const container = e.target;
                  const scrollPosition = container.scrollLeft;
                  const imageWidth = container.offsetWidth;
                  const newIndex = Math.round(scrollPosition / imageWidth);
                  setCurrentImageIndex(newIndex);
                }}
              >
                {Array.isArray(post.img) ? (
                  post.img.map((image, index) => (
                    <Box key={index} minW="100%" position="relative">
                      <Image src={image} width="100%" h="400px" flexShrink={0} scrollSnapAlign="start" objectFit="cover" transition="transform 0.3s ease" />
                      {index === currentImageIndex && (
                        <Text position="absolute" right="8px" bottom="8px" bg="blackAlpha.700" color="white" px={2} py={1} borderRadius="full" fontSize="sm" zIndex={1}>
                          {currentImageIndex + 1}/{post.img.length}
                        </Text>
                      )}
                    </Box>
                  ))
                ) : (
                  <Image src={post.img} width="100%" h="400px" flexShrink={0} objectFit="cover" transition="transform 0.3s ease" />
                )}
              </Flex>
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
      <Divider my={4} borderColor="gray.light" opacity={1} />
    </Link>
  );
};

export default Post;
