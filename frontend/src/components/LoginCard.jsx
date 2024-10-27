import { Flex, Box, FormControl, FormLabel, Input, InputGroup, InputRightElement, Stack, Button, Heading, Text, useColorModeValue, Link } from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useSetRecoilState } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";

export default function LoginCard() {
  const [showPassword, setShowPassword] = useState(false);
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const setUser = useSetRecoilState(userAtom);
  const [loading, setLoading] = useState(false);

  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });
  const showToast = useShowToast();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      localStorage.setItem("user-threads", JSON.stringify(data));
      setUser(data);
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex align={"center"} justify={"center"} minH={"90vh"} bg={useColorModeValue("gray.50", "gray.800")}>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={6} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Login to your account</Heading>
        </Stack>
        <Box rounded={"lg"} bg={useColorModeValue("white", "gray.700")} boxShadow={"lg"} p={8} w={{ base: "full", sm: "400px" }}>
          <Stack spacing={4}>
            <FormControl id="username" isRequired>
              <FormLabel>Username</FormLabel>
              <Input type="text" placeholder="Enter your username" value={inputs.username} onChange={(e) => setInputs((inputs) => ({ ...inputs, username: e.target.value }))} />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={inputs.password}
                  onChange={(e) => setInputs((inputs) => ({ ...inputs, password: e.target.value }))}
                />
                <InputRightElement h={"full"}>
                  <Button variant={"ghost"} onClick={() => setShowPassword((showPassword) => !showPassword)}>
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Stack spacing={10} pt={2}>
              <Button
                loadingText="Logging in"
                size="lg"
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                onClick={handleLogin}
                isLoading={loading}
              >
                Login
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align={"center"}>
                Don&apos;t have an account?{" "}
                <Link color={"blue.400"} onClick={() => setAuthScreen("signup")}>
                  Sign up
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
