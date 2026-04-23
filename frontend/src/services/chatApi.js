import API from "./api";

export const startConversation = (payload) =>
  API.post("/chat/conversations/start", payload);

export const getConversations = () => API.get("/chat/conversations");

export const getConversationMessages = (conversationId) =>
  API.get(`/chat/conversations/${conversationId}/messages`);

export const sendConversationMessage = (conversationId, text) =>
  API.post(`/chat/conversations/${conversationId}/messages`, { text });
