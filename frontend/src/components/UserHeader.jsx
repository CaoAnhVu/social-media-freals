import { Avatar } from "@chakra-ui/avatar";
import { Box, Flex, Link, Text, VStack } from "@chakra-ui/layout";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { Portal } from "@chakra-ui/portal";
import { Button, useToast, useColorMode } from "@chakra-ui/react";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link as RouterLink } from "react-router-dom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";

const UserHeader = ({ user }) => {
  const toast = useToast();
  const currentUser = useRecoilValue(userAtom); // logged in user
  const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);
  const { colorMode } = useColorMode();

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

  return (
    <VStack gap={4} alignItems={"start"}>
      <Flex justifyContent={"space-between"} w={"full"}>
        <Box>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {user.name}
          </Text>
          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"sm"}>{user.username}</Text>
            <Text fontSize={"xs"} bg={colorMode === "dark" ? "gray.800" : "gray.300"} p={1} borderRadius={"full"}>
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
        <Link as={RouterLink} to="/update">
          <Button bg={colorMode === "dark" ? "gray.800" : "gray.300"} size={"sm"}>
            Update Profile
          </Button>
        </Link>
      )}
      {currentUser?._id !== user._id && (
        <Button size={"sm"} bg={colorMode === "dark" ? "gray.800" : "gray.300"} onClick={handleFollowUnfollow} isLoading={updating}>
          {following ? "Unfollow" : "Follow"}
        </Button>
      )}
      <Flex w={"full"} justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Text color={"gray.light"}>{user.followers.length} followers</Text>
          <Box w="1" h="1" bg={"gray.light"} borderRadius={"full"}></Box>
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
        <Flex flex={1} borderBottom={colorMode === "dark" ? "2px solid white" : "3px solid black"} justifyContent={"center"} pb="3" cursor={"pointer"}>
          <Text fontWeight={"bold"}> Post</Text>
        </Flex>
        <Flex flex={1} borderBottom={colorMode === "dark" ? "2px solid gray" : "3px solid lightgray"} justifyContent={"center"} color={"gray.light"} pb="3" cursor={"pointer"}>
          <Text fontWeight={"bold"}> Replies</Text>
        </Flex>
        <Flex flex={1} borderBottom={colorMode === "dark" ? "2px solid gray" : "3px solid lightgray"} justifyContent={"center"} color={"gray.light"} pb="3" cursor={"pointer"}>
          <Text fontWeight={"bold"}> Reposts</Text>
        </Flex>
      </Flex>
    </VStack>
  );
};

export default UserHeader;
