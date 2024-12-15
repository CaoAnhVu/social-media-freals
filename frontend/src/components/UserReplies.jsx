// import { VStack, Text, Flex, Image } from "@chakra-ui/react";
// import { Link } from "react-router-dom";
// import { useColorMode } from "@chakra-ui/color-mode";
// import Actions from "./Actions";

// const UserReplies = ({ replies }) => {
//   const { colorMode } = useColorMode();

//   if (!replies?.length) {
//     return (
//       <Text textAlign={"center"} w={"full"}>
//         Không có bình luận nào
//       </Text>
//     );
//   }

//   return (
//     <VStack gap={4} w={"full"}>
//       {replies.map((reply) => (
//         <Flex key={reply._id} gap={3} w={"full"} _hover={{ bg: colorMode === "dark" ? "whiteAlpha.100" : "gray.100" }} borderRadius={6} p={2}>
//           <Link to={`/profile/${reply.userId}`}>
//             <Image src={reply.userProfilePic} w={10} h={10} rounded={"full"} />
//           </Link>
//           <Flex flex={1} flexDirection={"column"} gap={2}>
//             <Flex justifyContent={"space-between"} w={"full"}>
//               <Link to={`/profile/${reply.userId}`}>
//                 <Text fontSize={"sm"} fontWeight={"bold"}>
//                   {reply.username}
//                 </Text>
//               </Link>
//             </Flex>
//             <Text fontSize={"sm"}>{reply.text}</Text>
//             <Actions reply={reply} />
//           </Flex>
//         </Flex>
//       ))}
//     </VStack>
//   );
// };

// export default UserReplies;
