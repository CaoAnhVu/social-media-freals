import { Box, Flex, FormControl, Image, Text, useDisclosure, Avatar, useColorModeValue, Popover, PopoverTrigger, PopoverContent, PopoverBody, Button, IconButton, Tooltip } from "@chakra-ui/react";
import Comment from "./Comment";
import { useState, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../atoms/postsAtom";
import { useNavigate } from "react-router-dom";
import { MentionsInput, Mention } from "react-mentions";
import { CloseIcon } from "@chakra-ui/icons";
import { BsSendFill, BsEmojiSmile, BsImage, BsTypeBold, BsTypeItalic } from "react-icons/bs";
import ReactMarkdown from "react-markdown";
import Picker from "@emoji-mart/react";
const Actions = ({ post, showReplies = false }) => {
  const user = useRecoilValue(userAtom);
  const [liked, setLiked] = useState(post.likes.includes(user?._id));
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [isReplying, setIsReplying] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const navigate = useNavigate();
  const [imgUrl, setImgUrl] = useState(null);
  const imageRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const listBgColor = useColorModeValue("#fff", "#1A202C");
  const previewBgColor = useColorModeValue("gray.50", "gray.700");
  const inputContainerBgColor = useColorModeValue("rgba(255, 255, 255, 0.1)", "rgba(26, 32, 44, 0.1)");

  const [formatting, setFormatting] = useState({
    bold: false,
    italic: false,
  });
  const [reply, setReply] = useState("");
  const showToast = useShowToast();
  const { onOpen, onClose } = useDisclosure();

  // Hàm xử lý click vào icon reply
  const handleCommentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!showReplies && post?.postedBy?.username) {
      navigate(`/${post.postedBy.username}/post/${post._id}`);
    } else {
      onOpen();
    }
  };

  // Xử lý upload ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý xóa ảnh
  const handleRemoveImage = () => {
    setImgUrl(null);
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  };

  // Xử lý định dạng văn bản
  const toggleFormat = (type) => {
    setFormatting((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Format text before sending
  const getFormattedText = (text) => {
    let formattedText = text;
    if (formatting.bold) formattedText = `**${formattedText}**`;
    if (formatting.italic) formattedText = `*${formattedText}*`;
    return formattedText;
  };

  const addEmoji = (emoji) => {
    setReply((prevReply) => prevReply + emoji.native);
  };

  const handleLikeAndUnlike = async () => {
    if (!user) return showToast("Error", "You must be logged in to like a post", "error");
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await fetch("/api/posts/like/" + post._id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text(); // Get full error response text
        console.error("Error Response Text: ", errorText);
        throw new Error(`Error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      // Handle state update on successful response
      const updatedPosts = posts.map((p) => {
        if (p._id === post._id) {
          return { ...p, likes: liked ? p.likes.filter((id) => id !== user._id) : [...p.likes, user._id] };
        }
        return p;
      });
      setPosts(updatedPosts);

      // Thay đổi trạng thái liked trước khi hiển thị thông báo
      const newLikedState = !liked;
      setLiked(newLikedState);

      // Cập nhật thông báo dựa trên trạng thái mới
      showToast("Success", newLikedState ? "Post liked successfully" : "Post unliked successfully", "success");
    } catch (error) {
      console.error("Error during like/unlike:", error);
      showToast("Error", error.message, "error");
    } finally {
      setIsLiking(false);
    }
  };

  const handleReply = async () => {
    if (!user) return showToast("Error", "You must be logged in to reply to a post", "error");
    if (isReplying) return;

    try {
      const formData = new FormData();
      formData.append("text", getFormattedText(reply));

      // Nếu có ảnh, thêm vào FormData
      if (imgUrl) {
        // Chuyển base64 string thành file
        const response = await fetch(imgUrl);
        const blob = await response.blob();
        const file = new File([blob], "image.jpg", { type: "image/jpeg" });
        formData.append("img", file);
      }

      const res = await fetch(`/api/posts/reply/${post._id}`, {
        method: "PATCH",
        body: formData, // Gửi FormData thay vì JSON
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const data = await res.json();
      console.log("Reply response:", data); // Log phản hồi từ server

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      // Cập nhật UI
      const updatedPosts = posts.map((p) => {
        if (p._id === post._id) {
          return { ...p, replies: [...p.replies, data] };
        }
        return p;
      });

      setPosts(updatedPosts);
      showToast("Success", "Reply posted successfully", "success");
      setReply("");
      setImgUrl(null);
      onClose();
    } catch (error) {
      console.error("Error during reply:", error);
      showToast("Error", error.message, "error");
    } finally {
      setIsReplying(false);
    }
  };

  // hàm xử lý xóa reply
  const handleDeleteReply = async (replyId) => {
    if (!user) return showToast("Error", "You must be logged in", "error");

    try {
      const res = await fetch(`/api/posts/reply/${post._id}/${replyId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      // Cập nhật UI sau khi xóa thành công
      const updatedPosts = posts.map((p) => {
        if (p._id === post._id) {
          return {
            ...p,
            replies: p.replies.filter((reply) => reply._id !== replyId),
          };
        }
        return p;
      });

      setPosts(updatedPosts);
      showToast("Success", "Reply deleted successfully", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const handleRepost = async () => {
    if (!user) return showToast("Error", "You must be logged in to repost", "error");

    try {
      const res = await fetch("/api/posts/repost/" + post._id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user._id }),
      });

      const responseText = await res.text();
      console.log("Repost API Response Text:", responseText);

      if (!res.ok) {
        console.error("Repost API Error:", responseText);
        throw new Error(`Error: ${res.status} - ${responseText}`);
      }

      const repost = JSON.parse(responseText);
      console.log("Repost API Response Data:", repost);

      // Kiểm tra message từ server để xác định hành động
      if (repost.message === "Post reposted successfully") {
        setPosts([repost.post, ...posts]); // Thêm bài repost vào đầu danh sách
        showToast("Success", "Post reposted successfully", "success");
      } else if (repost.message === "Repost removed") {
        // Cập nhật lại danh sách posts bằng cách loại bỏ bài repost
        const updatedPosts = posts.filter((p) => p._id !== repost.post._id);
        setPosts(updatedPosts);
        showToast("Success", "Repost removed successfully", "success");
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/posts/${post._id}`;
    navigator.clipboard.writeText(postUrl);
    showToast("Success", "Post link copied to clipboard", "success");
  };

  return (
    <Flex flexDirection="column" w="full">
      <Flex maxWidth={"100%"} gap={3} my={2} onClick={(e) => e.preventDefault()}>
        <svg
          aria-label="Like"
          cursor={"pointer"}
          color={liked ? "rgb(237, 73, 86)" : ""}
          fill={liked ? "rgb(237, 73, 86)" : "transparent"}
          height="19"
          role="img"
          viewBox="0 0 24 22"
          width="20"
          onClick={handleLikeAndUnlike}
        >
          <path
            d="M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z"
            stroke="currentColor"
            strokeWidth="2"
          ></path>
        </svg>

        <svg aria-label="Comment" cursor={"pointer"} color="" fill="" height="20" role="img" viewBox="0 0 24 24" width="20" onClick={handleCommentClick}>
          <title>Comment</title>
          <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
        </svg>

        <svg aria-label="Repost" cursor={"pointer"} color="currentColor" fill="currentColor" height="20" role="img" viewBox="0 0 24 24" width="20" onClick={handleRepost}>
          <title>Repost</title>
          <path
            fill=""
            d="M19.998 9.497a1 1 0 0 0-1 1v4.228a3.274 3.274 0 0 1-3.27 3.27h-5.313l1.791-1.787a1 1 0 0 0-1.412-1.416L7.29 18.287a1.004 1.004 0 0 0-.294.707v.001c0 .023.012.042.013.065a.923.923 0 0 0 .281.643l3.502 3.504a1 1 0 0 0 1.414-1.414l-1.797-1.798h5.318a5.276 5.276 0 0 0 5.27-5.27v-4.228a1 1 0 0 0-1-1Zm-6.41-3.496-1.795 1.795a1 1 0 1 0 1.414 1.414l3.5-3.5a1.003 1.003 0 0 0 0-1.417l-3.5-3.5a1 1 0 0 0-1.414 1.414l1.794 1.794H8.27A5.277 5.277 0 0 0 3 9.271V13.5a1 1 0 0 0 2 0V9.271a3.275 3.275 0 0 1 3.271-3.27Z"
          ></path>
        </svg>

        <svg aria-label="Share" cursor={"pointer"} color="" fill="rgb(243, 245, 247)" height="20" role="img" viewBox="0 0 24 24" width="20" onClick={handleShare}>
          <title>Share</title>
          <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line>
          <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon>
        </svg>
        {/* <RepostSVG  />

        <ShareSVG /> */}
      </Flex>
      <Flex gap={2} alignItems={"center"} mb={6}>
        <Text color={"gray.light"} fontSize="sm">
          {post.likes.length} likes
        </Text>
        <Box w={0.5} h={0.5} borderRadius={"full"} bg={"gray.light"}></Box>
        <Text color={"gray.light"} fontSize="sm">
          {post.replies.length} replies
        </Text>
        <Box w={0.5} h={0.5} borderRadius={"full"} bg={"gray.light"}></Box>
        <Text color={"gray.light"} fontSize="sm">
          {post.reposts.length} reposts
        </Text>
        <Box w={0.5} h={0.5} borderRadius={"full"} bg={"gray.light"}></Box>
        <Text color={"gray.light"} fontSize="sm">
          {post.sharedBy.length} shared
        </Text>
      </Flex>
      {/* Comment Section */}
      {showReplies && (
        <Box w="full" mt={6}>
          <Flex direction="column" gap={4}>
            {/* Input Container */}
            <Box borderWidth="1px" borderRadius="2xl" p={4} bg={inputContainerBgColor} backdropFilter="blur(10px)">
              {/* Input Area */}
              <Flex gap={3}>
                <Avatar name={user?.name} src={user?.profilePic} size="sm" />

                <Box flex="1">
                  <FormControl>
                    <MentionsInput
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Write a comment..."
                      style={{
                        control: {
                          minHeight: "35px",
                          backgroundColor: "transparent",
                          fontSize: 14,
                          fontWeight: "normal",
                          border: "none",
                        },
                        input: {
                          margin: 0,
                          padding: "8px 0",
                          border: "none",
                          outline: "none",
                        },
                        suggestions: {
                          list: {
                            backgroundColor: listBgColor,
                            border: "1px solid rgba(0,0,0,0.15)",
                            borderRadius: "10px",
                            marginTop: "2px",
                          },
                        },
                      }}
                    >
                      <Mention
                        trigger="@"
                        data={[]}
                        renderSuggestion={(suggestion) => (
                          <Box p={2}>
                            <Text>{suggestion.display}</Text>
                          </Box>
                        )}
                      />
                    </MentionsInput>
                  </FormControl>

                  {/* Image Preview */}
                  {imgUrl && (
                    <Flex mt={3} position="relative">
                      <Image src={imgUrl} alt="Selected image" maxH="200px" borderRadius="md" objectFit="cover" />
                      <IconButton
                        icon={<CloseIcon />}
                        size="xs"
                        position="absolute"
                        top={2}
                        right={2}
                        onClick={handleRemoveImage}
                        colorScheme="red"
                        variant="solid"
                        opacity={0.8}
                        _hover={{ opacity: 1 }}
                      />
                    </Flex>
                  )}

                  {/* Text Preview */}
                  {reply && (
                    <Box mt={3} p={3} borderRadius="md" bg={previewBgColor}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.500" mb={2}>
                        Preview
                      </Text>
                      <ReactMarkdown>{getFormattedText(reply)}</ReactMarkdown>
                    </Box>
                  )}
                </Box>
              </Flex>

              {/* Action Buttons */}
              <Flex justify="space-between" mt={4} pt={2} borderTopWidth="1px">
                <Flex gap={1}>
                  <Tooltip label="Attach image">
                    <IconButton icon={<BsImage />} onClick={() => imageRef.current.click()} size="sm" variant="ghost" colorScheme="gray" />
                  </Tooltip>
                  <input type="file" hidden ref={imageRef} onChange={handleImageChange} accept="image/*" />

                  <Popover isOpen={showEmojiPicker} onClose={() => setShowEmojiPicker(false)}>
                    <PopoverTrigger>
                      <IconButton icon={<BsEmojiSmile />} size="sm" variant="ghost" colorScheme="gray" onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody>
                        <Picker onEmojiSelect={addEmoji} />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                  {/* Formatting toolbar */}
                  <Tooltip label="Bold">
                    <IconButton icon={<BsTypeBold />} size="sm" colorScheme={formatting.bold ? "teal" : "gray"} variant={formatting.bold ? "solid" : "ghost"} onClick={() => toggleFormat("bold")} />
                  </Tooltip>
                  <Tooltip label="Italic">
                    <IconButton
                      icon={<BsTypeItalic />}
                      size="sm"
                      colorScheme={formatting.italic ? "teal" : "gray"}
                      variant={formatting.italic ? "solid" : "ghost"}
                      onClick={() => toggleFormat("italic")}
                    />
                  </Tooltip>
                </Flex>

                <Button colorScheme="teal" size="sm" leftIcon={<BsSendFill />} onClick={handleReply} isLoading={isReplying} isDisabled={!reply.trim() && !imgUrl}>
                  Reply
                </Button>
              </Flex>
            </Box>
            {/* Danh sách replies */}
            <Box mt={4}>
              {post.replies.map((reply, index) => (
                <Comment key={reply._id} reply={reply} lastReply={index === post.replies.length - 1} onDeleteReply={handleDeleteReply} />
              ))}
            </Box>
          </Flex>
        </Box>
      )}
    </Flex>
  );
};

export default Actions;
