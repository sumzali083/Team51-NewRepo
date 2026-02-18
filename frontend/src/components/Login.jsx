import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CiUser } from "react-icons/ci";
import { RiLockPasswordLine } from "react-icons/ri";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

export function Login({ initialEmail = "" }) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/users/login", {
        email: email.trim(),
        password,
      });

      const user = res.data?.user;
      setMessage(res.data?.message || "Login successful");

      if (user) {
        login(user);
        localStorage.setItem("osaiUser", JSON.stringify(user));
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Login failed. Please check your details and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1
          style={{
            fontWeight: 800,
            fontSize: 26,
            marginBottom: 6,
            color: "#ff5a00",
          }}
        >
          Login
        </h1>
        <p style={{ color: "#bbb", fontSize: 15 }}>
          Please login to access our services!
        </p>
      </div>

      {error && (
        <div
          style={{
            background: "#5c1a1a",
            color: "#ffe5e5",
            padding: "10px 14px",
            borderRadius: 8,
            marginBottom: 12,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            background: "#1d3b21",
            color: "#e1ffe5",
            padding: "10px 14px",
            borderRadius: 8,
            marginBottom: 12,
            fontSize: 14,
          }}
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 18 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#222",
            borderRadius: 8,
            padding: "12px 16px",
            border: "1px solid #333",
          }}
        >
          <CiUser style={{ fontSize: 22, color: "#ff5a00", marginRight: 8 }} />
          <input
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: 16,
              flex: 1,
            }}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#222",
            borderRadius: 8,
            padding: "12px 16px",
            border: "1px solid #333",
          }}
        >
          <RiLockPasswordLine
            style={{ fontSize: 22, color: "#ff5a00", marginRight: 8 }}
          />
          <input
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: 16,
              flex: 1,
            }}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? "#aa4400" : "#ff5a00",
            color: "#fff",
            borderRadius: 8,
            padding: "13px 0",
            fontWeight: 700,
            fontSize: 17,
            border: "none",
            cursor: loading ? "default" : "pointer",
            marginTop: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,.10)",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <Link
            to="/forgot-password"
            style={{ color: "#ff5a00", textDecoration: "none", fontWeight: 600, fontSize: 14 }}
          >
            Forgot Password?
          </Link>
          <Link
            to="/account/change-password"
            style={{ color: "#ff5a00", textDecoration: "none", fontWeight: 600, fontSize: 14 }}
          >
            Change Password
          </Link>
        </div>
      </form>
    </div>
  );
}
