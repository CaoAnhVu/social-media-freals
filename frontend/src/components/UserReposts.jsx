// import { VStack, Text, Flex, Box, Image } from "@chakra-ui/react";
// import { Link } from "react-router-dom";
// import { useColorMode } from "@chakra-ui/color-mode";
// import Actions from "./Actions";

// const UserReposts = ({ reposts }) => {
//   const { colorMode } = useColorMode();

//   if (!reposts?.length) {
//     return (
//       <Text textAlign={"center"} w={"full"}>
//         Không có bài đăng lại nào
//       </Text>
//     );
//   }

//   return (
//     <VStack gap={4} w={"full"}>
//       {reposts.map((repost) => (
//         <Flex key={repost._id} gap={3} w={"full"} _hover={{ bg: colorMode === "dark" ? "whiteAlpha.100" : "gray.100" }} borderRadius={6} p={2}>
//           <Link to={`/profile/${repost.originalUserId}`}>
//             <Image src={repost.originalUserProfilePic} w={10} h={10} rounded={"full"} />
//           </Link>
//           <Flex flex={1} flexDirection={"column"} gap={2}>
//             <Flex justifyContent={"space-between"} w={"full"}>
//               <Link to={`/profile/${repost.originalUserId}`}>
//                 <Text fontSize={"sm"} fontWeight={"bold"}>
//                   {repost.originalUsername}
//                 </Text>
//               </Link>
//               <Text fontSize={"xs"} color={"gray.500"}>
//                 Đã đăng lại bởi {repost.username}
//               </Text>
//             </Flex>
//             <Text fontSize={"sm"}>{repost.text}</Text>
//             {repost.img && (
//               <Box borderRadius={6} overflow={"hidden"} border={"1px solid"} borderColor={"gray.light"}>
//                 <Image src={repost.img} w={"full"} />
//               </Box>
//             )}
//             <Actions post={repost} />
//           </Flex>
//         </Flex>
//       ))}
//     </VStack>
//   );
// };

// export default UserReposts;
