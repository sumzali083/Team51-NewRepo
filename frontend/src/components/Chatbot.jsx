import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import "./Chatbot.css";

const Chatbot = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Hi there! I'm here to help you with your shopping. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "Where are you located?",
    "How do I contact you?",
    "Shipping & delivery?",
    "Returns & refunds?",
    "Where is the sale?",
    "How do I search products?",
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    const userMessage = text?.trim();
    if (!userMessage || isLoading) return;

    // Add user message immediately
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post("/api/chatbot", {
        message: userMessage,
        conversationHistory: messages,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: response.data?.response ?? "I’ve received your message, but I’m not sure how to respond.",
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      // Softer fallback instead of “not connected”
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "I couldn't fetch live information just now, but you can reach OSAI Fashion at OSAI@aston.ac.uk or visit the Contact page. What else can I help with?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
  };

  const handleQuickQuestion = (q) => {
    sendMessage(q);
    if (isMinimized) setIsMinimized(false);
  };

  return (
    <div className={`chatbot-widget ${isMinimized ? "minimized" : ""}`}>
      {/* Header (always visible) */}
      <div
        className="chatbot-header"
        onClick={() => setIsMinimized((prev) => !prev)}
      >
        <div className="chatbot-header-left">
          <div className="chatbot-avatar">
            {/* Simple chat icon */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="chatbot-header-text">
            <h4>Customer Support</h4>
            <span className="chatbot-status">Online</span>
          </div>
        </div>
        <div className="chatbot-header-controls">
          <button
            type="button"
            className="chatbot-control-btn"
            aria-label={isMinimized ? "Open chat" : "Minimize chat"}
          >
            {isMinimized ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${
              msg.role === "user" ? "user-message" : "bot-message"
            }`}
          >
            <div className="message-content">{msg.content}</div>
          </div>
        ))}

        {isLoading && (
          <div className="message bot-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions – show when conversation is short */}
      {messages.length <= 2 && (
        <div className="chatbot-suggestions">
          <p className="chatbot-suggestions-label">Try asking:</p>
          <div className="chatbot-suggestions-buttons">
            {quickQuestions.map((q) => (
              <button
                key={q}
                type="button"
                className="chatbot-suggestion-btn"
                onClick={() => handleQuickQuestion(q)}
                disabled={isLoading}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form className="chatbot-input-form" onSubmit={handleSubmit}>
        <input
          className="chatbot-input"
          type="text"
          placeholder="Ask anything about this site..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="chatbot-send-btn"
          disabled={isLoading || !input.trim()}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
