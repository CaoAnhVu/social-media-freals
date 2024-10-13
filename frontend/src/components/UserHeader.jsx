import { Box, Link, Flex, VStack, Text, MenuButton, Menu, Portal, MenuList, MenuItem, useToast } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/avatar";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import { base } from "framer-motion/client";
const UserHeader = () => {
  const toast = useToast();
  const copyUrl = () => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL).ethen(() => {
      toast({
        title: "Account created.",
        status: "success",
        description: "Profile link copied.",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  return (
    <VStack gap={4} alignItems={"start"}>
      <Flex justifyContent={"space-between"} w={"full"} bg={"#181818"}>
        <Box>
          <Text fontsize={"2xl"} fontWeight={"bold"}>
            Cao Anh Vu
          </Text>
          <Flex gap={2} alignItems={"center"}>
            <Text fontsize={"sm"}>caoanhvu</Text>
            <Text fontsize={"xs"} bg={"gray.dark"} color={"gray.light"} p={1} borderRadius={"full"}>
              freals.net
            </Text>
            <Text fontsize={"sm"}>caoanhvu</Text>
          </Flex>
        </Box>
        <Box>
          <Avatar
            name="AndyVu Coder"
            src="/public/vu-avatar.jpg"
            size={{
              base: "md",
              md: "xl",
            }}
          />
        </Box>
      </Flex>
      <Text>Lorem ipsum dolor sit amet consectetur adipisicing elit.</Text>
      <Flex w={"full"} justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Text color={"gray.light"}>3.2k người theo dõi</Text>
          <Box w="1" h="1" bg={"gray.light"} borderRadius={"full"}></Box>
          <Link color={"gray.light"}>instagram.com</Link>
        </Flex>
        <Flex></Flex>
        <Box>
          <BsInstagram size={24} cursor={"pointer"} />
        </Box>
        <Box className="icon-container">
          <Menu>
            <MenuButton>
              <CgMoreO size={24} cursor={"pointer"} />
            </MenuButton>
            <Portal>
              <MenuList bg={"gray.dark"}>
                <MenuItem bg={"gray.dark"} onClick={copyUrl}>
                  Copy link
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        </Box>
      </Flex>
      <Flex w={"full"}>
        <Flex flex={1} borderBottom={"1.5px solid white"} justifyContent={"center"} pb="3" cursor={"pointer"}>
          <Text fontWeight={"bold"}>Freals</Text>
        </Flex>
        <Flex flex={1} borderBottom={"1px solid gray"} justifyContent={"center"} color={"gray.light"} pb="3" cursor={"pointer"}>
          <Text fontWeight={"bold"}>Replies</Text>
        </Flex>
      </Flex>
    </VStack>
  );
};

export default UserHeader;
