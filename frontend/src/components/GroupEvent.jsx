// frontend/src/components/GroupEvent.jsx
import {
  VStack,
  Box,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";

const GroupEvent = ({ groupId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${groupId}/events`);
      if (!response.ok) {
        throw new Error("Không thể tải danh sách sự kiện");
      }
      const data = await response.json();
      setEvents(data);
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
    fetchEvents();
  }, [fetchEvents]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/groups/${groupId}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        throw new Error("Không thể tạo sự kiện");
      }

      const data = await response.json();
      setEvents([...events, data]);
      onClose();
      setNewEvent({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        location: "",
      });
      toast({
        title: "Thành công",
        description: "Đã tạo sự kiện mới",
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
      setLoading(false);
    }
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
      <Button colorScheme="teal" onClick={onOpen}>
        Tạo sự kiện mới
      </Button>

      {events.length === 0 ? (
        <Center py={8}>
          <Text color="gray.500">Chưa có sự kiện nào trong nhóm</Text>
        </Center>
      ) : (
        events.map((event) => (
          <Box key={event._id} p={4} borderWidth="1px" borderRadius="lg">
            <Text fontWeight="bold" fontSize="lg">
              {event.title}
            </Text>
            <Text>{event.description}</Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Thời gian: {new Date(event.startDate).toLocaleDateString()}
              {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
            </Text>
            {event.location && (
              <Text fontSize="sm" color="gray.500">
                Địa điểm: {event.location}
              </Text>
            )}
          </Box>
        ))
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>Tạo sự kiện mới</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Tên sự kiện</FormLabel>
                  <Input name="title" value={newEvent.title} onChange={handleInputChange} />
                </FormControl>

                <FormControl>
                  <FormLabel>Mô tả</FormLabel>
                  <Textarea name="description" value={newEvent.description} onChange={handleInputChange} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Ngày bắt đầu</FormLabel>
                  <Input name="startDate" type="datetime-local" value={newEvent.startDate} onChange={handleInputChange} />
                </FormControl>

                <FormControl>
                  <FormLabel>Ngày kết thúc</FormLabel>
                  <Input name="endDate" type="datetime-local" value={newEvent.endDate} onChange={handleInputChange} />
                </FormControl>

                <FormControl>
                  <FormLabel>Địa điểm</FormLabel>
                  <Input name="location" value={newEvent.location} onChange={handleInputChange} />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Hủy
              </Button>
              <Button colorScheme="teal" type="submit" isLoading={loading} loadingText="Đang tạo...">
                Tạo sự kiện
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default GroupEvent;
