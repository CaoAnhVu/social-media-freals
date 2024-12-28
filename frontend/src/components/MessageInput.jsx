import { Flex, Image, Input, InputGroup, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Spinner, useDisclosure } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { IoSendSharp } from "react-icons/io5";
import useShowToast from "../hooks/useShowToast";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { BsFillImageFill, BsCameraVideo } from "react-icons/bs";
import { usePreviewImg, usePreviewVideo } from "../hooks/usePreviewImg";
import { useSocket } from "../context/SocketContext";
const MessageInput = ({ setMessages }) => {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const showToast = useShowToast();
  const { handleImageChange: handleImagePreview, imgUrl, setImgUrl } = usePreviewImg();
  const { handleVideoPreview, videoUrl, setVideoUrl } = usePreviewVideo();
  const { socket } = useSocket();
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const setConversations = useSetRecoilState(conversationsAtom);

  // Tạo hàm xử lý cho việc chọn ảnh
  const handleImageChange = (e) => {
    handleImagePreview(e);
    if (e.target.files[0]) {
      onOpen(); // Mở modal khi có file được chọn
    }
  };

  // Tạo hàm xử lý cho việc chọn video
  const handleVideoChange = async (e) => {
    handleVideoPreview(e);
    const file = e.target.files[0];
    if (file && file.type.startsWith("video/")) {
      try {
        // Chuyển đổi video thành base64
        const base64Video = await convertToBase64(file);
        setVideoUrl(base64Video);
        onOpen();
      } catch (error) {
        showToast("Error", `Error processing video: ${error.message}`, "error");
      }
    } else {
      showToast("Invalid file type", "Please select a video file", "error");
      setVideoUrl(null);
    }
  };

  // Hàm chuyển đổi file thành base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText && !imgUrl && !videoUrl) return;
    if (isSending) return;

    setIsSending(true);

    try {
      // 1. Gửi tin nhắn lên server qua API
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          recipientId: selectedConversation.userId,
          img: imgUrl,
          video: videoUrl,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      // 2. Emit sự kiện tin nhắn mới qua socket
      socket.emit("sendMessage", {
        message: data,
        recipientId: selectedConversation.userId,
        conversationId: selectedConversation._id,
      });

      // 3. Cập nhật UI
      setMessages((prev) => [...prev, data]);
      setConversations((prevConvs) => {
        return prevConvs.map((conversation) => {
          if (conversation._id === selectedConversation._id) {
            return {
              ...conversation,
              lastMessage: {
                text: messageText,
                sender: data.sender,
              },
            };
          }
          return conversation;
        });
      });

      // 4. Reset form
      setMessageText("");
      setImgUrl(null);
      setVideoUrl(null);
      onClose();
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsSending(false);
    }
  };
  return (
    <Flex gap={2} alignItems={"center"}>
      <form onSubmit={handleSendMessage} style={{ flex: 95 }}>
        <InputGroup>
          <Input w={"full"} borderRadius={"full"} placeholder="Aa" onChange={(e) => setMessageText(e.target.value)} value={messageText} />
          <InputRightElement onClick={handleSendMessage} cursor={"pointer"}>
            <IoSendSharp />
          </InputRightElement>
        </InputGroup>
      </form>
      <Flex flex={5} cursor={"pointer"}>
        <BsFillImageFill size={20} onClick={() => imageRef.current.click()} />
        <Input type={"file"} hidden ref={imageRef} onChange={handleImageChange} accept="image/*" />
      </Flex>

      <Flex flex={5} cursor={"pointer"}>
        <BsCameraVideo size={20} onClick={() => videoRef.current.click()} />
        <Input type={"file"} hidden ref={videoRef} onChange={handleVideoChange} accept="video/*" />
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {imgUrl && <Image src={imgUrl} alt="Selected image" />}
            {videoUrl && <video controls src={videoUrl} style={{ width: "100%" }} />}
            <Flex justifyContent={"flex-end"} my={2}>
              {!isSending ? <IoSendSharp size={24} cursor={"pointer"} onClick={handleSendMessage} /> : <Spinner size={"md"} />}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default MessageInput;
