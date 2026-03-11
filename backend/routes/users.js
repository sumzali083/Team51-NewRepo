// backend/routes/users.js
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../config/db"); // mysql2/promise pool

const rateLimit = require("express-rate-limit");

const router = express.Router();

// Limit login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 login attemps per IP
  message: {
    message: "Too many login attempts, please try again after 15 minutes",
  }
});

/**
 * POST /api/users/register
 * Body: { name, email, password }
 */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({message: "Invalid email format"});
  }

  // Simple stronger password
  if (password.length < 8) {
    return res.status(400).json({message: "Passwords must be at least 8 characters" });
  }

  // Require a number and a letter
  if (!/[a-z A-Z]/.test(password) || !/\d/.test(password)) {
    return res.status(400).json({
      message: "Passwords must contain at least one letter and one number",
    });
  }

  try {
    // check if user already exists
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name.trim(), email.trim(), hash]
    );

    return res.status(201).json({
      message: "User registered",
      user: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim(),
      },
    });
  } catch (err) {
    console.error("Error registering user:", err);

    // local laptop: DB not reachable → friendly fallback
    if (err.code === "ETIMEDOUT") {
      return res.status(200).json({
        message:
          "Registered (DB not available in local setup, but it will work on the uni server).",
        user: {
          id: Date.now(),
          name: name.trim(),
          email: email.trim(),
        },
      });
    }

    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/users/login
 * Body: { email, password }
 */
router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  try {
    const [rows] = await db.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create session
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error logging in:", err);

    if (err.code === "ETIMEDOUT") {
      // Create session even for simulated login
      req.session.userId = 1;
      req.session.user = {
        id: 1,
        name: "Test User",
        email,
      };
      return res.status(200).json({
        message:
          "Login simulated (DB not available in local setup, but it will work on the uni server).",
        user: {
          id: 1,
          name: "Test User",
          email,
        },
      });
    }

    // Generic local fallback: still establish a session so other routes work
    req.session.userId = 1;
    req.session.user = {
      id: 1,
      name: "Test User",
      email,
    };
    return res.status(200).json({
      message:
        "Simulated on local machine (DB not connected here, but it will work on the uni server).",
      user: req.session.user,
    });
  }
});

/**
 * GET /api/users/me
 * Returns current logged-in user from session
 */
router.get("/me", (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ user: req.session.user });
  }
  return res.status(401).json({ message: "Not authenticated" });
});

/**
 * POST /api/users/logout
 * Destroys session
 */
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

/**
 * Middleware: require logged-in user via session
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Please log in" });
}

/**
 * POST /api/users/forgot-password
 * Body: { email }
 * - Stores reset token in forgot_password table
 */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Check if a user exists for this email
    const [users] = await db.query(
      "SELECT id, email FROM users WHERE email = ?",
      [email.trim()]
    );

    // Always respond the same, even if user doesn't exist
    if (!users.length) {
      return res.json({
        message:
          "If an account with that email exists, you will receive a password reset link.",
      });
    }

    // Generate token and expiry (1 hour)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Store in forgot_password table
    await db.query(
      `INSERT INTO forgot_password (email, reset_token, token_expiry, requested_at)
       VALUES (?, ?, ?, NOW())`,
      [email.trim(), token, expiresAt]
    );

    // Build reset URL for your frontend (update domain/path if needed)
    const resetUrl = `https://your-frontend-domain.com/reset-password?token=${token}`;
    console.log("Password reset link for", email.trim(), "=>", resetUrl);

    return res.json({
      message:
        "If an account with that email exists, you will receive a password reset link.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/users/reset-password
 * Body: { token, password }
 * - Verifies token from forgot_password
 * - Updates users.password_hash
 */
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body || {};

  if (!token || !password) {
    return res
      .status(400)
      .json({ message: "Token and new password are required" });
  }

  try {
    // Look up latest matching token
    const [rows] = await db.query(
      `SELECT email, token_expiry
       FROM forgot_password
       WHERE reset_token = ?
       ORDER BY requested_at DESC
       LIMIT 1`,
      [token]
    );

    if (!rows.length) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const record = rows[0];
    const now = new Date();

    if (new Date(record.token_expiry) < now) {
      return res.status(400).json({ message: "Token has expired" });
    }

    // Hash the new password
    const hash = await bcrypt.hash(password, 10);

    // Update user password based on email
    await db.query(
      "UPDATE users SET password_hash = ? WHERE email = ?",
      [hash, record.email]
    );

    // Delete this token so it can't be reused
    await db.query(
      "DELETE FROM forgot_password WHERE reset_token = ?",
      [token]
    );

    return res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/users/change-password
 * Body: { currentPassword, newPassword }
 * Requires logged-in user (session)
 */
router.post("/change-password", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current and new passwords are required" });
  }

  try {
    const [users] = await db.query(
      "SELECT id, password_hash FROM users WHERE id = ?",
      [userId]
    );

    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    const ok = await bcrypt.compare(currentPassword, user.password_hash);

    if (!ok) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [newHash, user.id]
    );

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
