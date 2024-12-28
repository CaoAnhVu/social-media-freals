// frontend/src/components/GroupFiles.jsx
import {
  VStack,
  Box,
  Text,
  Icon,
  Button,
  HStack,
  useToast,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Progress,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FiFile, FiUpload, FiDownload, FiTrash2 } from "react-icons/fi";
import { useState, useEffect, useRef, useCallback } from "react";

const GroupFiles = ({ groupId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${groupId}/files`);
      if (!response.ok) {
        throw new Error("Không thể tải danh sách files");
      }
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [groupId, toast]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/groups/${groupId}/files/upload`, {
        method: "POST",
        body: formData,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải lên file");
      }

      const newFile = await response.json();
      setFiles([...files, newFile]);
      onClose();
      toast({
        title: "Thành công",
        description: "Đã tải lên file",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploadProgress(0);
    }
  };

  const handleFileDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/files/${fileId}/download`);
      if (!response.ok) {
        throw new Error("Không thể tải xuống file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFileDelete = async (fileId) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Không thể xóa file");
      }

      setFiles(files.filter((file) => file._id !== fileId));
      toast({
        title: "Thành công",
        description: "Đã xóa file",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <Center py={8}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <Button leftIcon={<FiUpload />} colorScheme="teal" onClick={onOpen}>
        Tải lên file mới
      </Button>

      {files.length === 0 ? (
        <Center py={8}>
          <Text color="gray.500">Chưa có file nào trong nhóm</Text>
        </Center>
      ) : (
        files.map((file) => (
          <Box key={file._id} p={4} borderWidth="1px" borderRadius="lg">
            <HStack spacing={4} justify="space-between">
              <HStack spacing={4}>
                <Icon as={FiFile} boxSize={6} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">{file.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                  </Text>
                </VStack>
              </HStack>
              <HStack>
                <Button size="sm" leftIcon={<FiDownload />} onClick={() => handleFileDownload(file._id, file.name)}>
                  Tải xuống
                </Button>
                <Button size="sm" leftIcon={<FiTrash2 />} colorScheme="red" variant="ghost" onClick={() => handleFileDelete(file._id)}>
                  Xóa
                </Button>
              </HStack>
            </HStack>
          </Box>
        ))
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tải lên file mới</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input type="file" ref={fileInputRef} onChange={handleFileUpload} display="none" />
            <Button onClick={() => fileInputRef.current.click()} width="100%" height="100px" variant="outline">
              <VStack>
                <Icon as={FiUpload} boxSize={6} />
                <Text>Chọn file để tải lên</Text>
              </VStack>
            </Button>
            {uploadProgress > 0 && <Progress value={uploadProgress} mt={4} size="sm" colorScheme="teal" />}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Hủy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default GroupFiles;
