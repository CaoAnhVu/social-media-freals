import { Image, Box, useColorMode, useColorModeValue, InputGroup, InputLeftElement, Input, Button, Flex, VStack, Text, Avatar } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useState, useRef } from "react"; // Xóa useEffect vì không sử dụng
import useShowToast from "../hooks/useShowToast";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputBgColor = useColorModeValue("white", "gray.dark");
  const showToast = useShowToast();
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;

    try {
      setIsLoading(true);
      const res = await fetch(`/api/users/search?username=${searchText}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt-token")}`,
        },
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await res.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      showToast("Error", error.message, "error");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (value.trim()) {
      handleSearch(e);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleUserClick = (username) => {
    navigate(`/${username}`);
    setShowResults(false);
    setSearchText("");
  };

  return (
    <Box as="nav" position="fixed" top={0} left={"80px"} right={0} zIndex={1000} height="60px" bg={colorMode === "dark" ? "#181818" : "white"} p={4} px={6}>
      <Flex justify="space-between" align="center" h="100%" position="relative">
        {/* Search form bên trái */}
        <Box maxW="300px" w="100%" position="relative" ref={searchContainerRef}>
          <form onSubmit={handleSearch}>
            <InputGroup>
              <InputLeftElement>
                <Button aria-label="Search" variant="link" isLoading={isLoading} onClick={handleSearch}>
                  <SearchIcon color="gray.500" />
                </Button>
              </InputLeftElement>
              <Input
                bg={inputBgColor}
                placeholder="Tìm kiếm người dùng..."
                value={searchText}
                onChange={handleInputChange}
                variant="outline"
                borderRadius="full"
                _placeholder={{ color: "gray.500" }}
                _hover={{
                  borderColor: "blue.500",
                }}
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px blue.500",
                }}
              />
            </InputGroup>
          </form>

          {/* Search Results Dropdown */}
          {showResults && (
            <VStack
              position="absolute"
              top="100%"
              left={0}
              right={0}
              mt={2}
              bg={colorMode === "dark" ? "gray.800" : "white"}
              borderRadius="md"
              boxShadow="lg"
              maxH="300px"
              overflowY="auto"
              spacing={0}
              border="1px solid"
              borderColor="gray.200"
            >
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <Flex key={user._id} w="100%" p={3} align="center" _hover={{ bg: colorMode === "dark" ? "gray.700" : "gray.100" }} cursor="pointer" onClick={() => handleUserClick(user.username)}>
                    <Avatar size="sm" src={user.profilePic} name={user.username} />
                    <Box ml={3}>
                      <Text fontWeight="medium">{user.username}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {user.name}
                      </Text>
                    </Box>
                  </Flex>
                ))
              ) : (
                <Box p={4}>
                  <Text color="gray.500">Không tìm thấy người dùng</Text>
                </Box>
              )}
            </VStack>
          )}
        </Box>

        {/* Logo ở giữa */}
        <Box position="absolute" left="50%" transform="translateX(-50%)">
          <Image cursor={"pointer"} alt="logo" w={150} src={colorMode === "dark" ? "/light-logo.png" : "/dark-logo.png"} onClick={toggleColorMode} />
        </Box>

        {/* Box trống bên phải */}
        <Box maxW="300px" w="100%" visibility="hidden" />
      </Flex>
    </Box>
  );
};

export default Header;
