import { Avatar, Box, Flex, Link, Text, VStack, Button, useToast, useColorMode, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure } from "@chakra-ui/react";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { Portal } from "@chakra-ui/portal";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";
import { useState, useEffect } from "react";
import UserReplies from "./UserReplies";
import UserReposts from "./UserReposts";

const UserHeader = ({ user }) => {
  const toast = useToast();
  const currentUser = useRecoilValue(userAtom); // logged in user
  const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("posts");
  const { isOpen: isFollowersOpen, onOpen: onFollowersOpen, onClose: onFollowersClose } = useDisclosure();
  const { isOpen: isFollowingOpen, onOpen: onFollowingOpen, onClose: onFollowingClose } = useDisclosure();
  const [followersData, setFollowersData] = useState([]);
  const [followingData, setFollowingData] = useState([]);

  const copyURL = async () => {
    try {
      const currentURL = window.location.href;
      await navigator.clipboard.writeText(currentURL);
      toast({
        title: "Success.",
        status: "success",
        description: "Profile link copied.",
        duration: 3000,
        isClosable: true,
      });
    } catch {
      toast({
        title: "Error.",
        status: "error",
        description: "Failed to copy profile link.",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  useEffect(() => {
    const fetchFollowers = async () => {
      const followers = await Promise.all(
        user.followers.map(async (followerId) => {
          const res = await fetch(`/api/users/profile/${followerId}`);
          return await res.json();
        })
      );
      setFollowersData(followers);
    };

    const fetchFollowing = async () => {
      const following = await Promise.all(
        user.following.map(async (followingId) => {
          const res = await fetch(`/api/users/profile/${followingId}`);
          return await res.json();
        })
      );
      setFollowingData(following);
    };

    fetchFollowers();
    fetchFollowing();
  }, [user.followers, user.following]);

  return (
    <VStack gap={4} alignItems={"start"}>
      <Flex justifyContent={"space-between"} w={"full"}>
        <Box>
          <Text fontSize={"2xl"} fontWeight={"bold"} mb={2}>
            {user.name}
          </Text>
          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"lg"}> @{user.username}</Text>
            <Text fontSize={"sm"} bg={colorMode === "dark" ? "gray.800" : "gray.300"} p={2} w={"100px"} textAlign={"center"} borderRadius={"full"}>
              freals.net
            </Text>
          </Flex>
        </Box>
        <Box>
          {user.profilePic && (
            <Avatar
              name={user.name}
              src={user.profilePic}
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
          {!user.profilePic && (
            <Avatar
              name={user.name}
              src="https://bit.ly/broken-link"
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
        </Box>
      </Flex>

      <Text>{user.bio}</Text>

      {currentUser?._id === user._id && (
        <Flex justifyContent="center" w="full">
          <Link as={RouterLink} to="/update">
            <Button bg={colorMode === "dark" ? "gray.800" : "gray.300"} size={"sm"} w={"600px"}>
              Update Profile
            </Button>
          </Link>
        </Flex>
      )}
      {currentUser?._id !== user._id && (
        <Button size={"sm"} bg={colorMode === "dark" ? "gray.800" : "gray.300"} onClick={handleFollowUnfollow} isLoading={updating}>
          {following ? "Unfollow" : "Follow"}
        </Button>
      )}

      {/* Modal Followers */}
      <Modal isOpen={isFollowersOpen} onClose={onFollowersClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Followers</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {followersData.length > 0 ? (
              followersData.map((follower) => (
                <Flex key={follower._id} alignItems="center" justifyContent="space-between" mb={2}>
                  <Flex gap={2} to={`${follower.username}`}>
                    <Avatar
                      name={follower.name}
                      src={follower.profilePic}
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/${follower.username}`);
                      }}
                      _hover={{ transform: "scale(1.1)" }}
                      transition="all 0.3s"
                      cursor={"pointer"}
                    />
                    <Box>
                      <Text
                        fontSize={"sm"}
                        fontWeight={"bold"}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/${follower.username}`);
                        }}
                        _hover={{ color: "blue.400" }}
                        cursor="pointer"
                      >
                        {follower?.username}
                      </Text>
                      <Text color={"gray.500"} fontSize={"sm"} cursor={"pointer"}>
                        {follower.name}
                      </Text>
                    </Box>
                  </Flex>
                  <Button
                    size="xs"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/${following.user.username}`);
                    }}
                    _hover={{ transform: "scale(1.1)" }}
                    transition="all 0.3s"
                    cursor={"pointer"}
                  >
                    Follow
                  </Button>
                </Flex>
              ))
            ) : (
              <Text>No followers found.</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal Following */}
      <Modal isOpen={isFollowingOpen} onClose={onFollowingClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Following</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {followingData.length > 0 ? (
              followingData.map((following) => (
                <Flex key={following._id} alignItems="center" justifyContent="space-between" mb={2}>
                  <Flex gap={2} to={`${following.username}`}>
                    <Avatar
                      name={following.name}
                      src={following.profilePic}
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/${following.username}`);
                      }}
                      _hover={{ transform: "scale(1.1)" }}
                      transition="all 0.3s"
                      cursor={"pointer"}
                    />
                    <Box>
                      <Text
                        fontSize={"sm"}
                        fontWeight={"bold"}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/${following.username}`);
                        }}
                        _hover={{ color: "blue.400" }}
                        cursor="pointer"
                      >
                        {following?.username}
                      </Text>
                      <Text color={"gray.500"} fontSize={"sm"} cursor={"pointer"}>
                        {following.name}
                      </Text>
                    </Box>
                  </Flex>
                  <Button
                    size="xs"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/${following.username}`);
                    }}
                    _hover={{ transform: "scale(1.1)" }}
                    transition="all 0.3s"
                    cursor={"pointer"}
                  >
                    Unfollow
                  </Button>
                </Flex>
              ))
            ) : (
              <Text>No following found.</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      <Flex w={"full"} justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Text size={"sm"} color={"gray.light"} onClick={onFollowingOpen} cursor={"pointer"}>
            {user.following.length} Following
          </Text>
          <Text fontSize="sm">•</Text>
          <Text size={"sm"} color={"gray.light"} onClick={onFollowersOpen} cursor={"pointer"}>
            {user.followers.length} followers
          </Text>
          <Text fontSize="sm">•</Text>
          <Link href="https://instagram.com" isExternal color="gray.light">
            instagram.com
          </Link>
        </Flex>
        <Flex>
          <Box
            className="icon-container"
            marginRight={2}
            _hover={{
              bg: colorMode === "dark" ? "#1e1e1e" : "#e2e8f0",
            }}
          >
            <BsInstagram size={24} cursor={"pointer"} />
          </Box>
          <Box
            className="icon-container"
            _hover={{
              bg: colorMode === "dark" ? "#1e1e1e" : "#e2e8f0",
            }}
          >
            <Menu>
              <MenuButton>
                <CgMoreO size={24} cursor={"pointer"} />
              </MenuButton>
              <Portal>
                <MenuList bg={colorMode === "dark" ? "gray.800" : "gray.300"}>
                  <MenuItem bg={colorMode === "dark" ? "gray.800" : "gray.300"} onClick={copyURL}>
                    Copy link
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        </Flex>
      </Flex>

      <Flex w={"full"}>
        <Flex
          flex={1}
          borderBottom={selectedTab === "posts" ? (colorMode === "dark" ? "2px solid white" : "3px solid black") : colorMode === "dark" ? "2px solid gray" : "3px solid lightgray"}
          justifyContent={"center"}
          pb="3"
          cursor={"pointer"}
          onClick={() => setSelectedTab("posts")}
        >
          <Text fontWeight={"bold"} color={selectedTab === "posts" ? "" : "gray.light"}>
            Post
          </Text>
        </Flex>

        <Flex
          flex={1}
          borderBottom={selectedTab === "replies" ? (colorMode === "dark" ? "2px solid white" : "3px solid black") : colorMode === "dark" ? "2px solid gray" : "3px solid lightgray"}
          justifyContent={"center"}
          pb="3"
          cursor={"pointer"}
          onClick={() => setSelectedTab("replies")}
        >
          <Text fontWeight={"bold"} color={selectedTab === "replies" ? "" : "gray.light"}>
            Replies
          </Text>
        </Flex>

        <Flex
          flex={1}
          borderBottom={selectedTab === "reposts" ? (colorMode === "dark" ? "2px solid white" : "3px solid black") : colorMode === "dark" ? "2px solid gray" : "3px solid lightgray"}
          justifyContent={"center"}
          pb="3"
          cursor={"pointer"}
          onClick={() => setSelectedTab("reposts")}
        >
          <Text fontWeight={"bold"} color={selectedTab === "reposts" ? "" : "gray.light"}>
            Reposts
          </Text>
        </Flex>
      </Flex>
      {selectedTab === "replies" && <UserReplies username={user.username} />}
      {selectedTab === "reposts" && <UserReposts username={user.username} />}
    </VStack>
  );
};

export default UserHeader;
