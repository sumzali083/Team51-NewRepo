const express = require("express");
const router = express.Router();

// Website-specific + general responses (replace with OpenAI later for deeper answers)
const getReply = (message) => {
  const m = (message || "").toLowerCase().trim();

  // --- About this website / store ---
  if (m.includes("who are you") || m.includes("what is this") || m.includes("what site") || m.includes("this website"))
    return "This is OSAI Fashion—we bring authentic and stylish clothing to your wardrobe. You can browse Mens, Womens, Kids, New Arrivals, and Sale from the menu.";
  if (m.includes("osai") || m.includes("store name") || m.includes("company") || m.includes("brand"))
    return "We're OSAI Fashion. You're on our official website—browse the menu for Mens, Womens, Kids, New Arrivals, and Sale.";
  if (m.includes("where are you") || m.includes("address") || m.includes("location") || m.includes("find you") || m.includes("birmingham"))
    return "We're at 134a Aston Road, Birmingham, United Kingdom. Come visit us or get in touch online.";
  if (m.includes("contact") || m.includes("email") || m.includes("reach") || m.includes("get in touch"))
    return "You can reach us at OSAI@aston.ac.uk or use the Contact page in the menu. We're here to help!";
  if (m.includes("what page") || m.includes("which page") || m.includes("where can i") || m.includes("menu") || m.includes("navigate"))
    return "From the menu you can go to: Home, Mens, Womens, Kids, New Arrivals, Sale, Contact, About Us. You can also Search, view your Cart, and Login from the top bar.";
  if (m.includes("mens") || m.includes("men's") || m.includes("men "))
    return "Our Mens range is under the Mens link in the menu. Click 'Mens' to see all men's products.";
  if (m.includes("womens") || m.includes("women's") || m.includes("women "))
    return "Our Womens range is under the Womens link in the menu. Click 'Womens' to browse.";
  if (m.includes("kids") || m.includes("children"))
    return "We have a Kids section—click 'Kids' in the menu to see our kids' clothing.";
  if (m.includes("sale") || m.includes("discount") || m.includes("offer"))
    return "Sale items are on the Sale page. Click 'Sale' in the menu to see current deals.";
  if (m.includes("new arrival") || m.includes("new product"))
    return "Check the 'New Arrivals' link in the menu for the latest products.";
  if (m.includes("about") || m.includes("about us"))
    return "Learn more about us on the About Us page—use the 'About Us' link in the menu.";
  if (m.includes("cart") || m.includes("basket") || m.includes("checkout"))
    return "Your cart is in the top right (cart icon). When you're ready, go to Cart then Checkout to complete your order.";
  if (m.includes("login") || m.includes("sign in") || m.includes("account"))
    return "Use 'Login / Profile' in the top right to sign in or create an account.";
  if (m.includes("search") || m.includes("find product"))
    return "Use the search box in the top bar to find products. You can also browse by category: Mens, Womens, Kids, New Arrivals, or Sale.";

  // --- Orders, shipping, returns ---
  if (m.includes("order") || m.includes("track")) return "You can check your order status from your account or contact us with your order number at OSAI@aston.ac.uk.";
  if (m.includes("return") || m.includes("refund")) return "We accept returns within 30 days. Visit our Contact page or email OSAI@aston.ac.uk with your order number for help.";
  if (m.includes("shipping") || m.includes("delivery")) return "We ship across the UK. Standard delivery is 3–5 working days. Express options are available at checkout.";
  if (m.includes("size") || m.includes("fit")) return "Size guides are on each product page. If you're unsure, we're happy to help—tell me the item and your usual size.";
  if (m.includes("price") || m.includes("cost") || m.includes("pay")) return "Prices are on each product page. Sale items are on the Sale page. Need help with a specific product? Ask me!";

  // --- Greetings & closing ---
  if (m.includes("hello") || m.includes("hi") || m.includes("hey")) return "Hi! I'm the OSAI Fashion assistant. I can help with our website, products, orders, shipping, and more. What do you need?";
  if (m.includes("thank")) return "You're welcome! Anything else about the website or your order?";
  if (m.includes("bye") || m.includes("goodbye")) return "Thanks for chatting! Have a great day.";

  return "I'm the OSAI Fashion assistant. I can answer questions about this website (pages, contact, address), products, orders, shipping, and returns. What would you like to know?";
};

router.post("/", (req, res) => {
  try {
    const { message } = req.body || {};
    const response = getReply(message);
    res.json({ response });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ response: "Something went wrong. Please try again or contact support." });
  }
});

module.exports = router;
