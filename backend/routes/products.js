// backend/routes/products.js
const express = require("express");
const db = require("../config/db"); // mysql2/promise pool

const router = express.Router();
let _hasProductSizeStock = null;

async function hasProductSizeStockCol() {
  if (_hasProductSizeStock !== null) return _hasProductSizeStock;
  const [rows] = await db.query(
    `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'product_sizes' AND COLUMN_NAME = 'stock' LIMIT 1`
  );
  _hasProductSizeStock = rows.length > 0;
  return _hasProductSizeStock;
}

async function ensureProductSizeStockColumn() {
  const [tableRows] = await db.query("SHOW TABLES LIKE 'product_sizes'");
  if (!tableRows.length) return;
  const hasCol = await hasProductSizeStockCol();
  if (!hasCol) {
    await db.query("ALTER TABLE product_sizes ADD COLUMN stock INT NOT NULL DEFAULT 0");
    _hasProductSizeStock = true;
    await db.query(
      `UPDATE product_sizes ps
       JOIN products p ON p.id = ps.product_id
       SET ps.stock = COALESCE(p.stock, 0)
       WHERE ps.stock IS NULL OR ps.stock = 0`
    );
  }
}

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
  if (s === "new arrivals") return "all";
  if (s === "all products") return "all";
  if (s === "sale") return "sale";
  return s.replace(/\s+/g, "");
}

// Cache whether original_price column exists (checked once per process)
let _hasOriginalPrice = null;
async function hasOriginalPriceCol() {
  if (_hasOriginalPrice !== null) return _hasOriginalPrice;
  const [rows] = await db.query(
    `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'original_price' LIMIT 1`
  );
  _hasOriginalPrice = rows.length > 0;
  return _hasOriginalPrice;
}

function buildBaseSelect(includeOriginalPrice) {
  const opCol = includeOriginalPrice ? "p.original_price," : "NULL AS original_price,";
  return `
  SELECT
    p.id AS db_id,
    p.sku AS id,
    c.name AS category_name,
    p.name,
    p.price,
    p.stock,
    ${opCol}
    p.description AS \`desc\`,
    GROUP_CONCAT(DISTINCT pi.url ORDER BY pi.sort_order SEPARATOR '||') AS images,
    GROUP_CONCAT(DISTINCT ps.size ORDER BY ps.size SEPARATOR '||') AS sizes,
    GROUP_CONCAT(DISTINCT CONCAT(ps.size, ':', COALESCE(ps.stock, 0)) ORDER BY ps.size SEPARATOR '||') AS size_stocks,
    GROUP_CONCAT(DISTINCT pc.color ORDER BY pc.color SEPARATOR '||') AS colors,
    ROUND((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id), 1) AS avg_rating
  FROM products p
  JOIN categories c ON p.category_id = c.id
  LEFT JOIN product_images pi ON pi.product_id = p.id
  LEFT JOIN product_sizes  ps ON ps.product_id = p.id
  LEFT JOIN product_colors pc ON pc.product_id = p.id
`;
}

function buildProductRow(r) {
  return {
    id: r.id, // sku e.g. "m-001" (frontend expects this)
    db_id: r.db_id, // keep this if your basket_items needs INT product_id
    cat: catFromCategoryName(r.category_name),
    name: r.name,
    price: Number(r.price),
    stock: Number(r.stock ?? 0),
    originalPrice: r.original_price != null ? Number(r.original_price) : null,
    desc: r.desc,
    images: splitList(r.images),
    sizes: splitList(r.sizes),
    sizeStocks: splitList(r.size_stocks).map((entry) => {
      const idx = entry.lastIndexOf(":");
      if (idx <= 0) return null;
      const size = entry.slice(0, idx);
      const stock = Number(entry.slice(idx + 1));
      return { size, stock: Number.isFinite(stock) ? stock : 0 };
    }).filter(Boolean),
    colors: splitList(r.colors),
    avg_rating: r.avg_rating != null ? Number(r.avg_rating) : null,
    category: r.category_name,
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
  let orderBy = "ORDER BY p.id ASC";
  let limitSql = "";

  if (cat === "sale") {
    // If original_price column doesn't exist, return empty so frontend uses local fallback
    const saleHasOP = await hasOriginalPriceCol();
    if (!saleHasOP) return res.json([]);
    // Only pull from real product categories, not the "Sale" DB category
    where.push("p.original_price IS NOT NULL");
    where.push("c.name IN ('Mens', 'Womens', 'Kids')");
    limitSql = "LIMIT 6";
  } else if (cat === "all") {
    // All products from real categories (Mens/Womens/Kids), no limit
    where.push("c.name IN ('Mens', 'Womens', 'Kids')");
    orderBy = "ORDER BY p.id DESC";
  } else if (cat) {
    // map frontend cat to category names in DB
    if (cat === "men") where.push("c.name = 'Mens'");
    else if (cat === "women") where.push("c.name = 'Womens'");
    else if (cat === "kids") where.push("c.name = 'Kids'");
    else {
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

  const hasOP = await hasOriginalPriceCol();
  await ensureProductSizeStockColumn();
  const BASE_SELECT = buildBaseSelect(hasOP);
  const opGroup = hasOP ? "p.original_price," : "";

  const sql = `
    ${BASE_SELECT}
    ${whereSql}
    GROUP BY p.id, p.sku, c.name, p.name, p.price, p.stock, ${opGroup} p.description
    ${orderBy}
    ${limitSql}
  `;

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows.map(buildProductRow));
  } catch (err) {
    console.error("PRODUCTS DB error:", err.code || err.message);
    // Return empty array so frontend can use fallback data
    res.json([]);
  }
});

/**
 * GET /api/products/:id
 * Accepts either:
 *  - sku string like "m-001" (frontend)
 *  - numeric db id like 1 (if anything old still uses it)
 */
router.get("/:id", async (req, res) => {
  const raw = req.params.id;

  const isNumeric = /^\d+$/.test(raw);
  const where = isNumeric ? "p.id = ?" : "p.sku = ?";
  const param = isNumeric ? Number(raw) : raw;

  const hasOP = await hasOriginalPriceCol();
  await ensureProductSizeStockColumn();
  const BASE_SELECT = buildBaseSelect(hasOP);
  const opGroup = hasOP ? "p.original_price," : "";

  const sql = `
    ${BASE_SELECT}
    WHERE ${where}
    GROUP BY p.id, p.sku, c.name, p.name, p.price, p.stock, ${opGroup} p.description
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
