// backend/middleware/adminMiddleware.js
const db = require("../config/db");

async function adminMiddleware(req, res, next) {
  try {
    const userId = req.session?.userId;

    // check authentication
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // check user in database
    const [rows] = await db.query(
      "SELECT id, is_admin, must_change_password FROM users WHERE id = ?",
      [userId]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = rows[0];

    // admin check (safe for 0/1 values)
    if (!user.is_admin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    if (Number(user.must_change_password) === 1) {
      return res.status(403).json({
        message: "Password change required before using admin features.",
        code: "PASSWORD_CHANGE_REQUIRED",
      });
    }

    // attach user (optional, non-breaking improvement)
    req.user = user;

    next();
  } catch (err) {
    console.error("Admin middleware error:", err.code || err.message);

    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = adminMiddleware;
