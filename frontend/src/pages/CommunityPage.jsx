// frontend/src/pages/CommunityPage.jsx
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  Text,
  Spinner,
  useColorMode,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Stack,
  Avatar,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link } from "react-router-dom";

const CommunityPage = () => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    privacy: "public",
  });

  const showToast = useShowToast();
  const user = useRecoilValue(userAtom);
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue("white", "gray.dark");

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/groups/all");
      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      setGroups(data);
      // Lọc ra các nhóm của người dùng hiện tại
      if (user) {
        const userGroups = data.filter((group) => group.members.some((member) => member.user._id === user._id || member.user === user._id));
        console.log("My Groups:", userGroups); // Thêm log để debug
        setMyGroups(userGroups);
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, user]);

  // Fetch pending requests cho admin/moderator
  const fetchPendingRequests = useCallback(async () => {
    if (!user) return;

    try {
      const res = await fetch("/api/groups/pending-requests");
      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      setPendingRequests(data);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  }, [showToast, user]);

  useEffect(() => {
    fetchGroups();
    fetchPendingRequests();
  }, [fetchGroups, fetchPendingRequests]);

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) return;

    try {
      const res = await fetch("/api/groups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGroup),
      });

      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      setGroups([...groups, data]);
      setNewGroup({ name: "", description: "", privacy: "public" });
      onClose();
      showToast("Success", "Nhóm đã được tạo", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const handleJoinRequest = async (groupId) => {
    if (!groupId) {
      showToast("Error", "Không tìm thấy thông tin nhóm", "error");
      return;
    }
    try {
      const res = await fetch(`/api/groups/${groupId}/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user._id }),
      });

      const data = await res.json();
      console.log("Join request response:", data);
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      showToast("Success", "Đã gửi yêu cầu tham gia", "success");
    } catch (error) {
      console.error("Join request error:", error);
      showToast("Error", "Có lỗi xảy ra khi gửi yêu cầu", "error");
    }
  };

  const handleRequestAction = async (groupId, userId, action) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/handle-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, action }),
      });

      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      // Cập nhật danh sách yêu cầu
      setPendingRequests((prevRequests) => prevRequests.filter((request) => request.user._id !== userId));

      showToast("Success", action === "accept" ? "Đã chấp nhận yêu cầu" : "Đã từ chối yêu cầu", "success");
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const renderPendingRequests = () => (
    <Stack spacing={4}>
      {pendingRequests.map((request) => (
        <Box key={request._id} p={4} borderWidth="1px" borderRadius="lg" _hover={{ bg: colorMode === "dark" ? "gray.700" : "gray.50" }}>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={4}>
              <Avatar src={request.user.profilePic} size="sm" />
              <Box>
                <Text fontWeight="bold">{request.user.username}</Text>
                <Badge colorScheme="blue">Đang chờ phê duyệt</Badge>
              </Box>
            </Flex>
            <Flex gap={2}>
              <Button colorScheme="green" size="sm" onClick={() => handleRequestAction(request.group, request.user._id, "accept")}>
                Chấp nhận
              </Button>
              <Button colorScheme="red" size="sm" onClick={() => handleRequestAction(request.group, request.user._id, "reject")}>
                Từ chối
              </Button>
            </Flex>
          </Flex>
        </Box>
      ))}
    </Stack>
  );
  const renderGroups = () => {
    if (loading) {
      return (
        <Flex justify="center">
          <Spinner size="xl" />
        </Flex>
      );
    }

    if (groups.length === 0) {
      return <Text>Chưa có nhóm nào được tạo.</Text>;
    }

    return (
      <Flex direction="column" gap={4}>
        {groups.map((group) => (
          <Box key={group._id} p={4} borderWidth="1px" borderRadius="lg" _hover={{ bg: colorMode === "dark" ? "gray.700" : "gray.50" }}>
            <Flex justify="space-between" align="center">
              <Box>
                <Heading size="md">
                  <Link to={`/groups/${group._id}`}>{group.name}</Link>
                </Heading>
                <Text mt={2}>{group.description}</Text>
                <Text mt={2} fontSize="sm" color="gray.500">
                  {group.members?.length || 0} thành viên
                </Text>
              </Box>
              {user && !group.members?.some((member) => member.user?._id === user._id || member.user === user._id) && (
                <Button colorScheme="teal" onClick={() => handleJoinRequest(group._id)}>
                  Tham gia
                </Button>
              )}
            </Flex>
          </Box>
        ))}
      </Flex>
    );
  };
  const renderMyGroups = () => {
    if (myGroups.length === 0) {
      return <Text>Bạn chưa tham gia nhóm nào.</Text>;
    }

    return (
      <Stack spacing={4}>
        {myGroups.map((group) => (
          <Box key={group._id} p={4} borderWidth="1px" borderRadius="lg" _hover={{ bg: colorMode === "dark" ? "gray.700" : "gray.50" }}>
            <Flex justify="space-between" align="center">
              <Box>
                <Heading size="md">
                  <Link to={`/groups/${group._id}`}>{group.name}</Link>
                </Heading>
                <Text mt={2}>{group.description}</Text>
                <Flex align="center" gap={2} mt={2}>
                  <Badge colorScheme="green">{group.admin === user._id ? "Admin" : "Thành viên"}</Badge>
                  <Text fontSize="sm" color="gray.500">
                    {group.members.length} thành viên
                  </Text>
                  {group.privacy === "private" && <Badge colorScheme="red">Riêng tư</Badge>}
                </Flex>
              </Box>
            </Flex>
          </Box>
        ))}
      </Stack>
    );
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box maxW="1100px" w={"1100px"} mx={"auto"} mt="20" p="4" bg={bgColor} boxShadow="lg" borderRadius="xl" marginLeft="-200px">
      <Tabs>
        <TabList>
          <Tab>Tất cả nhóm</Tab>
          <Tab>Nhóm của tôi</Tab>
          {user && <Tab>Yêu cầu tham gia</Tab>}
        </TabList>

        <TabPanels>
          <TabPanel>
            <Flex direction="column" gap={4}>
              <Flex justify="space-between" align="center">
                <Heading size="lg">Cộng đồng</Heading>
                {user && (
                  <Button colorScheme="teal" onClick={onOpen}>
                    Tạo nhóm mới
                  </Button>
                )}
              </Flex>
              {renderGroups()}
            </Flex>
          </TabPanel>

          <TabPanel> {renderMyGroups()}</TabPanel>

          <TabPanel> {renderPendingRequests()}</TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modal tạo nhóm mới */}
      <Modal isOpen={isOpen} onClose={onClose} size={"xl"} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tạo nhóm mới</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Tên nhóm</FormLabel>
              <Input value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} placeholder="Nhập tên nhóm" />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Mô tả</FormLabel>
              <Textarea value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} placeholder="Mô tả về nhóm" />
            </FormControl>

            <Button mt={4} colorScheme="blue" mr={3} onClick={handleCreateGroup} isDisabled={!newGroup.name.trim()}>
              Tạo nhóm
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CommunityPage;
