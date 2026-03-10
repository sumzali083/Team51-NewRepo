// src/pages/FeedbackPage.jsx
import React, { useState, useRef } from "react";
import api from "../api";

<<<<<<< HEAD
export default function FeedbackPage({ onNavigate }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    rating: "",
    comment: "",
  });

=======
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
>>>>>>> deploy-branch
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
<<<<<<< HEAD

    const ratingNum = Number(form.rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return "Rating must be between 1 and 5";
    }
    if (!form.comment || form.comment.trim() === "") {
      return "Comment is required";
    }
=======
    if (!form.rating || form.rating < 1 || form.rating > 5) return "Please select a rating";
    if (!form.comment.trim()) return "Comment is required";
>>>>>>> deploy-branch
    return null;
  };

  const showAlert = (a) => {
    setAlert(a);
    if (clearTimer.current) clearTimeout(clearTimer.current);
<<<<<<< HEAD
    if (a && a.type === "success") {
=======
    if (a?.type === "success") {
>>>>>>> deploy-branch
      clearTimer.current = setTimeout(() => setAlert(null), 4000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD

    const v = validate();
    if (v) {
      showAlert({ type: "danger", text: v });
      return;
    }
=======
    const v = validate();
    if (v) return showAlert({ type: "danger", text: v });
>>>>>>> deploy-branch

    setLoading(true);
    showAlert(null);

    try {
<<<<<<< HEAD
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        rating: Number(form.rating),
        comment: form.comment.trim(), // backend maps this to `comments` column
      };

      const res = await api.post("/api/feedback", payload);

      showAlert({
        type: "success",
        text: res.data?.message || "Feedback submitted.",
      });

      setForm({ name: "", email: "", rating: "", comment: "" });
    } catch (err) {
      console.error("FEEDBACK ERROR:", err);
      const msg =
        err?.response?.data?.message || "Server error submitting feedback";
=======
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
>>>>>>> deploy-branch
      showAlert({ type: "danger", text: msg });
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  return (
    <main className="container mt-5" style={{ maxWidth: 900 }}>
      <div className="p-4 bg-white rounded shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Send Us Feedback</h2>
          {typeof onNavigate === "function" && (
            <button
              className="btn btn-link text-decoration-none"
              onClick={(e) => {
                e.preventDefault();
                onNavigate(e, "home");
              }}
            >
              ← Back to Home
            </button>
          )}
        </div>

        <p className="text-muted">
          Tell us what you think about our products, website, or anything else.
        </p>

        {alert && (
          <div
            className={`alert alert-${alert.type} mt-2`}
            role="alert"
            aria-live="polite"
=======
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
        color: "#fff",
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
>>>>>>> deploy-branch
          >
            {alert.text}
          </div>
        )}

<<<<<<< HEAD
        <form onSubmit={handleSubmit} className="mt-3" noValidate>
          <div className="mb-3">
            <label htmlFor="feedback-name" className="form-label">
              Name
            </label>
            <input
              id="feedback-name"
              name="name"
              className="form-control"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="feedback-email" className="form-label">
              Email
            </label>
            <input
              id="feedback-email"
              name="email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="feedback-rating" className="form-label">
              Rating (1–5)
            </label>
            <select
              id="feedback-rating"
              name="rating"
              value={form.rating}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Choose a rating…</option>
              <option value="1">1 – Very bad</option>
              <option value="2">2</option>
              <option value="3">3 – Okay</option>
              <option value="4">4</option>
              <option value="5">5 – Excellent</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="feedback-comment" className="form-label">
              Comment
            </label>
=======
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
                      color: filled ? "#fff" : "#333",
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
>>>>>>> deploy-branch
            <textarea
              id="feedback-comment"
              name="comment"
              value={form.comment}
              onChange={handleChange}
<<<<<<< HEAD
              rows="5"
              className="form-control"
              placeholder="Share your thoughts…"
              required
            />
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-dark" disabled={loading}>
              {loading ? "Sending..." : "Submit Feedback"}
=======
              rows={6}
              placeholder="Share your thoughts…"
              style={{ ...INPUT, resize: "vertical", minHeight: 140 }}
              onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
              onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 4 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "14px",
                background: loading ? "#ccc" : "#fff",
                color: "#000",
                border: "none",
                borderRadius: 4,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.18s ease",
              }}
              onMouseEnter={e => { if (!loading) e.target.style.background = "#e0e0e0"; }}
              onMouseLeave={e => { if (!loading) e.target.style.background = "#fff"; }}
            >
              {loading ? "Sending…" : "Submit Feedback"}
>>>>>>> deploy-branch
            </button>

            <button
              type="button"
<<<<<<< HEAD
              className="btn btn-outline-secondary"
              onClick={() => {
                setForm({ name: "", email: "", rating: "", comment: "" });
                if (clearTimer.current) clearTimeout(clearTimer.current);
                setAlert(null);
              }}
              disabled={loading}
=======
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
>>>>>>> deploy-branch
            >
              Reset
            </button>
          </div>
        </form>
      </div>
<<<<<<< HEAD
    </main>
=======
    </div>
>>>>>>> deploy-branch
  );
}
