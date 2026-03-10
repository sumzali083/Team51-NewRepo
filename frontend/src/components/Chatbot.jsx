<<<<<<< HEAD
import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm your shopping assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();

    // Products & Inventory
    if (msg.includes('product') || msg.includes('item') || msg.includes('clothes')) {
      return "We offer a wide range of clothing for Men, Women, and Kids! You can browse our collections from the navigation menu.";
    }
    if (msg.includes('men') && (msg.includes('clothing') || msg.includes('wear'))) {
      return "Our Men's collection includes hoodies, t-shirts, jackets, joggers, shorts, and accessories. Check out the 'Mens' section for all items!";
    }
    if (msg.includes('women') && (msg.includes('clothing') || msg.includes('wear'))) {
      return "Our Women's collection features crop tees, hoodies, jackets, joggers, and leggings. Visit the 'Womens' page to see our full range.";
    }
    if (msg.includes('kids') || msg.includes('children')) {
      return "We have a great Kids collection with hoodies, jackets, joggers, leggings, tees, and shorts. Head to the 'Kids' section to explore.";
    }

    // Pricing
    if (msg.includes('price') || msg.includes('cost') || msg.includes('expensive') || msg.includes('how much')) {
      return "Our prices range from £19.99 to £59.99 depending on the item. You can view specific prices on each product page.";
    }

    // Shipping & Delivery
    if (msg.includes('ship') || msg.includes('deliver')) {
      return "We offer standard shipping for £8.00 and free shipping on orders over £50! Delivery usually takes 3-5 business days.";
    }
    if (msg.includes('track') || msg.includes('order status')) {
      return "You can track your order by logging into your account and viewing your order history. You'll also receive tracking via email.";
    }

    // Sizing
    if (msg.includes('size') || msg.includes('sizing') || msg.includes('fit')) {
      return "Most of our items come in sizes XS, S, M, L, XL, and XXL. Each product page has a detailed size guide - check the 'Size Guide' tab!";
    }

    // Returns & Exchanges
    if (msg.includes('return') || msg.includes('exchange') || msg.includes('refund')) {
      return "We offer a 30-day return policy on all unworn items with tags attached. Exchanges are free, and refunds take 5-10 business days.";
    }

    // Payment
    if (msg.includes('payment') || msg.includes('pay') || msg.includes('card')) {
      return "We accept all major credit cards (Visa, Mastercard, Amex), debit cards, and PayPal. All payments are secure and encrypted.";
    }

    // Cart & Checkout
    if (msg.includes('cart') || msg.includes('basket') || msg.includes('checkout')) {
      return "You can add items to your cart and checkout anytime. Just click 'Add to Basket' on any product, then visit your cart to proceed.";
    }

    // Account
    if (msg.includes('account') || msg.includes('register') || msg.includes('sign up') || msg.includes('login')) {
      return "You can create an account to save your information, track orders, and checkout faster. Click 'Login/Profile' in the top right!";
    }

    // Contact & Support
    if (msg.includes('contact') || msg.includes('support') || msg.includes('help') || msg.includes('customer service')) {
      return "You can reach our customer support team through our Contact page. We're here to help Monday-Friday, 9am-5pm GMT.";
    }

    // About
    if (msg.includes('about') || msg.includes('company') || msg.includes('who are you')) {
      return "We're a family-owned clothing retailer dedicated to providing quality, comfortable, and stylish clothing for everyone.";
    }

    // Stock & Availability
    if (msg.includes('stock') || msg.includes('available') || msg.includes('out of stock')) {
      return "If an item is out of stock, you'll see a notification on the product page. We restock popular items regularly!";
    }

    // Discounts & Sales
    if (msg.includes('discount') || msg.includes('sale') || msg.includes('coupon') || msg.includes('promo')) {
      return "We regularly run sales and promotions! Sign up for our newsletter to be the first to know about discounts and special offers.";
    }

    // Greetings
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return "Hello! How can I assist you today? Feel free to ask me about our products, shipping, returns, or anything else!";
    }
    if (msg.includes('thank') || msg.includes('thanks')) {
      return "You're welcome! Is there anything else I can help you with today?";
    }
    if (msg.includes('bye') || msg.includes('goodbye')) {
      return "Goodbye! Thanks for visiting us today. Happy shopping! 👋";
    }

    // Default response
    return "I'm here to help! You can ask me about:\n• Our products and categories\n• Shipping and delivery\n• Sizing and fit guides\n• Returns and exchanges\n• Payment options\n• Order tracking\n• Account creation";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = {
        text: getBotResponse(input),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const quickQuestions = [
    "What products do you have?",
    "Shipping information",
    "Size guide",
    "Return policy"
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
    // Auto-send after 300ms
    setTimeout(() => {
      if (input === question) {
        const e = { preventDefault: () => {} };
        handleSend(e);
      }
    }, 300);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="header-content">
              <h3>Shopping Assistant</h3>
              <span className="status">
                <span className="status-dot"></span> Online
              </span>
            </div>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  {msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < msg.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="message bot-message">
                <div className="message-content typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 2 && (
            <div className="quick-questions">
              <p>Quick questions:</p>
              <div className="quick-buttons">
                {quickQuestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(q)}
                    className="quick-btn"
                    type="button"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form className="chatbot-input" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isTyping}
              autoFocus
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className={!input.trim() ? 'disabled' : ''}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
=======
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
>>>>>>> deploy-branch
  );
};

export default Chatbot;