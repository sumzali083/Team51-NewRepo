// backend/routes/products.js
const express = require("express");
const db = require("../config/db"); // mysql2/promise pool

const router = express.Router();

<<<<<<< HEAD
/**
 * GET /api/products
 * Optional query: ?category=Mens
 */
router.get("/", async (req, res) => {
  const category = req.query.category;

  try {
    let sql = `
      SELECT p.id, p.name, p.description, p.price, p.stock,
             p.image_url, c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
    `;
    const params = [];

    if (category) {
      sql += " WHERE c.name = ?";
      params.push(category);
    }

    sql += " ORDER BY p.id ASC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("PRODUCTS DB error:", err.code || err.message);
    res.status(500).json({ message: "Failed to load products." });
=======
function splitList(value) {
  if (!value) return [];
  return String(value)
    .split("||")
    .map((s) => s.trim())
    .filter(Boolean);
}

function catFromCategoryName(categoryName) {
  const s = String(categoryName || "").trim().toLowerCase();
  if (s === "mens") return "men";
  if (s === "womens") return "women";
  if (s === "kids") return "kids";
  if (s === "new arrivals") return "newarrivals";
  if (s === "sale") return "sale";
  return s.replace(/\s+/g, "");
}

// This query assembles product into arrays via GROUP_CONCAT.
// Works on most MySQL versions (no JSON_ARRAYAGG needed).
const BASE_SELECT = `
  SELECT
    p.id AS db_id,
    p.sku AS id,
    c.name AS category_name,
    p.name,
    p.price,
    p.description AS \`desc\`,
    GROUP_CONCAT(DISTINCT pi.url ORDER BY pi.sort_order SEPARATOR '||') AS images,
    GROUP_CONCAT(DISTINCT ps.size ORDER BY ps.size SEPARATOR '||') AS sizes,
    GROUP_CONCAT(DISTINCT pc.color ORDER BY pc.color SEPARATOR '||') AS colors
  FROM products p
  JOIN categories c ON p.category_id = c.id
  LEFT JOIN product_images pi ON pi.product_id = p.id
  LEFT JOIN product_sizes  ps ON ps.product_id = p.id
  LEFT JOIN product_colors pc ON pc.product_id = p.id
`;

function buildProductRow(r) {
  return {
    id: r.id, // sku e.g. "m-001" (frontend expects this)
    db_id: r.db_id, // keep this if your basket_items needs INT product_id
    cat: catFromCategoryName(r.category_name),
    name: r.name,
    price: Number(r.price),
    desc: r.desc,
    images: splitList(r.images),
    sizes: splitList(r.sizes),
    colors: splitList(r.colors),
  };
}

/**
 * GET /api/products
 * Supports:
 *  - ?cat=women | men | kids | newarrivals | sale  (recommended)
 *  - ?category=Womens | Mens | Kids | New Arrivals | Sale (backwards compatible)
 *  - ?q=searchText
 */
router.get("/", async (req, res) => {
  const cat = (req.query.cat || "").toString().trim().toLowerCase();
  const category = (req.query.category || "").toString().trim(); // old style
  const q = (req.query.q || "").toString().trim().toLowerCase();

  const where = [];
  const params = [];

  if (cat) {
    // map frontend cat to category names in DB
    if (cat === "men") where.push("c.name = 'Mens'");
    else if (cat === "women") where.push("c.name = 'Womens'");
    else if (cat === "kids") where.push("c.name = 'Kids'");
    else if (cat === "newarrivals") where.push("c.name = 'New Arrivals'");
    else if (cat === "sale") where.push("c.name = 'Sale'");
    else {
      // fallback: try match category name directly
      where.push("LOWER(c.name) = ?");
      params.push(cat);
    }
  } else if (category) {
    where.push("c.name = ?");
    params.push(category);
  }

  if (q) {
    where.push("(LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const sql = `
    ${BASE_SELECT}
    ${whereSql}
    GROUP BY p.id, p.sku, c.name, p.name, p.price, p.description
    ORDER BY p.id ASC
  `;

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows.map(buildProductRow));
  } catch (err) {
    console.error("PRODUCTS DB error:", err.code || err.message);
    // Return empty array so frontend can use fallback data
    res.json([]);
>>>>>>> deploy-branch
  }
});

/**
 * GET /api/products/:id
<<<<<<< HEAD
 */
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  try {
    const sql = `
      SELECT p.id, p.name, p.description, p.price, p.stock,
             p.image_url, c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
    const [rows] = await db.query(sql, [id]);

    if (!rows.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("SINGLE PRODUCT DB error:", err.code || err.message);
    res.status(500).json({ message: "Failed to load product." });
  }
});

module.exports = router;
=======
 * Accepts either:
 *  - sku string like "m-001" (frontend)
 *  - numeric db id like 1 (if anything old still uses it)
 */
router.get("/:id", async (req, res) => {
  const raw = req.params.id;

  const isNumeric = /^\d+$/.test(raw);
  const where = isNumeric ? "p.id = ?" : "p.sku = ?";
  const param = isNumeric ? Number(raw) : raw;

  const sql = `
    ${BASE_SELECT}
    WHERE ${where}
    GROUP BY p.id, p.sku, c.name, p.name, p.price, p.description
    LIMIT 1
  `;

  try {
    const [rows] = await db.query(sql, [param]);
    if (!rows.length) return res.status(404).json({ message: "Product not found" });
    res.json(buildProductRow(rows[0]));
  } catch (err) {
    console.error("SINGLE PRODUCT DB error:", err.code || err.message);
    // Return 404 so frontend can handle gracefully
    res.status(404).json({ message: "Product not found" });
  }
});

module.exports = router;
>>>>>>> deploy-branch
