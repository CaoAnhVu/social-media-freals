// frontend/src/components/GroupMembers.jsx
import { VStack, Avatar, Text, HStack, Box, Spinner, Button, useToast, Badge, Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const GroupMembers = ({ groupId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useRecoilValue(userAtom);
  const toast = useToast();

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`);
      if (!response.ok) {
        throw new Error("Không thể tải danh sách thành viên");
      }
      const data = await response.json();
      setMembers(data);
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
    fetchMembers();
  }, [fetchMembers]);

  const handleRemoveMember = async (memberId) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Không thể xóa thành viên");
      }

      setMembers(members.filter((member) => member._id !== memberId));
      toast({
        title: "Thành công",
        description: "Đã xóa thành viên khỏi nhóm",
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

  const handleChangeRole = async (memberId, newRole) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members/${memberId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật vai trò");
      }

      setMembers(members.map((member) => (member._id === memberId ? { ...member, role: newRole } : member)));
      toast({
        title: "Thành công",
        description: "Đã cập nhật vai trò thành viên",
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between" mb={4}>
        <Text fontSize="lg" fontWeight="bold">
          Thành viên ({members.length})
        </Text>
        <Button size="sm" colorScheme="teal">
          Mời thêm
        </Button>
      </HStack>

      {members.map((member) => (
        <Box key={member._id} p={4} borderWidth="1px" borderRadius="lg">
          <HStack justify="space-between">
            <HStack spacing={4}>
              <Avatar src={member.profilePic} name={member.username} />
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold">{member.username}</Text>
                <Badge colorScheme={member.role === "admin" ? "red" : "green"}>{member.role === "admin" ? "Quản trị viên" : "Thành viên"}</Badge>
              </VStack>
            </HStack>

            {currentUser?._id !== member._id && currentUser?.role === "admin" && (
              <Menu>
                <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                <MenuList>
                  <MenuItem onClick={() => handleChangeRole(member._id, member.role === "admin" ? "member" : "admin")}>
                    {member.role === "admin" ? "Hủy quyền quản trị" : "Thêm quyền quản trị"}
                  </MenuItem>
                  <MenuItem onClick={() => handleRemoveMember(member._id)}>Xóa khỏi nhóm</MenuItem>
                </MenuList>
              </Menu>
            )}
          </HStack>
        </Box>
      ))}
    </VStack>
  );
};

export default GroupMembers;
