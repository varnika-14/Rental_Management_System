const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  startConversation,
  getConversations,
  getConversationMessages,
  sendMessage,
} = require("../controllers/chatController");

router.use(auth);

router.post("/conversations/start", startConversation);
router.get("/conversations", getConversations);
router.get("/conversations/:id/messages", getConversationMessages);
router.post("/conversations/:id/messages", sendMessage);

module.exports = router;
