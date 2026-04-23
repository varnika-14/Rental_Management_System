const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Property = require("../models/Property");

const getUserId = (req) => (req.user._id || req.user.id).toString();

const isParticipant = (conversation, userId) =>
  conversation.owner.toString() === userId ||
  conversation.tenant.toString() === userId;

exports.startConversation = async (req, res) => {
  try {
    const { propertyId, ownerId, tenantId } = req.body;
    const requesterId = getUserId(req);

    if (!propertyId || !ownerId || !tenantId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (requesterId !== ownerId.toString() && requesterId !== tenantId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const property = await Property.findById(propertyId).select("owner");
    if (!property) return res.status(404).json({ message: "Property not found" });
    if (property.owner.toString() !== ownerId.toString()) {
      return res.status(400).json({ message: "Owner does not match property" });
    }

    let conversation = await Conversation.findOne({
      property: propertyId,
      owner: ownerId,
      tenant: tenantId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        property: propertyId,
        owner: ownerId,
        tenant: tenantId,
      });
    }

    const populated = await Conversation.findById(conversation._id)
      .populate("property", "title location")
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
      .populate("property", "title location")
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

        return {
          ...conversation.toObject(),
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
      io.to(`conversation:${conversation._id}`).emit("new_message", {
        conversationId: conversation._id.toString(),
        message: populatedMessage,
      });
      io.to(`conversation:${conversation._id}`).emit("conversation_updated", {
        conversationId: conversation._id.toString(),
      });
    }

    return res.status(201).json(populatedMessage);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
