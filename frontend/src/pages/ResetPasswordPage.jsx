// frontend/src/pages/ResetPasswordPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
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

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    if (!form.email.trim()) return "Email is required.";
    if (!form.password) return "New password is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    setError(null);

    try {
      await api.post("/api/users/reset-password", {
        email: form.email.trim(),
        password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not reset password. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
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
        fontSize: "clamp(56px, 11vw, 110px)",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "-0.01em",
        lineHeight: 0.92,
        color: "#fff",
        marginBottom: 40,
        textAlign: "center",
      }}>
        Reset Password.
      </h1>

      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: 480,
        background: "#111",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "32px 32px 28px",
      }}>
        {success ? (
          /* ── Success state ── */
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "#fff", color: "#000",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 700, margin: "0 auto 20px",
            }}>
              ✓
            </div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 22, fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "0.06em", color: "#fff", margin: "0 0 12px",
            }}>
              Password Updated
            </h2>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 28 }}>
              Your password has been reset successfully.
            </p>
            <Link
              to="/login"
              style={{
                display: "inline-block", padding: "13px 40px",
                background: "#fff", color: "#000", borderRadius: 4,
                fontWeight: 700, fontSize: 13, letterSpacing: "0.1em",
                textTransform: "uppercase", textDecoration: "none",
                transition: "background 0.18s ease",
              }}
              onMouseEnter={e => (e.target.style.background = "#e0e0e0")}
              onMouseLeave={e => (e.target.style.background = "#fff")}
            >
              Back to Login
            </Link>
          </div>
        ) : (
          /* ── Reset form ── */
          <>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 22, fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "0.06em", color: "#fff", margin: "0 0 6px",
            }}>
              Set New Password
            </h2>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 28 }}>
              Enter your email and choose a new password.
            </p>

            {error && (
              <div style={{
                marginBottom: 20, padding: "12px 16px", borderRadius: 6, fontSize: 13,
                background: "rgba(255,60,60,0.12)", border: "1px solid rgba(255,60,60,0.25)",
                color: "#f87171",
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={LABEL} htmlFor="rp-email">Email</label>
                <input
                  id="rp-email" name="email" type="email"
                  placeholder="name@example.com"
                  value={form.email} onChange={handleChange}
                  style={INPUT}
                  onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
                  onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={LABEL} htmlFor="rp-password">New Password</label>
                  <input
                    id="rp-password" name="password" type="password"
                    placeholder="••••••••"
                    value={form.password} onChange={handleChange}
                    style={INPUT}
                    onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
                    onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                </div>
                <div>
                  <label style={LABEL} htmlFor="rp-confirm">Confirm</label>
                  <input
                    id="rp-confirm" name="confirm" type="password"
                    placeholder="••••••••"
                    value={form.confirm} onChange={handleChange}
                    style={INPUT}
                    onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
                    onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                style={{
                  width: "100%", padding: "14px",
                  background: loading ? "#ccc" : "#fff", color: "#000",
                  border: "none", borderRadius: 4, fontWeight: 700, fontSize: 13,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: 8, transition: "background 0.18s ease",
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={e => { if (!loading) e.target.style.background = "#e0e0e0"; }}
                onMouseLeave={e => { if (!loading) e.target.style.background = "#fff"; }}
              >
                {loading ? "Updating…" : "Reset Password"}
              </button>

              <Link to="/login" style={{
                alignSelf: "center", fontSize: 12, color: "#888",
                textDecoration: "underline", textUnderlineOffset: 3, marginTop: 4,
              }}>
                ← Back to Login
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
