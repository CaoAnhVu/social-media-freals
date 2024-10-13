import UserHeader from "../components/UserHeader";
import UserPost from "../components/UserPost";

const UserPage = () => {
  return (
    <>
      <UserHeader />
      <UserPost likes={1200} replies={481} postImg="/fontend/public/post1.png" postTitle="Let's talk about freals." />
      <UserPost likes={451} replies={12} postImg="/fontend/public/post2.png" postTitle="Nice tutorial." />
      <UserPost likes={321} replies={989} postImg="/fontend/public/post3.png" postTitle="I like post." />
      <UserPost likes={212} replies={56} postTitle="This is my first Freals." />
    </>
  );
};
export default UserPage;
