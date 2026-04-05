import { useState } from "react";
import "./HustChatbot.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import logo from './logo.jpg';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput("");

    try {
      const res = await fetch("https://nonlocalized-unijugate-reatha.ngrok-free.dev/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420"
        },
        body: JSON.stringify({
          query: input,
          chat_history: messages,
        }),
      });

      const data = await res.json();

      const botMessage = {
        role: "assistant", // Bạn có thể giữ nguyên là assistant từ backend
        content: data.answer,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi kết nối server!");
    }

    setLoading(false);
  };

  return (
    <div className="hust-chatbot-page">
      <div className="chat-container">
        
        {/* HEADER */}
        <div className="chat-header">
          <div className="header-info">
            <img 
              src={logo}
              alt="HUST logo" 
              className="header-logo"
            />
            <h1>HUST Chatbot</h1>
            <p>Tư vấn quy chế đào tạo</p>
          </div>
        </div>

        {/* CHAT BOX */}
        <div className="chat-box">
          <div className="messages-list">

            {messages.length === 0 && (
              <div className="welcome">
                <h2>Xin chào 👋</h2>
                <p className="welcome-desc">
                  Hỏi tôi về quy chế đào tạo HUST
                </p>
              </div>
            )}

            {messages.map((msg, index) => {
              // SỬA LỖI Ở ĐÂY: Xác định class dựa trên role
              const isUser = msg.role === "user";
              const roleClass = isUser ? "user" : "bot"; // Tự động chuyển 'assistant' thành 'bot' cho CSS

              return (
                <div
                  key={index}
                  className={`message-row ${roleClass}`}
                >
                  <div className={`avatar ${roleClass}`}>
                    {isUser ? "U" : "B"}
                  </div>

                  <div className={`bubble ${roleClass}`}>
                    <div className="bubble">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading animation */}
            {loading && (
              <div className="message-row bot">
                <div className="avatar bot">B</div>
                <div className="bubble bot">
                  <div className="typing-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                  <p>Đang tra cứu thông tin...</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* INPUT */}
        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              placeholder="Nhập câu hỏi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={loading}
            >
              ➤
            </button>
          </div>

          <div className="input-footer">
            Enter để gửi • Chatbot HUST
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;