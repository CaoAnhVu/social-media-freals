import { Box, Flex, Link, IconButton, useColorMode } from "@chakra-ui/react";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useLogout from "../hooks/useLogout";

const Sidebar = () => {
  const { colorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const logout = useLogout();

  return (
    <Box as="nav" pos="fixed" left={0} top={0} h="100vh" w="60px" bg={colorMode === "dark" ? "gray.800" : "gray.100"} boxShadow="lg" p={4} display="flex" flexDir="column" alignItems="center" gap={4}>
      <Link as={RouterLink} to="/">
        <IconButton icon={<AiFillHome />} aria-label="Home" size="lg" />
      </Link>
      {user ? (
        <>
          <Link as={RouterLink} to={`/${user.username}`}>
            <IconButton icon={<RxAvatar />} aria-label="Profile" size="lg" />
          </Link>
          <Link as={RouterLink} to="/chat">
            <IconButton icon={<BsFillChatQuoteFill />} aria-label="Chat" size="lg" />
          </Link>
          <Link as={RouterLink} to="/settings">
            <IconButton icon={<MdOutlineSettings />} aria-label="Settings" size="lg" />
          </Link>
          <IconButton icon={<FiLogOut />} aria-label="Logout" size="lg" onClick={logout} />
        </>
      ) : (
        <Link as={RouterLink} to="/auth">
          Login
        </Link>
      )}
    </Box>
  );
};

export default Sidebar;
