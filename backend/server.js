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
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Rental Management API Running");
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/property", require("./routes/property"));
app.use("/api/booking", require("./routes/booking"));
app.use("/api/chat", require("./routes/chat"));
const PORT = process.env.PORT || 5000;

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  socket.on("join_conversation", async ({ conversationId }) => {
    try {
      const userId = (socket.user.id || socket.user._id).toString();
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const isParticipant =
        conversation.owner.toString() === userId ||
        conversation.tenant.toString() === userId;
      if (!isParticipant) return;

      socket.join(`conversation:${conversationId}`);
    } catch (error) {
      console.log("join_conversation error:", error.message);
    }
  });

  socket.on("leave_conversation", ({ conversationId }) => {
    socket.leave(`conversation:${conversationId}`);
  });
});

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
