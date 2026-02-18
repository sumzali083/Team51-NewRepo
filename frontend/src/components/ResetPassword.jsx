import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../api";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }
    if (!password || !confirm) {
      setError("Please fill in both password fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/users/reset-password", {
        token,
        password,
      });
      setMessage(res.data?.message || "Password reset successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Reset password error:", err);
      const msg =
        err?.response?.data?.message || "Could not reset password. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto" }}>
      <div
        style={{
          background: "#111",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
          color: "#fff",
        }}
      >
        <h2 style={{ color: "#ff5a00", fontWeight: 800, marginBottom: 8 }}>
          Reset Password
        </h2>
        <p style={{ color: "#bbb", marginBottom: 16 }}>
          Enter and confirm your new password.
        </p>

        {error && (
          <div style={{ background: "#5c1a1a", padding: 10, marginBottom: 10 }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ background: "#1d3b21", padding: 10, marginBottom: 10 }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "1px solid #333",
                background: "#222",
                color: "#fff",
              }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "1px solid #333",
                background: "#222",
                color: "#fff",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#aa4400" : "#ff5a00",
              color: "#fff",
              borderRadius: 8,
              padding: "12px 18px",
              fontWeight: 700,
              border: "none",
            }}
          >
            {loading ? "Saving..." : "Set new password"}
          </button>
        </form>

        <div style={{ marginTop: 12 }}>
          <Link to="/login" style={{ color: "#ff5a00", textDecoration: "none", fontWeight: 600 }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
