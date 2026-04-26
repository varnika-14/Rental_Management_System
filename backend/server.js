const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Conversation = require("./models/Conversation");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const path = require("path");

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://rental-management-system-var.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
  allowUpgrades: true,
  pingInterval: 10000,
  pingTimeout: 5000,
});

app.set("io", io);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://rental-management-system-var.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Rental Management API Running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/property", require("./routes/property"));
app.use("/api/booking", require("./routes/booking"));
app.use("/api/chat", require("./routes/chat"));

const PORT = process.env.PORT || 5000;

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.log("Socket connection rejected: No token");
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    console.log("Socket authenticated for user:", socket.user.id);
    next();
  } catch (error) {
    console.log("Socket authentication error:", error.message);
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.user?.id, "Socket ID:", socket.id);

  socket.on("join_conversation", async ({ conversationId }) => {
    try {
      const userId = (socket.user.id || socket.user._id).toString();
      console.log(
        `User ${userId} attempting to join conversation ${conversationId}`,
      );

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        console.log(`Conversation ${conversationId} not found`);
        return;
      }

      const isParticipant =
        conversation.owner.toString() === userId ||
        conversation.tenant.toString() === userId;

      if (!isParticipant) {
        console.log(
          `User ${userId} is not a participant of conversation ${conversationId}`,
        );
        return;
      }

      const roomName = `conversation:${conversationId}`;
      socket.join(roomName);
      console.log(`User ${userId} joined room: ${roomName}`);

      socket.to(roomName).emit("user_joined", { userId });
    } catch (error) {
      console.log("join_conversation error:", error.message);
    }
  });

  socket.on("leave_conversation", ({ conversationId }) => {
    const roomName = `conversation:${conversationId}`;
    socket.leave(roomName);
    console.log(`User ${socket.user?.id} left room: ${roomName}`);
  });

  socket.on("typing", ({ conversationId, isTyping }) => {
    const roomName = `conversation:${conversationId}`;
    socket.to(roomName).emit("user_typing", {
      userId: socket.user?.id,
      isTyping,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user?.id, "Socket ID:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.log("Socket connect error:", error.message);
  });
});

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await mongoose.disconnect();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
