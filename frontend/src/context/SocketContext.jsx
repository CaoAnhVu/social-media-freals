// frontend/src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    // Thay đổi điều kiện kiểm tra
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const user = useRecoilValue(userAtom);

  useEffect(() => {
    let newSocket;
    if (!user?._id) return;

    newSocket = io("http://localhost:5000", {
      query: {
        userId: user._id,
      },
      transports: ["websocket"],
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected", newSocket.id);
      newSocket.emit("register", {
        userId: user._id,
        socketId: newSocket.id,
      });
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user?._id]);
  const value = {
    socket,
    isConnected: !!socket?.connected,
  };
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
