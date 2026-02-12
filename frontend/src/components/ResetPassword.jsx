import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
    <div style={{ maxWidth: 400, margin: "40px auto", color: "#fff" }}>
      <h2>Reset Password</h2>

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
            style={{ width: "100%", padding: 10 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: "10px 16px" }}>
          {loading ? "Saving..." : "Set new password"}
        </button>
      </form>
    </div>
  );
}

