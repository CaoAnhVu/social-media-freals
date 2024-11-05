import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  CloseButton,
  Flex,
  FormControl,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import Picker from "@emoji-mart/react";
import { BsFillImageFill, BsEmojiSmile, BsCameraVideo } from "react-icons/bs";
import usePreviewImg from "../hooks/usePreviewImg";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../atoms/postsAtom";
import { useParams } from "react-router-dom";

const MAX_CHAR = 500;

const CreatePost = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [postText, setPostText] = useState("");
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
  const user = useRecoilValue(userAtom);
  const showToast = useShowToast();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const { username } = useParams();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleTextChange = (e) => {
    const inputText = e.target.value;
    if (inputText.length > MAX_CHAR) {
      setPostText(inputText.slice(0, MAX_CHAR));
      setRemainingChar(0);
    } else {
      setPostText(inputText);
      setRemainingChar(MAX_CHAR - inputText.length);
    }
  };

  const addEmoji = (emoji) => {
    setPostText((prevText) => prevText + emoji.native);
  };

  const handleCreatePost = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postedBy: user._id, text: postText, img: imgUrl }),
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Post created successfully", "success");
      if (username === user.username) {
        setPosts([data, ...posts]);
      }
      onClose();
      setPostText("");
      setImgUrl("");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImgUrl(url);
    }
  };

  return (
    <>
      <Button
        position={"fixed"}
        bottom={10}
        right={5}
        bg={useColorModeValue("teal.400", "teal.600")}
        color="white"
        _hover={{ bg: useColorModeValue("teal.500", "teal.700") }}
        onClick={onOpen}
        size="md"
        borderRadius="full"
        shadow="lg"
        transition="all 0.2s"
      >
        <AddIcon />
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent bg={useColorModeValue("white", "gray.800")} borderRadius="lg" shadow="xl" maxW="lg" w="full">
          <ModalHeader textAlign="center">Create New Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired>
              <Textarea
                placeholder="What's on your mind?"
                value={postText}
                onChange={handleTextChange}
                variant="filled"
                size="lg"
                _focus={{ borderColor: useColorModeValue("teal.500", "teal.400") }}
                resize="none"
                mb={2}
              />
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="xs" color="gray.500">
                  {remainingChar}/{MAX_CHAR} characters
                </Text>
                <Popover isOpen={showEmojiPicker} onClose={() => setShowEmojiPicker(false)}>
                  <PopoverTrigger>
                    <Button variant="ghost" size="sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                      <BsEmojiSmile size={20} color={useColorModeValue("teal.500", "teal.300")} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverBody>
                      <Picker onEmojiSelect={addEmoji} theme={useColorModeValue("light", "dark")} />
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
                <BsFillImageFill style={{ cursor: "pointer" }} size={20} color={useColorModeValue("teal.500", "teal.300")} onClick={() => imageRef.current.click()} />
                <BsCameraVideo style={{ cursor: "pointer", marginLeft: "10px" }} size={20} color={useColorModeValue("teal.500", "teal.300")} onClick={() => videoRef.current.click()} />
                <Input type="file" hidden ref={imageRef} onChange={handleImageChange} accept="image/*" />
                <Input type="file" hidden ref={videoRef} onChange={handleVideoChange} accept="video/*" />
              </Flex>
            </FormControl>

            {imgUrl && (
              <Flex position="relative" mt={2} mb={4}>
                <Image src={imgUrl} alt="Selected preview" borderRadius="md" shadow="md" maxH="200px" objectFit="cover" />
                <CloseButton size="sm" position="absolute" top={1} right={1} bg="red.600" color="white" onClick={() => setImgUrl("")} />
              </Flex>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="teal" isLoading={loading} loadingText="Posting" onClick={handleCreatePost} w="full">
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePost;
