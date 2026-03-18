// frontend/src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Login } from "../components/Login";
import { Registration } from "../components/Registration";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [prefillEmail, setPrefillEmail] = useState("");

  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "60px 24px 80px",
    }}>
      {/* Large heading — changes with mode */}
      <h1 style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "clamp(56px, 11vw, 110px)",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "-0.01em",
        lineHeight: 0.92,
        color: "var(--text-primary)",
        marginBottom: 40,
        textAlign: "center",
      }}>
        {mode === "login" ? "Welcome Back." : "Join OSAI."}
      </h1>

      {/* Login / Sign Up toggle */}
      <div style={{
        display: "flex",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 32,
      }}>
        {[
          { key: "login",  label: "Login"   },
          { key: "signup", label: "Sign Up" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            style={{
              padding: "10px 36px",
              background: mode === key ? "#000" : "#141414",
              color: "#fff",
              border: "none",
              fontSize: 11,
              fontWeight: 700,
              opacity: mode === key ? 1 : 0.82,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "background 0.18s ease, color 0.18s ease",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Form card */}
      <div style={{
        width: "100%",
        maxWidth: 480,
        background: "#111",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "32px 32px 28px",
      }}>
        {mode === "login" ? (
          <Login initialEmail={prefillEmail} />
        ) : (
          <Registration
            onSuccess={(email) => {
              setPrefillEmail(email);
              setMode("login");
            }}
          />
        )}
      </div>
    </div>
  );
}
