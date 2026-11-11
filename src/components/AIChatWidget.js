import React, { useState, useRef, useEffect } from "react";
import "../assets/css/AIChatWidget.css";
import { Link } from "react-router-dom";
import ExpertCardChat from "./ExpertCardChat";
import { renderAiInline } from "./AiInline";
import { sendMemberAiChat, toHistory } from "../services/chatai.api";
import { useSelector } from "react-redux";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content: `Xin chào! 👋 Mình là trợ lý AI của MajorGuide. Mình có thể giúp bạn:
- **Tư vấn chọn ngành** theo sở thích và thế mạnh
- Giải thích **kết quả bài test gần nhất** của bạn
- **Gợi ý giảng viên** phù hợp và tìm **lịch trống để đặt**
- Xem **lịch tư vấn của bạn** và giải đáp cách dùng website`,
  suggestions: [
    "Kết quả bài test gần nhất của mình nói gì?",
    "Gợi ý giảng viên phù hợp với mình",
    "Mình muốn đặt lịch tư vấn",
    "Lịch tư vấn sắp tới của mình",
  ],
  time: new Date(),
};

const TypingIndicator = () => (
  <div className="ai-msg-typing">
    <span></span>
    <span></span>
    <span></span>
  </div>
);

const AIChatWidget = () => {
  const isLogin = useSelector((state) => state.authClientReducer.isLogin);
  const userInfo = useSelector((state) => state.authClientReducer.loggedUser);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 500);
  }, []);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (question = inputValue.trim()) => {
    if (!question || isTyping) return;
    const reply = (content, extra = {}) =>
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-${Math.random()}`, role: "assistant", content, time: new Date(), ...extra },
      ]);

    if (!isLogin) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: question, time: new Date() }]);
      reply("Vui lòng bấm **Đăng nhập** ở góc trên bằng tài khoản học viên để sử dụng trợ lý tư vấn nghề nghiệp.", {
        isError: true,
      });
      setInputValue("");
      return;
    }
    if (userInfo?.role_name && userInfo.role_name !== "member") {
      reply("Trợ lý này dành cho học viên. Tài khoản admin/chuyên gia dùng MajorGuide Copilot trong trang quản trị.", { isError: true });
      return;
    }

    const history = toHistory(messages);
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: question, time: new Date() }]);
    setInputValue("");
    setIsTyping(true);

    try {
      const rs = await sendMemberAiChat(question, history);
      const data = rs.data?.data || {};
      reply(data.message || "Xin lỗi, mình chưa có câu trả lời. Bạn thử hỏi lại nhé.", {
        actions: Array.isArray(data.actions) ? data.actions : [],
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        (err.code === "ECONNABORTED" ? "AI phản hồi quá lâu. Vui lòng thử lại." : "") ||
        "Không thể kết nối với trợ lý AI. Vui lòng thử lại sau.";
      reply(typeof errorMessage === "string" ? errorMessage : "Không thể kết nối với trợ lý AI.", { isError: true });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessageContent = (content) => {
    if (!content) return null;
    return content.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={idx} />;
      const bullet = trimmed.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
      const heading = trimmed.match(/^#{1,4}\s+(.*)$/);
      if (heading) return <div key={idx} className="ai-msg-heading">{renderAiInline(heading[1])}</div>;
      if (bullet) return <div key={idx} className="ai-msg-bullet">{renderAiInline(bullet[1])}</div>;
      return <div key={idx}>{renderAiInline(trimmed)}</div>;
    });
  };

  const renderActions = (msg) => {
    const actions = msg.actions || [];
    const experts = actions.filter((action) => action.type === "experts").flatMap((action) => action.experts || []);
    const links = actions.filter((action) => action.type === "link");
    return (
      <>
        {!!experts.length && (
          <div className="ai-expert-list">
            <div className="ai-expert-list-scroll">
              {experts.map((expert) => <ExpertCardChat key={expert.id} expert={expert} />)}
            </div>
          </div>
        )}
        {!!links.length && (
          <div className="ai-action-links">
            {links.map((action) => (
              <Link key={action.href} to={action.href} className="ai-action-link">
                <i className="bi bi-arrow-right-circle"></i> {action.label}
              </Link>
            ))}
          </div>
        )}
        {!!msg.suggestions?.length && (
          <div className="ai-rag-followups">
            {msg.suggestions.map((suggestion) => (
              <button key={suggestion} onClick={() => handleSend(suggestion)} disabled={isTyping}>
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className={`ai-chat-container ${isVisible ? "visible" : ""}`}>
      {isOpen && (
        <div className="ai-chat-window">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-header-left">
              <div className="ai-avatar">
                <div className="ai-avatar-ring">
                  <div className="ai-avatar-inner">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2L2 7L12 12L22 7L12 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 17L12 22L22 17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 12L12 17L22 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="ai-header-info">
                <span className="ai-header-name">MajorGuide AI</span>
                <span className="ai-header-status">
                  <span className="ai-status-dot"></span>
                  Trực tuyến
                </span>
              </div>
            </div>
            <button
              className="ai-header-close"
              onClick={() => setIsOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="ai-chat-body">
            <div className="ai-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`ai-msg ai-msg-${msg.role}`}>
                  {msg.role === "assistant" && (
                    <div className="ai-msg-avatar">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 2L2 7L12 12L22 7L12 2Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 17L12 22L22 17"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 12L12 17L22 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="ai-msg-bubble">
                    <div className="ai-msg-content">
                      {renderMessageContent(msg.content)}
                      {renderActions(msg)}
                    </div>
                    <span className="ai-msg-time">{formatTime(msg.time)}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="ai-msg ai-msg-assistant">
                  <div className="ai-msg-avatar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2L2 7L12 12L22 7L12 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 17L12 22L22 17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 12L12 17L22 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="ai-msg-bubble">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggestions */}
          {/* {messages.length === 1 && (
                        <div className="ai-suggestions">
                            <span className="ai-suggestions-label">Gợi ý câu hỏi:</span>
                            <div className="ai-suggestions-list">
                                {SUGGESTED_QUESTIONS.map((q, idx) => (
                                    <button
                                        key={idx}
                                        className="ai-suggestion-btn"
                                        onClick={() => handleSend(q)}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                            <path d="M9.09 9A3 3 0 0 1 15 10C15 12 12 13 12 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                            <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
                                        </svg>
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )} */}

          {/* Input */}
          <div className="ai-chat-footer">
            <div className="ai-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                className="ai-input"
                placeholder="Nhập câu hỏi của bạn..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
              />
              <button
                className={`ai-send-btn ${inputValue.trim() ? "active" : ""}`}
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <p className="ai-footer-note">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 16V12M12 8H12.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              MajorGuide AI có thể đưa ra thông tin không chính xác. Hãy kiểm
              chứng kỹ.
            </p>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        className={`ai-fab ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Mở chat AI"
      >
        <div className="ai-fab-icon">
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 10h8M8 14h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
        <div className="ai-fab-pulse"></div>
        <div className="ai-fab-ring"></div>
      </button>
    </div>
  );
};

export default AIChatWidget;
