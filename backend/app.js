const express = require("express");
const cors = require("cors");
const path = require("path"); // <--- This line is critical

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

app.use(express.json());

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

// === SERVE FRONTEND (THE MISSING PART) ===
// 1. Serve the static files from the build folder
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// 2. Catch-All: Send React's index.html for any other request
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// === START SERVER ===
const PORT = process.env.PORT || 21051;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});