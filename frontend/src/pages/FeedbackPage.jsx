// src/pages/FeedbackPage.jsx
import React, { useState, useRef } from "react";
import api from "../api";

const INPUT = {
  width: "100%",
  display: "block",
  background: "#1a1a1a",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: "13px 16px",
  color: "#fff",
  fontSize: 14,
  fontFamily: "'Inter', sans-serif",
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

export default function FeedbackPage() {
  const [form, setForm] = useState({ name: "", email: "", rating: 0, comment: "" });
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const clearTimer = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim()) return "Email is required";
    if (!form.rating || form.rating < 1 || form.rating > 5) return "Please select a rating";
    if (!form.comment.trim()) return "Comment is required";
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
      const res = await api.post("/api/feedback", {
        name: form.name.trim(),
        email: form.email.trim(),
        rating: form.rating,
        comment: form.comment.trim(),
      });
      showAlert({ type: "success", text: res.data?.message || "Feedback submitted — thank you!" });
      setForm({ name: "", email: "", rating: 0, comment: "" });
    } catch (err) {
      const msg = err?.response?.data?.message || "Server error submitting feedback";
      showAlert({ type: "danger", text: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ name: "", email: "", rating: 0, comment: "" });
    if (clearTimer.current) clearTimeout(clearTimer.current);
    setAlert(null);
  };

  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "60px 24px 80px",
    }}>
      {/* Large heading */}
      <h1 style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "clamp(56px, 11vw, 120px)",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "-0.01em",
        lineHeight: 0.92,
        color: "var(--text)",
        marginBottom: 48,
        textAlign: "center",
      }}>
        Your Feedback.
      </h1>

      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: 620,
        background: "#111",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "32px 32px 28px",
      }}>
        <h3 style={{ color: "#fff", fontWeight: 600, margin: "0 0 4px", fontSize: 18 }}>
          Share your thoughts
        </h3>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 28 }}>
          Tell us what you think about our products, website, or anything else.
        </p>

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
              background: alert.type === "success" ? "rgba(0,200,80,0.12)" : "rgba(255,60,60,0.12)",
              border: `1px solid ${alert.type === "success" ? "rgba(0,200,80,0.25)" : "rgba(255,60,60,0.25)"}`,
              color: alert.type === "success" ? "#4ade80" : "#f87171",
            }}
          >
            {alert.text}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Name + Email — two columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={LABEL} htmlFor="feedback-name">Name</label>
              <input
                id="feedback-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                style={INPUT}
                onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
                onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
            <div>
              <label style={LABEL} htmlFor="feedback-email">Email</label>
              <input
                id="feedback-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                style={INPUT}
                onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
                onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          </div>

          {/* Star rating */}
          <div>
            <label style={LABEL}>Rating</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= (hovered || form.rating);
                return (
                  <button
                    key={star}
                    type="button"
                    aria-label={`Rate ${star} out of 5`}
                    onClick={() => setForm((s) => ({ ...s, rating: star }))}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px 2px",
                      fontSize: 28,
                      color: filled ? "#d4af37" : "#333",
                      transition: "color 0.12s ease",
                      lineHeight: 1,
                    }}
                  >
                    ★
                  </button>
                );
              })}
              {form.rating > 0 && (
                <span style={{ alignSelf: "center", fontSize: 12, color: "#888", marginLeft: 4 }}>
                  {["", "Very bad", "Poor", "Okay", "Good", "Excellent"][form.rating]}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label style={LABEL} htmlFor="feedback-comment">Comment</label>
            <textarea
              id="feedback-comment"
              name="comment"
              value={form.comment}
              onChange={handleChange}
              rows={6}
              placeholder="Share your thoughts…"
              className="feedback-comment-input"
              style={{ ...INPUT, resize: "vertical", minHeight: 140 }}
              onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
              onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 4 }}>
            <button
              className="basket-match-btn"
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: 4,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.18s ease",
              }}
            >
              {loading ? "Sending…" : "Submit Feedback"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              style={{
                background: "transparent",
                border: "none",
                color: "#666",
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                padding: 0,
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
