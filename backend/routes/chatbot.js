const express = require("express");
const db = require("../config/db");

const router = express.Router();

const PRODUCT_SEARCH_TRIGGERS = [
  "show",
  "find",
  "looking for",
  "recommend",
  "products",
  "product",
  "under",
  "below",
  "between",
  "in stock",
  "low stock",
  "sold out",
  "mens",
  "womens",
  "kids",
  "sale",
  "new arrivals",
];

const STOP_WORDS = new Set([
  "show", "me", "find", "i", "am", "im", "looking", "for", "with", "and", "or",
  "the", "a", "an", "in", "on", "at", "to", "from", "under", "over", "above",
  "below", "between", "price", "cost", "products", "product", "stock", "only",
  "please", "want", "need", "mens", "womens", "kids", "sale", "new", "arrivals",
  "cheap", "best", "some",
]);

function normalizeCategory(cat) {
  const c = String(cat || "").toLowerCase();
  if (c === "mens" || c === "men") return "Mens";
  if (c === "womens" || c === "women") return "Womens";
  if (c === "kids" || c === "kid") return "Kids";
  if (c === "sale") return "Sale";
  if (c === "newarrivals" || c === "new arrivals") return "New Arrivals";
  return null;
}

function extractFilters(message) {
  const m = String(message || "").toLowerCase().trim();
  const filters = {
    category: null,
    priceMin: null,
    priceMax: null,
    stockMode: null, // in_stock | low_stock | sold_out
    keywords: [],
  };

  if (/\b(mens|men)\b/.test(m)) filters.category = "Mens";
  else if (/\b(womens|women)\b/.test(m)) filters.category = "Womens";
  else if (/\bkids?\b/.test(m)) filters.category = "Kids";
  else if (/\bsale\b/.test(m)) filters.category = "Sale";
  else if (/\bnew arrivals?\b/.test(m)) filters.category = "New Arrivals";

  const between = m.match(/\bbetween\s+(\d+(?:\.\d+)?)\s*(?:and|to|-)\s*(\d+(?:\.\d+)?)\b/);
  if (between) {
    const a = Number(between[1]);
    const b = Number(between[2]);
    filters.priceMin = Math.min(a, b);
    filters.priceMax = Math.max(a, b);
  } else {
    const under = m.match(/\b(?:under|below|less than|max)\s*£?\s*(\d+(?:\.\d+)?)\b/);
    const over = m.match(/\b(?:over|above|more than|min)\s*£?\s*(\d+(?:\.\d+)?)\b/);
    if (under) filters.priceMax = Number(under[1]);
    if (over) filters.priceMin = Number(over[1]);
  }

  if (/\blow stock\b/.test(m)) filters.stockMode = "low_stock";
  else if (/\bsold out\b/.test(m) || /\bout of stock\b/.test(m)) filters.stockMode = "sold_out";
  else if (/\bin stock\b/.test(m) || /\bavailable\b/.test(m)) filters.stockMode = "in_stock";

  const tokens = m
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => t.length >= 3 && !STOP_WORDS.has(t));

  filters.keywords = [...new Set(tokens)].slice(0, 5);
  return filters;
}

function shouldSearchProducts(message, filters) {
  const m = String(message || "").toLowerCase();
  if (filters.category || filters.priceMin !== null || filters.priceMax !== null || filters.stockMode) {
    return true;
  }
  return PRODUCT_SEARCH_TRIGGERS.some((t) => m.includes(t));
}

async function searchProducts(filters) {
  const where = [];
  const params = [];

  if (filters.category) {
    where.push("c.name = ?");
    params.push(normalizeCategory(filters.category));
  }

  if (filters.priceMin !== null) {
    where.push("p.price >= ?");
    params.push(filters.priceMin);
  }
  if (filters.priceMax !== null) {
    where.push("p.price <= ?");
    params.push(filters.priceMax);
  }

  if (filters.stockMode === "in_stock") where.push("p.stock > 0");
  if (filters.stockMode === "low_stock") where.push("p.stock > 0 AND p.stock <= 5");
  if (filters.stockMode === "sold_out") where.push("p.stock = 0");

  for (const kw of filters.keywords) {
    where.push(`(
      LOWER(p.name) LIKE ?
      OR LOWER(COALESCE(p.description, '')) LIKE ?
      OR EXISTS (
        SELECT 1 FROM product_colors pc
        WHERE pc.product_id = p.id
        AND LOWER(pc.color) LIKE ?
      )
    )`);
    const like = `%${kw}%`;
    params.push(like, like, like);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const sql = `
    SELECT
      p.id,
      p.sku,
      p.name,
      p.price,
      p.stock,
      c.name AS category_name
    FROM products p
    JOIN categories c ON c.id = p.category_id
    ${whereSql}
    ORDER BY
      CASE WHEN p.stock > 0 THEN 0 ELSE 1 END,
      p.price ASC,
      p.id DESC
    LIMIT 5
  `;

  const [rows] = await db.query(sql, params);
  return rows.map((r) => ({
    id: r.id,
    sku: r.sku,
    name: r.name,
    price: Number(r.price),
    stock: Number(r.stock || 0),
    category: r.category_name,
    url: `/product/${r.sku}`,
  }));
}

function describeFilters(filters) {
  const parts = [];
  if (filters.category) parts.push(filters.category);
  if (filters.priceMax !== null && filters.priceMin !== null) {
    parts.push(`between GBP ${filters.priceMin} and GBP ${filters.priceMax}`);
  } else if (filters.priceMax !== null) {
    parts.push(`under GBP ${filters.priceMax}`);
  } else if (filters.priceMin !== null) {
    parts.push(`above GBP ${filters.priceMin}`);
  }
  if (filters.stockMode === "in_stock") parts.push("in stock");
  if (filters.stockMode === "low_stock") parts.push("low stock");
  if (filters.stockMode === "sold_out") parts.push("sold out");
  if (filters.keywords.length) parts.push(`matching: ${filters.keywords.join(", ")}`);
  return parts.length ? parts.join(" | ") : "your request";
}

function getFallbackReply(message) {
  const m = (message || "").toLowerCase().trim();

  if (m.includes("who are you") || m.includes("what is this") || m.includes("what site") || m.includes("this website"))
    return "This is OSAI Fashion. You can browse Mens, Womens, Kids, New Arrivals, and Sale from the menu.";
  if (m.includes("osai") || m.includes("store name") || m.includes("company") || m.includes("brand"))
    return "We're OSAI Fashion. You're on our official website.";
  if (m.includes("where are you") || m.includes("address") || m.includes("location") || m.includes("find you") || m.includes("birmingham"))
    return "We're at 134a Aston Road, Birmingham, United Kingdom.";
  if (m.includes("contact") || m.includes("email") || m.includes("reach") || m.includes("get in touch"))
    return "You can reach us at OSAI@aston.ac.uk or use the Contact page in the menu.";
  if (m.includes("what page") || m.includes("which page") || m.includes("where can i") || m.includes("menu") || m.includes("navigate"))
    return "From the menu: Home, Mens, Womens, Kids, New Arrivals, Sale, Contact, About Us.";
  if (m.includes("cart") || m.includes("basket") || m.includes("checkout"))
    return "Your cart is in the top-right basket icon. Then go to checkout.";
  if (m.includes("login") || m.includes("sign in") || m.includes("account"))
    return "Use Login/Profile in the top-right to sign in or create an account.";
  if (m.includes("order") || m.includes("track"))
    return "Check order status from your account or email OSAI@aston.ac.uk with your order number.";
  if (m.includes("return") || m.includes("refund"))
    return "We accept returns within 30 days. Email OSAI@aston.ac.uk with your order number.";
  if (m.includes("shipping") || m.includes("delivery"))
    return "We ship across the UK. Standard delivery is 3-5 working days.";
  if (m.includes("hello") || m.includes("hi") || m.includes("hey"))
    return "Hi! Ask me for products like: 'mens under 40 in stock' or 'black hoodie'.";

  return "I can help you find products. Try: 'show womens under 50 in stock' or 'find black hoodie'.";
}

function getSupportReply(message) {
  const m = (message || "").toLowerCase().trim();

  // Refunds / returns / orders
  if (m.includes("refund") || m.includes("return")) {
    return "We accept returns within 30 days. To request a refund, go to your orders/history and click request refund, or contact OSAI@aston.ac.uk with your order number.";
  }
  if (m.includes("order") || m.includes("track")) {
    return "You can check your order status from your account order history, or contact OSAI@aston.ac.uk with your order number.";
  }

  // Delivery / payments
  if (m.includes("shipping") || m.includes("delivery")) {
    return "We ship across the UK. Standard delivery is usually 3-5 working days, with faster options at checkout.";
  }
  if (m.includes("payment") || m.includes("pay")) {
    return "You can pay securely at checkout. Prices are shown on each product page.";
  }

  // Account / navigation / contact
  if (m.includes("login") || m.includes("sign in") || m.includes("account")) {
    return "Use Login/Profile in the top-right to sign in or create an account.";
  }
  if (m.includes("contact") || m.includes("email") || m.includes("reach")) {
    return "You can contact us at OSAI@aston.ac.uk or use the Contact page in the menu.";
  }
  if (m.includes("where are you") || m.includes("address") || m.includes("location")) {
    return "We're at 134a Aston Road, Birmingham, United Kingdom.";
  }
  if (m.includes("menu") || m.includes("where can i") || m.includes("navigate") || m.includes("what page")) {
    return "From the menu you can go to Home, Mens, Womens, Kids, New Arrivals, Sale, Contact, and About.";
  }
  if (m.includes("cart") || m.includes("basket") || m.includes("checkout")) {
    return "Use the basket icon in the top-right, then continue to checkout when ready.";
  }

  return null;
}

router.post("/", async (req, res) => {
  try {
    const { message } = req.body || {};
    const supportReply = getSupportReply(message);
    if (supportReply) {
      return res.json({ response: supportReply, products: [] });
    }

    const filters = extractFilters(message);

    if (shouldSearchProducts(message, filters)) {
      const products = await searchProducts(filters);
      if (products.length) {
        return res.json({
          response: `I found ${products.length} product${products.length > 1 ? "s" : ""} for ${describeFilters(filters)}.`,
          products,
          filters,
        });
      }
      return res.json({
        response: `I could not find products for ${describeFilters(filters)}. Try a wider price range or fewer keywords.`,
        products: [],
        filters,
      });
    }

    return res.json({ response: getFallbackReply(message), products: [] });
  } catch (err) {
    console.error("Chatbot error:", err);
    return res.status(500).json({
      response: "Something went wrong. Please try again or contact support.",
      products: [],
    });
  }
});

module.exports = router;

