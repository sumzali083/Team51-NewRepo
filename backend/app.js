const express = require("express");
const cors = require("cors");
const session = require("express-session");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const feedbackRoutes = require("./routes/feedback");
const contactRoutes = require("./routes/contact");
const userRoutes = require("./routes/users");
const reviewRoutes = require("./routes/reviews");
const chatbotRoutes = require("./routes/chatbot");
const adminRoutes = require("./routes/admin");
const wishlistRoutes = require("./routes/wishlist");
const refundRoutes = require("./routes/refunds");
const { getOrderHistoryForUser } = require("./services/orderHistory");

const app = express();
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  console.error("SESSION_SECRET is required. Set it in your environment.");
  process.exit(1);
}

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

// Session config
app.use(session({
  name: "team51.sid",
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 604800000
  }
}));

app.get("/api", (req, res) => {
  res.json({ 
    message: "API Backend is working - Summer",
    endpoints: [
      "GET /api/products",
      "GET /api/products/:id",
      "POST /api/cart",
      "POST /api/orders/checkout",
      "POST /api/feedback",
      "POST /api/contact",
      "POST /api/users/register",
      "POST /api/users/login",
      "GET /api/users/me",
      "POST /api/users/logout",
      "GET /api/refunds/my",
      "POST /api/refunds",
      "GET /api/reviews/:productId",
      "POST /api/reviews/:productId",
      "DELETE /api/reviews/:reviewId",
      "POST /api/chatbot"
    ]
  });
});

// Direct history endpoint fallback to avoid route-mount issues in some deploys.
app.get("/api/orders/history", async (req, res) => {
  const userId = req.session && req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: "Please log in to view order history" });
  }

  try {
    const orders = await getOrderHistoryForUser(userId);
    return res.json(orders);
  } catch (err) {
    console.error("Order history error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// API routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/refunds", refundRoutes.router);

// Serve uploaded product images
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
app.use("/uploads", express.static(uploadsPath));

// Serve static frontend if built
const distPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.use((req, res) => {
  if (req.url.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }

  if (fs.existsSync(path.join(distPath, "index.html"))) {
    return res.sendFile(path.join(distPath, "index.html"));
  }

  return res.status(404).send("Frontend build not found");
});

const PORT = process.env.PORT || 21051;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
