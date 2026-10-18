import React, { useState, useRef, useEffect } from "react";
import "../assets/css/AIChatWidget.css";
import ExpertCardChat from "./ExpertCardChat";
import { sendAiChatClient } from "../services/chatai.api";
import { useSelector } from "react-redux";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content: `Xin chào! 👋 Tôi là trợ lý AI của MajorGuide. Tôi có thể giúp bạn:

Chúng ta trò truyện với nhau nhé?`,
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

  const parseContent = (content) => {
    if (typeof content !== "string") return null;
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  };

  const handleSend = async (question = inputValue.trim()) => {
    if (!question || isTyping) return;
    if (!isLogin) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "Vui lòng đăng nhập tài khoản học viên để sử dụng trợ lý tư vấn nghề nghiệp.",
          time: new Date(),
        },
      ]);
      return;
    }

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Gọi endpoint RAG: /api/v2/chat-ai/rag
      const history = messages
        .filter(
          (message) =>
            message.id !== "welcome" && typeof message.content === "string"
        )
        .slice(-8)
        .map((message) => ({
          role: message.role,
          content: message.content.slice(0, 1200),
        }));
      const rs = await sendAiChatClient(question, history);
      // BFF trả về: { data: { answer, context_used, results_count, query } }
      const rawData = rs.data?.data;

      let parsedData = null;
      if (rawData && typeof rawData === "object" && rawData.answer) {
        // RAG response: { answer, context_used, results_count, query }
        parsedData = rawData;
      } else if (rawData && typeof rawData === "object" && rawData.message) {
        // Tool response: { message, experts?, email1?, emailContent? }
        parsedData = rawData;
      } else if (typeof rawData === "string") {
        parsedData = parseContent(rawData);
      }

      // ── Trường hợp 1: expert list (từ tool all_expert) ──
      if (parsedData?.experts && Array.isArray(parsedData.experts)) {
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          time: new Date(),
          isExpertList: true,
          experts: parsedData.experts,
          content:
            parsedData.message ||
            `Tìm thấy ${parsedData.experts.length} chuyên gia phù hợp.`,
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, aiMsg]);
        return;
      }

      // ── Trường hợp 2: RAG response (answer) ──
      if (parsedData?.answer) {
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          time: new Date(),
          isExpertList: false,
          experts: null,
          content: parsedData.answer,
          sources: parsedData.sources || [],
          suggestions: parsedData.suggested_questions || [],
          retrieval: parsedData.retrieval,
          generation: parsedData.generation,
          disclaimer: parsedData.disclaimer,
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, aiMsg]);
        return;
      }

      // ── Trường hợp 3: fallback – plain text message ──
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        time: new Date(),
        isExpertList: false,
        experts: null,
        content: parsedData?.message || String(rawData) || "Không có phản hồi.",
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setIsTyping(false);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        (err.code === "ECONNABORTED"
          ? "AI phản hồi quá lâu. Vui lòng thử lại."
          : "") ||
        "Không thể kết nối với trợ lý AI. Vui lòng thử lại sau.";
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        time: new Date(),
        isExpertList: false,
        experts: null,
        content: errorMessage,
      };
      setMessages((prev) => [...prev, aiMsg]);
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
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={idx} />;

      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return <div key={idx}>{rendered}</div>;
    });
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
                    {msg.isExpertList ? (
                      <div className="ai-expert-list">
                        <div className="ai-expert-list-header">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                              stroke="#6366f1"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <circle
                              cx="9"
                              cy="7"
                              r="4"
                              stroke="#6366f1"
                              strokeWidth="2"
                            />
                            <path
                              d="M23 21v-2a4 4 0 0 0-3-3.87"
                              stroke="#6366f1"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M16 3.13a4 4 0 0 1 0 7.75"
                              stroke="#6366f1"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span>{msg.content}</span>
                        </div>
                        <div className="ai-expert-list-scroll">
                          {msg.experts.map((expert) => (
                            <ExpertCardChat key={expert.id} expert={expert} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="ai-msg-content">
                        {renderMessageContent(msg.content)}
                        {msg.generation === "fallback" && (
                          <div className="ai-rag-fallback">
                            <i className="bi bi-exclamation-triangle"></i> Groq
                            chưa khả dụng; đây là kết quả retrieval trực tiếp từ
                            kho nghề.
                          </div>
                        )}
                        {!!msg.sources?.length && (
                          <div className="ai-rag-sources">
                            <span>
                              <i className="bi bi-journal-text"></i> Nguồn nghề
                              nghiệp
                            </span>
                            {msg.sources.map((source) => (
                              <div key={source.id} className="ai-rag-source">
                                <b>
                                  [{source.id}] {source.title}
                                </b>
                                <small>
                                  {source.minimum_education ||
                                    "Chưa có thông tin học vấn tối thiểu"}
                                </small>
                              </div>
                            ))}
                          </div>
                        )}
                        {!!msg.suggestions?.length && (
                          <div className="ai-rag-followups">
                            {msg.suggestions.slice(0, 3).map((suggestion) => (
                              <button
                                key={suggestion}
                                onClick={() => handleSend(suggestion)}
                                disabled={isTyping}
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                        {msg.disclaimer && (
                          <small className="ai-rag-disclaimer">
                            {msg.disclaimer}
                          </small>
                        )}
                      </div>
                    )}
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
