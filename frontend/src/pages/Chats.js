import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  getConversationMessages,
  getConversations,
  sendConversationMessage,
  startConversation,
} from "../services/chatApi";
import { connectSocket, getSocket } from "../services/socket";
import "../styles/chat.css";

function Chats() {
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryConversationId = searchParams.get("conversation");

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedConversationIdRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  };

  const formatTime = (value) =>
    new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await getConversations();
      const items = res.data || [];
      setConversations(items);

      if (items.length === 0) {
        setSelectedConversation(null);
        return;
      }

      if (queryConversationId) {
        const requested = items.find((c) => c._id === queryConversationId);
        if (requested) {
          setSelectedConversation(requested);
          return;
        }
      }

      if (selectedConversationIdRef.current) {
        const selected = items.find(
          (item) => item._id === selectedConversationIdRef.current,
        );
        if (selected) setSelectedConversation(selected);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) return;
    try {
      const res = await getConversationMessages(conversationId);
      setMessages(res.data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    const handleNewMessage = ({ conversationId, message }) => {
      console.log("New message received:", conversationId, message);

      if (selectedConversationIdRef.current === conversationId) {
        setMessages((prev) => {
          if (prev.some((item) => item._id === message._id)) return prev;
          return [...prev, message];
        });
        scrollToBottom();
      }
      loadConversations();
    };

    const handleConversationUpdated = ({ conversationId }) => {
      console.log("Conversation updated:", conversationId);
      loadConversations();
    };

    if (socket) {
      socket.on("new_message", handleNewMessage);
      socket.on("conversation_updated", handleConversationUpdated);
    }

    return () => {
      if (socket) {
        socket.off("new_message", handleNewMessage);
        socket.off("conversation_updated", handleConversationUpdated);
      }
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation?._id) {
      selectedConversationIdRef.current = selectedConversation._id;

      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit("join_conversation", {
          conversationId: selectedConversation._id,
        });
      }

      loadMessages(selectedConversation._id);
      loadConversations();

      return () => {
        const socket = getSocket();
        if (socket && socket.connected) {
          socket.emit("leave_conversation", {
            conversationId: selectedConversation._id,
          });
        }
      };
    }
    selectedConversationIdRef.current = null;
  }, [selectedConversation?._id]);

  const otherParticipant = useMemo(() => {
    if (!selectedConversation || !user?._id) return null;
    return selectedConversation.otherUser || selectedConversation;
  }, [selectedConversation, user?._id]);

  const handleSend = async () => {
    if (!messageText.trim() || !selectedConversation?._id || sending) return;
    try {
      setSending(true);
      const res = await sendConversationMessage(
        selectedConversation._id,
        messageText.trim(),
      );
      setMessages((prev) => {
        if (prev.some((item) => item._id === res.data._id)) return prev;
        return [...prev, res.data];
      });
      setMessageText("");
      scrollToBottom();
      await loadConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      alert(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="chat-page">
        <p>Loading chats...</p>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <h2 className="chat-heading">Chats</h2>
      <div
        className={`chat-layout ${selectedConversation ? "chat-open" : "chat-closed"}`}
      >
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">All Conversations</div>
          {conversations.length === 0 ? (
            <p className="chat-empty">
              No chats yet. Start from property screens.
            </p>
          ) : (
            conversations.map((conversation) => {
              const other = conversation.otherUser;
              return (
                <button
                  key={conversation._id}
                  type="button"
                  className={`chat-list-item ${
                    selectedConversation?._id === conversation._id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedConversation(conversation);
                  }}
                >
                  <div className="chat-list-top">
                    <div className="chat-avatar">
                      {getInitials(other?.name)}
                    </div>
                    <div className="chat-list-main">
                      <div className="chat-list-title">
                        {other?.name || "Unknown User"}
                      </div>
                    </div>
                    <div className="chat-list-time">
                      {conversation.lastMessageAt
                        ? formatTime(conversation.lastMessageAt)
                        : ""}
                    </div>
                  </div>
                  <div className="chat-list-last">
                    {conversation.lastMessage || "No messages yet"}
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="chat-unread-badge">
                      {conversation.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </aside>

        {selectedConversation && (
          <section className="chat-main">
            <div className="chat-main-header">
              <div className="chat-main-user">
                <div className="chat-avatar lg">
                  {getInitials(otherParticipant?.name)}
                </div>
                <div>
                  <h3>{otherParticipant?.name || "Chat"}</h3>
                </div>
              </div>
            </div>
            <div className="chat-messages">
              {messages.length === 0 ? (
                <p className="chat-empty-main">No messages yet.</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m._id}
                    className={`chat-bubble ${
                      m.sender?._id === user?._id ? "mine" : "theirs"
                    }`}
                  >
                    <p>{m.text}</p>
                    <span>{formatTime(m.createdAt)}</span>
                  </div>
                ))
              )}
              {messages.length > 0 && <div ref={messagesEndRef} />}
            </div>
            <div className="chat-input-row">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
              />
              <button type="button" onClick={handleSend} disabled={sending}>
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Chats;
