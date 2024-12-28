import { Box, Container } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import UserPage from "./pages/UserPage";
import PostPage from "./pages/PostPage";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import { useRecoilValue } from "recoil";
import userAtom from "./atoms/userAtom";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import CreatePost from "./components/CreatePost";
import ChatPage from "./pages/ChatPage";
import { SettingsPage } from "./pages/SettingsPage";
import CommunityPage from "./pages/CommunityPage";
import GroupPage from "./pages/GroupPage";

// import LogoutButton from "./components/LogoutButton";

function App() {
  const user = useRecoilValue(userAtom);
  const { pathname } = useLocation();

  return (
    <Box position={"relative"} w="full">
      <Container maxW={pathname === "/" ? { base: "620px", md: "1100px" } : "620px"}>
        <Header />
        <Sidebar />
        <Routes>
          <Route path="/" element={user ? <HomePage /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
          <Route path="/update" element={user ? <UpdateProfilePage /> : <Navigate to="/auth" />} />
          <Route
            path="/:username"
            element={
              user ? (
                <>
                  <UserPage />
                  <CreatePost />
                </>
              ) : (
                <UserPage />
              )
            }
          />
          <Route path="/posts/:pid" element={<PostPage />} />
          <Route path="/:username/post/:pid" element={<PostPage />} />
          <Route path="/chat" element={user ? <ChatPage /> : <Navigate to={"/auth"} />} />
          <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to={"/auth"} />} />
          <Route path="/community" element={user ? <CommunityPage /> : <Navigate to="/auth" />} />
          <Route path="/groups/:id" element={user ? <GroupPage /> : <Navigate to="/auth" />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
