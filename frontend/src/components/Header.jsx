import { Image, Box, useColorMode } from "@chakra-ui/react";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={"80px"}
      right={0}
      zIndex={1000}
      height="60px"
      bg={colorMode === "dark" ? "gray.800" : "gray.300"}
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={4}
      px={6}
    >
      <Image cursor={"pointer"} alt="logo" w={150} src={colorMode === "dark" ? "/light-logo.png" : "/dark-logo.png"} onClick={toggleColorMode} />
    </Box>
  );
};

export default Header;
