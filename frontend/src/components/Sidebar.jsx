import { Box, Flex, Link, IconButton, useColorMode, Text } from "@chakra-ui/react";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { FaFacebookMessenger } from "react-icons/fa";
// import { GrGroup } from "react-icons/gr";
import { MdGroups } from "react-icons/md";
import { MdOutlineSettings } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { CiLogin } from "react-icons/ci";
import { Link as RouterLink } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authAtom";

const Sidebar = () => {
  const { colorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  const setAuthScreen = useSetRecoilState(authScreenAtom);

  return (
    <Box
      as="nav"
      pos="fixed"
      left={0}
      top={0}
      h="100vh"
      w="80px"
      bg={colorMode === "dark" ? "#181818" : "white"}
      boxShadow="xl"
      p={4}
      display="flex"
      flexDir="column"
      gap={4}
      overflow="hidden"
      transition="width 0.3s ease"
      role="group"
      _hover={{
        width: "200px",
      }}
    >
      <Link _hover={{ cursor: "pointer", color: "red.500", textDecoration: "none", fontWeight: "bold" }} mt={12} as={RouterLink} to="/" display="flex" alignItems="center">
        <Flex alignItems="center">
          <IconButton icon={<AiFillHome />} aria-label="Home" size="lg" />
          <Text ml={4} fontSize="lg" whiteSpace="nowrap" overflow="hidden" color={colorMode === "dark" ? "white" : "black"} opacity={0} transition="opacity 0.3s ease" _groupHover={{ opacity: 1 }}>
            Home
          </Text>
        </Flex>
      </Link>

      {user ? (
        <>
          <Link _hover={{ cursor: "pointer", color: "red.500", textDecoration: "none", fontWeight: "bold" }} as={RouterLink} to={`/${user.username}`} display="flex" alignItems="center">
            <Flex alignItems="center">
              <IconButton icon={<RxAvatar />} aria-label="Profile" size="lg" />
              <Text ml={4} fontSize="lg" whiteSpace="nowrap" overflow="hidden" color={colorMode === "dark" ? "white" : "black"} opacity={0} transition="opacity 0.3s ease" _groupHover={{ opacity: 1 }}>
                Profile
              </Text>
            </Flex>
          </Link>
          <Link _hover={{ cursor: "pointer", color: "red.500", textDecoration: "none", fontWeight: "bold" }} as={RouterLink} to="/chat" display="flex" alignItems="center">
            <Flex alignItems="center">
              <IconButton icon={<FaFacebookMessenger />} aria-label="Chat" size="lg" />
              <Text ml={4} fontSize="lg" whiteSpace="nowrap" overflow="hidden" color={colorMode === "dark" ? "white" : "black"} opacity={0} transition="opacity 0.3s ease" _groupHover={{ opacity: 1 }}>
                Messenger
              </Text>
            </Flex>
          </Link>
          <Link
            _hover={{
              cursor: "pointer",
              color: "red.500",
              textDecoration: "none",
              fontWeight: "bold",
            }}
            as={RouterLink}
            to="/community"
            display="flex"
            alignItems="center"
          >
            <Flex alignItems="center">
              <IconButton
                icon={<MdGroups />} // Sử dụng icon mới
                aria-label="Community"
                size="lg"
                _hover={{ bg: "red.500", color: "white" }}
              />
              <Text ml={4} fontSize="lg" whiteSpace="nowrap" overflow="hidden" color={colorMode === "dark" ? "white" : "black"} opacity={0} transition="opacity 0.3s ease" _groupHover={{ opacity: 1 }}>
                Community
              </Text>
            </Flex>
          </Link>

          <Link _hover={{ cursor: "pointer", color: "red.500", textDecoration: "none", fontWeight: "bold" }} as={RouterLink} to="/settings" display="flex" alignItems="center">
            <Flex alignItems="center">
              <IconButton icon={<MdOutlineSettings />} aria-label="Settings" size="lg" />
              <Text ml={4} fontSize="lg" whiteSpace="nowrap" overflow="hidden" color={colorMode === "dark" ? "white" : "black"} opacity={0} transition="opacity 0.3s ease" _groupHover={{ opacity: 1 }}>
                Settings
              </Text>
            </Flex>
          </Link>
          <Flex
            alignItems="center"
            _hover={{ cursor: "pointer", color: "red.500", textDecoration: "none", fontWeight: "bold" }}
            onClick={async () => {
              // Thêm xác nhận trước khi đăng xuất
              if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
                await logout();
                // Có thể thêm điều hướng về trang chủ sau khi đăng xuất
                window.location.href = "/";
              }
            }}
          >
            <IconButton icon={<FiLogOut />} aria-label="Logout" size="lg" _hover={{ bg: "red.500", color: "white" }} />
            <Text ml={4} fontSize="lg" whiteSpace="nowrap" overflow="hidden" color={colorMode === "dark" ? "white" : "black"} opacity={0} transition="opacity 0.3s ease" _groupHover={{ opacity: 1 }}>
              Logout
            </Text>
          </Flex>
        </>
      ) : (
        <>
          <Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("login")} _hover={{ textDecoration: "none" }}>
            <Flex alignItems="center">
              <IconButton icon={<CiLogin />} aria-label="Login" size="lg" />
              <Text ml={4} fontSize="lg" whiteSpace="nowrap" overflow="hidden" color={colorMode === "dark" ? "white" : "black"} _hover={{ fontWeight: "bold", color: "white" }}>
                Login
              </Text>
            </Flex>
          </Link>
          <Link
            as={RouterLink}
            to={"/auth"}
            onClick={() => setAuthScreen("signup")}
            _hover={{ cursor: "pointer", color: "red.500", textDecoration: "none", fontWeight: "bold" }}
            display="flex"
            alignItems="center"
          >
            <Flex alignItems="center">
              <IconButton icon={<CiLogin />} aria-label="Sign Up" size="lg" />
              <Text ml={4} fontSize="lg" whiteSpace="nowrap" overflow="hidden" color={colorMode === "dark" ? "white" : "black"} opacity={0} transition="opacity 0.3s ease" _groupHover={{ opacity: 1 }}>
                Sign Up
              </Text>
            </Flex>
          </Link>
        </>
      )}
    </Box>
  );
};

export default Sidebar;
