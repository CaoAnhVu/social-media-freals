import ReactMarkdown from "react-markdown";
import { Avatar, Divider, Flex, Text, Box, Image, IconButton } from "@chakra-ui/react";
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { useState } from "react";
const Comment = ({ reply, lastReply, onDeleteReply }) => {
  const user = useRecoilValue(userAtom);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!reply) return null;

  const handleDelete = async (replyId) => {
    setIsDeleting(true);
    try {
      await onDeleteReply(replyId);
    } finally {
      setIsDeleting(false);
    }
  };

  const timeAgo = reply.createdAt ? formatDistanceToNow(new Date(reply.createdAt)) : "unknown time";

  return (
    <>
      <Box mb={lastReply ? 0 : 4} p={4} borderRadius="lg" _hover={{ bg: "whiteAlpha.100" }} transition="all 0.3s">
        <Flex gap={3}>
          <Avatar src={reply.userProfilePic || "/default-avatar.png"} size={"sm"} _hover={{ transform: "scale(1.1)" }} transition="all 0.3s" />

          <Box flex="1">
            {/* Header: Username, Time và Delete Button */}
            <Flex justifyContent={"space-between"} alignItems={"center"} mb={2}>
              <Flex alignItems="center" gap={2}>
                <Text fontSize="sm" fontWeight="bold" _hover={{ color: "blue.400" }} cursor="pointer">
                  {reply.username || "Unknown User"}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  • {timeAgo} ago
                </Text>
              </Flex>

              {/* Nút xóa - chỉ hiển thị khi user là người tạo reply */}
              {user && reply.userId === user._id && (
                <IconButton
                  icon={<DeleteIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  isLoading={isDeleting}
                  onClick={() => handleDelete(reply._id)}
                  aria-label="Delete reply"
                  opacity={0.7}
                  _hover={{
                    opacity: 1,
                    bg: "red.50",
                    color: "red.600",
                  }}
                />
              )}
            </Flex>

            {/* Nội dung reply */}
            <Box fontSize="sm" mb={reply.img ? 3 : 0}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <Text lineHeight="1.5">{children}</Text>,
                }}
              >
                {reply.text}
              </ReactMarkdown>
            </Box>

            {/* Hình ảnh trong reply */}
            {reply.img && (
              <Box maxW="500px" borderRadius="md" overflow="hidden" boxShadow="sm">
                <Image src={reply.img} alt="Comment image" objectFit="cover" w="50%" transition="transform 0.3s" _hover={{ transform: "scale(1.02)" }} loading="lazy" />
              </Box>
            )}
          </Box>
        </Flex>
      </Box>

      {/* Divider giữa các replies */}
      {!lastReply && <Divider my={4} borderColor="gray.700" opacity={0.3} />}
    </>
  );
};

export default Comment;
