// components/GroupPost.jsx
import { Box, VStack, HStack, Text, Avatar, IconButton, Input } from "@chakra-ui/react";
import { AiOutlineLike, AiFillLike, AiOutlineComment } from "react-icons/ai";
import { useState } from "react";

const GroupPost = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/groups/posts/${post._id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success) {
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const res = await fetch(`/api/groups/posts/${post._id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment }),
      });
      const data = await res.json();
      if (data.success) {
        setComments([...comments, data.comment]);
        setComment("");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4}>
      <HStack spacing={4} mb={4}>
        <Avatar src={post.author.profilePic} />
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold">{post.author.username}</Text>
          <Text fontSize="sm" color="gray.500">
            {new Date(post.createdAt).toLocaleDateString()}
          </Text>
        </VStack>
      </HStack>

      <Text mb={4}>{post.content}</Text>

      {/* Post Actions */}
      <HStack spacing={4} mb={4}>
        <IconButton icon={isLiked ? <AiFillLike /> : <AiOutlineLike />} aria-label="Like post" variant="ghost" colorScheme={isLiked ? "blue" : "gray"} onClick={handleLike} />
        <IconButton icon={<AiOutlineComment />} aria-label="Comment" variant="ghost" onClick={() => setShowComments(!showComments)} />
      </HStack>

      {/* Like Count */}
      <Text fontSize="sm" color="gray.500" mb={2}>
        {post.likes?.length || 0} lượt thích
      </Text>

      {/* Comments Section */}
      {showComments && (
        <VStack align="stretch" mt={4} spacing={4}>
          {/* Comment Form */}
          <form onSubmit={handleComment}>
            <HStack>
              <Input placeholder="Viết bình luận..." value={comment} onChange={(e) => setComment(e.target.value)} />
              <IconButton type="submit" icon={<AiOutlineComment />} aria-label="Post comment" colorScheme="blue" />
            </HStack>
          </form>

          {/* Comments List */}
          <VStack align="stretch" spacing={2}>
            {comments.map((comment, index) => (
              <Box key={index} p={2} bg="gray.50" borderRadius="md">
                <HStack spacing={2}>
                  <Avatar size="sm" src={comment.user?.profilePic} />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" fontSize="sm">
                      {comment.user?.username}
                    </Text>
                    <Text fontSize="sm">{comment.content}</Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        </VStack>
      )}
    </Box>
  );
};

export default GroupPost;
