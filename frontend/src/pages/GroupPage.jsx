// frontend/src/pages/GroupPage.jsx
import { Container, Tabs, TabList, Tab, TabPanels, TabPanel, VStack, Spinner, Box, Text } from "@chakra-ui/react";
import GroupPost from "../components/GroupPost";
import GroupEvent from "../components/GroupEvent";
import GroupFiles from "../components/GroupFiles";
import GroupMembers from "../components/GroupMembers";
import { useGroupPosts } from "../hooks/useGroupPosts";
import { useParams } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const GroupPage = () => {
  const { groupId } = useParams();
  const { posts } = useGroupPosts(groupId);
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/groups/${groupId}`);

        if (!response.ok) {
          throw new Error("Không thể tải thông tin nhóm");
        }

        const data = await response.json();
        setGroupDetails(data);
      } catch (error) {
        toast({
          title: "Lỗi",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId, toast]);

  if (loading) {
    return (
      <Container centerContent py={8}>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (!groupDetails) {
    return (
      <Container centerContent py={8}>
        <Text>Không tìm thấy thông tin nhóm</Text>
      </Container>
    );
  }
  const renderTabPanel = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" py={8}>
          <Spinner size="xl" />
        </Box>
      );
    }

    return (
      <TabPanels>
        {/* Posts Tab */}
        <TabPanel>
          <VStack spacing={4}>
            {posts.map((post) => (
              <GroupPost key={post._id} post={post} />
            ))}
          </VStack>
        </TabPanel>

        {/* Events Tab */}
        <TabPanel>
          <GroupEvent groupId={groupId} />
        </TabPanel>

        {/* Files Tab */}
        <TabPanel>
          <GroupFiles groupId={groupId} />
        </TabPanel>

        {/* Members Tab */}
        <TabPanel>
          <GroupMembers groupId={groupId} />
        </TabPanel>
      </TabPanels>
    );
  };

  return (
    <Container maxW="container.xl" py={8} mt={10}>
      <Tabs isLazy>
        <TabList mb={4}>
          <Tab>Bài viết</Tab>
          <Tab>Sự kiện</Tab>
          <Tab>Files</Tab>
          <Tab>Thành viên</Tab>
        </TabList>

        {renderTabPanel()}
      </Tabs>
    </Container>
  );
};

export default GroupPage;
