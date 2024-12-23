import { VStack, Text, Flex, Spinner, Divider } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "./Post";
import Comment from "./Comment";
const UserReplies = ({ username }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();
  useEffect(() => {
    const fetchReplies = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/posts/replies/${username}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        // Lọc ra những replies không phải của chính user
        const filteredReplies = data.filter((reply) => reply.originalPost.postedBy.username !== username);
        // Xử lý và thêm thông tin media vào mỗi originalPost
        const processedReplies = filteredReplies.map((reply) => {
          // Đảm bảo tất cả các trường cần thiết đều tồn tại
          const processedPost = {
            ...reply.originalPost,
            img: reply.originalPost.img || [], // Đảm bảo img luôn là mảng
            video: reply.originalPost.video || null, // Giữ nguyên giá trị video
            postedBy: {
              ...reply.originalPost.postedBy,
              username: reply.originalPost.postedBy.username || username,
            },
          };
          // Chuyển đổi img thành mảng nếu là string
          if (typeof processedPost.img === "string") {
            processedPost.img = [processedPost.img];
          }
          // Log để kiểm tra dữ liệu
          // console.log("Processed post:", {
          //   originalVideo: reply.originalPost.video,
          //   processedVideo: processedPost.video,
          // });
          return {
            ...reply,
            originalPost: processedPost,
          };
        });
        setReplies(processedReplies);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchReplies();
  }, [username, showToast]);
  const handleDeleteReply = async (replyId) => {
    try {
      replyId.preventDefault();
      if (!window.confirm("Are you sure you want to delete this post?")) return;
      const res = await fetch(`/api/posts/reply/${replyId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      setReplies((prev) => prev.filter((reply) => reply._id !== replyId));
      showToast("Success", "Reply deleted successfully", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };
  if (loading) {
    return (
      <Flex justify="center" w="full" p={4}>
        <Spinner size="xl" />
      </Flex>
    );
  }
  if (!replies?.length) {
    return (
      <Text textAlign={"center"} w={"full"} color={"red.500"}>
        There are no comments yet
      </Text>
    );
  }
  return (
    <VStack gap={4} w={"full"}>
      {replies.map((reply) => (
        <Flex w={"full"} flexDir="column" key={reply._id}>
          {/* Truyền trực tiếp originalPost vào Post component */}
          <Post post={reply.originalPost} postedBy={reply.originalPost.postedBy.username} />

          <Comment reply={reply} onDeleteReply={handleDeleteReply} lastReply={replies.indexOf(reply) === replies.length - 1} />
          <Divider my={4} borderColor="gray.light" opacity={1} />
        </Flex>
      ))}
    </VStack>
  );
};
export default UserReplies;
