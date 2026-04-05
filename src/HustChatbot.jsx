import React, { useState, useRef, useEffect } from "react";
import "./HustChatbot.css";

/* ===== SUGGESTED ===== */
const SUGGESTED_QUESTIONS = [
  "Điều kiện để được xét tốt nghiệp là gì?",
  "Sinh viên được phép đăng ký tối đa bao nhiêu tín chỉ?",
  "Quy định về bảo lưu kết quả học tập?",
  "Điều kiện cảnh báo học vụ là gì?",
];

/* ===== ICONS ===== */
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
  </svg>
);

const IconBot = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
  </svg>
);

const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

/* ===== COMPONENTS ===== */

function TypingIndicator() {
  return (
    <div>
      <div className="typing-dots">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
      <p className="loading-text">Đang tra cứu quy chế...</p>
    </div>
  );
}

function ChatMessage({ msg, isLoading }) {
  const isUser = msg.role === "user";

  return (
    <div className={`message-row ${isUser ? "user" : "bot"}`}>
      <div className="avatar">
        {isUser ? <IconUser /> : <IconBot />}
      </div>
      <div className="bubble">
        {isLoading ? <TypingIndicator /> : <p>{msg.content}</p>}
      </div>
    </div>
  );
}

function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled]);

  const send = () => {
    const v = value.trim();
    if (!v || disabled) return;
    onSend(v);
    setValue("");
  };

  return (
    <div className="input-area">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Nhập câu hỏi..."
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
      />
      <button onClick={send} disabled={disabled || !value.trim()}>
        <IconSend />
      </button>
    </div>
  );
}

/* ===== MAIN ===== */

export default function HustChatbot() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (content) => {
    const userMsg = {
      id: Date.now(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("https://tmkov-113-190-22-65.run.pinggy-free.link/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: content,
          // Cắt lấy 5 phần tử cuối cùng của mảng messages
          chat_history: messages.slice(-5), 
        }),
      });

      const data = await res.json();

      const botMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.answer,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "❌ Lỗi kết nối server!",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.length === 0 && (
          <div className="welcome">
            <h2>Xin chào 👋</h2>
            {SUGGESTED_QUESTIONS.map((q) => (
              <button key={q} onClick={() => handleSend(q)}>
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((m) => (
          <ChatMessage key={m.id} msg={m} />
        ))}

        {loading && (
          <ChatMessage msg={{ role: "assistant" }} isLoading />
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={loading} />
    </div>
  );
}