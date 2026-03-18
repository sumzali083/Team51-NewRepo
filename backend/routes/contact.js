// backend/routes/contact.js
const express = require("express");
const db = require("../config/db"); // mysql2/promise pool

const router = express.Router();

// simple in-memory rate limit (per IP)
const lastSubmissionTime = {};

router.post("/", async (req, res) => {
  const { name, email, message } = req.body || {};

  // trim inputs FIRST
  const nameTrim = name?.trim();
  const emailTrim = email?.trim();
  const messageTrim = message?.trim();

  // basic validation
  if (!nameTrim || !emailTrim || !messageTrim) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // rate limiting (5 sec per IP)
  const ip = req.ip;
  if (lastSubmissionTime[ip] && Date.now() - lastSubmissionTime[ip] < 5000) {
    return res.status(429).json({ message: "Too many requests. Please wait." });
  }
  lastSubmissionTime[ip] = Date.now();

  // email format validation
  if (!/^\S+@\S+\.\S+$/.test(emailTrim)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  // length validation
  if (nameTrim.length > 100 || emailTrim.length > 100) {
    return res.status(400).json({ message: "Input too long." });
  }

  if (messageTrim.length > 1000) {
    return res.status(400).json({ message: "Message too long." });
  }

  try {
    const sql =
      "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)";

    await db.query(sql, [nameTrim, emailTrim, messageTrim]);

    // success
    return res.json({ message: "Thank you! Your message has been sent." });
  } catch (err) {
    console.error("Contact DB error:", err.code || err.message);

    return res.status(500).json({
      message:
        "Sorry, we couldn't send your message right now. Please try again later.",
    });
  }
});

module.exports = router;
