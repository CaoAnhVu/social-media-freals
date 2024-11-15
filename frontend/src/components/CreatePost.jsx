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
  useToast,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useRef, useState } from "react";
import Picker from "@emoji-mart/react";
import { BsFillImageFill, BsEmojiSmile, BsCameraVideo, BsGeoAlt } from "react-icons/bs";
import { usePreviewImg, usePreviewVideo } from "../hooks/usePreviewImg";
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
  const { handleVideoChange, videoUrl, setVideoUrl } = usePreviewVideo();
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
  const user = useRecoilValue(userAtom);
  const showToast = useShowToast();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const { username } = useParams();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { isOpen: isLocationModalOpen, onOpen: onOpenLocationModal, onClose: onCloseLocationModal } = useDisclosure();
  const [locationName, setLocationName] = useState("");
  const [locationCoordinates, setLocationCoordinates] = useState({ latitude: "", longitude: "" });
  const [location, setLocation] = useState(null);
  const toast = useToast();

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

  const handleLocationSave = () => {
    if (
      locationName &&
      locationCoordinates.latitude &&
      locationCoordinates.longitude &&
      !isNaN(locationCoordinates.latitude) &&
      !isNaN(locationCoordinates.longitude) &&
      locationCoordinates.latitude >= -90 &&
      locationCoordinates.latitude <= 90 &&
      locationCoordinates.longitude >= -180 &&
      locationCoordinates.longitude <= 180
    ) {
      setLocation({
        name: locationName,
        coordinates: [parseFloat(locationCoordinates.latitude), parseFloat(locationCoordinates.longitude)],
      });
      onCloseLocationModal(); // Close the modal after saving location
      toast({
        title: "Location Saved.",
        description: `Location: ${locationName}, Latitude: ${locationCoordinates.latitude}, Longitude: ${locationCoordinates.longitude}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Error",
        description: "Please fill in all fields for location.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreatePost = async () => {
    setLoading(true);
    try {
      if (!postText && !imgUrl && !videoUrl) {
        showToast("Error", "Please provide text, an image, or a video", "error");
        return;
      }

      // Create FormData object
      const formData = new FormData();
      formData.append("postedBy", user._id);
      formData.append("text", postText || "");

      // Append the image file if it's selected
      if (imageRef.current?.files[0]) {
        formData.append("img", imageRef.current.files[0]);
      }

      // Append the video file if it's selected
      if (videoRef.current?.files[0]) {
        formData.append("video", videoRef.current.files[0]);
      }

      // Append location if available
      if (location && location.name && location.coordinates) {
        formData.append("location", JSON.stringify(location)); // Ensure it's properly serialized
      }

      for (var pair of formData.entries()) {
        console.log(pair[0] + ", " + pair[1]);
      }

      // Send FormData to the API
      const res = await fetch("/api/posts/create", {
        method: "POST",
        body: formData, // Use FormData directly as the body
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
      setVideoUrl("");
      setLocationName("");
      setLocationCoordinates({ latitude: "", longitude: "" });
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setLoading(false);
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
        transition="all 0.25s"
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
                style={{ fontFamily: "Segoe UI Emoji, Noto Color Emoji, Apple Color Emoji" }}
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
                <BsGeoAlt
                  style={{ cursor: "pointer", marginLeft: "10px" }}
                  size={20}
                  color={useColorModeValue("teal.500", "teal.300")}
                  onClick={onOpenLocationModal} // Open the modal when clicked
                />
                <Input type="file" hidden ref={imageRef} onChange={handleImageChange} accept="image/*" />
                <Input type="file" hidden ref={videoRef} onChange={handleVideoChange} accept="video/*" />
              </Flex>
            </FormControl>
            {imgUrl && (
              <Flex position="relative" mt={2} mb={4}>
                <Image src={imgUrl} alt="Selected preview" borderRadius="md" shadow="md" maxW={"100%"} objectFit="cover" />
                <CloseButton size="sm" position="absolute" top={1} right={1} bg="red.600" color="white" onClick={() => setImgUrl("")} />
              </Flex>
            )}
            {videoUrl && (
              <Flex position="relative" mt={2} mb={4}>
                <video src={videoUrl} controls style={{ borderRadius: "8px", maxWidth: "100%" }} />
                <CloseButton size="sm" position="absolute" top={1} right={1} bg="red.600" color="white" onClick={() => setVideoUrl("")} />
              </Flex>
            )}
            {/* Location Modal */}
            <Modal isOpen={isLocationModalOpen} onClose={onCloseLocationModal}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Save Location</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl>
                    <Input placeholder="Enter location name" value={locationName} onChange={(e) => setLocationName(e.target.value)} mb={3} />
                    <Flex direction="row" gap={3}>
                      <Input placeholder="Latitude" value={locationCoordinates.latitude} onChange={(e) => setLocationCoordinates({ ...locationCoordinates, latitude: e.target.value })} />
                      <Input placeholder="Longitude" value={locationCoordinates.longitude} onChange={(e) => setLocationCoordinates({ ...locationCoordinates, longitude: e.target.value })} />
                    </Flex>
                  </FormControl>
                </ModalBody>
                <ModalFooter>
                  <Button colorScheme="teal" onClick={handleLocationSave}>
                    Save Location
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
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
