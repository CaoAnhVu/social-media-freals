import { Avatar } from "@chakra-ui/avatar";
import { Image } from "@chakra-ui/image";
import { Box, Flex, Text, Skeleton, Spinner } from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import Actions from "./Actions";
import { useEffect, useState, useMemo, useCallback } from "react";
import useShowToast from "../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { DeleteIcon } from "@chakra-ui/icons";
import { MdOutlineCommentsDisabled } from "react-icons/md";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const location = post.location && post.location.name ? post.location.name : null;
  const coordinates = post?.location?.coordinates?.length ? post.location.coordinates.join(", ") : "No coordinates available";
  console.log("Post props:", { post, postedBy });
  console.log("Post received:", {
    post,
    video: post.video,
    img: post.img,
  });
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

  const handleScroll = useCallback((e) => {
    const container = e.target;
    const scrollPosition = container.scrollLeft;
    const itemWidth = container.offsetWidth;
    const newIndex = Math.round(scrollPosition / itemWidth);
    setCurrentImageIndex(newIndex);
  }, []);

  useEffect(() => {
    const imageContainer = document.querySelector(".image-container");
    if (imageContainer) {
      imageContainer.addEventListener("scroll", handleScroll);
      return () => imageContainer.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    if (post.video) {
      console.log("Video URL:", post.video);
      // Kiểm tra video URL
      fetch(post.video)
        .then((response) => console.log("Video response:", response))
        .catch((error) => console.error("Video error:", error));
    }
  }, [post.video]);
  const mediaItems = useMemo(() => {
    const items = [];

    // Xử lý ảnh
    if (post.img) {
      if (Array.isArray(post.img)) {
        items.push(...post.img.map((img) => ({ type: "image", url: img })));
      } else {
        items.push({ type: "image", url: post.img });
      }
    }

    // Xử lý video - thêm kiểm tra kỹ hơn
    if (post.video && typeof post.video === "string" && post.video.trim() !== "") {
      items.push({
        type: "video",
        url: post.video,
        mimeType: post.video.endsWith(".mp4") ? "video/mp4" : post.video.endsWith(".webm") ? "video/webm" : "video/mp4",
      });
    }

    console.log("Media Items:", items); // Thêm log để debug

    return items;
  }, [post.img, post.video]);

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
  const handleVideoError = (e) => {
    console.error("Video error:", e);
    showToast("Error", "Could not load video", "error");
  };
  return (
    <Link to={`/${user.username}/post/${post._id}`}>
      <Flex gap={1} mb={4} py={5}>
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
              _hover={{ transform: "scale(1.1)" }}
              transition="all 0.3s"
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
                  _hover={{ color: "blue.400" }}
                  cursor="pointer"
                >
                  {user?.username}
                </Text>
              </Skeleton>
              <Image src="/verified.png" w={4} h={4} ml={1} _hover={{ transform: "scale(1.1)" }} transition="all 0.3s" />
            </Flex>

            {/* Điều chỉnh phần hiển thị date */}
            <Flex gap={2} alignItems={"center"} mt={4}>
              <Skeleton isLoaded={!loading}>
                <Flex gap={2} alignItems="center" whiteSpace="nowrap">
                  <Text fontSize={"sm"} color={"gray.light"}>
                    {new Intl.DateTimeFormat("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(post.createdAt))}
                  </Text>
                  <Text fontSize="sm">•</Text>
                  <Text fontSize={"sm"} color={"gray.light"}>
                    {new Intl.DateTimeFormat("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(new Date(post.createdAt))}
                  </Text>
                  <Text fontSize="sm">•</Text>
                  <Text fontSize={"sm"} color={"gray.light"} whiteSpace="nowrap">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </Text>
                </Flex>
              </Skeleton>
              {currentUser && currentUser._id === user._id && (
                <DeleteIcon
                  size={20}
                  onClick={handleDeletePost}
                  _hover={{
                    cursor: "pointer",
                    color: "red.500",
                  }}
                  transition="all 0.2s ease"
                />
              )}
            </Flex>
          </Flex>

          <Skeleton isLoaded={!loading}>
            <Text fontSize={"sm"}>{post.text}</Text>
          </Skeleton>

          {/* Hiển thị media container khi có ảnh hoặc video */}
          {mediaItems.length > 0 && (
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
                  const itemWidth = container.offsetWidth;
                  const newIndex = Math.round(scrollPosition / itemWidth);
                  setCurrentImageIndex(newIndex);
                }}
              >
                {mediaItems.map((item, index) => (
                  <Box key={index} minW="100%" position="relative">
                    {item.type === "image" ? (
                      <Image src={item.url} width="100%" h="400px" flexShrink={0} scrollSnapAlign="start" objectFit="cover" transition="transform 0.3s ease" />
                    ) : (
                      <Box width="100%" h="400px" flexShrink={0} scrollSnapAlign="start" display="flex" alignItems="center" justifyContent="center" bg="black">
                        <video width="100%" height="100%" controls preload="metadata" style={{ objectFit: "contain" }} onError={handleVideoError}>
                          <source src={item.url} type={item.mimeType} />
                          <source src={item.url} type="video/webm" />
                          <source src={item.url} type="video/ogg" />
                          Your browser does not support the video tag.
                        </video>
                      </Box>
                    )}
                  </Box>
                ))}
              </Flex>

              {/* Hiển thị chỉ số trang */}
              {mediaItems.length > 1 && (
                <Text position="absolute" right="8px" bottom="8px" bg="blackAlpha.700" color="white" px={2} py={1} borderRadius="full" fontSize="sm" zIndex={1}>
                  {currentImageIndex + 1}/{mediaItems.length}
                </Text>
              )}
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
