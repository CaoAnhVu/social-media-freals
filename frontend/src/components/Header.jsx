import { Button, Flex, Image, Link, Box, useColorMode } from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authAtom";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  const setAuthScreen = useSetRecoilState(authScreenAtom);

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={"60px"}
      right={0}
      zIndex={1000}
      height="60px"
      bg={colorMode === "dark" ? "gray.800" : "gray.100"}
      // boxShadow="md"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={4}
      px={6}
    >
      <Image cursor={"pointer"} alt="logo" w={150} src={colorMode === "dark" ? "/light-logo.png" : "/dark-logo.png"} onClick={toggleColorMode} />
      {/* <Flex justifyContent={"space-between"} mt={6} mb="6">
        {user && (
          <Link as={RouterLink} to="/">
            <AiFillHome size={24} />
          </Link>
        )}
        {!user && (
          <Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("login")}>
            Login
          </Link>
        )}
        {user && (
          <Flex alignItems={"center"} gap={4}>
            <Link as={RouterLink} to={`/${user.username}`}>
              <RxAvatar size={24} />
            </Link>
            <Link as={RouterLink} to={`/chat`}>
              <BsFillChatQuoteFill size={20} />
            </Link>
            <Link as={RouterLink} to={`/settings`}>
              <MdOutlineSettings size={20} />
            </Link>
            <Button size={"xs"} onClick={logout}>
              <FiLogOut size={20} />
            </Button>
          </Flex>
        )}

        {!user && (
          <Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("signup")}>
            Sign up
          </Link>
        )}
      </Flex> */}
    </Box>
  );
};

export default Header;
