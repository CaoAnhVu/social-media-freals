import { Avatar, Box, Button, Divider, Flex, Image, Spinner, Text, IconButton, useColorMode, Modal, ModalOverlay, ModalContent, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import { DeleteIcon, ArrowBackIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import Actions from "../components/Actions";
import { useEffect, useMemo, useState, useCallback } from "react";
import useGetUserProfile from "../hooks/useGetUserProfile";
import useShowToast from "../hooks/useShowToast";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postsAtom from "../atoms/postsAtom";
import { vi } from "date-fns/locale";

const PostPage = () => {
  const { user, loading } = useGetUserProfile();
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const { colorMode } = useColorMode();
  const showToast = useShowToast();
  const { pid } = useParams();
  const currentUser = useRecoilValue(userAtom);
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Tìm post hiện tại
  const currentPost = useMemo(() => {
    return posts.find((post) => post._id === pid);
  }, [posts, pid]);

  useEffect(() => {
    const getPost = async () => {
      if (!pid) return;
      setIsLoadingPost(true);
      try {
        const res = await fetch(`/api/posts/${pid}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        // console.log("Fetched post data:", data);
        // console.log("Images array:", data.img);

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch post");
        }
        const processedPost = {
          ...data,
          reposts: data.reposts || [], // Đảm bảo reposts luôn là một mảng
          replies: data.replies || [], // Đảm bảo replies luôn là một mảng
          likes: data.likes || [], // Đảm bảo likes luôn là một mảng
          img: data.img || [], // Đảm bảo img luôn là một mảng
        };
        setPosts((prevPosts) => {
          const existingPostIndex = prevPosts.findIndex((p) => p._id === data._id);
          if (existingPostIndex !== -1) {
            const updatedPosts = [...prevPosts];
            updatedPosts[existingPostIndex] = processedPost;
            return updatedPosts;
          }
          return [data, ...prevPosts];
        });
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setIsLoadingPost(false);
      }
    };

    getPost();
  }, [pid, setPosts, showToast]);
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

  const mediaItems = useMemo(() => {
    if (!currentPost) return [];
    const items = [];

    // Xử lý ảnh
    if (currentPost.img) {
      const images = Array.isArray(currentPost.img) ? currentPost.img : [currentPost.img];
      items.push(...images.filter((img) => img).map((img) => ({ type: "image", url: img })));
    }

    // Xử lý video
    if (currentPost.video && typeof currentPost.video === "string" && currentPost.video.trim() !== "") {
      items.push({
        type: "video",
        url: currentPost.video,
        mimeType: currentPost.video.endsWith(".mp4") ? "video/mp4" : "video/webm",
      });
    }

    return items;
  }, [currentPost]);

  const handlePrevMedia = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const handleNextMedia = () => {
    setCurrentImageIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  // Xử lý thêm reply mới
  const updateReplies = useCallback(
    (newReply) => {
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p._id === currentPost?._id) {
            const currentReplies = p.replies || [];
            if (!currentReplies.some((r) => r._id === newReply._id)) {
              // Thêm reply mới và sắp xếp lại theo thời gian
              const updatedReplies = [newReply, ...currentReplies].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              return {
                ...p,
                replies: updatedReplies,
              };
            }
          }
          return p;
        })
      );

      // Fetch lại post sau khi thêm reply để đồng bộ dữ liệu
      const fetchUpdatedPost = async () => {
        try {
          const res = await fetch(`/api/posts/${currentPost._id}`);
          const data = await res.json();
          if (res.ok) {
            setPosts((prevPosts) => prevPosts.map((p) => (p._id === data._id ? data : p)));
          }
        } catch (error) {
          console.error("Error fetching updated post:", error);
        }
      };

      fetchUpdatedPost();
    },
    [currentPost?._id, setPosts]
  );

  // Xử lý xóa post
  const handleDeletePost = async () => {
    try {
      if (!window.confirm("Are you sure you want to delete this post?")) return;

      const res = await fetch(`/api/posts/${currentPost._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete post");
      }

      showToast("Success", "Post deleted", "success");
      navigate(`/${user.username}`);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  if (loading || isLoadingPost || !user) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }
  if (!currentPost) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="100vh">
        <Text>Post not found</Text>
      </Flex>
    );
  }
  // Render component
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
        mx="auto"
        border="1px solid rgba(128, 128, 128, 0.5)"
        borderRadius="20px"
        p="8"
        mb="6"
        mt={"120px"}
        w={{ base: "660px", md: "900px", lg: "660px" }}
      >
        {/* User Info */}
        <Flex w={"full"} alignItems={"center"} justifyContent="space-between">
          <Flex alignItems={"center"} gap={3}>
            {/* Avatar */}
            <Avatar src={user?.profilePic} size={"md"} name={user?.username || "User"} _hover={{ transform: "scale(1.1)" }} transition="all 0.3s" />

            {/* Username và Verified Badge */}
            <Flex alignItems="center" gap={1}>
              <Text fontSize={"sm"} fontWeight={"bold"} _hover={{ color: "blue.400" }} cursor="pointer">
                {user?.username || "Unknown User"}
              </Text>
              <Image src="/verified.png" w="4" h={4} />
            </Flex>
          </Flex>

          <Flex alignItems="center" gap={2}>
            {/* Timeline */}
            <Flex alignItems="center" gap={2} whiteSpace="nowrap">
              <Text fontSize="sm" color={"gray.light"}>
                {new Date(currentPost.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Text fontSize="sm">•</Text>
              <Text fontSize="sm" color={"gray.light"}>
                {new Date(currentPost.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Text>
              <Text fontSize="sm">•</Text>
              <Text fontSize={"sm"} color={"gray.light"}>
                {formatDistanceToNow(new Date(currentPost.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </Text>
            </Flex>

            {/* Delete Icon */}
            {currentUser?._id === user?._id && <DeleteIcon size={20} cursor={"pointer"} onClick={handleDeletePost} _hover={{ color: "red.500" }} />}
          </Flex>
        </Flex>

        {/* Post Content */}
        <Text my={3}>{currentPost.text}</Text>

        {/* Hiển thị media container khi có ảnh hoặc video */}
        {mediaItems.length > 0 && (
          <Box borderRadius={12} overflow="hidden" border={"1px solid"} borderColor={"gray.light"} position="relative">
            <Flex
              className="image-container"
              position="relative"
              overflowX="auto"
              scrollBehavior="smooth"
              css={{
                "&::-webkit-scrollbar": { display: "none" },
                scrollSnapType: "x mandatory",
                cursor: "grab",
                "&:active": { cursor: "grabbing" },
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
                    <Image
                      src={item.url}
                      width="100%"
                      h="400px"
                      flexShrink={0}
                      scrollSnapAlign="start"
                      objectFit="cover"
                      transition="transform 0.3s ease"
                      onClick={() => {
                        setCurrentImageIndex(index);
                        onOpen();
                      }}
                    />
                  ) : (
                    <Box
                      width="100%"
                      h="400px"
                      flexShrink={0}
                      scrollSnapAlign="start"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg="black"
                      onClick={() => {
                        setCurrentImageIndex(index);
                        onOpen();
                      }}
                    >
                      <video width="100%" height="100%" controls preload="metadata" style={{ objectFit: "contain" }}>
                        <source src={item.url} type={item.mimeType} />
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

        {/* Modal xem media phóng to */}
        <Modal isOpen={isOpen} onClose={onClose} size="full">
          <ModalOverlay />
          <ModalContent bg="blackAlpha.900">
            <ModalCloseButton color="white" bg="whiteAlpha.300" borderRadius="full" size="lg" position="fixed" top={4} right={4} zIndex={9999} _hover={{ bg: "whiteAlpha.400" }} />

            <Flex justify="center" align="center" h="100vh" position="relative">
              {mediaItems.length > 1 && (
                <>
                  {/* Nút điều hướng trái */}
                  <IconButton
                    icon={<ChevronLeftIcon boxSize={10} />}
                    onClick={handlePrevMedia}
                    position="fixed"
                    left={10}
                    top="50%"
                    transform="translateY(-50%)"
                    colorScheme="whiteAlpha"
                    variant="solid"
                    size="lg"
                    isRound
                    aria-label="Previous media"
                    zIndex={9999}
                  />

                  {/* Nút điều hướng phải */}
                  <IconButton
                    icon={<ChevronRightIcon boxSize={10} />}
                    onClick={handleNextMedia}
                    position="fixed"
                    right={10}
                    top="50%"
                    transform="translateY(-50%)"
                    colorScheme="whiteAlpha"
                    variant="solid"
                    size="lg"
                    isRound
                    aria-label="Next media"
                    zIndex={9999}
                  />

                  {/* Chỉ số media hiện tại */}
                  <Text position="fixed" bottom={4} color="white" fontSize="lg" fontWeight="bold">
                    {currentImageIndex + 1} / {mediaItems.length}
                  </Text>
                </>
              )}

              {/* Hiển thị media phóng to */}
              {mediaItems[currentImageIndex].type === "image" ? (
                <Image src={mediaItems[currentImageIndex].url} maxH="90vh" maxW="90vw" objectFit="contain" />
              ) : (
                <video src={mediaItems[currentImageIndex].url} controls style={{ maxHeight: "90vh", maxWidth: "90vw", objectFit: "contain" }} />
              )}
            </Flex>
          </ModalContent>
        </Modal>

        {currentPost.location?.name && (
          <Text fontSize="sm" color={colorMode === "dark" ? "white" : "black"} mt={2}>
            <strong>Location:</strong> {currentPost.location.name}
          </Text>
        )}

        {/* Actions */}
        <Flex gap={3} my={1}>
          <Actions post={currentPost} showReplies={true} onReplyAdded={updateReplies} />
        </Flex>

        <Divider my={4} />

        {/* Footer */}
        <Flex justifyContent={"space-between"}>
          <Flex gap={2} alignItems={"center"}>
            <Text color={"gray.light"}>Get the app to like, reply and post.</Text>
          </Flex>
          <Button>Get</Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default PostPage;
