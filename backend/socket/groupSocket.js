// socket/groupSocket.js
import { Server } from "socket.io";

export const setupGroupSocket = (io) => {
  io.on("connection", (socket) => {
    // Join group room
    socket.on("joinGroup", (groupId) => {
      socket.join(`group_${groupId}`);
    });

    // New post notification
    socket.on("newPost", (groupId) => {
      io.to(`group_${groupId}`).emit("refreshPosts");
    });

    // Real-time chat
    socket.on("groupMessage", (data) => {
      io.to(`group_${data.groupId}`).emit("newMessage", data);
    });
  });
};
