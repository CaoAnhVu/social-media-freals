import { Box, Button, Flex, InputGroup, InputLeftElement, Input, Skeleton, SkeletonCircle, Text, useColorModeValue } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import Conversation from "../components/Conversation";
import { GiConversation } from "react-icons/gi";
import MessageContainer from "../components/MessageContainer";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState, useRecoilValue } from "recoil";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext.jsx";

const ChatPage = () => {
  const [searchingUser, setSearchingUser] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const currentUser = useRecoilValue(userAtom);
  const showToast = useShowToast();
  const { socket } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const bgColor = useColorModeValue("gray.200", "gray.900");
  const inputBgColor = useColorModeValue("white", "gray.dark");
  const bgChatColor = useColorModeValue("white", "gray.dark");
  const hoverBgColor = useColorModeValue("gray.dark", "gray.light");

  useEffect(() => {
    if (socket) {
      socket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });
    }
  }, [socket]);
  useEffect(() => {
    socket?.on("messagesSeen", ({ conversationId }) => {
      setConversations((prev) => {
        const updatedConversations = prev.map((conversation) => {
          if (conversation._id === conversationId) {
            return {
              ...conversation,
              lastMessage: {
                ...conversation.lastMessage,
                seen: true,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
    });
  }, [socket, setConversations]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await fetch("/api/messages/conversations");
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        console.log(data);
        setConversations(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoadingConversations(false);
      }
    };

    getConversations();
  }, [showToast, setConversations]);

  const handleConversationSearch = async (e) => {
    e.preventDefault();
    setSearchingUser(true);
    try {
      const res = await fetch(`/api/users/profile/${searchText}`);
      const searchedUser = await res.json();
      if (searchedUser.error) {
        showToast("Error", searchedUser.error, "error");
        return;
      }

      const messagingYourself = searchedUser._id === currentUser._id;
      if (messagingYourself) {
        showToast("Error", "You cannot message yourself", "error");
        return;
      }

      const conversationAlreadyExists = conversations.find((conversation) => conversation.participants[0]._id === searchedUser._id);

      if (conversationAlreadyExists) {
        setSelectedConversation({
          _id: conversationAlreadyExists._id,
          userId: searchedUser._id,
          username: searchedUser.username,
          userProfilePic: searchedUser.profilePic,
        });
        return;
      }

      const mockConversation = {
        mock: true,
        lastMessage: {
          text: "",
          sender: "",
        },
        _id: Date.now(),
        participants: [
          {
            _id: searchedUser._id,
            username: searchedUser.username,
            profilePic: searchedUser.profilePic,
          },
        ],
      };
      setConversations((prevConvs) => [...prevConvs, mockConversation]);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setSearchingUser(false);
    }
  };

  return (
    <Box position={"absolute"} left={"50%"} w={{ base: "100%", md: "80%", lg: "1100px" }} p={2} mt={10} transform={"translateX(-50%)"}>
      <Flex gap={6} flexDirection={{ base: "column", md: "row" }} maxW={{ sm: "400px", md: "full" }} maxH={{ sm: "400px", md: "full" }} mx="auto" p={2} bg={bgColor} boxShadow="lg" borderRadius="xl">
        <Flex flex={30} gap={2} flexDirection={"column"} maxW={{ sm: "250px", md: "full" }} mx={"auto"} bg={useColorModeValue("white", "gray.dark")} boxShadow="lg" borderRadius="xl" p={4}>
          <Text fontWeight={700} fontSize="2xl" mb={2} color={useColorModeValue("gray.dark", "gray.light")}>
            Đoạn chat
          </Text>
          <form onSubmit={handleConversationSearch}>
            <InputGroup>
              <InputLeftElement>
                <Button aria-label="Search" variant="link" onClick={handleConversationSearch} isLoading={searchingUser}>
                  <SearchIcon color="gray.200" />
                </Button>
              </InputLeftElement>
              <Input bg={inputBgColor} placeholder="Tìm kiếm trên messenger" onChange={(e) => setSearchText(e.target.value)} variant="outline" borderRadius="full" />
            </InputGroup>
          </form>
          <Flex
            direction="column"
            gap={2}
            overflowY="auto"
            maxH="500px"
            css={{
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                width: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "gray",
                borderRadius: "24px",
              },
            }}
          >
            {loadingConversations &&
              [0, 1, 2, 3, 4].map((_, i) => (
                <Flex
                  key={i}
                  gap={4}
                  overflowY="auto"
                  maxH="600px"
                  alignItems="center"
                  p={4}
                  borderRadius="md"
                  bg={bgChatColor}
                  _hover={{ bg: hoverBgColor, cursor: "pointer" }}
                  transition="background-color 0.2s"
                >
                  <Box>
                    <SkeletonCircle size="10" />
                  </Box>
                  <Flex w="full" flexDirection="column" gap={2}>
                    <Skeleton h="12px" w="80px" />
                    <Skeleton h="10px" w="90%" />
                  </Flex>
                </Flex>
              ))}
            {/* <Text>{onlineUsers.includes(user._id) ? "Online" : "Offline"}</Text> */}
            {!loadingConversations &&
              conversations.map((conversation) => <Conversation key={conversation._id} isOnline={onlineUsers.includes(conversation.participants[0]._id)} conversation={conversation} />)}
          </Flex>
        </Flex>
        {!selectedConversation._id && (
          <Flex flex={70} borderRadius="lg" p={4} flexDir="column" alignItems="center" justifyContent="center" height="600px" bg={("gray.50", "gray.800")} boxShadow="lg" mt={25}>
            <GiConversation size={100} color={("teal.400", "teal.300")} />
            <Text fontSize="xl" fontWeight="bold" mt={4} color={("gray.600", "gray.300")}>
              Select a conversation to start messaging
            </Text>
          </Flex>
        )}

        {selectedConversation._id && <MessageContainer />}
      </Flex>
    </Box>
  );
};

export default ChatPage;
