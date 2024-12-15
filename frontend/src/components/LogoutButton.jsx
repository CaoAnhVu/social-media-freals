// import { useSetRecoilState } from "recoil";
// import userAtom from "../atoms/userAtom";
// import useShowToast from "../hooks/useShowToast";

// const LogoutButton = () => {
//   const setUser = useSetRecoilState(userAtom);
//   const showToast = useShowToast();

//   const handleLogout = async () => {
//     try {
//       const res = await fetch("/api/users/logout", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       const data = await res.json();

//       if (data.error) {
//         showToast("Error", data.error, "error");
//         return;
//       }

//       localStorage.removeItem("user-freals");
//       setUser(null);
//     } catch (error) {
//       showToast("Error", error, "error");
//     }
//   };
// };

// export default LogoutButton;
