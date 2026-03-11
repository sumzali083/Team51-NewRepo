// backend/routes/feedback.js
const express = require("express");
const db = require("../config/db"); // mysql2/promise pool

const router = express.Router();

/**
 * POST /api/feedback
 * Body: { name, email, rating, comment }
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body || {};

    // basic validation
    if (!name || !email || !comment) {
      return res.status(400).json({
        message: "name, email and comment are required",
      });
    }

    const ratingNum =
      rating !== undefined && rating !== null && rating !== ""
        ? Number(rating)
        : null;

    if (ratingNum !== null && (ratingNum < 1 || ratingNum > 5)) {
      return res.status(400).json({
        message: "rating must be between 1 and 5",
      });
    }

    // matches your DB columns: name, email, rating, comments
    const sql = `
      INSERT INTO feedback (name, email, rating, comments)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      name.trim(),
      email.trim(),
      ratingNum,
      comment.trim(),
    ]);

    return res.status(201).json({
      message: "Feedback submitted",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Error saving feedback:", err);
    return res.status(500).json({ message: "Server error saving feedback" });
  }
});

/**
 * GET /api/feedback    (for TP2 admin panel later)
 */
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, rating, comments, created_at
       FROM feedback
       ORDER BY created_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    return res.status(500).json({ message: "Server error loading feedback" });
  }
});

module.exports = router;
