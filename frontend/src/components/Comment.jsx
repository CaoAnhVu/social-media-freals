import ReactMarkdown from "react-markdown";
import { Avatar, Divider, Flex, Text, Box, Image, IconButton, Modal, ModalOverlay, ModalContent, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { useState, useMemo, memo } from "react";

const Comment = ({ reply, lastReply, onDeleteReply }) => {
  const user = useRecoilValue(userAtom);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDelete = async () => {
    if (!reply?._id) {
      console.error("Reply ID not found");
      return;
    }
    setIsDeleting(true);
    try {
      await onDeleteReply(reply._id);
    } catch (error) {
      console.error("Error in handleDelete:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const timeAgo = useMemo(() => {
    if (!reply?.createdAt) return "unknown time";
    return formatDistanceToNow(new Date(reply.createdAt));
  }, [reply?.createdAt]);

  if (!reply || !reply._id) {
    return null;
  }

  return (
    <>
      <Box mb={lastReply ? 0 : 4} p={4} borderRadius="lg" _hover={{ bg: "whiteAlpha.100" }} transition="all 0.3s">
        <Flex gap={3}>
          <Avatar src={reply.userProfilePic || "/default-avatar.png"} size={"sm"} _hover={{ transform: "scale(1.1)" }} transition="all 0.3s" />

          <Box flex="1">
            <Flex justifyContent={"space-between"} alignItems={"center"} mb={2}>
              <Flex alignItems="center" gap={2}>
                <Text fontSize="sm" fontWeight="bold" _hover={{ color: "blue.400" }} cursor="pointer">
                  {reply.username || "Unknown User"}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  • {timeAgo} ago
                </Text>
              </Flex>

              {user && reply.userId === user._id && (
                <IconButton
                  icon={<DeleteIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  isLoading={isDeleting}
                  onClick={handleDelete}
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

            <Box fontSize="sm" mb={reply.img ? 3 : 0}>
              <ReactMarkdown>{reply.text}</ReactMarkdown>
            </Box>

            {reply.img && (
              <>
                <Box maxW="500px" borderRadius="md" overflow="hidden" boxShadow="sm" cursor="pointer" onClick={onOpen}>
                  <Image src={reply.img} alt="Reply image" objectFit="cover" w="50%" transition="transform 0.3s" _hover={{ transform: "scale(1.02)" }} loading="lazy" />
                </Box>

                <Modal isOpen={isOpen} onClose={onClose} size="xl">
                  <ModalOverlay />
                  <ModalContent bg="transparent" maxW="90vw" maxH="90vh">
                    <ModalCloseButton
                      color="white"
                      bg="blackAlpha.700"
                      borderRadius="full"
                      size="lg"
                      m={2}
                      _hover={{
                        bg: "blackAlpha.800",
                      }}
                    />
                    <Image src={reply.img} alt="Reply image full size" objectFit="contain" w="100%" h="100%" maxH="90vh" />
                  </ModalContent>
                </Modal>
              </>
            )}
          </Box>
        </Flex>
      </Box>

      {!lastReply && <Divider my={4} borderColor="gray.700" opacity={0.3} />}
    </>
  );
};

export default memo(Comment, (prevProps, nextProps) => {
  return (
    prevProps.reply?._id === nextProps.reply?._id && prevProps.lastReply === nextProps.lastReply && prevProps.reply?.text === nextProps.reply?.text && prevProps.reply?.img === nextProps.reply?.img
  );
});
