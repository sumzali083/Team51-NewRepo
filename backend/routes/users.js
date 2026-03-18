// backend/routes/users.js
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const db = require("../config/db"); // mysql2/promise pool

const rateLimit = require("express-rate-limit");

const router = express.Router();

let mailTransporter = null;
let profileColsEnsured = false;
let authColsEnsured = false;

function getResetBaseUrl(req) {
  const envUrl = process.env.PASSWORD_RESET_BASE_URL || process.env.FRONTEND_URL;
  if (envUrl) return envUrl.replace(/\/+$/, "");

  const host = req.get("host");
  const proto = req.secure ? "https" : "http";
  return `${proto}://${host}`;
}

function getMailer() {
  if (mailTransporter) return mailTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  mailTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return mailTransporter;
}

async function ensureForgotPasswordTable() {
  await db.query(
    `CREATE TABLE IF NOT EXISTS forgot_password (
      id INT NOT NULL AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL,
      reset_token VARCHAR(255) NOT NULL,
      token_expiry DATETIME NOT NULL,
      requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_fp_email (email),
      KEY idx_fp_token (reset_token),
      KEY idx_fp_expiry (token_expiry)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci`
  );
}

async function columnExists(tableName, colName) {
  const [rows] = await db.query(
    `SELECT 1
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1`,
    [tableName, colName]
  );
  return rows.length > 0;
}

async function ensureUserProfileColumns() {
  if (profileColsEnsured) return;

  const columnsToAdd = [
    ["phone", "VARCHAR(30) NULL"],
    ["address_line1", "VARCHAR(255) NULL"],
    ["address_line2", "VARCHAR(255) NULL"],
    ["city", "VARCHAR(120) NULL"],
    ["postcode", "VARCHAR(32) NULL"],
  ];

  for (const [col, definition] of columnsToAdd) {
    const exists = await columnExists("users", col);
    if (!exists) {
      await db.query(`ALTER TABLE users ADD COLUMN ${col} ${definition}`);
    }
  }

  profileColsEnsured = true;
}

async function ensureAuthColumnsAndTables() {
  if (authColsEnsured) return;

  const hasMustChangePassword = await columnExists("users", "must_change_password");
  if (!hasMustChangePassword) {
    await db.query("ALTER TABLE users ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0");
  }

  await db.query(
    `CREATE TABLE IF NOT EXISTS admin_role_requests (
      id INT NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      reason VARCHAR(500) NULL,
      status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
      reviewed_by INT NULL,
      reviewed_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_admin_role_requests_user (user_id),
      KEY idx_admin_role_requests_status (status),
      KEY idx_admin_role_requests_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci`
  );

  authColsEnsured = true;
}

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
    await ensureAuthColumnsAndTables();
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
      "INSERT INTO users (name, email, password_hash, must_change_password) VALUES (?, ?, ?, 0)",
      [name.trim(), email.trim().toLowerCase(), hash]
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
    await ensureAuthColumnsAndTables();
    const [rows] = await db.query(
      "SELECT id, name, email, password_hash, is_admin, must_change_password FROM users WHERE email = ?",
      [email.trim().toLowerCase()]
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
      is_admin: user.is_admin === 1,
      must_change_password: Number(user.must_change_password) === 1,
    };

    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_admin: user.is_admin === 1,
        must_change_password: Number(user.must_change_password) === 1,
      },
    });
  } catch (err) {
    console.error("Error logging in:", err);

    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/users/me
 * Returns current logged-in user from session
 */
router.get("/me", async (req, res) => {
  if (!(req.session && req.session.userId)) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    await ensureUserProfileColumns();
    await ensureAuthColumnsAndTables();
    const [rows] = await db.query(
      `SELECT id, name, email, is_admin, must_change_password, phone, address_line1, address_line2, city, postcode
         FROM users
        WHERE id = ?
        LIMIT 1`,
      [req.session.userId]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      is_admin: Number(rows[0].is_admin) === 1,
      must_change_password: Number(rows[0].must_change_password) === 1,
      phone: rows[0].phone || "",
      address_line1: rows[0].address_line1 || "",
      address_line2: rows[0].address_line2 || "",
      city: rows[0].city || "",
      postcode: rows[0].postcode || "",
    };

    const [requestRows] = await db.query(
      `SELECT id, status, reason, reviewed_at, created_at
       FROM admin_role_requests
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );
    user.admin_role_request = requestRows.length ? requestRows[0] : null;

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin,
      must_change_password: user.must_change_password,
    };

    return res.json({ user });
  } catch (err) {
    console.error("Error loading user profile:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/users/me
 * Body: { name, email, phone, address_line1, address_line2, city, postcode }
 */
router.put("/me", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const {
    name,
    email,
    phone = "",
    address_line1 = "",
    address_line2 = "",
    city = "",
    postcode = "",
  } = req.body || {};

  const normalizedName = String(name || "").trim();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPhone = String(phone || "").trim();
  const normalizedAddress1 = String(address_line1 || "").trim();
  const normalizedAddress2 = String(address_line2 || "").trim();
  const normalizedCity = String(city || "").trim();
  const normalizedPostcode = String(postcode || "").trim();

  if (!normalizedName || !normalizedEmail) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (normalizedName.length > 120) {
    return res.status(400).json({ message: "Name is too long" });
  }
  if (normalizedPhone.length > 30) {
    return res.status(400).json({ message: "Phone is too long" });
  }
  if (
    normalizedAddress1.length > 255 ||
    normalizedAddress2.length > 255 ||
    normalizedCity.length > 120 ||
    normalizedPostcode.length > 32
  ) {
    return res.status(400).json({ message: "One or more fields are too long" });
  }

  try {
    await ensureUserProfileColumns();

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1",
      [normalizedEmail, userId]
    );
    if (existing.length) {
      return res.status(409).json({ message: "Email already in use" });
    }

    await db.query(
      `UPDATE users
          SET name = ?, email = ?, phone = ?, address_line1 = ?, address_line2 = ?, city = ?, postcode = ?
        WHERE id = ?`,
      [
        normalizedName,
        normalizedEmail,
        normalizedPhone || null,
        normalizedAddress1 || null,
        normalizedAddress2 || null,
        normalizedCity || null,
        normalizedPostcode || null,
        userId,
      ]
    );

    const updatedUser = {
      id: userId,
      name: normalizedName,
      email: normalizedEmail,
      is_admin: !!req.session.user?.is_admin,
      phone: normalizedPhone,
      address_line1: normalizedAddress1,
      address_line2: normalizedAddress2,
      city: normalizedCity,
      postcode: normalizedPostcode,
    };

    req.session.user = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      is_admin: updatedUser.is_admin,
      must_change_password: !!req.session.user?.must_change_password,
    };

    return res.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/users/me/details
 * Clears optional personal detail fields for the logged in user.
 */
router.delete("/me/details", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  try {
    await ensureUserProfileColumns();
    await db.query(
      `UPDATE users
          SET phone = NULL, address_line1 = NULL, address_line2 = NULL, city = NULL, postcode = NULL
        WHERE id = ?`,
      [userId]
    );
    return res.json({ message: "Personal details cleared" });
  } catch (err) {
    console.error("Clear profile details error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/users/admin-request
 * Body: { reason }
 * Create an admin role request for review by an existing admin.
 */
router.post("/admin-request", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const reason = String(req.body?.reason || "").trim();
  try {
    await ensureAuthColumnsAndTables();

    const [[userRow]] = await db.query(
      "SELECT id, is_admin FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    if (!userRow) return res.status(404).json({ message: "User not found" });
    if (Number(userRow.is_admin) === 1) {
      return res.status(400).json({ message: "You already have admin access." });
    }

    const [[pending]] = await db.query(
      `SELECT id FROM admin_role_requests
       WHERE user_id = ? AND status = 'pending'
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );
    if (pending) {
      return res.status(409).json({ message: "An admin request is already pending." });
    }

    const [result] = await db.query(
      "INSERT INTO admin_role_requests (user_id, reason, status) VALUES (?, ?, 'pending')",
      [userId, reason ? reason.slice(0, 500) : null]
    );

    return res.status(201).json({
      message: "Admin role request submitted.",
      requestId: result.insertId,
    });
  } catch (err) {
    console.error("Admin request create error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/users/admin-request
 * Returns latest admin role request for current user
 */
router.get("/admin-request", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  try {
    await ensureAuthColumnsAndTables();
    const [rows] = await db.query(
      `SELECT id, status, reason, reviewed_at, created_at
       FROM admin_role_requests
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );
    return res.json({ request: rows.length ? rows[0] : null });
  } catch (err) {
    console.error("Admin request fetch error:", err);
    return res.status(500).json({ message: "Server error" });
  }
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
    await ensureForgotPasswordTable();

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

    const resetBaseUrl = getResetBaseUrl(req);
    const resetUrl = `${resetBaseUrl}/reset-password?token=${token}`;

    const transporter = getMailer();
    if (transporter) {
      const from = process.env.SMTP_FROM || process.env.SMTP_USER;
      await transporter.sendMail({
        from,
        to: email.trim(),
        subject: "OSAI Password Reset",
        text: `You requested a password reset. Use this link within 60 minutes: ${resetUrl}`,
        html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 60 minutes.</p>`,
      });
    } else {
      // Fallback while SMTP is not configured.
      console.log("Password reset link for", email.trim(), "=>", resetUrl);
    }

    const payload = {
      message:
        "If an account with that email exists, you will receive a password reset link.",
    };

    if (!transporter && process.env.NODE_ENV !== "production") {
      payload.resetUrl = resetUrl;
    }

    return res.json(payload);
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
    await ensureForgotPasswordTable();

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
    await ensureAuthColumnsAndTables();
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
      "UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?",
      [newHash, user.id]
    );

    if (req.session?.user) {
      req.session.user.must_change_password = false;
    }

    return res.json({
      message: "Password updated successfully",
      user: req.session?.user || null,
    });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

