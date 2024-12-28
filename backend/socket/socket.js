import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";
import User from "../models/userModel.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {}; // userId: socketId

// Thêm hàm getRecipientSocketId
const getRecipientSocketId = (recipientId) => {
  return userSocketMap[recipientId];
};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  // 1. Xử lý gửi tin nhắn mới
  socket.on("sendMessage", async ({ message, recipientId, conversationId }) => {
    try {
      const recipientSocketId = userSocketMap[recipientId];

      if (recipientSocketId) {
        // Gửi tin nhắn đến người nhận
        io.to(recipientSocketId).emit("newMessage", {
          ...message,
          conversationId,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // 2. Xử lý đánh dấu tin nhắn đã xem
  socket.on("markMessageAsSeen", async ({ conversationId, userId }) => {
    try {
      await Conversation.updateOne({ _id: conversationId }, { $set: { "lastMessage.seen": true } });

      const recipientSocketId = userSocketMap[userId];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("messageSeen", { conversationId });
      }
    } catch (error) {
      console.error("Error marking message as seen:", error);
    }
  });
  socket.on("register", async ({ userId, socketId }) => {
    try {
      console.log(`Registering user ${userId} with socket ${socketId}`);

      await User.findByIdAndUpdate(userId, {
        socketId: socket.id,
        online: true,
        lastSeen: new Date(),
      });

      userSocketMap[userId] = socket.id;

      io.emit("userOnline", { userId });
      io.emit("getOnlineUsers", Object.keys(userSocketMap));

      console.log("User registered successfully:", userId);
    } catch (error) {
      console.error("Error registering socket:", error);
    }
  });

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

  socket.on("disconnect", async () => {
    try {
      console.log("user disconnected");

      // Cập nhật trạng thái offline trong database
      if (userId !== "undefined") {
        await User.findByIdAndUpdate(userId, {
          socketId: null,
          online: false,
          lastSeen: new Date(),
        });
      }

      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      io.emit("userOffline", { userId });
    } catch (error) {
      console.error("Socket disconnect error:", error);
    }
  });
  socket.on("disconnect", async () => {
    try {
      const userId = Object.keys(userSocketMap).find((key) => userSocketMap[key] === socket.id);

      if (userId) {
        await User.findByIdAndUpdate(userId, {
          socketId: null,
          online: false,
          lastSeen: new Date(),
        });

        delete userSocketMap[userId];

        io.emit("userOffline", { userId });
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });
});

export { io, server, app, getRecipientSocketId };
