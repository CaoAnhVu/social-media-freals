import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

export const getRecipientSocketId = (recipientId) => {
  return userSocketMap[recipientId];
};

const userSocketMap = {}; // userId: socketId

io.on("connection", (socket) => {
  console.log("user connected", socket.id);
  const userId = socket.handshake.query.userId;

  if (userId != "undefined") userSocketMap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
    try {
      await Message.updateMany({ conversationId: conversationId, seen: false }, { $set: { seen: true } });
      await Conversation.updateOne({ _id: conversationId }, { $set: { "lastMessage.seen": true } });
      io.to(userSocketMap[userId]).emit("messagesSeen", { conversationId });
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("deleteMessage", async ({ messageId, conversationId }) => {
    try {
      // Xóa tin nhắn từ database
      await Message.findByIdAndDelete(messageId);

      // Broadcast sự kiện xóa tin nhắn đến tất cả clients trong conversation
      io.emit("messageDeleted", { messageId, conversationId });
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, server, app };
