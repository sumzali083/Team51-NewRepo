import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import "./Chatbot.css";

const Chatbot = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Hi there! I can help you find products. Try asking for category, price range, or stock.",
      products: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "show mens under 40 in stock",
    "find black hoodie",
    "womens between 20 and 60",
    "show low stock items",
    "kids in stock",
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    const userMessage = text?.trim();
    if (!userMessage || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: userMessage, products: [] }]);
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
          content:
            response.data?.response ||
            "I received your message, but I am not sure how to respond.",
          products: response.data?.products || [],
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "I couldn't fetch live information just now, but you can contact OSAI@aston.ac.uk. What else can I help with?",
          products: [],
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
      <div className="chatbot-header" onClick={() => setIsMinimized((prev) => !prev)}>
        <div className="chatbot-header-left">
          <div className="chatbot-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role === "user" ? "user-message" : "bot-message"}`}>
            <div className="message-content">
              <div>{msg.content}</div>

              {msg.role === "bot" && Array.isArray(msg.products) && msg.products.length > 0 && (
                <div className="chatbot-product-list">
                  {msg.products.map((p) => {
                    const stock = Number(p.stock || 0);
                    const isSoldOut = stock <= 0;
                    const isLowStock = stock > 0 && stock <= 5;

                    return (
                      <a key={p.sku || p.id} href={p.url} className="chatbot-product-card">
                        <div className="chatbot-product-top">
                          <span className="chatbot-product-name">{p.name}</span>
                          <span className="chatbot-product-price">GBP {Number(p.price || 0).toFixed(2)}</span>
                        </div>
                        <div className="chatbot-product-meta">
                          <span>{p.category}</span>
                          {isSoldOut ? (
                            <span className="chatbot-stock chatbot-stock-soldout">Sold out</span>
                          ) : isLowStock ? (
                            <span className="chatbot-stock chatbot-stock-low">Low stock: {stock}</span>
                          ) : (
                            <span className="chatbot-stock chatbot-stock-in">In stock</span>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
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

      <form className="chatbot-input-form" onSubmit={handleSubmit}>
        <input
          className="chatbot-input"
          type="text"
          placeholder="Ask for products, e.g. 'mens under 40 in stock'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="chatbot-send-btn" disabled={isLoading || !input.trim()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
