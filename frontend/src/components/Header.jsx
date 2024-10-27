import { Flex, Image, useColorMode } from "@chakra-ui/react";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Flex justifyContent={"center"} mt={6} mb="6">
      <Image cursor={"pointer"} alt="logo" w={150} src={colorMode === "dark" ? "/light-logo.png" : "/dark-logo.png"} onClick={toggleColorMode} />
    </Flex>
  );
};

export default Header;
