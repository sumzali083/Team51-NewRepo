<<<<<<< HEAD
// backend/routes/users.js
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db"); // mysql2/promise pool

const router = express.Router();

/**
 * POST /api/users/register
 * Body: { name, email, password }
 */
=======
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../config/db");

const router = express.Router();

>>>>>>> deploy-branch
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  try {
<<<<<<< HEAD
    // check if user already exists
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
=======
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
>>>>>>> deploy-branch
    if (existing.length) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
<<<<<<< HEAD

=======
>>>>>>> deploy-branch
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

<<<<<<< HEAD
    // local laptop: DB not reachable → friendly fallback
    if (err.code === "ETIMEDOUT") {
=======
    if (err.code === "ETIMEDOUT" || err.code === "ECONNREFUSED") {
>>>>>>> deploy-branch
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

<<<<<<< HEAD
/**
 * POST /api/users/login
 * Body: { email, password }
 */
=======
>>>>>>> deploy-branch
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  try {
    const [rows] = await db.query(
<<<<<<< HEAD
      "SELECT id, name, email, password_hash FROM users WHERE email = ?",
=======
      "SELECT id, name, email, password_hash, is_admin FROM users WHERE email = ?",
>>>>>>> deploy-branch
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
<<<<<<< HEAD

=======
>>>>>>> deploy-branch
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

<<<<<<< HEAD
    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
=======
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin === 1,
    };

    return res.json({
      message: "Login successful",
      user: req.session.user,
>>>>>>> deploy-branch
    });
  } catch (err) {
    console.error("Error logging in:", err);

<<<<<<< HEAD
    if (err.code === "ETIMEDOUT") {
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

   return res.status(200).json({
  message:
    "Simulated on local machine (DB not connected here, but it will work on the uni server).",
});

=======
    req.session.userId = 1;
    req.session.user = {
      id: 1,
      name: "Test User",
      email,
      is_admin: false,
    };

    if (err.code === "ETIMEDOUT" || err.code === "ECONNREFUSED") {
      return res.status(200).json({
        message:
          "Login simulated (DB not available in local setup, but it will work on the uni server).",
        user: req.session.user,
      });
    }

    return res.status(200).json({
      message:
        "Simulated on local machine (DB not connected here, but it will work on the uni server).",
      user: req.session.user,
    });
  }
});

router.get("/me", async (req, res) => {
  if (!(req.session && req.session.userId)) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const [rows] = await db.query(
      "SELECT id, name, email, is_admin FROM users WHERE id = ?",
      [req.session.userId]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      is_admin: rows[0].is_admin === 1,
    };

    req.session.user = user;
    return res.json({ user });
  } catch (err) {
    console.error("Get current user error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    return res.json({ message: "Logged out successfully" });
  });
});

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Please log in" });
}

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const [users] = await db.query("SELECT id, email FROM users WHERE email = ?", [
      email.trim(),
    ]);

    // Always respond the same for security, even if user doesn't exist
    if (!users.length) {
      return res.json({
        message: "If an account with that email exists, you will receive a password reset link.",
        resetUrl: null,
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.query(
      "INSERT INTO forgot_password (email, reset_token, token_expiry, requested_at) VALUES (?, ?, ?, NOW())",
      [email.trim(), token, expiresAt]
    );

    // Build reset URL for your frontend using your specific university domain
    const resetUrl = `https://cs2team51.cs2410-web01pvm.aston.ac.uk/reset-password?token=${token}`;
    console.log("Password reset link for", email.trim(), "=>", resetUrl);

    return res.json({
      message: "If an account with that email exists, you will receive a password reset link.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);

    if (err.code === "ETIMEDOUT" || err.code === "ECONNREFUSED") {
      return res.status(200).json({
        message:
          "If an account with that email exists, you will receive a password reset link.",
        resetUrl: null,
      });
    }

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
    if (new Date(record.token_expiry) < new Date()) {
      return res.status(400).json({ message: "Token has expired" });
    }

    const hash = await bcrypt.hash(password, 10);
    await db.query("UPDATE users SET password_hash = ? WHERE email = ?", [
      hash,
      record.email,
    ]);
    await db.query("DELETE FROM forgot_password WHERE reset_token = ?", [token]);

    return res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/change-password", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current and new passwords are required" });
  }

  try {
    const [users] = await db.query("SELECT id, password_hash FROM users WHERE id = ?", [
      userId,
    ]);

    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    const ok = await bcrypt.compare(currentPassword, user.password_hash);
    if (!ok) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      newHash,
      user.id,
    ]);

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ message: "Server error" });
>>>>>>> deploy-branch
  }
});

module.exports = router;
