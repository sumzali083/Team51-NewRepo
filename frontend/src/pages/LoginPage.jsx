// frontend/src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Login } from "../components/Login";
import { Registration } from "../components/Registration";

export default function LoginPage() {
<<<<<<< HEAD
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [prefillEmail, setPrefillEmail] = useState("");

  return (
    <main className="container mt-5" style={{ maxWidth: 600 }}>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 24,
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={() => setMode("login")}
          style={{
            padding: "10px 20px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            background: mode === "login" ? "#ff5a00" : "#333",
            color: "#fff",
          }}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          style={{
            padding: "10px 20px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            background: mode === "signup" ? "#ff5a00" : "#333",
            color: "#fff",
          }}
        >
          Sign Up
        </button>
      </div>

      {/* Card containing whichever form is active */}
      <div
        style={{
          background: "#111",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
        }}
      >
=======
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
        color: "#fff",
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
              background: mode === key ? "#fff" : "transparent",
              color: mode === key ? "#000" : "#888",
              border: "none",
              fontSize: 11,
              fontWeight: 700,
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
>>>>>>> deploy-branch
        {mode === "login" ? (
          <Login initialEmail={prefillEmail} />
        ) : (
          <Registration
            onSuccess={(email) => {
              setPrefillEmail(email);
<<<<<<< HEAD
              setMode("login"); // switch back to login after signup
=======
              setMode("login");
>>>>>>> deploy-branch
            }}
          />
        )}
      </div>
<<<<<<< HEAD
    </main>
=======
    </div>
>>>>>>> deploy-branch
  );
}
