// backend/middleware/adminMiddleware.js
const db = require("../config/db");

function normalizeTinyIntFlag(value) {
  if (Buffer.isBuffer(value)) {
    return value.length > 0 && value[0] === 1;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true";
  }
  return Number(value) === 1;
}

async function adminMiddleware(req, res, next) {
  try {
    const userId = Number(req.session?.userId);

    // check authentication
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // check user in database
    const [rows] = await db.query(
      "SELECT id, is_admin, must_change_password FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = rows[0];

    // strict admin check to avoid truthy edge-cases (e.g. string/buffer values)
    if (!normalizeTinyIntFlag(user.is_admin)) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const mustChangePassword = normalizeTinyIntFlag(user.must_change_password);
    if (mustChangePassword) {
      return res.status(403).json({
        message: "Password change required before using admin features.",
        code: "PASSWORD_CHANGE_REQUIRED",
      });
    }

    // attach normalized admin user metadata for downstream handlers
    req.user = {
      id: Number(user.id),
      is_admin: true,
      must_change_password: mustChangePassword,
    };

    next();
  } catch (err) {
    console.error("Admin middleware error:", err.code || err.message);

    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = adminMiddleware;
