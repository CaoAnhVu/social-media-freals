import { Avatar, Box, Flex, Image, Skeleton, Text, useColorModeValue, Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All, BsThreeDots } from "react-icons/bs";
import { useState, useEffect, useCallback } from "react";
import useShowToast from "../hooks/useShowToast.js";
import { useSocket } from "../context/SocketContext.jsx";
const Message = ({ ownMessage, message, setMessages }) => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const user = useRecoilValue(userAtom);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const themeChatColor = useColorModeValue("gray.dark", "gray.100");
  const showToast = useShowToast();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Xử lý tin nhắn bị xóa
    const handleMessageDeleted = ({ messageId, conversationId }) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
    };

    // Xử lý tin nhắn đã xem
    const handleMessagesSeen = ({ conversationId }) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((m) => ({
            ...m,
            seen: true,
          }))
        );
      }
    };

    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messagesSeen", handleMessagesSeen);

    return () => {
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messagesSeen", handleMessagesSeen);
    };
  }, [socket, isConnected, message.conversationId, setMessages]);
  // Xử lý xóa tin nhắn
  const handleDeleteMessage = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/messages/${message._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      // Emit sự kiện xóa tin nhắn
      socket.emit("deleteMessage", {
        messageId: message._id,
        conversationId: message.conversationId,
      });

      showToast("Success", "Đã xóa tin nhắn", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Xử lý đánh dấu đã xem
  const handleMarkAsSeen = useCallback(() => {
    if (!message.seen && !ownMessage) {
      socket.emit("markMessagesAsSeen", {
        conversationId: message.conversationId,
        userId: selectedConversation.userId,
      });
    }
  }, [message.seen, ownMessage, message.conversationId, selectedConversation.userId, socket]);

  useEffect(() => {
    if (!ownMessage && !message.seen) {
      handleMarkAsSeen();
    }
  }, [message, ownMessage, handleMarkAsSeen]);
  return (
    <>
      {ownMessage ? (
        <Flex
          gap={2}
          w={"full"}
          alignSelf={ownMessage ? "flex-end" : "flex-start"}
          flexDir={ownMessage ? "row-reverse" : "row"}
          alignItems={"center"}
          position={"relative"}
          maxW={{ base: "90%", md: "500px" }}
        >
          <Flex position={"relative"}>
            {/* Menu cho tin nhắn */}
            {ownMessage && (
              <Box position={"absolute"} top={1} left={-8} zIndex={1}>
                <Menu>
                  <MenuButton minW="auto" p={1} as={IconButton} icon={<BsThreeDots />} variant={"ghost"} size={"sm"} opacity={0.5} _hover={{ opacity: 1 }} />
                  <MenuList bg={"gray.800"}>
                    <MenuItem bg={"gray.800"} color={"white"} _hover={{ bg: "gray.700" }} onClick={handleDeleteMessage} isDisabled={isDeleting}>
                      Thu hồi
                    </MenuItem>
                    <MenuItem bg={"gray.800"} color={"white"} _hover={{ bg: "gray.700" }}>
                      Chuyển tiếp
                    </MenuItem>
                    <MenuItem bg={"gray.800"} color={"white"} _hover={{ bg: "gray.700" }}>
                      Ghim
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Box>
            )}
            {message.text && (
              <Flex bg={"blue.400"} maxW={"350px"} border={"1px"} borderRadius={"20px 0px 20px 20px"} p={"4px 10px 4px 10px"} overflowWrap="break-word" whiteSpace="normal">
                <Text color={"white"}>{message.text}</Text>
                {/* <Text color={"white"}>
                  {message.text.split(" ").map((word, index) => {
                    // Kiểm tra xem từ có phải là URL không
                    const isUrl = word.startsWith("http://") || word.startsWith("https://");
                    return (
                      <span key={index} style={{ wordBreak: isUrl ? "break-all" : "normal" }}>
                        {word}{" "}
                      </span>
                    );
                  })}
                </Text> */}
                <Box alignSelf={"flex-end"} ml={1} color={message.seen ? "gray.400" : ""} fontWeight={"bold"}>
                  <BsCheck2All size={16} />
                </Box>
              </Flex>
            )}
            <Flex flexDir="column" gap={2}>
              {message.img && !imgLoaded && (
                <Flex mt={2} maxW="100%" overflow="hidden" w={"400px"}>
                  <Image src={message.img} objectFit="contain" maxH="300px" w="100%" hidden onLoad={() => setImgLoaded(true)} alt="Message image" borderRadius={4} />
                  <Skeleton w={"200px"} h={"200px"} />
                </Flex>
              )}

              {message.img && imgLoaded && (
                <Flex mt={2} justifySelf={"flex-end"} w={"400px"}>
                  <Image src={message.img} alt="Message image" borderRadius={4} />
                </Flex>
              )}

              {message.video && (
                <Box mt={2} w={"400px"}>
                  <video
                    controls
                    preload="metadata"
                    onLoadedData={() => setIsVideoLoaded(true)}
                    style={{
                      borderRadius: "8px",
                      maxWidth: "100%",
                      maxHeight: "400px",
                      objectFit: "contain",
                      display: isVideoLoaded ? "block" : "none",
                    }}
                    alt="Message video"
                  >
                    <Skeleton w={"200px"} h={"200px"} />
                    <source src={message.video} type="video/mp4" alt="Message video" />
                    Your browser does not support the video tag.
                  </video>
                </Box>
              )}
            </Flex>

            <Box alignSelf={"flex-end"} ml={1} color={message.seen ? "blue.400" : ""} fontWeight={"bold"}>
              <BsCheck2All size={16} />
            </Box>
            <Avatar src={user.profilePic} w="7" h={7} />
          </Flex>
        </Flex>
      ) : (
        <Flex gap={2}>
          <Avatar src={selectedConversation.userProfilePic} w="7" h={7} />

          {message.text && (
            <Text maxW={"350px"} bg={"transparent"} p={"4px 10px 4px 10px"} border={"1px"} borderRadius={"0px 20px 20px 20px"} color={themeChatColor}>
              {message.text}
            </Text>
          )}
          {message.img && !imgLoaded && (
            <Flex mt={5} w={"200px"}>
              <Image src={message.img} hidden onLoad={() => setImgLoaded(true)} alt="Message image" borderRadius={4} />
              <Skeleton w={"200px"} h={"200px"} />
            </Flex>
          )}

          {message.img && imgLoaded && (
            <Flex mt={5} w={"200px"}>
              <Image src={message.img} alt="Message image" borderRadius={4} />
            </Flex>
          )}
          {message.video && (
            <Box mt={5} w={"200px"}>
              <video
                controls
                preload="metadata"
                onLoadedData={() => setIsVideoLoaded(true)}
                style={{
                  borderRadius: "8px",
                  maxWidth: "100%",
                  maxHeight: "400px",
                  display: isVideoLoaded ? "block" : "none",
                }}
                alt="Message video"
              >
                <Skeleton w={"200px"} h={"200px"} />
                <source src={message.video} type="video/mp4" alt="Message video" />
                Your browser does not support the video tag.
              </video>
            </Box>
          )}
        </Flex>
      )}
    </>
  );
};

export default Message;
