import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

/* Shared input/label style tokens */
const INPUT = {
  width: "100%",
  display: "block",
  background: "#1a1a1a",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: "13px 16px",
  color: "#fff",
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.18s ease",
  boxSizing: "border-box",
};

const LABEL = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#888",
  marginBottom: 8,
};

export default function Contact() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const clearTimer = useRef(null);
  const revealRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!revealRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(revealRef.current);

    return () => observer.disconnect();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.includes("@")) return "Valid email is required";
    if (!form.message.trim()) return "Message is required";
    return null;
  };

  const showAlert = (a) => {
    setAlert(a);
    if (clearTimer.current) clearTimeout(clearTimer.current);
    if (a?.type === "success") {
      clearTimer.current = setTimeout(() => setAlert(null), 4000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return showAlert({ type: "danger", text: v });

    setLoading(true);
    showAlert(null);

    try {
      const messageBody = form.subject.trim()
        ? `Subject: ${form.subject.trim()}\n\n${form.message.trim()}`
        : form.message.trim();

      const res = await api.post("/api/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        message: messageBody,
      });

      showAlert({ type: "success", text: res.data?.message || "Message sent!" });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err.code === "ECONNABORTED" ? "Request timed out" : "Server error");
      showAlert({ type: "danger", text: msg });
    } finally {
      setLoading(false);
    }
  };

  const titleSlideFadeIn = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateX(0)" : "translateX(-90px)",
    transition: "opacity 0.8s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
  };

  const formSlideFadeIn = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateX(0)" : "translateX(-120px)",
    transition: "opacity 0.9s ease 0.12s, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.12s",
  };

  return (
    <div
      ref={revealRef}
      style={{
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "60px 24px 80px",
    }}>
      {/* ── Large heading ── */}
      <h1 style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "clamp(56px, 11vw, 120px)",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "-0.01em",
        lineHeight: 0.92,
        color: "var(--text-primary)",
        marginBottom: 48,
        textAlign: "center",
        ...titleSlideFadeIn,
      }}>
        Get In Touch
      </h1>

      {/* ── Card ── */}
      <div style={{
        width: "100%",
        maxWidth: 620,
        background: "#111",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "32px 32px 28px",
        ...formSlideFadeIn,
      }}>
        {/* Card header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h3 style={{ color: "#fff", fontWeight: 600, margin: 0, fontSize: 18 }}>
            General
          </h3>
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              width: 34,
              height: 34,
              borderRadius: 4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            ←
          </button>
        </div>

        {/* Alert */}
        {alert && (
          <div
            role="alert"
            aria-live="polite"
            style={{
              marginBottom: 20,
              padding: "12px 16px",
              borderRadius: 6,
              fontSize: 13,
              background: alert.type === "success"
                ? "rgba(0,200,80,0.12)"
                : "rgba(255,60,60,0.12)",
              border: `1px solid ${alert.type === "success" ? "rgba(0,200,80,0.25)" : "rgba(255,60,60,0.25)"}`,
              color: alert.type === "success" ? "#4ade80" : "#f87171",
            }}
          >
            {alert.text}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* NAME + Email — two columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={LABEL} htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                style={INPUT}
                onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
            <div>
              <label style={LABEL} htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@gmail.com"
                style={INPUT}
                onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          </div>

          {/* Subject */}
          <div style={{ marginBottom: 16 }}>
            <label style={LABEL} htmlFor="contact-subject">Subject</label>
            <input
              id="contact-subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Enter subject"
              style={INPUT}
              onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {/* Message */}
          <div style={{ marginBottom: 24 }}>
            <label style={LABEL} htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={8}
              placeholder="Enter message"
              className="contact-message-input"
              style={{ ...INPUT, resize: "vertical", minHeight: 180 }}
              onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {/* Submit */}
          <button
            className="contact-submit-btn basket-match-btn"
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 4,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.18s ease",
            }}
          >
            {loading ? "Sending…" : "Submit"}
          </button>
        </form>
      </div>

      {/* ── Map Section ── */}
      <div style={{
        width: "100%",
        maxWidth: 620,
        marginTop: 60,
        ...formSlideFadeIn,
      }}>
        <h2 style={{
          color: "#fff",
          fontWeight: 600,
          fontSize: 18,
          marginBottom: 20,
          textAlign: "center",
        }} className="contact-location-title">
          Our Location
        </h2>
        <div 
          onClick={() => {
            window.open(
              "https://www.google.com/maps/dir/?api=1&destination=134a+Aston+Road,+Birmingham,+UK&travelmode=driving",
              "_blank"
            );
          }}
          style={{
            background: "#111",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            overflow: "hidden",
            aspectRatio: "16 / 9",
            cursor: "pointer",
            transition: "border-color 0.18s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2428.6848396569256!2d-1.8945!3d52.5077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48709b4b4b7b7b7b%3A0x7b7b7b7b7b7b7b7b!2s134a%20Aston%20Rd%2C%20Birmingham%20B6%204BY!5e0!3m2!1sen!2suk!4v1234567890"
            width="100%"
            height="100%"
            style={{
              border: "none",
              borderRadius: 12,
              pointerEvents: "none",
            }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Our Location - 134a Aston Road, Birmingham, UK"
          />
        </div>
        <p style={{
          color: "#888",
          fontSize: 13,
          marginTop: 16,
          textAlign: "center",
        }}>
          134a Aston Road, Birmingham, UK
        </p>
      </div>
    </div>
  );
}
