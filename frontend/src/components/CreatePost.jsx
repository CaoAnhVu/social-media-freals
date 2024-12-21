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
  Box,
  Progress,
  Spinner,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useRef, useState, useEffect } from "react";
import Picker from "@emoji-mart/react";
import { BsFillImageFill, BsEmojiSmile, BsCameraVideo, BsGeoAlt } from "react-icons/bs";
import { usePreviewVideo } from "../hooks/usePreviewImg";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../atoms/postsAtom";
import { useParams } from "react-router-dom";

const MAX_CHAR = 500;

const CreatePost = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [postText, setPostText] = useState("");
  const [imgUrls, setImgUrls] = useState([]);
  const { handleVideoPreview, videoUrl, setVideoUrl } = usePreviewVideo();
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
  const [mediaCount, setMediaCount] = useState(0);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const MAX_IMAGES = 4;
  const MAX_VIDEOS = 4;
  const toast = useToast();

  const validateMedia = () => {
    // Kiểm tra kích thước file
    const maxSize = 3072 * 1024 * 1024; // 50MB

    // Kiểm tra ảnh
    for (const file of imgUrls) {
      if (file.size > maxSize) {
        showToast("Error", "Each file must be less than 50MB", "error");
        return false;
      }
    }

    // Kiểm tra video
    if (videoRef.current?.files[0]?.size > maxSize) {
      showToast("Error", "Video must be less than 50MB", "error");
      return false;
    }

    return true;
  };
  const validateFileType = (file, type) => {
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];

    if (type === "image") {
      return allowedImageTypes.includes(file.type);
    }

    if (type === "video") {
      return allowedVideoTypes.includes(file.type);
    }
    return false;
  };

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

  useEffect(() => {
    return () => {
      // Cleanup URLs khi component unmount
      imgUrls.forEach((file) => {
        if (file instanceof File) {
          URL.revokeObjectURL(URL.createObjectURL(file));
        }
      });
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [imgUrls, videoUrl]);

  useEffect(() => {
    // Tạo preview URLs cho ảnh
    const urls = imgUrls.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // Cleanup
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [imgUrls]);

  const handleImageChange = (e) => {
    setIsMediaLoading(true);
    try {
      const files = Array.from(e.target.files);
      // Kiểm tra định dạng file
      const invalidFiles = files.filter((file) => !validateFileType(file, "image"));

      if (invalidFiles.length > 0) {
        showToast("Error", "Only JPG, PNG, GIF and WEBP files are allowed", "error");
        return;
      }
      // Kiểm tra số lượng ảnh
      if (files.length + imgUrls.length > MAX_IMAGES) {
        showToast("Error", `Maximum ${MAX_IMAGES} images allowed`, "error");
        return;
      }

      setImgUrls((prev) => [...prev, ...files]);
      setMediaCount((prev) => prev + files.length);
    } catch {
      // Thêm underscore để chỉ ra biến không được sử dụng
      showToast("Error", "Failed to load image", "error");
    } finally {
      setIsMediaLoading(false);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra nếu đã có video
    if (videoUrl) {
      showToast("Error", "Only one video allowed", "error");
      return;
    }

    handleVideoPreview(e);
    setMediaCount((prev) => prev + 1);
  };

  const removeImage = (index) => {
    setImgUrls((prev) => prev.filter((_, i) => i !== index));
    setMediaCount((prev) => prev - 1);
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  };

  const removeVideo = () => {
    setVideoUrl("");
    setMediaCount((prev) => prev - 1);
    if (videoRef.current) {
      videoRef.current.value = "";
    }
  };

  const handleCreatePost = async () => {
    setLoading(true);
    setUploadProgress(0);
    if (!validateMedia()) return;
    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      };
      if (!postText && imgUrls.length === 0 && !videoUrl) {
        showToast("Error", "Please provide text, images, or a video", "error");
        return;
      }

      const formData = new FormData();
      formData.append("postedBy", user._id);
      formData.append("text", postText || "");

      // Upload ảnh
      if (imgUrls.length > 0) {
        imgUrls.forEach((file) => {
          formData.append("img", file);
        });
      }

      // Upload video
      if (videoRef.current?.files[0]) {
        formData.append("video", videoRef.current.files[0]);
      }

      if (location && location.name && location.coordinates) {
        formData.append("location", JSON.stringify(location));
      }

      console.log("Form data entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error creating post");
      }

      const data = await res.json();
      showToast("Success", "Post created successfully", "success");
      if (username === user.username) {
        setPosts([data, ...posts]);
      }

      onClose();
      setPostText("");
      setImgUrls([]);
      setVideoUrl("");
      setMediaCount(0);
      if (imageRef.current) imageRef.current.value = "";
      if (videoRef.current) videoRef.current.value = "";
      setLocationName("");
      setLocationCoordinates({ latitude: "", longitude: "" });
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };
  const handleClose = () => {
    if (postText || imgUrls.length > 0 || videoUrl) {
      if (window.confirm("Are you sure you want to discard this post?")) {
        onClose();
        setPostText("");
        setImgUrls([]);
        setVideoUrl("");
        setMediaCount(0);
      }
    } else {
      onClose();
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

      <Modal isOpen={isOpen} onClose={handleClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent bg={useColorModeValue("white", "#181818")} borderRadius="lg" shadow="xl" maxW="lg" w="full">
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
                {/* Hiển thị số lượng media */}
                <Text fontSize="xs" color="gray.500">
                  Media: {mediaCount}/{MAX_IMAGES + MAX_VIDEOS}
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

                <BsFillImageFill
                  style={{
                    cursor: imgUrls.length >= MAX_IMAGES ? "not-allowed" : "pointer",
                    opacity: imgUrls.length >= MAX_IMAGES ? 0.5 : 1,
                  }}
                  size={20}
                  color={useColorModeValue("teal.500", "teal.300")}
                  onClick={() => imgUrls.length < MAX_IMAGES && imageRef.current.click()}
                />
                <BsCameraVideo
                  style={{
                    cursor: videoUrl ? "not-allowed" : "pointer",
                    opacity: videoUrl ? 0.5 : 1,
                  }}
                  size={20}
                  color={useColorModeValue("teal.500", "teal.300")}
                  onClick={() => !videoUrl && videoRef.current.click()}
                />
                <BsGeoAlt
                  style={{ cursor: "pointer", marginLeft: "10px" }}
                  size={20}
                  color={useColorModeValue("teal.500", "teal.300")}
                  onClick={onOpenLocationModal} // Open the modal when clicked
                />
                <Input type="file" hidden ref={imageRef} onChange={handleImageChange} accept="image/*" multiple />
                <Input type="file" hidden ref={videoRef} onChange={handleVideoChange} accept="video/*" />
              </Flex>
              {isMediaLoading && (
                <Flex justify="center" my={2}>
                  <Spinner size="sm" color="teal.500" />
                </Flex>
              )}
            </FormControl>
            {/* Hiển thị preview ảnh */}
            {imgUrls.length > 0 && (
              <Flex position="relative" mt={2} mb={4} gap={2} flexWrap="wrap">
                {previewUrls.map((url, index) => (
                  <Box key={index} position="relative" width={imgUrls.length === 1 ? "100%" : "48%"}>
                    <Image src={url} alt={`Selected preview ${index + 1}`} borderRadius="md" shadow="md" w="100%" h="200px" objectFit="cover" loading="lazy" />
                    <CloseButton size="sm" position="absolute" top={1} right={1} bg="red.600" color="white" onClick={() => removeImage(index)} />
                  </Box>
                ))}
              </Flex>
            )}

            {/* Hiển thị preview video */}
            {videoUrl && (
              <Flex position="relative" mt={2} mb={4}>
                <video
                  src={videoUrl}
                  controls
                  style={{
                    borderRadius: "8px",
                    maxWidth: "100%",
                    maxHeight: "400px",
                    objectFit: "contain",
                  }}
                  preload="metadata"
                />
                <CloseButton size="sm" position="absolute" top={1} right={1} bg="red.600" color="white" onClick={removeVideo} />
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
                      {/* Swap the order of latitude and longitude */}

                      <Input
                        placeholder="Latitude"
                        value={locationCoordinates.latitude}
                        onChange={(e) =>
                          setLocationCoordinates({
                            ...locationCoordinates,
                            latitude: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Longitude"
                        value={locationCoordinates.longitude}
                        onChange={(e) =>
                          setLocationCoordinates({
                            ...locationCoordinates,
                            longitude: e.target.value,
                          })
                        }
                      />
                    </Flex>
                  </FormControl>
                  {uploadProgress > 0 && uploadProgress < 100 && <Progress value={uploadProgress} size="xs" colorScheme="teal" mt={4} borderRadius="full" />}
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
