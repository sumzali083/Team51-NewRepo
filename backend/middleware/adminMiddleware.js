// backend/middleware/adminMiddleware.js
const db = require("../config/db");

async function adminMiddleware(req, res, next) {
  try {
    const userId = req.session?.userId; // fixed bug (use session)

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // check user in database
    const [rows] = await db.query(
      "SELECT is_admin FROM users WHERE id = ?",
      [userId]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "User not found" });
    }

    if (rows[0].is_admin !== 1) {
      return res.status(403).json({ message: "Admin access required" });
    }

    // user is admin
    next();

  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = adminMiddleware;
