import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { messageAPI } from "../../services/api";
import "./MessageManagement.css";

const MessageManagement = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const res = await messageAPI.getConversations();
        const conversations = (res.data.data || []).map((msg) => ({
          id: msg.conversation_partner,
          participant: {
            id: msg.conversation_partner,
            username: msg.partner_username,
            display_name: msg.partner_display_name,
            avatar_config: msg.partner_avatar,
          },
        }));
        setConversations(conversations);
        if (conversations.length > 0) {
          setSelectedConversation(conversations[0]);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;

      try {
        setIsLoading(true);
        const res = await messageAPI.getMessages(
          selectedConversation.participant.id,
        );
        setMessages(res.data.data || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [selectedConversation?.participant?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedConversation) return;

    try {
      console.log("Sending message to:", selectedConversation.participant.id);
      console.log("Message content:", newMessage);
      const res = await messageAPI.sendMessage({
        receiver_id: selectedConversation.participant.id,
        content: newMessage,
      });

      console.log("Message sent response:", res);
      setMessages([...messages, res.data.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Error response:", error.response?.data);
      alert("Lỗi khi gửi tin nhắn!");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Bạn có chắc muốn xóa tin nhắn này?")) return;

    try {
      await messageAPI.deleteMessage(messageId);
      setMessages(messages.filter((m) => m.id !== messageId));
      alert("Đã xóa tin nhắn!");
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Lỗi khi xóa tin nhắn!");
    }
  };

  return (
    <div
      className="message-management"
      style={{ maxWidth: "1200px", margin: "0 auto" }}
    >
      <h1 style={{ marginBottom: "30px" }}>💬 Quản lý tin nhắn</h1>

      <div
        className="message-container"
        style={{ display: "flex", gap: "20px", height: "70vh" }}
      >
        <div
          className="conversations-sidebar card"
          style={{ flex: "0 0 300px", overflow: "auto" }}
        >
          <h3 style={{ marginBottom: "20px" }}>Cuộc trò chuyện</h3>
          {conversations.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "var(--text-secondary)",
              }}
            >
              <p>Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            <div className="conversations-list">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`conversation-item ${
                    selectedConversation?.id === conv.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                  style={{
                    padding: "12px",
                    marginBottom: "8px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor:
                      selectedConversation?.id === conv.id
                        ? "var(--accent-color)"
                        : "var(--bg-secondary)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div className="conv-header">
                    <div className="conv-avatar">
                      {conv.participant?.display_name?.[0]?.toUpperCase() ||
                        "?"}
                    </div>
                    <div className="conv-info">
                      <h4>{conv.participant?.display_name}</h4>
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        @{conv.participant?.username}
                      </p>
                    </div>
                  </div>
                  {conv.last_message && (
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        marginTop: "8px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {conv.last_message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div
          className="chat-window card"
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div
                style={{
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "16px",
                  marginBottom: "16px",
                }}
              >
                <h3>{selectedConversation.participant?.display_name}</h3>
                <p
                  style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
                >
                  @{selectedConversation.participant?.username}
                </p>
              </div>

              <div
                className="messages-area"
                style={{ flex: 1, overflow: "auto", marginBottom: "16px" }}
              >
                {messages.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <p>Chưa có tin nhắn nào</p>
                    <p>Hãy bắt đầu cuộc trò chuyện!</p>
                  </div>
                ) : (
                  <div className="messages-list">
                    {[...messages]
                      .sort(
                        (a, b) =>
                          new Date(a.created_at) - new Date(b.created_at),
                      )
                      .map((msg) => {
                        const isOwn = msg.sender_id === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`message-item ${
                              isOwn ? "own" : "other"
                            }`}
                            style={{
                              marginBottom: "12px",
                              display: "flex",
                              justifyContent: isOwn ? "flex-end" : "flex-start",
                              alignItems: "flex-end",
                              gap: "8px",
                            }}
                          >
                            {!isOwn && (
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  backgroundColor: "var(--accent-color)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontSize: "0.9rem",
                                }}
                              >
                                {selectedConversation.participant?.display_name?.[0]?.toUpperCase() ||
                                  "?"}
                              </div>
                            )}

                            <div
                              className="message-bubble"
                              style={{
                                maxWidth: "60%",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                backgroundColor: isOwn
                                  ? "var(--accent-color)"
                                  : "var(--bg-secondary)",
                                color: isOwn ? "white" : "var(--text-primary)",
                                wordBreak: "break-word",
                                position: "relative",
                                group: "hover",
                              }}
                            >
                              <p style={{ margin: 0, marginBottom: "4px" }}>
                                {msg.content}
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "0.75rem",
                                  color: isOwn
                                    ? "rgba(255,255,255,0.7)"
                                    : "var(--text-secondary)",
                                }}
                              >
                                {new Date(msg.created_at).toLocaleTimeString()}
                              </p>

                              {isOwn && (
                                <button
                                  className="delete-btn"
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  style={{
                                    position: "absolute",
                                    top: "-10px",
                                    right: "-10px",
                                    background: "var(--danger-color)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "24px",
                                    height: "24px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.8rem",
                                    opacity: 0,
                                    transition: "opacity 0.2s",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.target.style.opacity = 1)
                                  }
                                  onMouseLeave={(e) =>
                                    (e.target.style.opacity = 0)
                                  }
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                style={{ display: "flex", gap: "8px" }}
              >
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary">
                  Gửi
                </button>
              </form>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--text-secondary)",
              }}
            >
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageManagement;
