// backend/app.js
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const app = express();

/**
 * Trust Proxy is CRITICAL for Aston University VMs.
 * It allows Express to see the 'https' header from the university's load balancer.
 */
app.set("trust proxy", 1);

// Set this to true for the university VM to enable secure cookies
const isProduction = true; 

// === MIDDLEWARE ===
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://cs2team51.cs2410-web01pvm.aston.ac.uk",
    "http://cs2team51.cs2410-web01pvm.aston.ac.uk",
  ],
  credentials: true
}));

app.use(express.json());

// === SESSION MIDDLEWARE ===
// This configuration fixes the "401 Unauthorized" basket error
app.use(session({
  name: "osai.sid", 
  secret: process.env.SESSION_SECRET || "osai-fashion-secret-key-summer",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: isProduction,           // Must be true for HTTPS
    sameSite: "none",               // Required for cross-origin cookies
  }
}));

// === ROUTE IMPORTS ===
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const feedbackRoutes = require("./routes/feedback");
const contactRoutes = require("./routes/contact");
const userRoutes = require("./routes/users");
const chatbotRoutes = require("./routes/chatbot");

// === API ROUTES ===
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chatbot", chatbotRoutes);

// === FRONTEND SERVING ===
// Point to the built React files
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Serve the frontend for the home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// Serve the frontend for any non-API route to allow React Router to work
app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// === 404 HANDLER ===
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    requested: `${req.method} ${req.originalUrl}`
  });
});

// === START SERVER ===
const PORT = process.env.PORT || 21051;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Secure Sessions Enabled: ${isProduction}`);
});