import { useState, useRef, useEffect } from "react";
import "./HustChatbot.css";

const API_URL = "https://nonlocalized-unijugate-reatha.ngrok-free.dev/answer";

const SUGGESTED_QUESTIONS = [
  "Điều kiện để được xét tốt nghiệp là gì?",
  "Sinh viên được phép đăng ký tối đa bao nhiêu tín chỉ?",
  "Quy định về bảo lưu kết quả học tập?",
  "Điều kiện cảnh báo học vụ là gì?",
];

/* ── Icons ── */
const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IconBot = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M12 2v5" />
    <path d="M9 5l3-3 3 3" />
    <circle cx="8.5" cy="16" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="16" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
  </svg>
);

/* ── Simple markdown-like renderer (bold, newlines) ── */
function renderContent(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part.split("\n").map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

/* ── Typing dots ── */
function TypingDots() {
  return (
    <div className="typing-dots">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </div>
  );
}

/* ── Single message bubble ── */
function Message({ msg, isLoading }) {
  const isUser = msg.role === "user";
  return (
    <div className={`msg-row ${isUser ? "user" : "bot"}`}>
      <div className={`avatar ${isUser ? "user" : "bot"}`}>
        {isUser ? <IconUser /> : <IconBot />}
      </div>
      <div className={`bubble ${isUser ? "user" : "bot"}`}>
        {isLoading ? (
          <>
            <TypingDots />
            <span className="loading-label">Đang tra cứu...</span>
          </>
        ) : (
          <p>{renderContent(msg.content)}</p>
        )}
      </div>
    </div>
  );
}

/* ── Welcome screen ── */
function Welcome({ onSuggest }) {
  return (
    <div className="welcome">
      <div className="welcome-orb">
        <IconBot />
      </div>
      <div className="welcome-text">
        <h2>Xin chào!</h2>
        <p>Tôi có thể hỗ trợ tra cứu quy chế đào tạo của Đại học Bách khoa Hà Nội.</p>
      </div>
      <div className="suggestions">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button key={q} className="sug-btn" onClick={() => onSuggest(q)}>
            <span className="sug-icon">?</span>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function HustChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const adjustTextarea = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  const handleSend = async (content) => {
    const text = content ?? input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({
          query: text,
          chat_history: messages.slice(-6),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Không kết nối được server. Vui lòng thử lại." },
      ]);
    }

    setLoading(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="hc-page">
      <div className="hc-container">

        {/* Header */}
        <header className="hc-header">
          <div className="header-left">
            <div className="header-logo">
              <IconBot />
            </div>
            <div>
              <h1>HUST Chatbot</h1>
              <span className="header-sub">Tư vấn quy chế đào tạo</span>
            </div>
          </div>
          <div className="header-status">
            <span className="status-dot" />
            Trực tuyến
          </div>
        </header>

        {/* Messages */}
        <main className="hc-chat">
          {messages.length === 0 && !loading && (
            <Welcome onSuggest={handleSend} />
          )}

          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}

          {loading && (
            <Message msg={{ role: "assistant" }} isLoading />
          )}

          <div ref={bottomRef} />
        </main>

        {/* Input */}
        <footer className="hc-input-wrap">
          <div className="hc-input-box">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); adjustTextarea(); }}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi của bạn..."
              disabled={loading}
              rows={1}
            />
            <button
              className="hc-send-btn"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
            >
              <IconSend />
            </button>
          </div>
          <p className="hc-hint">Enter gửi · Shift+Enter xuống dòng</p>
        </footer>

      </div>
    </div>
  );
}
