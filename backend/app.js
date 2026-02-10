const express = require("express");
const cors = require("cors");
const session = require("express-session");

const app = express();

// === MIDDLEWARE ===
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://cs2team51.cs2410-web01pvm.aston.ac.uk",
    "http://cs2team51.cs2410-web01pvm.aston.ac.uk"
  ],
  credentials: true
}));

app.use(express.json()); // middleware to parse JSON request bodies

// === SESSION MIDDLEWARE ===
app.use(session({
  secret: process.env.SESSION_SECRET || "osai-fashion-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true if using HTTPS in production
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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

// === BASIC ROUTES ===
app.get("/", (req, res) => {
  res.send("Backend is working - Summer");
});

app.get("/api", (req, res) => {
  res.json({ 
    message: "API Backend is working - Summer",
    endpoints: [
      "GET /api/products",
      "GET /api/products/:id",
      "POST /api/cart",
      "GET /api/orders",
      "POST /api/feedback",
      "POST /api/contact",
      "POST /api/users/register",
      "POST /api/users/login"
    ]
  });
});


// === API ROUTES ===
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chatbot", chatbotRoutes);

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
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🌐 Live URL: https://cs2team51.cs2410-web01pvm.aston.ac.uk:${PORT}`);
});