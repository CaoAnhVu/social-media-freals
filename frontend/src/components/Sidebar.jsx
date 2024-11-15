import { Box, Flex, Link, IconButton, useColorMode, Text } from "@chakra-ui/react";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { CiLogin } from "react-icons/ci";
import { Link as RouterLink } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useLogout from "../hooks/useLogout";

const Sidebar = () => {
  const { colorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const logout = useLogout();

  return (
    <Box
      as="nav"
      pos="fixed"
      left={0}
      top={0}
      h="100vh"
      w="80px"
      bg={colorMode === "dark" ? "gray.800" : "gray.100"}
      boxShadow="lg"
      p={4}
      display="flex"
      flexDir="column"
      gap={4}
      overflow="hidden" // Ẩn chữ khi sidebar thu gọn
      transition="width 0.3s ease"
      role="group" // Đặt sidebar làm nhóm
      _hover={{
        width: "200px", // Mở rộng sidebar khi hover
      }}
    >
      <Link _hover={{ cursor: "pointer", color: "red.500", textDecoration: "none", fontWeight: "bold" }} mt={12} as={RouterLink} to="/" display="flex" alignItems="center">
        <Flex alignItems="center">
          <IconButton icon={<AiFillHome />} aria-label="Home" size="lg" />
          <Text
            ml={4}
            fontSize="lg"
            whiteSpace="nowrap"
            overflow="hidden"
            color={colorMode === "dark" ? "white" : "black"}
            opacity={0} // Ẩn chữ mặc định
            transition="opacity 0.3s ease"
            _groupHover={{ opacity: 1 }} // Hiển thị chữ khi hover vào sidebar
          >
            Home
          </Text>
        </Flex>
      </Link>

      {user ? (
        <>
          <Link _hover={{ cursor: "pointer", color: "red.500", textDecoration: "none", fontWeight: "bold" }} as={RouterLink} to={`/${user.username}`} display="flex" alignItems="center">
            <Flex alignItems="center">
              <IconButton icon={<RxAvatar />} aria-label="Profile" size="lg" />
              <Text
                ml={4}
                fontSize="lg"
                whiteSpace="nowrap"
                overflow="hidden"
                color={colorMode === "dark" ? "white" : "black"}
                opacity={0}
                transition="opacity 0.3s ease"
                _groupHover={{ opacity: 1 }} // Hiển thị chữ khi hover vào sidebar
              >
                Profile
              </Text>
            </Flex>
          </Link>
          <Link _hover={{ cursor: "pointer", color: "red.500", textDecoration: "none", fontWeight: "bold" }} as={RouterLink} to="/chat" display="flex" alignItems="center">
            <Flex alignItems="center">
              <IconButton icon={<BsFillChatQuoteFill />} aria-label="Chat" size="lg" />
              <Text
                ml={4}
                fontSize="lg"
                whiteSpace="nowrap"
                overflow="hidden"
                color={colorMode === "dark" ? "white" : "black"}
                opacity={0}
                transition="opacity 0.3s ease"
                _groupHover={{ opacity: 1 }} // Hiển thị chữ khi hover vào sidebar
              >
                Messenger
              </Text>
            </Flex>
          </Link>
          <Link _hover={{ cursor: "pointer", color: "red.500", textDecoration: "none", fontWeight: "bold" }} as={RouterLink} to="/settings" display="flex" alignItems="center">
            <Flex alignItems="center">
              <IconButton icon={<MdOutlineSettings />} aria-label="Settings" size="lg" />
              <Text
                ml={4}
                fontSize="lg"
                whiteSpace="nowrap"
                overflow="hidden"
                color={colorMode === "dark" ? "white" : "black"}
                opacity={0}
                transition="opacity 0.3s ease"
                _groupHover={{ opacity: 1 }} // Hiển thị chữ khi hover vào sidebar
              >
                Settings
              </Text>
            </Flex>
          </Link>
          <Flex
            as="button"
            alignItems="center"
            onClick={logout} // Gán sự kiện onClick cho toàn bộ Flex
            _hover={{ cursor: "pointer", color: "red.500", textDecoration: "none", fontWeight: "bold" }} // Hiệu ứng hover
          >
            <IconButton icon={<FiLogOut />} aria-label="Logout" size="lg" />
            <Text
              ml={4}
              fontSize="lg"
              whiteSpace="nowrap"
              overflow="hidden"
              color={colorMode === "dark" ? "white" : "black"}
              opacity={0}
              transition="opacity 0.3s ease"
              _groupHover={{ opacity: 1 }} // Hiển thị chữ khi hover sidebar
            >
              Logout
            </Text>
          </Flex>
        </>
      ) : (
        <Link
          as={RouterLink}
          to="/auth"
          _hover={{ textDecoration: "none" }} // Xóa gạch chân khi hover
        >
          <Flex alignItems="center">
            <IconButton icon={<CiLogin />} aria-label="Login" size="lg" />
            <Text
              ml={4}
              fontSize="lg"
              whiteSpace="nowrap"
              overflow="hidden"
              color={colorMode === "dark" ? "white" : "black"}
              _hover={{ fontWeight: "bold", color: "white" }} // Hiển thị hiệu ứng khi hover vào chữ
            >
              Login
            </Text>
          </Flex>
        </Link>
      )}
    </Box>
  );
};

export default Sidebar;
