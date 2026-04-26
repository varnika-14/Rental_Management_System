const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const getUserId = (req) => (req.user._id || req.user.id).toString();

const isParticipant = (conversation, userId) =>
  conversation.owner.toString() === userId ||
  conversation.tenant.toString() === userId;

exports.startConversation = async (req, res) => {
  try {
    const { ownerId, tenantId } = req.body;
    const requesterId = getUserId(req);

    if (!ownerId || !tenantId) {
      return res.status(400).json({ message: "Missing ownerId or tenantId" });
    }

    if (
      requesterId !== ownerId.toString() &&
      requesterId !== tenantId.toString()
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    let conversation = await Conversation.findOne({
      owner: ownerId,
      tenant: tenantId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        owner: ownerId,
        tenant: tenantId,
      });
    }

    const populated = await Conversation.findById(conversation._id)
      .populate("owner", "name email profilePhoto role")
      .populate("tenant", "name email profilePhoto role");

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = getUserId(req);
    const conversations = await Conversation.find({
      $or: [{ owner: userId }, { tenant: userId }],
    })
      .populate("owner", "name email profilePhoto role")
      .populate("tenant", "name email profilePhoto role")
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    const withUnreadCounts = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          sender: { $ne: userId },
          readBy: { $ne: userId },
        });

        const otherUser =
          conversation.owner._id.toString() === userId
            ? conversation.tenant
            : conversation.owner;

        return {
          ...conversation.toObject(),
          otherUser,
          unreadCount,
        };
      }),
    );

    res.json(withUnreadCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getConversationMessages = async (req, res) => {
  try {
    const userId = getUserId(req);
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!isParticipant(conversation, userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Message.updateMany(
      {
        conversation: conversation._id,
        sender: { $ne: userId },
        readBy: { $ne: userId },
      },
      { $addToSet: { readBy: userId } },
    );

    const messages = await Message.find({ conversation: conversation._id })
      .populate("sender", "name email profilePhoto role")
      .sort({ createdAt: 1 });

    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!isParticipant(conversation, userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: userId,
      text: text.trim(),
      readBy: [userId],
    });

    conversation.lastMessage = message.text;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "name email profilePhoto role",
    );

    const io = req.app.get("io");
    if (io) {
      const roomName = `conversation:${conversation._id}`;
      console.log(`Emitting new_message to room: ${roomName}`);

      io.to(roomName).emit("new_message", {
        conversationId: conversation._id.toString(),
        message: populatedMessage,
      });

      io.to(roomName).emit("conversation_updated", {
        conversationId: conversation._id.toString(),
      });
    } else {
      console.log("Socket.IO instance not found");
    }

    return res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ message: error.message });
  }
};
