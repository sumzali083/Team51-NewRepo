const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const app = express();

// Required for HTTPS sessions on university VMs
app.set("trust proxy", 1);

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://cs2team51.cs2410-web01pvm.aston.ac.uk",
    "http://cs2team51.cs2410-web01pvm.aston.ac.uk"
  ],
  credentials: true
}));

app.use(express.json());

// Session config with secure settings for HTTPS
app.use(session({
  name: "team51.sid",
  secret: process.env.SESSION_SECRET || "osai-fashion-secret-key-summer",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,      // Required for HTTPS
    sameSite: "none",  // Required for cross-origin cookies
    maxAge: 604800000  // 7 days in milliseconds
  }
}));

// API Routes
app.use("/api/products", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/users", require("./routes/users"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/contact", require("./routes/contact"));

// Serve Static Frontend Files
const distPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(distPath));

// Fallback Middleware (Fixes PathError by avoiding the '*' wildcard)
app.use((req, res) => {
  // If the request is for an API that doesn't exist, return 404
  if (req.url.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }
  // Otherwise, serve the React app
  res.sendFile(path.join(distPath, "index.html"));
});

